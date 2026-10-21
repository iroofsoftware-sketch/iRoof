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
  Tag,
  Space,
  Typography,
  Card,
  Popconfirm,
  message,
  Row,
  Col,
  Descriptions,
  Divider,
  Dropdown
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const STATUS_CONFIG = {
  new: { label: 'New Enquiry', color: 'blue' },
  visited: { label: 'Site Visited', color: 'orange' },
  estimated: { label: 'Estimated', color: 'purple' },
  approved: { label: 'Approved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  completed: { label: 'Completed', color: 'cyan' }
};

export const ROOF_TYPES = [
  'Model 1: Normal Cantilever',
  'Model 2: Auditorium',
  'Model 3: PEB Cantilever',
  'Model 4: Type 2 Cantilever',
  'Model 5: Simply Supported',
  'Custom Roof Structure'
];

const EnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { role } = useAuthStore();

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/enquiries');
      if (response.data && response.data.enquiries) {
        setEnquiries(response.data.enquiries);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      message.error(error.response?.data?.message || 'Failed to load enquiries');
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
      roofType: ROOF_TYPES[0],
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
      roofType: record.roofType,
      status: record.status,
      enquiryDate: record.enquiryDate ? dayjs(record.enquiryDate) : dayjs(),
      notes: record.notes
    });
    setModalVisible(true);
  };

  const handleOpenDetail = (record) => {
    setSelectedEnquiry(record);
    setDetailDrawerVisible(true);
  };

  const handleModalSubmit = async (values) => {
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
        message.success('Enquiry updated successfully');
      } else {
        await api.post('/enquiries', payload);
        message.success('New enquiry registered');
      }

      setModalVisible(false);
      form.resetFields();
      fetchEnquiries();
    } catch (error) {
      console.error('Save enquiry error:', error);
      message.error(error.response?.data?.message || 'Failed to save enquiry');
    }
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await api.patch(`/enquiries/${enquiryId}/status`, { status: newStatus });
      message.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
      );
      if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
        setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Change status error:', error);
      message.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteEnquiry = async (id) => {
    try {
      await api.delete(`/enquiries/${id}`);
      message.success('Enquiry deleted');
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setDetailDrawerVisible(false);
      }
    } catch (error) {
      console.error('Delete enquiry error:', error);
      message.error(error.response?.data?.message || 'Failed to delete enquiry');
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      (e.clientName && e.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.phone && e.phone.includes(searchQuery)) ||
      (e.email && e.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.address && e.address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Client Details',
      key: 'client',
      render: (_, record) => (
        <div>
          <div
            style={{ fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}
            onClick={() => handleOpenDetail(record)}
          >
            {record.clientName}
          </div>
          <Space orientation="horizontal" size={12} style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            <span>
              <PhoneOutlined /> {record.phone}
            </span>
            {record.email && (
              <span>
                <MailOutlined /> {record.email}
              </span>
            )}
          </Space>
          {record.address && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              <EnvironmentOutlined /> {record.address}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Roof Model / Type',
      dataIndex: 'roofType',
      key: 'roofType',
      render: (roofType) => (
        <Tag color="geekblue" style={{ borderRadius: 6, fontWeight: 500 }}>
          {roofType || 'Standard'}
        </Tag>
      )
    },
    {
      title: 'Enquiry Date',
      dataIndex: 'enquiryDate',
      key: 'enquiryDate',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : '—'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const config = STATUS_CONFIG[status] || { label: status, color: 'default' };
        const menuItems = Object.keys(STATUS_CONFIG).map((key) => ({
          key,
          label: (
            <Tag color={STATUS_CONFIG[key].color} style={{ margin: 0 }}>
              {STATUS_CONFIG[key].label}
            </Tag>
          ),
          onClick: () => handleStatusChange(record._id, key)
        }));

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              size="small"
              style={{
                borderRadius: 12,
                fontSize: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Tag color={config.color} style={{ margin: 0, border: 'none', background: 'transparent' }}>
                ● {config.label}
              </Tag>
              <DownOutlined style={{ fontSize: 10, color: '#94a3b8' }} />
            </Button>
          </Dropdown>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CalculatorOutlined />}
            onClick={() => navigate(`/sales/estimates/new?enquiryId=${record._id}`)}
            style={{
              background: '#059669',
              borderColor: '#059669',
              fontSize: 12
            }}
          >
            Estimate
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
          />
          {['admin', 'sales'].includes(role) && (
            <Popconfirm
              title="Delete Enquiry"
              description={`Delete enquiry for "${record.clientName}"?`}
              onConfirm={() => handleDeleteEnquiry(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>Enquiry Management</Title>
          <Text type="secondary">
            Capture, track, and convert client roofing inquiries into engineering estimations.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchEnquiries} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderColor: '#2563eb'
            }}
          >
            New Enquiry
          </Button>
        </Space>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12} lg={8}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search by client name, phone, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: '100%' }}
            >
              <Option value="all">All Statuses ({enquiries.length})</Option>
              {Object.keys(STATUS_CONFIG).map((key) => (
                <Option key={key} value={key}>
                  {STATUS_CONFIG[key].label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredEnquiries}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: 'No enquiries registered yet' }}
        />
      </Card>

      {/* Create / Edit Enquiry Modal */}
      <Modal
        title={editingEnquiry ? `Edit Enquiry: ${editingEnquiry.clientName}` : 'Register New Client Enquiry'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="clientName"
                label="Client / Company Name"
                rules={[{ required: true, message: 'Please enter client name' }]}
              >
                <Input placeholder="e.g. Acme Corporation" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="phone"
                label="Contact Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="e.g. +91 9876543210" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address (Optional)"
                rules={[{ type: 'email', message: 'Enter a valid email' }]}
              >
                <Input placeholder="client@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enquiryDate" label="Enquiry Date">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Site Address / Location">
            <Input placeholder="e.g. Plot 42, Industrial Area Phase II, Ernakulam" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="roofType"
                label="Roof Engineering Model"
                rules={[{ required: true, message: 'Select roof model' }]}
              >
                <Select placeholder="Select structural model">
                  {ROOF_TYPES.map((t) => (
                    <Option key={t} value={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="status" label="Enquiry Status">
                <Select placeholder="Status">
                  {Object.keys(STATUS_CONFIG).map((key) => (
                    <Option key={key} value={key}>
                      {STATUS_CONFIG[key].label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Site Visit & Engineering Notes">
            <TextArea rows={3} placeholder="Span dimensions, height constraints, client preferences..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingEnquiry ? 'Update Enquiry' : 'Register Enquiry'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Enquiry Detail Drawer */}
      <Drawer
        title="Enquiry Summary"
        placement="right"
        width={480}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        extra={
          selectedEnquiry && (
            <Button
              type="primary"
              icon={<CalculatorOutlined />}
              onClick={() => {
                setDetailDrawerVisible(false);
                navigate(`/sales/estimates/new?enquiryId=${selectedEnquiry._id}`);
              }}
              style={{ background: '#059669', borderColor: '#059669' }}
            >
              Start Estimate
            </Button>
          )
        }
      >
        {selectedEnquiry && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Title level={4} style={{ margin: 0 }}>{selectedEnquiry.clientName}</Title>
              <Space style={{ marginTop: 6 }}>
                <Tag color={STATUS_CONFIG[selectedEnquiry.status]?.color || 'blue'}>
                  {STATUS_CONFIG[selectedEnquiry.status]?.label || selectedEnquiry.status}
                </Tag>
                <Tag color="geekblue">{selectedEnquiry.roofType}</Tag>
              </Space>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Contact Phone">
                <a href={`tel:${selectedEnquiry.phone}`}>{selectedEnquiry.phone}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedEnquiry.email ? (
                  <a href={`mailto:${selectedEnquiry.email}`}>{selectedEnquiry.email}</a>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Site Location">
                {selectedEnquiry.address || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Enquiry Date">
                {selectedEnquiry.enquiryDate
                  ? new Date(selectedEnquiry.enquiryDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Registered By">
                {selectedEnquiry.createdBy?.name || 'Sales Staff'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>
                Engineering & Site Notes:
              </Text>
              <Paragraph
                style={{
                  background: '#f8fafc',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  color: '#475569'
                }}
              >
                {selectedEnquiry.notes || 'No preliminary notes recorded.'}
              </Paragraph>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                block
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailDrawerVisible(false);
                  handleOpenEditModal(selectedEnquiry);
                }}
              >
                Edit Enquiry
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default EnquiriesPage;
