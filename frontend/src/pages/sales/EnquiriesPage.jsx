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
  Col
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CalculatorOutlined,
  EditOutlined,
  CloseOutlined,
  DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const STATUSES = [
  { key: 'new', label: 'New' },
  { key: 'visited', label: 'Visited' },
  { key: 'estimated', label: 'Estimated' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'completed', label: 'Completed' }
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
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editingEnquiry, setEditingEnquiry] = useState(null);

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
        notes: values.notes
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
      await api.patch(`/enquiries/${enquiryId}/status`, { status: newStatus });
      message.success(`Status updated to ${newStatus}`);
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

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || dateRange !== null;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateRange(null);
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
      width: 100,
      render: (id) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 500, color: '#0b315d', fontSize: 12 }}>
          #{id.slice(-6).toUpperCase()}
        </span>
      )
    },
    {
      title: 'CUSTOMER',
      dataIndex: 'clientName',
      key: 'customer',
      render: (name) => <span style={{ fontWeight: 500, color: '#111827' }}>{name}</span>
    },
    {
      title: 'LOCATION',
      dataIndex: 'address',
      key: 'location',
      render: (loc) => <span style={{ color: '#6b7280' }}>{loc || '—'}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <span className={`status-dot status-${st || 'new'}`}>
          <span style={{ textTransform: 'capitalize' }}>{st || 'new'}</span>
        </span>
      )
    },
    {
      title: 'DATE',
      dataIndex: 'enquiryDate',
      key: 'date',
      render: (d) => (
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          {d ? new Date(d).toLocaleDateString('en-IN') : '—'}
        </span>
      )
    },
    {
      title: 'ASSIGNED TO',
      key: 'assigned',
      render: (_, r) => {
        const staffName = r.assignedTo?.name || r.createdBy?.name || 'Sales Staff';
        const initial = staffName.charAt(0).toUpperCase();
        return (
          <Space size={6}>
            <Avatar size={22} style={{ background: '#dde3ea', color: '#374151', fontSize: 11 }}>
              {initial}
            </Avatar>
            <span style={{ fontSize: 12, color: '#374151' }}>{staffName}</span>
          </Space>
        );
      }
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDrawer(record);
          }}
          style={{ color: '#0b315d', fontWeight: 500 }}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* HEADER ROW */}
      <div className="page-header">
        <div>
          <div className="page-title">Enquiries</div>
          <div className="page-subtitle">Manage client leads and site visits</div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          style={{ background: '#0b315d', borderColor: '#0b315d' }}
        >
          New Enquiry
        </Button>
      </div>

      {/* FILTER BAR */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde3ea',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by name, ref, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 260, height: 36, borderRadius: 8 }}
          allowClear
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 150, height: 36 }}
          placeholder="All statuses"
        >
          <Option value="all">All statuses</Option>
          {STATUSES.map((s) => (
            <Option key={s.key} value={s.key}>
              {s.label}
            </Option>
          ))}
        </Select>

        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          format="DD/MM/YYYY"
          style={{ height: 36, borderRadius: 8 }}
        />

        {hasActiveFilters && (
          <Button type="link" onClick={clearFilters} style={{ color: '#6b7280', fontSize: 13, padding: 0 }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* TABLE */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredEnquiries}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          onRow={(record) => ({
            onClick: () => handleOpenDrawer(record),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      {/* DETAIL DRAWER */}
      <Drawer
        title={null}
        placement="right"
        width={520}
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
                  Edit
                </Button>
                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  onClick={() => {
                    setDrawerVisible(false);
                    navigate(`/sales/estimates/new?enquiryId=${selectedEnquiry._id}`);
                  }}
                  style={{ background: '#0b315d', borderColor: '#0b315d' }}
                >
                  Create Estimate
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedEnquiry && (
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  background: '#0b315d',
                  color: '#ffffff',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 600
                }}
              >
                #{selectedEnquiry._id.slice(-6).toUpperCase()}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                {selectedEnquiry.clientName}
              </h2>
            </div>

            {/* Status row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #dde3ea',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`status-dot status-${selectedEnquiry.status || 'new'}`}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {selectedEnquiry.status || 'new'}
                  </span>
                </span>
              </div>

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
                  Change Status <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>
            </div>

            {/* Section 1: Customer Info */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', borderBottom: '1px solid #dde3ea', paddingBottom: 6, marginBottom: 12 }}>
                Customer Info
              </div>
              <Row gutter={[12, 10]}>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Contact Name</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{selectedEnquiry.clientName}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Phone</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{selectedEnquiry.phone}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Email</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{selectedEnquiry.email || '—'}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Enquiry Date</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                    {selectedEnquiry.enquiryDate ? new Date(selectedEnquiry.enquiryDate).toLocaleDateString('en-IN') : '—'}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Section 2: Site Details */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', borderBottom: '1px solid #dde3ea', paddingBottom: 6, marginBottom: 12 }}>
                Site Details
              </div>
              <Row gutter={[12, 10]}>
                <Col span={24}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Site Address</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{selectedEnquiry.address || '—'}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Roof Engineering Model</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#0b315d' }}>{selectedEnquiry.roofType || 'Standard'}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Assigned Representative</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                    {selectedEnquiry.assignedTo?.name || selectedEnquiry.createdBy?.name || 'Sales Staff'}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Section 3: Notes */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', borderBottom: '1px solid #dde3ea', paddingBottom: 6, marginBottom: 12 }}>
                Notes & Field Requirements
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #dde3ea',
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 13,
                  color: '#374151',
                  whiteSpace: 'pre-wrap',
                  minHeight: 70
                }}
              >
                {selectedEnquiry.notes || 'No preliminary notes recorded for this enquiry.'}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={editingEnquiry ? 'Edit Enquiry' : 'New Enquiry'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={540}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="clientName"
                label="Customer Name"
                rules={[{ required: true, message: 'Please enter customer name' }]}
              >
                <Input placeholder="e.g. Acme Industrial Corp" />
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
            <Input placeholder="Plot or street, City" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="roofType" label="Roof Model">
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
              <Form.Item name="status" label="Initial Status">
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

          <Form.Item name="notes" label="Field Notes">
            <TextArea rows={3} placeholder="Span dimensions, height, site constraints..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#0b315d', borderColor: '#0b315d' }}>
              {editingEnquiry ? 'Save Changes' : 'Create Enquiry'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EnquiriesPage;
