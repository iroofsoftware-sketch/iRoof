import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Drawer,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Row,
  Col,
  message,
  Dropdown
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  DollarOutlined,
  DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const STATUS_CONFIG = {
  draft: { color: '#6b7280', label: 'Draft' },
  sent: { color: '#3b82f6', label: 'Sent' },
  acknowledged: { color: '#8b5cf6', label: 'Acknowledged' },
  delivered: { color: '#10b981', label: 'Delivered' },
  cancelled: { color: '#ef4444', label: 'Cancelled' }
};

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedPRId = searchParams.get('prId');

  // Data states
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPOs: 0,
    totalValue: 0,
    openPOs: 0,
    deliveredPOs: 0,
    pendingDelivery: 0,
    thisMonthValue: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Change Modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('sent');

  // Create PO Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [approvedPRs, setApprovedPRs] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [selectedPRPreview, setSelectedPRPreview] = useState(null);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createForm] = Form.useForm();

  // Fetch POs & Stats
  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/purchase-orders/stats').catch(() => ({ data: { data: {} } }))
      ]);

      if (listRes.data?.success && listRes.data.data) {
        setPurchaseOrders(listRes.data.data);
      }
      if (statsRes.data?.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      message.error(err.response?.data?.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Handle open create PO modal
  const handleOpenCreateModal = async (initialPRId) => {
    createForm.resetFields();
    setSelectedPRPreview(null);
    setCreateModalVisible(true);

    try {
      const [prRes, suppRes] = await Promise.all([
        api.get('/purchase-requests'),
        api.get('/suppliers?isActive=true')
      ]);

      let prs = [];
      if (prRes.data?.success && prRes.data.data) {
        // filter approved PRs or the initial PR
        prs = prRes.data.data.filter(
          (p) => p.status === 'approved' || (initialPRId && p._id === initialPRId)
        );
        setApprovedPRs(prs);
      }

      if (suppRes.data?.success && suppRes.data.data) {
        setSuppliersList(suppRes.data.data);
      }

      if (initialPRId && prs.length > 0) {
        const found = prs.find((p) => p._id === initialPRId);
        if (found) {
          createForm.setFieldsValue({ purchaseRequestId: initialPRId });
          setSelectedPRPreview({
            workOrder: found.workOrderId?.refCode || 'WO Ref',
            itemsCount: found.items?.length || 0,
            estValue: `₹ ${Number(found.totalEstimate || 0).toLocaleString('en-IN')}`
          });
        }
      }
    } catch (e) {
      console.error('Error loading PRs or suppliers:', e);
    }
  };

  useEffect(() => {
    if (preselectedPRId) {
      handleOpenCreateModal(preselectedPRId);
    }
  }, [preselectedPRId]);

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
    setSelectedPRPreview(null);
    if (preselectedPRId) {
      setSearchParams({});
    }
  };

  const handlePRSelectChange = (prId) => {
    const found = approvedPRs.find((p) => p._id === prId);
    if (found) {
      setSelectedPRPreview({
        workOrder: found.workOrderId?.refCode || 'WO Ref',
        itemsCount: found.items?.length || 0,
        estValue: `₹ ${Number(found.totalEstimate || 0).toLocaleString('en-IN')}`
      });
      if (found.workOrderId?.siteAddress) {
        createForm.setFieldsValue({ deliveryAddress: found.workOrderId.siteAddress });
      }
    } else {
      setSelectedPRPreview(null);
    }
  };

  const handleCreateSubmit = async (values) => {
    setSubmittingCreate(true);
    try {
      const res = await api.post('/purchase-orders', {
        purchaseRequestId: values.purchaseRequestId,
        supplierId: values.supplierId,
        expectedDelivery: values.expectedDelivery ? values.expectedDelivery.toDate() : undefined,
        deliveryAddress: values.deliveryAddress || '',
        notes: values.notes || ''
      });

      const poCode = res.data?.purchaseOrder?.refCode || 'PO';
      message.success(`Purchase Order ${poCode} created successfully.`);
      handleCloseCreateModal();
      fetchPurchaseOrders();
    } catch (err) {
      console.error('Create PO error:', err);
      message.error(err.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Open Drawer and fetch full details
  const handleOpenDrawer = async (record) => {
    setSelectedPO(record);
    setDrawerVisible(true);
    setLoadingDetail(true);

    try {
      const res = await api.get(`/purchase-orders/${record._id}`);
      if (res.data?.success && res.data.data) {
        setSelectedPO(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching PO detail:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Advance / Change Status
  const handleChangeStatus = async (statusVal) => {
    if (!selectedPO) return;
    try {
      const res = await api.patch(`/purchase-orders/${selectedPO._id}`, { status: statusVal });
      message.success(`Purchase order marked as ${statusVal}`);
      setSelectedPO(res.data.purchaseOrder);
      setStatusModalVisible(false);
      fetchPurchaseOrders();
    } catch (e) {
      message.error('Failed to update status');
    }
  };

  // Filtered rows
  const filteredOrders = purchaseOrders.filter((po) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (po.refCode && po.refCode.toLowerCase().includes(q)) ||
      (po.supplierId?.name && po.supplierId.name.toLowerCase().includes(q)) ||
      (po.purchaseRequestId?.refCode && po.purchaseRequestId.refCode.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || po.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'PO REF',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (val) => <span className="ref-badge">{val || '—'}</span>
    },
    {
      title: 'PURCHASE REQUEST',
      dataIndex: 'purchaseRequestId',
      key: 'purchaseRequestId',
      width: 140,
      render: (pr) => (
        <span className="ref-badge" style={{ fontSize: 11, opacity: 0.85 }}>
          {pr?.refCode || '—'}
        </span>
      )
    },
    {
      title: 'SUPPLIER',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (supp) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {supp?.name || 'Assigned Supplier'}
          </span>
          {supp?.phone && (
            <div style={{ fontSize: 11, color: '#64748b' }}>{supp.phone}</div>
          )}
        </div>
      )
    },
    {
      title: 'EXPECTED DELIVERY',
      dataIndex: 'expectedDelivery',
      key: 'expectedDelivery',
      width: 140,
      render: (val, r) => {
        const isPastDue =
          val &&
          new Date(val) < new Date() &&
          r.status !== 'delivered' &&
          r.status !== 'cancelled';
        return (
          <span
            style={{
              fontSize: 12.5,
              color: isPastDue ? '#b91c1c' : '#64748b',
              fontWeight: isPastDue ? 600 : 400
            }}
            className="tabular-nums"
          >
            {val ? dayjs(val).format('DD MMM YYYY') : '—'}
          </span>
        );
      }
    },
    {
      title: 'GRAND TOTAL',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }} className="tabular-nums">
          ₹ {Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
        return (
          <span className={`status-dot status-${status}`}>
            <span style={{ textTransform: 'capitalize' }}>{cfg.label}</span>
          </span>
        );
      }
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ color: '#0b315d' }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDrawer(r);
            }}
          >
            View
          </Button>
          <Button
            type="text"
            size="small"
            icon={<PrinterOutlined style={{ color: '#0b315d' }} />}
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/purchase/orders/${r._id}/print`, '_blank');
            }}
          >
            Print
          </Button>
        </Space>
      )
    }
  ];

  const statusActionMenuItems = [
    { key: 'sent', label: 'Mark as Sent' },
    { key: 'acknowledged', label: 'Mark as Acknowledged' },
    { key: 'delivered', label: 'Mark as Delivered' },
    { type: 'divider' },
    { key: 'cancelled', label: 'Mark as Cancelled', danger: true }
  ];

  return (
    <div>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">Track supplier procurement orders, material schedules, and deliveries</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchPurchaseOrders} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenCreateModal()}>
            Create PO
          </Button>
        </Space>
      </div>

      {/* ── STATS ROW (4 Cards) ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total POs</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <FileTextOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.totalPOs || 0}</div>
            <div className="stat-card__meta">All supplier orders issued</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Open Orders</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#c2410c' }}>
              {stats.openPOs || 0}
            </div>
            <div className="stat-card__meta">Draft, sent, or acknowledged</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Pending Delivery</span>
              <div className="stat-card__icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <TruckOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#b45309' }}>
              {stats.pendingDelivery || 0}
            </div>
            <div className="stat-card__meta">In transit / awaited from vendor</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total Value</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <DollarOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#15803d' }}>
              ₹ {Number(stats.totalValue || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">Combined committed value</div>
          </div>
        </Col>
      </Row>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by PO ref, supplier, or PR..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 160 }}
        >
          <Option value="all">All Statuses</Option>
          <Option value="draft">Draft</Option>
          <Option value="sent">Sent</Option>
          <Option value="acknowledged">Acknowledged</Option>
          <Option value="delivered">Delivered</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>

        {(searchQuery || statusFilter !== 'all') && (
          <Button
            type="link"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            style={{ color: '#6b7280', fontSize: 13, padding: 0 }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="content-card">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          locale={{ emptyText: 'No purchase orders generated yet' }}
          onRow={(record) => ({
            onClick: () => handleOpenDrawer(record),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      {/* ── DETAIL DRAWER (720px) ── */}
      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={720}
        destroyOnClose
        title={
          selectedPO ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  background: '#0b315d',
                  color: '#ffffff',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4
                }}
              >
                {selectedPO.refCode}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {selectedPO.supplierId?.name || 'Supplier'}
              </span>
            </div>
          ) : (
            'Purchase Order Details'
          )
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.open(`/purchase/orders/${selectedPO?._id}/print`, '_blank')}
            >
              Print PO
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>Close</Button>
          </div>
        }
      >
        {selectedPO && (
          <div>
            {/* Status Row + Advance Status button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                marginBottom: 20,
                borderBottom: '1px solid #dde3ea'
              }}
            >
              <Space size={8}>
                {(() => {
                  const sCfg = STATUS_CONFIG[selectedPO.status] || STATUS_CONFIG.draft;
                  return (
                    <Tag color={sCfg.color} style={{ borderRadius: 4, fontWeight: 600 }}>
                      {sCfg.label.toUpperCase()}
                    </Tag>
                  );
                })()}
              </Space>

              <Dropdown
                menu={{
                  items: statusActionMenuItems,
                  onClick: ({ key }) => handleChangeStatus(key)
                }}
              >
                <Button size="small">
                  Advance Status <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>
            </div>

            {/* Section 1: PO Details (2-col grid) */}
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#111827',
                  paddingBottom: 8,
                  marginBottom: 12,
                  borderBottom: '1px solid #dde3ea'
                }}
              >
                PO Details
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px 16px',
                  fontSize: 13
                }}
              >
                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>PO DATE</span>
                  <span style={{ fontWeight: 500 }}>
                    {dayjs(selectedPO.poDate).format('DD MMM YYYY')}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>EXPECTED DELIVERY</span>
                  <span style={{ fontWeight: 600, color: '#0b315d' }}>
                    {dayjs(selectedPO.expectedDelivery).format('DD MMM YYYY')}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>PURCHASE REQUEST REF</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {selectedPO.purchaseRequestId?.refCode || '—'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>WORK ORDER REF</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {selectedPO.workOrderId?.refCode || '—'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>CREATED BY</span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedPO.createdBy?.name || 'Staff User'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>DELIVERY ADDRESS</span>
                  <span style={{ color: '#374151' }}>
                    {selectedPO.deliveryAddress || 'Site Address'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Supplier Details (Compact) */}
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#111827',
                  paddingBottom: 8,
                  marginBottom: 12,
                  borderBottom: '1px solid #dde3ea'
                }}
              >
                Supplier Details
              </h3>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #dde3ea',
                  borderRadius: 6,
                  padding: 12,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px 16px',
                  fontSize: 12
                }}
              >
                <div>
                  <span style={{ color: '#6b7280' }}>Contact Person: </span>
                  <span style={{ fontWeight: 500 }}>{selectedPO.supplierId?.contactPerson || '—'}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Phone: </span>
                  <span style={{ fontWeight: 500 }}>{selectedPO.supplierId?.phone || '—'}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Email: </span>
                  <span style={{ color: '#1e40af' }}>{selectedPO.supplierId?.email || '—'}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>GSTIN: </span>
                  <span style={{ fontFamily: 'monospace' }}>{selectedPO.supplierId?.gstin || '—'}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Payment Terms: </span>
                  <span style={{ fontWeight: 500 }}>{selectedPO.supplierId?.paymentTerms || '30 Days'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Order Items (structured table) */}
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#111827',
                  paddingBottom: 8,
                  marginBottom: 12,
                  borderBottom: '1px solid #dde3ea'
                }}
              >
                Order Items & Costs
              </h3>

              <div
                style={{
                  border: '1px solid #dde3ea',
                  borderRadius: 6,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 80px 80px 100px 120px',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    fontWeight: 600,
                    fontSize: 11,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #dde3ea'
                  }}
                >
                  <div>Description</div>
                  <div style={{ textAlign: 'center' }}>Qty</div>
                  <div style={{ textAlign: 'center' }}>Unit</div>
                  <div style={{ textAlign: 'right' }}>Rate (₹)</div>
                  <div style={{ textAlign: 'right' }}>Amount (₹)</div>
                </div>

                {selectedPO.lineItems && selectedPO.lineItems.length > 0 ? (
                  selectedPO.lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 80px 80px 100px 120px',
                        padding: '10px 12px',
                        fontSize: 12,
                        color: '#111827',
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfdfe'
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>{item.description}</div>
                      <div style={{ textAlign: 'center' }}>{item.quantity}</div>
                      <div style={{ textAlign: 'center', textTransform: 'capitalize' }}>
                        {item.unit || 'kg'}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {Number(item.rate || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 600 }}>
                        {Number(item.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
                    No items in this purchase order
                  </div>
                )}

                {/* Subtotal & Totals Summary */}
                <div style={{ padding: '12px 16px', background: '#fafbfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal</span>
                    <span style={{ fontWeight: 500 }}>
                      ₹ {Number(selectedPO.subtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                    <span style={{ color: '#6b7280' }}>GST @ 18%</span>
                    <span style={{ fontWeight: 500 }}>
                      ₹ {Number(selectedPO.gstAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#0b315d',
                      paddingTop: 8,
                      marginTop: 6,
                      borderTop: '2px solid #0b315d'
                    }}
                  >
                    <span>GRAND TOTAL</span>
                    <span>₹ {Number(selectedPO.grandTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Notes */}
            <div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#111827',
                  paddingBottom: 8,
                  marginBottom: 12,
                  borderBottom: '1px solid #dde3ea'
                }}
              >
                Order Notes & Instructions
              </h3>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #dde3ea',
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 12,
                  color: '#6b7280',
                  whiteSpace: 'pre-wrap',
                  minHeight: 50
                }}
              >
                {selectedPO.notes || 'No special instructions recorded.'}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── CREATE PURCHASE ORDER MODAL ── */}
      <Modal
        title="Create Purchase Order"
        open={createModalVisible}
        onCancel={handleCloseCreateModal}
        footer={null}
        destroyOnClose
        width={520}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="purchaseRequestId"
            label="Source Purchase Request"
            rules={[{ required: true, message: 'Please select an approved purchase request' }]}
          >
            <Select
              placeholder="Search approved purchase request..."
              showSearch
              optionFilterProp="children"
              onChange={handlePRSelectChange}
            >
              {approvedPRs.map((pr) => (
                <Option key={pr._id} value={pr._id}>
                  {pr.refCode} — {pr.workOrderId?.refCode || 'WO'} ({pr.items?.length || 0} items)
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Read-only preview */}
          {selectedPRPreview && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                padding: '10px 14px',
                marginBottom: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                fontSize: 12
              }}
            >
              <div>
                <span style={{ color: '#1e40af', display: 'block', fontWeight: 600 }}>WORK ORDER</span>
                <span style={{ color: '#1e293b' }}>{selectedPRPreview.workOrder}</span>
              </div>
              <div>
                <span style={{ color: '#1e40af', display: 'block', fontWeight: 600 }}>ITEMS</span>
                <span style={{ color: '#1e293b' }}>{selectedPRPreview.itemsCount} items</span>
              </div>
              <div>
                <span style={{ color: '#1e40af', display: 'block', fontWeight: 600 }}>EST. VALUE</span>
                <span style={{ color: '#0b315d', fontWeight: 700 }}>{selectedPRPreview.estValue}</span>
              </div>
            </div>
          )}

          <Form.Item
            name="supplierId"
            label="Assigned Supplier"
            rules={[{ required: true, message: 'Please select a vendor/supplier' }]}
          >
            <Select placeholder="Select approved supplier..." showSearch optionFilterProp="children">
              {suppliersList.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name} {s.contactPerson ? `(${s.contactPerson})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="expectedDelivery"
            label="Expected Delivery Date"
            rules={[{ required: true, message: 'Please select delivery date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
          </Form.Item>

          <Form.Item name="deliveryAddress" label="Delivery Destination">
            <Input placeholder="Site address or Central Workshop address" />
          </Form.Item>

          <Form.Item name="notes" label="Special Instructions / Delivery Terms">
            <TextArea rows={2} placeholder="Offloading requirements, mill test certificates, etc." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <Button onClick={handleCloseCreateModal}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingCreate}
              style={{ background: '#0b315d', borderColor: '#0b315d' }}
            >
              Create PO
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseOrdersPage;
