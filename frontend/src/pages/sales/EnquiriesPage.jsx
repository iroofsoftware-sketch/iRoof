import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Avatar,
  message,
  Dropdown,
  Row,
  Col,
  Segmented,
  Tag,
  Typography,
  Card,
  Badge,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CalculatorOutlined,
  EditOutlined,
  AppstoreOutlined,
  BarsOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  RightCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PaperClipOutlined,
  DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AttachmentManager from '../../components/common/AttachmentManager';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const STATUSES = [
  { key: 'new', label: 'New Lead', color: '#0b2e59' },
  { key: 'visited', label: 'Site Survey', color: '#1d4ed8' },
  { key: 'estimated', label: 'Estimated', color: '#0284c7' },
  { key: 'approved', label: 'Negotiation / Approved', color: '#c9940a' },
  { key: 'completed', label: 'Project Won', color: '#15803d' },
  { key: 'rejected', label: 'Closed / Lost', color: '#94a3b8' }
];

const ROOF_TYPES = [
  'Normal Cantilever',
  'Auditorium',
  'PEB Cantilever',
  'Type 2 Cantilever',
  'Simply Supported',
  'Custom Roof Structure'
];

const EnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  // Modals & Drawers
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/enquiries');
      if (response.data && response.data.enquiries) {
        setEnquiries(response.data.enquiries);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      message.error(err.response?.data?.message || 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleOpenCreateModal = () => {
    setEditingEnquiry(null);
    setAttachments([]);
    form.resetFields();
    form.setFieldsValue({
      roofType: 'Normal Cantilever',
      status: 'new',
      enquiryDate: dayjs()
    });
    setModalVisible(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingEnquiry(record);
    setAttachments(record.attachments || []);
    form.resetFields();
    form.setFieldsValue({
      clientName: record.clientName,
      phone: record.phone,
      email: record.email,
      address: record.address,
      roofType: record.roofType || 'Normal Cantilever',
      status: record.status || 'new',
      enquiryDate: record.enquiryDate ? dayjs(record.enquiryDate) : dayjs(),
      notes: record.notes
    });
    setModalVisible(true);
  };

  const handleOpenDrawer = (record) => {
    setSelectedEnquiry(record);
    setAttachments(record.attachments || []);
    setDrawerVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        clientName: values.clientName,
        phone: values.phone,
        email: values.email,
        address: values.address,
        roofType: values.roofType,
        status: values.status,
        enquiryDate: values.enquiryDate ? values.enquiryDate.toISOString() : new Date().toISOString(),
        notes: values.notes,
        attachments: attachments || []
      };

      if (editingEnquiry) {
        await api.put(`/enquiries/${editingEnquiry._id}`, payload);
        message.success('Enquiry updated');
      } else {
        await api.post('/enquiries', payload);
        message.success('New enquiry created');
      }

      setModalVisible(false);
      fetchEnquiries();
    } catch (err) {
      console.error('Save enquiry error:', err);
      message.error(err.response?.data?.message || 'Failed to save enquiry');
    }
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await api.put(`/enquiries/${enquiryId}`, { status: newStatus });
      message.success(`Lead moved to ${newStatus}`);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
      );
      if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
        setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Status change error:', err);
      message.error('Failed to change status');
    }
  };

  const handleDrawerAttachmentsChange = async (newAttachments) => {
    setAttachments(newAttachments);
    if (selectedEnquiry) {
      try {
        await api.put(`/enquiries/${selectedEnquiry._id}`, { attachments: newAttachments });
        setSelectedEnquiry((prev) => ({ ...prev, attachments: newAttachments }));
        setEnquiries((prev) =>
          prev.map((e) => (e._id === selectedEnquiry._id ? { ...e, attachments: newAttachments } : e))
        );
      } catch (err) {
        console.error('Error saving attachments:', err);
        message.error('Failed to update attachments');
      }
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (e.clientName && e.clientName.toLowerCase().includes(q)) ||
      (e._id && e._id.toLowerCase().includes(q)) ||
      (e.address && e.address.toLowerCase().includes(q)) ||
      (e.phone && e.phone.includes(q));

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;

    let matchesDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const enqDate = dayjs(e.enquiryDate || e.createdAt);
      matchesDate =
        enqDate.isAfter(dateRange[0].startOf('day')) &&
        enqDate.isBefore(dateRange[1].endOf('day'));
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const columns = [
    {
      title: 'REF #',
      dataIndex: '_id',
      key: 'ref',
      width: 120,
      render: (id) => <span className="ref-badge">ENQ-{id.slice(-6).toUpperCase()}</span>
    },
    {
      title: 'CUSTOMER',
      dataIndex: 'clientName',
      key: 'customer',
      render: (name) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{name}</span>
    },
    {
      title: 'LOCATION',
      dataIndex: 'address',
      key: 'location',
      render: (loc) => <span style={{ color: '#64748b' }}>{loc || '—'}</span>
    },
    {
      title: 'ROOF MODEL',
      dataIndex: 'roofType',
      key: 'roofType',
      render: (rt) => <Tag color="blue">{rt || 'Cantilever'}</Tag>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (st) => (
        <span className={`status-dot status-${st || 'new'}`}>
          <span style={{ textTransform: 'capitalize' }}>{st || 'new'}</span>
        </span>
      )
    },
    {
      title: 'DOCUMENTS',
      key: 'attachments',
      render: (_, r) =>
        r.attachments && r.attachments.length > 0 ? (
          <Tag icon={<PaperClipOutlined />} color="default">
            {r.attachments.length} files
          </Tag>
        ) : (
          <span style={{ color: '#cbd5e1' }}>—</span>
        )
    },
    {
      title: 'DATE',
      dataIndex: 'enquiryDate',
      key: 'date',
      width: 110,
      render: (d) => (
        <span style={{ color: '#64748b', fontSize: 12 }} className="tabular-nums">
          {d ? new Date(d).toLocaleDateString('en-IN') : '—'}
        </span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDrawer(record);
            }}
            style={{ color: '#0b2e59', fontWeight: 600 }}
          >
            View
          </Button>
          <Button
            type="text"
            size="small"
            icon={<CalculatorOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sales/estimates/new?enquiryId=${record._id}`);
            }}
            style={{ color: '#c9940a', fontWeight: 600 }}
            title="Create Estimate"
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Sales Pipeline & Leads</h1>
          <p className="page-subtitle">
            Manage commercial roofing leads, architectural inquiries, site measurements, and proposal progress
          </p>
        </div>

        <div className="page-header__actions">
          {/* View Switcher */}
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: 'Kanban Board', value: 'kanban', icon: <AppstoreOutlined /> },
              { label: 'Table List', value: 'table', icon: <BarsOutlined /> }
            ]}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
          >
            New Lead
          </Button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Search leads by client name, ref, phone, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 320, flex: '1 1 260px' }}
          allowClear
        />

        {viewMode === 'table' && (
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            placeholder="All Stages"
          >
            <Option value="all">All Stages</Option>
            {STATUSES.map((s) => (
              <Option key={s.key} value={s.key}>
                {s.label}
              </Option>
            ))}
          </Select>
        )}

        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD/MM/YYYY"
          style={{ width: 240 }}
        />

        {(searchQuery || statusFilter !== 'all' || dateRange) && (
          <Button
            type="link"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDateRange(null);
            }}
            style={{ color: '#64748b', padding: 0 }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            alignItems: 'flex-start',
            overflowX: 'auto',
            paddingBottom: 16
          }}
        >
          {STATUSES.map((col) => {
            const colLeads = filteredEnquiries.filter((e) => (e.status || 'new') === col.key);

            return (
              <div
                key={col.key}
                style={{
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 230px)'
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: col.color
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {col.label}
                    </span>
                  </div>
                  <Tag
                    style={{
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 11,
                      margin: 0,
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {colLeads.length}
                  </Tag>
                </div>

                {/* Column Cards Container */}
                <div
                  style={{
                    padding: 10,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    minHeight: 120
                  }}
                >
                  {colLeads.length === 0 ? (
                    <div
                      style={{
                        padding: '24px 12px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: 12,
                        border: '1px dashed #e2e8f0',
                        borderRadius: 6
                      }}
                    >
                      No leads in this stage
                    </div>
                  ) : (
                    colLeads.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleOpenDrawer(item)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          padding: 12,
                          boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#0b2e59';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Top: Ref & Date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="ref-badge" style={{ fontSize: 10.5 }}>
                            ENQ-{item._id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {item.enquiryDate ? dayjs(item.enquiryDate).format('DD MMM') : ''}
                          </span>
                        </div>

                        {/* Client Name */}
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
                          {item.clientName}
                        </div>

                        {/* Roof Model */}
                        <div>
                          <Tag color="blue" style={{ fontSize: 10.5, margin: 0 }}>
                            {item.roofType || 'Normal Cantilever'}
                          </Tag>
                        </div>

                        {/* Location & Attachments */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#64748b' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <EnvironmentOutlined style={{ fontSize: 11 }} />
                            {item.address || 'Location pending'}
                          </span>
                          {item.attachments && item.attachments.length > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#0284c7' }}>
                              <PaperClipOutlined /> {item.attachments.length}
                            </span>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: 8,
                            marginTop: 2
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Dropdown
                            menu={{
                              items: STATUSES.map((s) => ({
                                key: s.key,
                                label: s.label,
                                onClick: () => handleStatusChange(item._id, s.key)
                              }))
                            }}
                          >
                            <Button size="small" type="text" style={{ fontSize: 11, color: '#475569', padding: '0 4px' }}>
                              Move <DownOutlined style={{ fontSize: 9 }} />
                            </Button>
                          </Dropdown>

                          <Button
                            size="small"
                            type="primary"
                            icon={<CalculatorOutlined />}
                            onClick={() => navigate(`/sales/estimates/new?enquiryId=${item._id}`)}
                            style={{
                              background: '#0b2e59',
                              borderColor: '#0b2e59',
                              fontSize: 11,
                              height: 24,
                              padding: '0 8px'
                            }}
                          >
                            Estimate
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW: TABLE */
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={columns}
            dataSource={filteredEnquiries}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 12, showSizeChanger: true }}
            onRow={(record) => ({
              onClick: () => handleOpenDrawer(record),
              style: { cursor: 'pointer' }
            })}
          />
        </div>
      )}

      {/* DETAIL DRAWER */}
      <Drawer
        title={null}
        placement="right"
        width={580}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose
        styles={{
          body: { padding: '24px 24px 90px 24px', background: '#ffffff' }
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 0' }}>
            <Button onClick={() => setDrawerVisible(false)}>Close</Button>
            {selectedEnquiry && (
              <>
                <Button
                  onClick={() => {
                    setDrawerVisible(false);
                    handleOpenEditModal(selectedEnquiry);
                  }}
                >
                  Edit Details
                </Button>
                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  onClick={() => {
                    setDrawerVisible(false);
                    navigate(`/sales/estimates/new?enquiryId=${selectedEnquiry._id}`);
                  }}
                  style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
                >
                  Create Commercial Estimate
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedEnquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span className="ref-badge" style={{ fontSize: 12 }}>
                  ENQ-{selectedEnquiry._id.slice(-6).toUpperCase()}
                </span>
                <span className={`status-dot status-${selectedEnquiry.status || 'new'}`}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {selectedEnquiry.status || 'new'}
                  </span>
                </span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {selectedEnquiry.clientName}
              </h2>
            </div>

            {/* Quick Stage advance row */}
            <div
              style={{
                background: '#f8fafc',
                padding: '10px 14px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
                Pipeline Stage:
              </span>
              <Dropdown
                menu={{
                  items: STATUSES.map((s) => ({
                    key: s.key,
                    label: s.label,
                    onClick: () => handleStatusChange(selectedEnquiry._id, s.key)
                  }))
                }}
              >
                <Button size="small" style={{ fontSize: 12 }}>
                  Move Stage <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>
            </div>

            {/* Customer Details */}
            <Card styles={{ body: { padding: 14 } }} style={{ borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                Contact & Site Coordinates
              </div>
              <Row gutter={[12, 10]} style={{ fontSize: 12.5 }}>
                <Col span={12}>
                  <div style={{ color: '#64748b' }}>Phone Number</div>
                  <strong className="tabular-nums" style={{ color: '#0f172a' }}>{selectedEnquiry.phone}</strong>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#64748b' }}>Email</div>
                  <strong style={{ color: '#0f172a' }}>{selectedEnquiry.email || '—'}</strong>
                </Col>
                <Col span={24}>
                  <div style={{ color: '#64748b' }}>Site Address</div>
                  <div style={{ color: '#0f172a' }}>{selectedEnquiry.address || '—'}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#64748b' }}>Roof Architecture</div>
                  <Tag color="blue">{selectedEnquiry.roofType || 'Standard Cantilever'}</Tag>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#64748b' }}>Date Received</div>
                  <div>{selectedEnquiry.enquiryDate ? new Date(selectedEnquiry.enquiryDate).toLocaleDateString('en-IN') : '—'}</div>
                </Col>
              </Row>
            </Card>

            {/* Notes */}
            <Card styles={{ body: { padding: 14 } }} style={{ borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Engineering & Site Notes
              </div>
              <div style={{ fontSize: 12.5, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {selectedEnquiry.notes || 'No preliminary notes recorded for this enquiry.'}
              </div>
            </Card>

            {/* Document Attachments Manager */}
            <Card styles={{ body: { padding: 14 } }} style={{ borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <AttachmentManager
                title="Site Measurement Photos & Drawings"
                attachments={attachments}
                onChange={handleDrawerAttachmentsChange}
              />
            </Card>
          </div>
        )}
      </Drawer>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={editingEnquiry ? 'Edit Enquiry & Lead' : 'Create New Client Lead'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="clientName"
                label="Customer / Company Name"
                rules={[{ required: true, message: 'Please enter customer name' }]}
              >
                <Input placeholder="e.g. Acme Warehouses Pvt Ltd" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone' }]}
              >
                <Input placeholder="+91 9876543210" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="email" label="Email Address">
                <Input placeholder="contact@example.com" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="enquiryDate" label="Enquiry Date">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Site Address / Location">
            <Input placeholder="Industrial Estate, Survey No., City" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="roofType" label="Roof Engineering Model">
                <Select>
                  {ROOF_TYPES.map((t) => (
                    <Option key={t} value={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="status" label="Pipeline Stage">
                <Select>
                  {STATUSES.map((s) => (
                    <Option key={s.key} value={s.key}>
                      {s.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Field Notes & Requirements">
            <TextArea rows={3} placeholder="Span dimensions, height, site constraints, column spacing..." />
          </Form.Item>

          {/* Attachments inside modal */}
          <div style={{ marginBottom: 16 }}>
            <AttachmentManager
              title="Site Photos / Blueprints"
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#0b2e59', borderColor: '#0b2e59' }}>
              {editingEnquiry ? 'Save Changes' : 'Create Lead'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EnquiriesPage;
