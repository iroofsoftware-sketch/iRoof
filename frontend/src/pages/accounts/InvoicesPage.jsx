import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Drawer,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tag,
  Space,
  Progress,
  Row,
  Col,
  message
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const STATUS_CONFIG = {
  draft: { color: '#6b7280', label: 'Draft' },
  sent: { color: '#3b82f6', label: 'Sent' },
  partial: { color: '#f59e0b', label: 'Partial' },
  paid: { color: '#10b981', label: 'Paid' },
  overdue: { color: '#ef4444', label: 'Overdue' },
  cancelled: { color: '#9ca3af', label: 'Cancelled' }
};

const PAYMENT_MODES = [
  { key: 'bank_transfer', label: 'Bank Transfer / NEFT / RTGS' },
  { key: 'upi', label: 'UPI / GPay / PhonePe' },
  { key: 'cheque', label: 'Cheque' },
  { key: 'cash', label: 'Cash' },
  { key: 'other', label: 'Other' }
];

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedWOId = searchParams.get('workOrderId');

  // Data states
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalBilled: 0,
    totalReceived: 0,
    totalOutstanding: 0,
    overdueCount: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Drawer & detail
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Change Modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('sent');

  // Create Invoice Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [workOrdersList, setWorkOrdersList] = useState([]);
  const [selectedWOPreview, setSelectedWOPreview] = useState(null);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createForm] = Form.useForm();

  // Record Payment Modal
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentForm] = Form.useForm();

  // ──────────────────────────────────────────
  // FETCH DATA
  // ──────────────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/invoices/stats').catch(() => ({ data: { data: {} } }))
      ]);

      if (listRes.data && listRes.data.data) {
        setInvoices(listRes.data.data);
      }
      if (statsRes.data && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      message.error(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Open Create Invoice Modal
  const handleOpenCreateModal = async (initialWOId) => {
    createForm.resetFields();
    setSelectedWOPreview(null);
    setCreateModalVisible(true);

    try {
      const res = await api.get('/workorders');
      if (res.data && res.data.data) {
        setWorkOrdersList(res.data.data);
        if (initialWOId) {
          const found = res.data.data.find((w) => w._id === initialWOId);
          if (found) {
            createForm.setFieldsValue({ workOrderId: initialWOId });
            setSelectedWOPreview({
              client: found.clientName || 'General Client',
              grandTotal: `₹ ${Number(found.grandTotal || 0).toLocaleString('en-IN')}`,
              model: found.roofModel || 'Standard'
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to load work orders for invoice creation:', e);
    }
  };

  useEffect(() => {
    if (preselectedWOId) {
      handleOpenCreateModal(preselectedWOId);
    }
  }, [preselectedWOId]);

  const handleWOSelectChange = (woId) => {
    const found = workOrdersList.find((w) => w._id === woId);
    if (found) {
      setSelectedWOPreview({
        client: found.clientName || 'General Client',
        grandTotal: `₹ ${Number(found.grandTotal || 0).toLocaleString('en-IN')}`,
        model: found.roofModel || 'Standard'
      });
    } else {
      setSelectedWOPreview(null);
    }
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
    setSelectedWOPreview(null);
    if (preselectedWOId) {
      setSearchParams({});
    }
  };

  const handleCreateSubmit = async (values) => {
    setSubmittingCreate(true);
    try {
      const res = await api.post('/invoices', {
        workOrderId: values.workOrderId,
        dueDate: values.dueDate ? values.dueDate.toDate() : undefined,
        paymentTerms: values.paymentTerms || '30 days',
        notes: values.notes || ''
      });

      const invCode = res.data?.data?.refCode || 'INV';
      message.success(`Invoice ${invCode} created successfully.`);
      handleCloseCreateModal();
      fetchInvoices();
    } catch (err) {
      console.error('Create invoice error:', err);
      message.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Open Drawer and fetch full detail with payment history
  const handleOpenDrawer = async (record) => {
    setSelectedInvoice(record);
    setDrawerVisible(true);
    setLoadingDetail(true);

    try {
      const res = await api.get(`/invoices/${record._id}`);
      if (res.data && res.data.data) {
        setSelectedInvoice(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching invoice details:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Change Status
  const handleChangeStatus = async () => {
    if (!selectedInvoice) return;
    try {
      await api.patch(`/invoices/${selectedInvoice._id}`, { status: newStatus });
      message.success(`Status updated to ${newStatus}`);
      setSelectedInvoice((prev) => ({ ...prev, status: newStatus }));
      setStatusModalVisible(false);
      fetchInvoices();
    } catch (e) {
      message.error('Failed to update status');
    }
  };

  // Open Record Payment Modal
  const handleOpenPaymentModal = () => {
    paymentForm.resetFields();
    paymentForm.setFieldsValue({
      paymentDate: dayjs(),
      paymentMode: 'bank_transfer',
      amount: selectedInvoice?.amountDue || 0
    });
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async (values) => {
    setSubmittingPayment(true);
    try {
      const res = await api.post('/payments', {
        invoiceId: selectedInvoice._id,
        amount: Number(values.amount),
        paymentDate: values.paymentDate ? values.paymentDate.toDate() : new Date(),
        paymentMode: values.paymentMode,
        referenceNo: values.referenceNo || '',
        notes: values.notes || ''
      });

      message.success(`Payment of ₹${Number(values.amount).toLocaleString('en-IN')} recorded.`);
      setPaymentModalVisible(false);

      // Refresh drawer details
      const detailRes = await api.get(`/invoices/${selectedInvoice._id}`);
      if (detailRes.data?.data) {
        setSelectedInvoice(detailRes.data.data);
      }
      fetchInvoices();
    } catch (err) {
      console.error('Record payment error:', err);
      message.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Filtered rows
  const filtered = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (inv.refCode && inv.refCode.toLowerCase().includes(q)) ||
      (inv.clientName && inv.clientName.toLowerCase().includes(q)) ||
      (inv.workOrderId?.refCode && inv.workOrderId.refCode.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'INVOICE #',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 130,
      render: (val) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            color: '#0b315d',
            fontSize: 12
          }}
        >
          {val || 'INV-REF'}
        </span>
      )
    },
    {
      title: 'WORK ORDER',
      key: 'wo',
      render: (_, r) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#6b7280',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (r.workOrderId?._id) {
              navigate(`/projectmanager/workorders/${r.workOrderId._id}`);
            }
          }}
        >
          {r.workOrderId?.refCode || '—'}
        </span>
      )
    },
    {
      title: 'CLIENT',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (val) => <span style={{ fontWeight: 500, color: '#111827' }}>{val}</span>
    },
    {
      title: 'INVOICE DATE',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? dayjs(val).format('DD MMM YYYY') : '—'}
        </span>
      )
    },
    {
      title: 'DUE DATE',
      key: 'dueDate',
      render: (_, r) => {
        const isPastDue =
          r.dueDate &&
          new Date(r.dueDate) < new Date() &&
          r.status !== 'paid' &&
          r.status !== 'cancelled';
        return (
          <span style={{ fontSize: 12, color: isPastDue ? '#b91c1c' : '#6b7280', fontWeight: isPastDue ? 600 : 400 }}>
            {r.dueDate ? dayjs(r.dueDate).format('DD MMM YYYY') : '—'}
          </span>
        );
      }
    },
    {
      title: 'GRAND TOTAL',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>
          ₹ {Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'PAID',
      dataIndex: 'amountPaid',
      key: 'amountPaid',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#15803d', fontSize: 13 }}>
          ₹ {Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'OUTSTANDING',
      dataIndex: 'amountDue',
      key: 'amountDue',
      render: (val, r) => {
        const due = val !== undefined ? val : Math.max(0, (r.grandTotal || 0) - (r.amountPaid || 0));
        return (
          <span style={{ fontWeight: 600, color: due > 0 ? '#c2410c' : '#15803d', fontSize: 13 }}>
            ₹ {Number(due).toLocaleString('en-IN')}
          </span>
        );
      }
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (st, r) => {
        const isPastDue =
          r.dueDate &&
          new Date(r.dueDate) < new Date() &&
          st !== 'paid' &&
          st !== 'cancelled';
        const displayStatus = isPastDue ? 'overdue' : (st || 'draft');
        const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.draft;

        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 500
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: cfg.color
              }}
            />
            <span style={{ color: cfg.color }}>{cfg.label}</span>
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
              window.open(`/accounts/invoices/${r._id}/print`, '_blank');
            }}
          >
            Print
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage commercial billing, GST schedules, and payment collection</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchInvoices} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
            Create Invoice
          </Button>
        </Space>
      </div>

      {/* ── STATS ROW (4 Cards) ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total Billed</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <DollarOutlined />
              </div>
            </div>
            <div className="stat-card__value">
              ₹ {Number(stats.totalBilled || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">All generated invoices</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total Received</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#15803d' }}>
              ₹ {Number(stats.totalReceived || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">Cleared payments received</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Outstanding Amount</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <WarningOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#c2410c' }}>
              ₹ {Number(stats.totalOutstanding || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">Pending client settlements</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Overdue Count</span>
              <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#b91c1c' }}>
              {stats.overdueCount || 0}
            </div>
            <div className="stat-card__meta">Invoices past payment terms</div>
          </div>
        </Col>
      </Row>

      {/* ── FILTER BAR ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde3ea',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by client name or INV ref..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 160 }}
        >
          <Option value="all">All Statuses</Option>
          <Option value="draft">Draft</Option>
          <Option value="sent">Sent</Option>
          <Option value="partial">Partial</Option>
          <Option value="paid">Paid</Option>
          <Option value="overdue">Overdue</Option>
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
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          locale={{ emptyText: 'No invoices created yet' }}
          onRow={(r) => ({
            onClick: () => handleOpenDrawer(r),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      {/* ── DETAIL DRAWER (width 720px) ── */}
      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={720}
        destroyOnClose
        title={
          selectedInvoice ? (
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
                {selectedInvoice.refCode}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {selectedInvoice.clientName}
              </span>
            </div>
          ) : (
            'Invoice Details'
          )
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.open(`/accounts/invoices/${selectedInvoice?._id}/print`, '_blank')}
            >
              Print Invoice
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>Close</Button>
          </div>
        }
      >
        {selectedInvoice && (
          <div>
            {/* Status Header Row */}
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
                  const cfg = STATUS_CONFIG[selectedInvoice.status] || STATUS_CONFIG.draft;
                  return (
                    <Tag color={cfg.color} style={{ borderRadius: 4, fontWeight: 600 }}>
                      {cfg.label.toUpperCase()}
                    </Tag>
                  );
                })()}
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  Terms: {selectedInvoice.paymentTerms || '30 days'}
                </span>
              </Space>

              <Button
                size="small"
                onClick={() => {
                  setNewStatus(selectedInvoice.status);
                  setStatusModalVisible(true);
                }}
              >
                Change Status
              </Button>
            </div>

            {/* Section 1: Invoice Details */}
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
                Invoice Particulars
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
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>INVOICE DATE</span>
                  <span style={{ fontWeight: 500 }}>
                    {dayjs(selectedInvoice.invoiceDate || selectedInvoice.createdAt).format('DD MMM YYYY')}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>DUE DATE</span>
                  <span style={{ fontWeight: 600, color: '#0b315d' }}>
                    {dayjs(selectedInvoice.dueDate).format('DD MMM YYYY')}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>WORK ORDER LINK</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {selectedInvoice.workOrderId?.refCode || '—'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>ISSUED BY</span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedInvoice.createdBy?.name || 'Accounts Staff'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Line Items */}
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
                Commercial Line Items
              </h3>

              <div style={{ width: '100%', fontSize: 12, border: '1px solid #dde3ea', borderRadius: 6, overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 1fr 1fr 1fr 1.5fr',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #dde3ea',
                    fontWeight: 600,
                    color: '#6b7280',
                    fontSize: 11,
                    textTransform: 'uppercase'
                  }}
                >
                  <span>Description</span>
                  <span style={{ textAlign: 'center' }}>Qty</span>
                  <span style={{ textAlign: 'center' }}>Unit</span>
                  <span style={{ textAlign: 'right' }}>Rate</span>
                  <span style={{ textAlign: 'right' }}>Amount</span>
                </div>

                {selectedInvoice.lineItems?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '3fr 1fr 1fr 1fr 1.5fr',
                      padding: '10px 12px',
                      borderBottom: '1px solid #f0f4f8'
                    }}
                  >
                    <span style={{ fontWeight: 500, color: '#111827' }}>{it.description}</span>
                    <span style={{ textAlign: 'center', color: '#6b7280' }}>{it.quantity}</span>
                    <span style={{ textAlign: 'center', color: '#6b7280' }}>{it.unit}</span>
                    <span style={{ textAlign: 'right', color: '#6b7280' }}>
                      ₹{Number(it.rate).toLocaleString('en-IN')}
                    </span>
                    <span style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                      ₹ {Number(it.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}

                {/* Subtotal */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '6fr 1.5fr',
                    padding: '10px 12px',
                    borderBottom: '1px solid #dde3ea'
                  }}
                >
                  <span style={{ textAlign: 'right', fontWeight: 600, color: '#374151' }}>
                    Subtotal:
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₹ {Number(selectedInvoice.subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* GST */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '6fr 1.5fr',
                    padding: '10px 12px',
                    borderBottom: '2px solid #0b315d'
                  }}
                >
                  <span style={{ textAlign: 'right', color: '#6b7280' }}>
                    GST @ {selectedInvoice.gstRate || 18}%:
                  </span>
                  <span style={{ textAlign: 'right', color: '#6b7280' }}>
                    ₹ {Number(selectedInvoice.gstAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Grand Total */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '6fr 1.5fr',
                    padding: '14px 12px',
                    background: '#eff6ff'
                  }}
                >
                  <span style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: '#0b315d' }}>
                    GRAND TOTAL:
                  </span>
                  <span style={{ textAlign: 'right', fontSize: 18, fontWeight: 700, color: '#0b315d' }}>
                    ₹ {Number(selectedInvoice.grandTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Summary */}
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
                Payment Summary
              </h3>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #dde3ea',
                  borderRadius: 8,
                  padding: 16
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 16,
                    marginBottom: 14
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>TOTAL BILLED</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                      ₹ {Number(selectedInvoice.grandTotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>AMOUNT PAID</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }}>
                      ₹ {Number(selectedInvoice.amountPaid || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>OUTSTANDING DUE</span>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: (selectedInvoice.amountDue || 0) > 0 ? '#c2410c' : '#15803d'
                      }}
                    >
                      ₹ {Number(selectedInvoice.amountDue || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <Progress
                  percent={Math.min(
                    100,
                    Math.round(
                      ((selectedInvoice.amountPaid || 0) / (selectedInvoice.grandTotal || 1)) * 100
                    )
                  )}
                  strokeColor="#15803d"
                  trailColor="#f0fdf4"
                />
              </div>
            </div>

            {/* Section 4: Payment History Table */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 8,
                  marginBottom: 12,
                  borderBottom: '1px solid #dde3ea'
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                  Payment History
                </h3>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleOpenPaymentModal}
                  style={{ background: '#15803d', borderColor: '#15803d' }}
                >
                  Record Payment
                </Button>
              </div>

              <Table
                dataSource={selectedInvoice.payments || []}
                rowKey="_id"
                pagination={false}
                size="small"
                locale={{ emptyText: 'No payment transactions recorded yet' }}
                columns={[
                  {
                    title: 'REF #',
                    dataIndex: 'refCode',
                    key: 'ref',
                    render: (val) => (
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0b315d' }}>
                        {val || 'PAY-REF'}
                      </span>
                    )
                  },
                  {
                    title: 'DATE',
                    dataIndex: 'paymentDate',
                    key: 'date',
                    render: (d) => (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        {d ? dayjs(d).format('DD/MM/YYYY') : '—'}
                      </span>
                    )
                  },
                  {
                    title: 'MODE',
                    dataIndex: 'paymentMode',
                    key: 'mode',
                    render: (m) => <span style={{ textTransform: 'capitalize' }}>{(m || '').replace('_', ' ')}</span>
                  },
                  {
                    title: 'REFERENCE NO',
                    dataIndex: 'referenceNo',
                    key: 'refNo',
                    render: (v) => <span style={{ color: '#6b7280', fontSize: 12 }}>{v || '—'}</span>
                  },
                  {
                    title: 'AMOUNT',
                    dataIndex: 'amount',
                    key: 'amount',
                    align: 'right',
                    render: (a) => (
                      <span style={{ fontWeight: 600, color: '#15803d' }}>
                        ₹ {Number(a || 0).toLocaleString('en-IN')}
                      </span>
                    )
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* ── CREATE INVOICE MODAL ── */}
      <Modal
        title="Create Tax Invoice"
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
          initialValues={{ paymentTerms: '30 days' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="workOrderId"
            label="Source Work Order"
            rules={[{ required: true, message: 'Please select a work order' }]}
          >
            <Select
              placeholder="Search work order..."
              showSearch
              optionFilterProp="children"
              onChange={handleWOSelectChange}
            >
              {workOrdersList.map((wo) => (
                <Option key={wo._id} value={wo._id}>
                  {wo.refCode} — {wo.clientName} ({wo.status})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedWOPreview && (
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
                <span style={{ color: '#1e40af', display: 'block', fontWeight: 600 }}>CLIENT</span>
                <span style={{ color: '#1e293b' }}>{selectedWOPreview.client}</span>
              </div>
              <div>
                <span style={{ color: '#1e40af', display: 'block', fontWeight: 600 }}>ROOF MODEL</span>
                <span style={{ color: '#1e293b' }}>{selectedWOPreview.model}</span>
              </div>
              <div>
                <span style={{ color: '#1e40af', display: 'block', fontWeight: 600 }}>GRAND TOTAL</span>
                <span style={{ color: '#0b315d', fontWeight: 700 }}>
                  {selectedWOPreview.grandTotal}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="dueDate"
              label="Payment Due Date"
              rules={[{ required: true, message: 'Select due date' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
            </Form.Item>

            <Form.Item name="paymentTerms" label="Payment Terms">
              <Select>
                <Option value="On Delivery">On Delivery</Option>
                <Option value="7 Days">7 Days</Option>
                <Option value="15 Days">15 Days</Option>
                <Option value="30 Days">30 Days</Option>
                <Option value="45 Days">45 Days</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Invoice Notes / Payment Instructions">
            <TextArea rows={2} placeholder="Bank details, wire instructions..." />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #dde3ea'
            }}
          >
            <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingCreate}
              style={{ background: '#0b315d', borderColor: '#0b315d' }}
            >
              Create Invoice
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── RECORD PAYMENT MODAL ── */}
      <Modal
        title={`Record Payment — ${selectedInvoice?.refCode || 'Invoice'}`}
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        destroyOnClose
        width={440}
      >
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 6,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 13
          }}
        >
          <span style={{ color: '#9a3412', fontWeight: 600 }}>Outstanding Balance Due: </span>
          <span style={{ fontWeight: 700, color: '#c2410c' }}>
            ₹ {Number(selectedInvoice?.amountDue || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentSubmit}
        >
          <Form.Item
            name="amount"
            label="Payment Amount (₹)"
            rules={[
              { required: true, message: 'Enter payment amount' },
              {
                type: 'number',
                min: 1,
                message: 'Must be greater than 0'
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              step={100}
              placeholder="e.g. 50000"
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
            </Form.Item>

            <Form.Item name="paymentMode" label="Payment Mode">
              <Select>
                {PAYMENT_MODES.map((pm) => (
                  <Option key={pm.key} value={pm.key}>
                    {pm.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="referenceNo" label="Reference No / Transaction UTR">
            <Input placeholder="UTR / Cheque No / UPI Ref..." />
          </Form.Item>

          <Form.Item name="notes" label="Payment Remarks">
            <TextArea rows={2} placeholder="Cheque clearance notes, bank account ref..." />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #dde3ea'
            }}
          >
            <Button onClick={() => setPaymentModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingPayment}
              style={{ background: '#15803d', borderColor: '#15803d' }}
            >
              Record Payment
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── CHANGE STATUS MODAL ── */}
      <Modal
        title="Update Invoice Status"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={handleChangeStatus}
        width={400}
      >
        <div style={{ padding: '16px 0' }}>
          <Select
            value={newStatus}
            onChange={(val) => setNewStatus(val)}
            style={{ width: '100%' }}
          >
            <Option value="draft">Draft</Option>
            <Option value="sent">Sent</Option>
            <Option value="partial">Partial</Option>
            <Option value="paid">Paid</Option>
            <Option value="overdue">Overdue</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default InvoicesPage;
