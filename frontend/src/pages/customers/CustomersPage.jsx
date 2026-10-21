import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Space,
  Row,
  Col,
  Statistic,
  Drawer,
  Tabs,
  Typography,
  message,
  Popconfirm,
  Badge,
  Divider,
  Avatar
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  ReloadOutlined,
  SyncOutlined,
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ProfileOutlined,
  AccountBookOutlined,
  CalculatorOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';

const { Text, Title } = Typography;
const { Option } = Select;

const formatINR = (val) => {
  if (val === undefined || val === null) return '₹0';
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

const categoryColors = {
  Industrial: 'blue',
  Commercial: 'purple',
  'PEB Builder': 'orange',
  Architect: 'cyan',
  Individual: 'green',
  'Govt/Infra': 'volcano'
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    leadCustomers: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    totalDue: 0
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // 360 Drawer State
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const navigate = useNavigate();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers({
        search: search.trim(),
        category: categoryFilter,
        status: statusFilter
      });
      if (res && res.success) {
        setCustomers(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSync = async () => {
    try {
      setLoading(true);
      const res = await customerService.syncCustomers();
      message.success(res.message || 'Customers synchronized from existing records');
      fetchCustomers();
    } catch (err) {
      console.error('Sync failed:', err);
      message.error('Customer sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cust = null) => {
    setEditingCustomer(cust);
    if (cust) {
      form.setFieldsValue(cust);
    } else {
      form.resetFields();
      form.setFieldsValue({
        category: 'Industrial',
        status: 'Active',
        state: 'Tamil Nadu',
        paymentTerms: '30 days'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmitForm = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer._id, values);
        message.success('Customer profile updated successfully');
      } else {
        await customerService.createCustomer(values);
        message.success('New customer created successfully');
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error('Save customer failed:', err);
      message.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await customerService.deleteCustomer(id);
      message.success(res.message || 'Customer record updated');
      fetchCustomers();
    } catch (err) {
      console.error('Delete failed:', err);
      message.error('Failed to delete customer');
    }
  };

  // Open 360 Drawer
  const handleView360 = async (id) => {
    setSelectedCustomerId(id);
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await customerService.getCustomerById(id);
      if (res && res.success) {
        setDetailData(res.data);
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
      message.error('Failed to load customer profile details');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: 'Customer & Company',
      key: 'name',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            style={{
              backgroundColor: '#0b2e59',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 12
            }}
          >
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div
              style={{ fontWeight: 600, color: '#0b2e59', cursor: 'pointer' }}
              onClick={() => handleView360(record._id)}
            >
              {record.name}
            </div>
            {record.companyName && (
              <div style={{ fontSize: 12, color: '#475569' }}>{record.companyName}</div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Contact Details',
      key: 'contact',
      render: (_, record) => (
        <div style={{ fontSize: 12.5 }}>
          <div>
            <PhoneOutlined style={{ color: '#0b2e59', marginRight: 6 }} />
            <span className="tabular-nums">{record.phone}</span>
          </div>
          {record.email && (
            <div style={{ color: '#64748b', marginTop: 2 }}>
              <MailOutlined style={{ marginRight: 6 }} />
              {record.email}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <div style={{ fontSize: 12.5, color: '#475569' }}>
          <EnvironmentOutlined style={{ color: '#94a3b8', marginRight: 4 }} />
          {[record.city, record.state].filter(Boolean).join(', ') || '—'}
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color={categoryColors[cat] || 'default'}>{cat || 'General'}</Tag>
    },
    {
      title: 'GSTIN',
      dataIndex: 'gstin',
      key: 'gstin',
      render: (gst) =>
        gst ? (
          <span className="ref-badge" style={{ fontSize: 11 }}>
            {gst}
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: 11 }}>Not registered</span>
        )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Active' ? 'success' : status === 'Lead' ? 'processing' : 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView360(record._id)}
            title="360° Profile"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            title="Edit Customer"
          />
          <Popconfirm
            title="Deactivate or delete customer?"
            description="Existing financial records will be preserved."
            onConfirm={() => handleDelete(record._id)}
            okText="Confirm"
            cancelText="Cancel"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
            Customer Relationship Management (CRM)
          </Title>
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            Master directory of roofing clients, builder accounts, project histories, and financial ledgers
          </Text>
        </div>

        <Space>
          <Button icon={<SyncOutlined />} onClick={handleSync} loading={loading}>
            Sync Records
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => handleOpenModal()}
            style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
          >
            Add Customer
          </Button>
        </Space>
      </div>

      {/* KPI METRIC CARDS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card styles={{ body: { padding: 18 } }} style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Statistic
              title={<span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>TOTAL CLIENTS</span>}
              value={stats.totalCustomers}
              prefix={<TeamOutlined style={{ color: '#0b2e59', marginRight: 8 }} />}
              valueStyle={{ fontWeight: 800, color: '#0f172a', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card styles={{ body: { padding: 18 } }} style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Statistic
              title={<span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>ACTIVE CONTRACTS</span>}
              value={stats.activeCustomers}
              prefix={<CheckCircleOutlined style={{ color: '#15803d', marginRight: 8 }} />}
              valueStyle={{ fontWeight: 800, color: '#15803d', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card styles={{ body: { padding: 18 } }} style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Statistic
              title={<span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>LIFETIME BILLED</span>}
              value={formatINR(stats.totalInvoiced)}
              prefix={<AccountBookOutlined style={{ color: '#1d4ed8', marginRight: 8 }} />}
              valueStyle={{ fontWeight: 800, color: '#0b2e59', fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card styles={{ body: { padding: 18 } }} style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Statistic
              title={<span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>OUTSTANDING RECEIVABLES</span>}
              value={formatINR(stats.totalDue)}
              prefix={<ClockCircleOutlined style={{ color: '#d97706', marginRight: 8 }} />}
              valueStyle={{ fontWeight: 800, color: stats.totalDue > 0 ? '#b91c1c' : '#15803d', fontSize: 22 }}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER & SEARCH BAR */}
      <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Search by client name, company, phone, email, GSTIN, city..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Filter Category"
            >
              <Option value="All">All Categories</Option>
              <Option value="Industrial">Industrial</Option>
              <Option value="Commercial">Commercial</Option>
              <Option value="PEB Builder">PEB Builder</Option>
              <Option value="Architect">Architect</Option>
              <Option value="Individual">Individual</Option>
              <Option value="Govt/Infra">Govt / Infra</Option>
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter Status"
            >
              <Option value="All">All Statuses</Option>
              <Option value="Active">Active</Option>
              <Option value="Lead">Lead</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Button icon={<ReloadOutlined />} onClick={fetchCustomers} loading={loading}>
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* CUSTOMERS DATA TABLE */}
      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 12, showTotal: (t) => `Total ${t} customer accounts` }}
          size="middle"
        />
      </Card>

      {/* ADD / EDIT CUSTOMER MODAL */}
      <Modal
        title={editingCustomer ? 'Edit Customer Profile' : 'Create New Customer Account'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmitForm}
        confirmLoading={submitting}
        width={680}
        okText={editingCustomer ? 'Update Profile' : 'Save Customer'}
        okButtonProps={{ style: { background: '#0b2e59', borderColor: '#0b2e59' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Contact Person / Client Name"
                rules={[{ required: true, message: 'Client name is required' }]}
              >
                <Input placeholder="e.g. Rajesh Kumar" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyName" label="Company / Entity Name">
                <Input placeholder="e.g. Apex Engineering Ltd." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Primary Phone Number"
                rules={[{ required: true, message: 'Phone number is required' }]}
              >
                <Input placeholder="e.g. 9840012345" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="alternatePhone" label="Alternate Phone">
                <Input placeholder="e.g. 9444098765" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email Address">
                <Input placeholder="contact@company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gstin" label="GSTIN Number">
                <Input placeholder="e.g. 33AAAAA0000A1Z5" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Client Category">
                <Select>
                  <Option value="Industrial">Industrial</Option>
                  <Option value="Commercial">Commercial</Option>
                  <Option value="PEB Builder">PEB Builder</Option>
                  <Option value="Architect">Architect</Option>
                  <Option value="Individual">Individual</Option>
                  <Option value="Govt/Infra">Govt / Infra</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Account Status">
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Lead">Lead</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Site / Office Address">
            <Input.TextArea rows={2} placeholder="Street, Industrial Area, Landmark" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Input placeholder="e.g. Chennai" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Input placeholder="Tamil Nadu" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pincode" label="Pincode">
                <Input placeholder="600001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="paymentTerms" label="Default Payment Terms">
                <Input placeholder="e.g. 30 days, 50% Advance" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="notes" label="Internal Notes">
                <Input placeholder="Special specifications or project preferences" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 360° CUSTOMER PROFILE DRAWER */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={760}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShopOutlined style={{ color: '#0b2e59', fontSize: 18 }} />
            <span>Customer 360° Enterprise Profile</span>
          </div>
        }
      >
        {detailLoading || !detailData ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading customer profile...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer Summary Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '18px 20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0b2e59' }}>
                    {detailData.customer.name}
                  </div>
                  {detailData.customer.companyName && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                      {detailData.customer.companyName}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Tag color={categoryColors[detailData.customer.category] || 'blue'}>
                      {detailData.customer.category}
                    </Tag>
                    <Tag color={detailData.customer.status === 'Active' ? 'success' : 'default'}>
                      {detailData.customer.status}
                    </Tag>
                    {detailData.customer.gstin && (
                      <span className="ref-badge" style={{ fontSize: 11 }}>
                        GSTIN: {detailData.customer.gstin}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate('/sales/estimates/new');
                  }}
                  style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
                >
                  New Estimate
                </Button>
              </div>

              <Divider style={{ margin: '14px 0' }} />

              <Row gutter={[16, 8]} style={{ fontSize: 12.5 }}>
                <Col span={12}>
                  <Text type="secondary">Phone:</Text>{' '}
                  <strong className="tabular-nums" style={{ color: '#0f172a' }}>
                    {detailData.customer.phone}
                  </strong>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Email:</Text>{' '}
                  <strong style={{ color: '#0f172a' }}>{detailData.customer.email || '—'}</strong>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Address:</Text>{' '}
                  <span style={{ color: '#334155' }}>
                    {[
                      detailData.customer.address,
                      detailData.customer.city,
                      detailData.customer.state,
                      detailData.customer.pincode
                    ]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </span>
                </Col>
              </Row>
            </div>

            {/* Financial Velocity Bar */}
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <div style={{ background: '#eff6ff', padding: 12, borderRadius: 6, border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>TOTAL BILLED</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a8a' }}>
                    {formatINR(detailData.metrics?.totalBilled)}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 6, border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>COLLECTED</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#064e3b' }}>
                    {formatINR(detailData.metrics?.totalCollected)}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: '#fffbeb', padding: 12, borderRadius: 6, border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>OUTSTANDING</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: detailData.metrics?.outstandingBalance > 0 ? '#b91c1c' : '#15803d' }}>
                    {formatINR(detailData.metrics?.outstandingBalance)}
                  </div>
                </div>
              </Col>
            </Row>

            {/* 360 Tabs */}
            <Tabs
              defaultActiveKey="enquiries"
              items={[
                {
                  key: 'enquiries',
                  label: `Enquiries (${detailData.enquiries?.length || 0})`,
                  children: (
                    <Table
                      dataSource={detailData.enquiries || []}
                      rowKey="_id"
                      size="small"
                      pagination={false}
                      columns={[
                        {
                          title: 'Date',
                          dataIndex: 'enquiryDate',
                          key: 'date',
                          render: (d) => new Date(d).toLocaleDateString()
                        },
                        {
                          title: 'Roof Type',
                          dataIndex: 'roofType',
                          key: 'roofType'
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (st) => <Tag>{st}</Tag>
                        }
                      ]}
                    />
                  )
                },
                {
                  key: 'estimates',
                  label: `Estimates (${detailData.estimates?.length || 0})`,
                  children: (
                    <Table
                      dataSource={detailData.estimates || []}
                      rowKey="_id"
                      size="small"
                      pagination={false}
                      columns={[
                        {
                          title: 'Model',
                          dataIndex: 'model',
                          key: 'model'
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (st) => <Tag color={st === 'approved' ? 'green' : 'default'}>{st}</Tag>
                        },
                        {
                          title: 'Created',
                          dataIndex: 'createdAt',
                          key: 'createdAt',
                          render: (d) => new Date(d).toLocaleDateString()
                        }
                      ]}
                    />
                  )
                },
                {
                  key: 'workorders',
                  label: `Work Orders (${detailData.workOrders?.length || 0})`,
                  children: (
                    <Table
                      dataSource={detailData.workOrders || []}
                      rowKey="_id"
                      size="small"
                      pagination={false}
                      columns={[
                        {
                          title: 'Ref Code',
                          dataIndex: 'refCode',
                          key: 'refCode',
                          render: (ref) => <span className="ref-badge">{ref}</span>
                        },
                        {
                          title: 'Model',
                          dataIndex: 'roofModel',
                          key: 'roofModel'
                        },
                        {
                          title: 'Grand Total',
                          dataIndex: 'grandTotal',
                          key: 'grandTotal',
                          render: (v) => formatINR(v)
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (st) => <Tag color={st === 'completed' ? 'success' : 'processing'}>{st}</Tag>
                        }
                      ]}
                    />
                  )
                },
                {
                  key: 'invoices',
                  label: `Invoices (${detailData.invoices?.length || 0})`,
                  children: (
                    <Table
                      dataSource={detailData.invoices || []}
                      rowKey="_id"
                      size="small"
                      pagination={false}
                      columns={[
                        {
                          title: 'Invoice Ref',
                          dataIndex: 'refCode',
                          key: 'refCode',
                          render: (ref) => <span className="ref-badge">{ref}</span>
                        },
                        {
                          title: 'Due Date',
                          dataIndex: 'dueDate',
                          key: 'dueDate',
                          render: (d) => new Date(d).toLocaleDateString()
                        },
                        {
                          title: 'Billed',
                          dataIndex: 'grandTotal',
                          key: 'grandTotal',
                          render: (v) => formatINR(v)
                        },
                        {
                          title: 'Due',
                          dataIndex: 'amountDue',
                          key: 'amountDue',
                          render: (v) => (
                            <span style={{ color: v > 0 ? '#b91c1c' : '#15803d', fontWeight: 600 }}>
                              {formatINR(v)}
                            </span>
                          )
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (st) => <Tag color={st === 'paid' ? 'success' : 'warning'}>{st}</Tag>
                        }
                      ]}
                    />
                  )
                }
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomersPage;
