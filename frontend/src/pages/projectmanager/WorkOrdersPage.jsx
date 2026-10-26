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
  Avatar,
  message,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
  EditOutlined,
  ArrowRightOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Option } = Select;
const { TextArea } = Input;

const PRIORITY_TAGS = {
  urgent: { bg: '#fef2f2', color: '#b91c1c', label: 'Urgent' },
  high: { bg: '#fff7ed', color: '#c2410c', label: 'High' },
  medium: { bg: '#eff6ff', color: '#1e40af', label: 'Medium' },
  low: { bg: '#f1f5f9', color: '#475569', label: 'Low' }
};

const STATUS_CONFIG = {
  pending_accounts_approval: { color: '#d97706', label: '1. Accounts Approval' },
  pending_design: { color: '#2563eb', label: '2. In Design' },
  pending_pm_review: { color: '#7c3aed', label: '3. PM Review' },
  drawing_revision: { color: '#dc2626', label: '3b. Drawing Revision' },
  pending_purchase: { color: '#0891b2', label: '4. Procurement' },
  pending_delivery: { color: '#4f46e5', label: '5. Awaiting Delivery' },
  materials_received: { color: '#059669', label: '6a. GRN Verified' },
  in_fabrication: { color: '#0b2e59', label: '6b. In Fabrication' },
  completed: { color: '#15803d', label: '7. Completed' },
  active: { color: '#3b82f6', label: 'Active' },
  draft: { color: '#6b7280', label: 'Draft' },
  on_hold: { color: '#f59e0b', label: 'On Hold' },
  cancelled: { color: '#ef4444', label: 'Cancelled' }
};

const WorkOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Data states
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    active: 0,
    on_hold: 0,
    completed: 0,
    cancelled: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Detail Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Change Modal state
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('active');

  // Create Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [approvedEstimates, setApprovedEstimates] = useState([]);
  const [selectedEstimatePreview, setSelectedEstimatePreview] = useState(null);
  const [pmUsers, setPmUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [createForm] = Form.useForm();

  // ──────────────────────────────────────────
  // FETCH DATA
  // ──────────────────────────────────────────
  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/workorders'),
        api.get('/workorders/stats').catch(() => ({ data: { data: {} } }))
      ]);

      if (listRes.data && listRes.data.data) {
        setWorkOrders(listRes.data.data);
      }
      if (statsRes.data && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching work orders:', err);
      message.error(err.response?.data?.message || 'Failed to load work orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  // Fetch estimates & PMs for modal
  const handleOpenCreateModal = async () => {
    createForm.resetFields();
    setSelectedEstimatePreview(null);
    setCreateModalVisible(true);

    try {
      const [estRes, usersRes] = await Promise.all([
        api.get('/estimates'),
        api.get('/admin/users').catch(() => ({ data: { users: [] } }))
      ]);

      if (estRes.data && estRes.data.estimates) {
        // Show approved estimates or all estimates that are ready for WO
        setApprovedEstimates(estRes.data.estimates);
      }
      if (usersRes.data && usersRes.data.users) {
        const pms = usersRes.data.users.filter(
          (u) => u.role === 'projectmanager' || u.role === 'admin'
        );
        setPmUsers(pms);
      }
    } catch (e) {
      console.error('Error loading modal dependencies:', e);
    }
  };

  // On selecting estimate in Create Modal
  const handleEstimateSelectChange = (estimateId) => {
    const found = approvedEstimates.find((e) => e._id === estimateId);
    if (found) {
      const grandTotal =
        found.results?.costs?.grandTotal || found.results?.costs?.beforeGst || 0;
      setSelectedEstimatePreview({
        client: found.enquiryId?.clientName || 'Valued Customer',
        model: found.model || 'Standard Model',
        grandTotal: `₹ ${Number(grandTotal).toLocaleString('en-IN')}`
      });
    } else {
      setSelectedEstimatePreview(null);
    }
  };

  const handleCreateSubmit = async (values) => {
    setSubmitting(true);
    try {
      await api.post('/workorders', {
        estimateId: values.estimateId,
        targetDate: values.targetDate ? values.targetDate.toDate() : undefined,
        priority: values.priority || 'medium',
        assignedPM: values.assignedPM || user?._id,
        notes: values.notes || ''
      });

      message.success(
        'Work order created. Design, Purchase, Workshop and Site Visit tasks generated automatically.'
      );
      setCreateModalVisible(false);
      createForm.resetFields();
      setSelectedEstimatePreview(null);
      fetchWorkOrders();
    } catch (err) {
      console.error('Create work order error:', err);
      message.error(err.response?.data?.message || 'Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Drawer and fetch details
  const handleOpenDrawer = async (record) => {
    setSelectedWO(record);
    setDrawerVisible(true);
    setLoadingDetail(true);

    try {
      const res = await api.get(`/workorders/${record._id}`);
      if (res.data && res.data.data) {
        setSelectedWO(res.data.data);
      }
    } catch (e) {
      console.error('Detail fetch error:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Status Change Handler
  const handleChangeStatus = async () => {
    if (!selectedWO) return;
    try {
      await api.patch(`/workorders/${selectedWO._id}`, { status: newStatus });
      message.success(`Status updated to ${newStatus}`);
      setSelectedWO((prev) => ({ ...prev, status: newStatus }));
      setStatusModalVisible(false);
      fetchWorkOrders();
    } catch (e) {
      message.error('Failed to update status');
    }
  };

  // Filtered rows
  const filteredWorkOrders = workOrders.filter((wo) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (wo.refCode && wo.refCode.toLowerCase().includes(q)) ||
      (wo.clientName && wo.clientName.toLowerCase().includes(q)) ||
      (wo.roofModel && wo.roofModel.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || wo.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const columns = [
    {
      title: 'REF CODE',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (val) => <span className="ref-badge">{val || '—'}</span>
    },
    {
      title: 'CLIENT',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (val, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{val}</span>
          {r.siteAddress && (
            <div style={{ fontSize: 11, color: '#64748b' }}>{r.siteAddress}</div>
          )}
        </div>
      )
    },
    {
      title: 'ROOF MODEL',
      dataIndex: 'roofModel',
      key: 'roofModel',
      render: (val) => <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{val || '—'}</span>
    },
    {
      title: 'PRIORITY',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (val) => {
        const cfg = PRIORITY_TAGS[val] || PRIORITY_TAGS.medium;
        return (
          <Tag
            bordered={false}
            style={{
              backgroundColor: cfg.bg,
              color: cfg.color,
              fontWeight: 600,
              fontSize: 11,
              borderRadius: 4
            }}
          >
            {cfg.label}
          </Tag>
        );
      }
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
      title: 'TARGET DATE',
      dataIndex: 'targetDate',
      key: 'targetDate',
      width: 130,
      render: (val) => (
        <span style={{ fontSize: 12.5, color: '#64748b' }} className="tabular-nums">
          {val ? dayjs(val).format('DD MMM YYYY') : '—'}
        </span>
      )
    },
    {
      title: 'PM ASSIGNED',
      key: 'pm',
      render: (_, r) => {
        const name = r.assignedPM?.name || user?.name || 'Project Manager';
        const initial = name.charAt(0).toUpperCase();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar size={24} style={{ backgroundColor: '#0b2e59', fontSize: 11, fontWeight: 600 }}>
              {initial}
            </Avatar>
            <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 500 }}>{name}</span>
          </div>
        );
      }
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space size={4}>
          {r.status === 'completed' && (
            <Button
              type="primary"
              size="small"
              icon={<FileTextOutlined />}
              style={{ background: '#15803d', borderColor: '#15803d', fontSize: 12 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/accounts/invoices?workOrderId=${r._id}`);
              }}
            >
              Invoice
            </Button>
          )}
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
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Work Orders</h1>
          <p className="page-subtitle">Plan and track all active roofing projects</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchWorkOrders} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
            Create Work Order
          </Button>
        </Space>
      </div>

      {/* ── STATS ROW (5 Cards) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 20
        }}
      >
        <div className="stat-card">
          <span className="stat-card__label">Total Work Orders</span>
          <span className="stat-card__value">{stats.total || 0}</span>
          <span className="stat-card__meta">All registered projects</span>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Active Operations</span>
          <span className="stat-card__value" style={{ color: '#1e40af' }}>
            {stats.active || 0}
          </span>
          <span className="stat-card__meta">In production & erection</span>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">On Hold</span>
          <span className="stat-card__value" style={{ color: '#f59e0b' }}>
            {stats.on_hold || 0}
          </span>
          <span className="stat-card__meta">Pending client or site clearance</span>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Completed</span>
          <span className="stat-card__value" style={{ color: '#15803d' }}>
            {stats.completed || 0}
          </span>
          <span className="stat-card__meta">Handed over to customer</span>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Cancelled</span>
          <span className="stat-card__value" style={{ color: '#b91c1c' }}>
            {stats.cancelled || 0}
          </span>
          <span className="stat-card__meta">Archived or dropped</span>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by client or ref..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ width: 260 }}
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 160 }}
        >
          <Option value="all">All Statuses</Option>
          <Option value="draft">Draft</Option>
          <Option value="active">Active</Option>
          <Option value="on_hold">On Hold</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>

        <Select
          value={priorityFilter}
          onChange={(val) => setPriorityFilter(val)}
          style={{ width: 140 }}
        >
          <Option value="all">All Priorities</Option>
          <Option value="low">Low</Option>
          <Option value="medium">Medium</Option>
          <Option value="high">High</Option>
          <Option value="urgent">Urgent</Option>
        </Select>

        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <Button
            type="link"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPriorityFilter('all');
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
          dataSource={filteredWorkOrders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          onRow={(record) => ({
            onClick: () => handleOpenDrawer(record),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      {/* ── DETAIL DRAWER (680px) ── */}
      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={680}
        destroyOnClose
        title={
          selectedWO ? (
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
                {selectedWO.refCode}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {selectedWO.clientName}
              </span>
            </div>
          ) : (
            'Work Order Details'
          )
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setDrawerVisible(false);
                navigate(`/projectmanager/workorders/${selectedWO?._id}`);
              }}
              style={{ background: '#0b315d', borderColor: '#0b315d' }}
            >
              Open Full Page Detail →
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>Close</Button>
          </div>
        }
      >
        {selectedWO && (
          <div>
            {/* Status + Priority Row */}
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
                  const sCfg = STATUS_CONFIG[selectedWO.status] || STATUS_CONFIG.draft;
                  return (
                    <Tag color={sCfg.color} style={{ borderRadius: 4, fontWeight: 600 }}>
                      {sCfg.label.toUpperCase()}
                    </Tag>
                  );
                })()}

                {(() => {
                  const pCfg = PRIORITY_TAGS[selectedWO.priority] || PRIORITY_TAGS.medium;
                  return (
                    <Tag
                      bordered={false}
                      style={{
                        backgroundColor: pCfg.bg,
                        color: pCfg.color,
                        fontWeight: 600,
                        borderRadius: 4
                      }}
                    >
                      {pCfg.label} Priority
                    </Tag>
                  );
                })()}
              </Space>

              <Button
                size="small"
                onClick={() => {
                  setNewStatus(selectedWO.status);
                  setStatusModalVisible(true);
                }}
              >
                Change Status
              </Button>
            </div>

            {/* Section 1: Project Details */}
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
                Project Details
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
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>ROOF MODEL</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {selectedWO.roofModel || 'Standard'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>GRAND TOTAL</span>
                  <span style={{ fontWeight: 700, color: '#0b315d', fontSize: 14 }}>
                    ₹ {Number(selectedWO.grandTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>SPAN × LENGTH</span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedWO.span || '—'}m × {selectedWO.length || '—'}m
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>PROJECTION HEIGHT</span>
                  <span style={{ fontWeight: 500 }}>{selectedWO.height || '0'}m</span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>TARGET DATE</span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedWO.targetDate
                      ? dayjs(selectedWO.targetDate).format('DD MMM YYYY')
                      : 'Not set'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>PM ASSIGNED</span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedWO.assignedPM?.name || user?.name || 'Project Manager'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Task Overview */}
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
                Operational Tasks Overview
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {/* Design Task */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #dde3ea',
                    borderRadius: 8,
                    padding: 12
                  }}
                >
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                    1. Design Drawings
                  </div>
                  <div style={{ margin: '6px 0', fontSize: 13, fontWeight: 600 }}>
                    {selectedWO.designTask?.title || 'Structural Drawings'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="blue">{selectedWO.designTask?.status || 'pending'}</Tag>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setDrawerVisible(false);
                        navigate('/design/drawings');
                      }}
                      style={{ padding: 0 }}
                    >
                      View →
                    </Button>
                  </div>
                </div>

                {/* Purchase Request */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #dde3ea',
                    borderRadius: 8,
                    padding: 12
                  }}
                >
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                    2. Procurement / PR
                  </div>
                  <div style={{ margin: '6px 0', fontSize: 13, fontWeight: 600 }}>
                    {selectedWO.purchaseRequest?.refCode || 'Purchase Request'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="orange">{selectedWO.purchaseRequest?.status || 'pending'}</Tag>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setDrawerVisible(false);
                        navigate('/purchase/requests');
                      }}
                      style={{ padding: 0 }}
                    >
                      View →
                    </Button>
                  </div>
                </div>

                {/* Workshop Job */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #dde3ea',
                    borderRadius: 8,
                    padding: 12
                  }}
                >
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                    3. Fabrication Job
                  </div>
                  <div style={{ margin: '6px 0', fontSize: 13, fontWeight: 600 }}>
                    {selectedWO.workshopJob?.title || 'Workshop Job'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="purple">{selectedWO.workshopJob?.status || 'pending'}</Tag>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setDrawerVisible(false);
                        navigate('/workshop/jobs');
                      }}
                      style={{ padding: 0 }}
                    >
                      View →
                    </Button>
                  </div>
                </div>

                {/* Site Visit */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #dde3ea',
                    borderRadius: 8,
                    padding: 12
                  }}
                >
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                    4. Site Inspection
                  </div>
                  <div style={{ margin: '6px 0', fontSize: 13, fontWeight: 600 }}>
                    {selectedWO.siteVisit?.refCode || 'Site Kickoff'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="green">{selectedWO.siteVisit?.status || 'scheduled'}</Tag>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setDrawerVisible(false);
                        navigate('/sitevisitor/visits');
                      }}
                      style={{ padding: 0 }}
                    >
                      View →
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Notes */}
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
                Project Notes & Instructions
              </h3>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #dde3ea',
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 13,
                  color: '#374151',
                  whiteSpace: 'pre-wrap',
                  minHeight: 60
                }}
              >
                {selectedWO.notes || 'No notes provided for this project.'}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── CREATE WORK ORDER MODAL ── */}
      <Modal
        title="Create Work Order"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
          initialValues={{ priority: 'medium' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="estimateId"
            label="Source Estimate"
            rules={[{ required: true, message: 'Please select an estimate' }]}
          >
            <Select
              placeholder="Search approved estimate..."
              showSearch
              optionFilterProp="children"
              onChange={handleEstimateSelectChange}
            >
              {approvedEstimates.map((est) => {
                const total =
                  est.results?.costs?.grandTotal || est.results?.costs?.beforeGst || 0;
                const ref = `EST-${est._id.slice(-6).toUpperCase()}`;
                const client = est.enquiryId?.clientName || 'General Client';
                return (
                  <Option key={est._id} value={est._id}>
                    {ref} — {client} — ₹{Number(total).toLocaleString('en-IN')} ({est.model})
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {/* Auto-fill read-only summary row */}
          {selectedEstimatePreview && (
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
                <span style={{ color: '#1e293b' }}>{selectedEstimatePreview.client}</span>
              </div>
              <div>
                <span style={{ color: '#1e40af', display: 'block', fontWeight: 600 }}>ROOF MODEL</span>
                <span style={{ color: '#1e293b' }}>{selectedEstimatePreview.model}</span>
              </div>
              <div>
                <span style={{ color: '#1e40af', display: 'block', fontWeight: 600 }}>GRAND TOTAL</span>
                <span style={{ color: '#0b315d', fontWeight: 700 }}>
                  {selectedEstimatePreview.grandTotal}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="targetDate"
              label="Target Completion Date"
              rules={[{ required: true, message: 'Please select target date' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
            </Form.Item>

            <Form.Item name="priority" label="Priority">
              <Select>
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="urgent">Urgent</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="assignedPM" label="Assign Project Manager">
            <Select placeholder="Select PM...">
              {pmUsers.map((p) => (
                <Option key={p._id} value={p._id}>
                  {p.name} ({p.role})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Project Notes & Instructions">
            <TextArea rows={3} placeholder="Initial kickoff directions, site constraints..." />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid #dde3ea'
            }}
          >
            <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#0b315d', borderColor: '#0b315d' }}
            >
              Create Work Order
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── CHANGE STATUS MODAL ── */}
      <Modal
        title="Update Work Order Status"
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
            <Option value="active">Active</Option>
            <Option value="on_hold">On Hold</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default WorkOrdersPage;
