import React, { useState, useEffect, useCallback } from 'react';
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Space,
  Typography,
  Card,
  Popconfirm,
  message,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  DatabaseOutlined,
  SearchOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const RATE_CATEGORIES = [
  { key: 'sheeting', label: 'Sheeting & Cladding', color: 'blue' },
  { key: 'welding', label: 'Welding & Fabrication', color: 'volcano' },
  { key: 'labour', label: 'Labour & Erection', color: 'green' },
  { key: 'transport', label: 'Transportation & Logistics', color: 'purple' },
  { key: 'hardware', label: 'Hardware & Fasteners', color: 'orange' },
  { key: 'accessories', label: 'Gutters & Accessories', color: 'cyan' },
  { key: 'general', label: 'General / Miscellaneous', color: 'default' }
];

const RateMastersPage = () => {
  const [activeTab, setActiveTab] = useState('rates');

  // Rates State
  const [rates, setRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateSearchQuery, setRateSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Sections State
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionSearchQuery, setSectionSearchQuery] = useState('');

  const [rateForm] = Form.useForm();
  const [sectionForm] = Form.useForm();

  // ──────────────────────────────────────────
  // FETCH DATA
  // ──────────────────────────────────────────
  const fetchRates = useCallback(async () => {
    setLoadingRates(true);
    try {
      const response = await api.get('/admin/rates');
      if (response.data && response.data.rates) {
        setRates(response.data.rates);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      message.error(error.response?.data?.message || 'Failed to load rate master');
    } finally {
      setLoadingRates(false);
    }
  }, []);

  const fetchSections = useCallback(async () => {
    setLoadingSections(true);
    try {
      const response = await api.get('/admin/sections');
      if (response.data && response.data.sections) {
        setSections(response.data.sections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      message.error(error.response?.data?.message || 'Failed to load section master');
    } finally {
      setLoadingSections(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    fetchSections();
  }, [fetchRates, fetchSections]);

  // ──────────────────────────────────────────
  // RATE MASTER HANDLERS
  // ──────────────────────────────────────────
  const handleOpenRateModal = (rateItem = null) => {
    setEditingRate(rateItem);
    rateForm.resetFields();
    if (rateItem) {
      rateForm.setFieldsValue({
        itemName: rateItem.itemName,
        category: rateItem.category,
        unit: rateItem.unit,
        rate: rateItem.rate
      });
    } else {
      rateForm.setFieldsValue({
        category: 'sheeting',
        unit: 'kg',
        rate: 0
      });
    }
    setRateModalVisible(true);
  };

  const handleRateSubmit = async (values) => {
    try {
      if (editingRate) {
        await api.put(`/admin/rates/${editingRate._id}`, values);
        message.success('Rate item updated successfully');
      } else {
        await api.post('/admin/rates', values);
        message.success('New rate item added');
      }
      setRateModalVisible(false);
      fetchRates();
    } catch (error) {
      console.error('Save rate error:', error);
      message.error(error.response?.data?.message || 'Failed to save rate item');
    }
  };

  const handleDeleteRate = async (id) => {
    try {
      await api.delete(`/admin/rates/${id}`);
      message.success('Rate item deleted');
      setRates((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Delete rate error:', error);
      message.error(error.response?.data?.message || 'Failed to delete rate item');
    }
  };

  // ──────────────────────────────────────────
  // SECTION MASTER HANDLERS
  // ──────────────────────────────────────────
  const handleOpenSectionModal = (sectionItem = null) => {
    setEditingSection(sectionItem);
    sectionForm.resetFields();
    if (sectionItem) {
      sectionForm.setFieldsValue({
        sectionName: sectionItem.sectionName,
        weight: sectionItem.weight,
        rate: sectionItem.rate,
        unit: sectionItem.unit || 'kg'
      });
    } else {
      sectionForm.setFieldsValue({
        unit: 'kg',
        weight: 1.0,
        rate: 80
      });
    }
    setSectionModalVisible(true);
  };

  const handleSectionSubmit = async (values) => {
    try {
      if (editingSection) {
        await api.put(`/admin/sections/${editingSection._id}`, values);
        message.success('Steel section updated successfully');
      } else {
        await api.post('/admin/sections', values);
        message.success('New steel section added');
      }
      setSectionModalVisible(false);
      fetchSections();
    } catch (error) {
      console.error('Save section error:', error);
      message.error(error.response?.data?.message || 'Failed to save section');
    }
  };

  const handleDeleteSection = async (id) => {
    try {
      await api.delete(`/admin/sections/${id}`);
      message.success('Steel section deleted');
      setSections((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      console.error('Delete section error:', error);
      message.error(error.response?.data?.message || 'Failed to delete section');
    }
  };

  // ──────────────────────────────────────────
  // COLUMNS DEFINITIONS
  // ──────────────────────────────────────────
  const filteredRates = rates.filter((r) => {
    const matchesSearch = r.itemName && r.itemName.toLowerCase().includes(rateSearchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const rateColumns = [
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => {
        const found = RATE_CATEGORIES.find((c) => c.key === cat);
        return <Tag color={found?.color || 'default'}>{found?.label || cat}</Tag>;
      }
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => <Tag color="blue">{unit}</Tag>
    },
    {
      title: 'Standard Rate (₹)',
      dataIndex: 'rate',
      key: 'rate',
      align: 'right',
      render: (rate) => (
        <Text strong style={{ color: '#059669', fontSize: 14 }}>
          ₹{Number(rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      )
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenRateModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete Rate Item"
            description={`Are you sure you want to remove "${record.itemName}"?`}
            onConfirm={() => handleDeleteRate(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredSections = sections.filter((s) =>
    s.sectionName && s.sectionName.toLowerCase().includes(sectionSearchQuery.toLowerCase())
  );

  const sectionColumns = [
    {
      title: 'Section Specification',
      dataIndex: 'sectionName',
      key: 'sectionName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Unit Weight (kg/m)',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => (
        <Tag color="cyan" style={{ fontSize: 13, fontWeight: 600 }}>
          {Number(weight).toFixed(3)} kg/m
        </Tag>
      )
    },
    {
      title: 'Rate per kg (₹)',
      dataIndex: 'rate',
      key: 'rate',
      align: 'right',
      render: (rate) => (
        <Text strong style={{ color: '#2563eb', fontSize: 14 }}>
          ₹{Number(rate).toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Estimated Cost per Meter',
      key: 'costPerMeter',
      align: 'right',
      render: (_, record) => {
        const cost = (record.weight || 0) * (record.rate || 0);
        return (
          <Text strong style={{ color: '#059669' }}>
            ₹{cost.toFixed(2)} / m
          </Text>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenSectionModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete Section"
            description={`Remove section "${record.sectionName}"?`}
            onConfirm={() => handleDeleteSection(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
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
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>Rate & Section Masters</Title>
          <Text type="secondary">
            Configure central unit rates for materials, labour, transport, and structural steel sections.
          </Text>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchRates();
              fetchSections();
            }}
          >
            Refresh
          </Button>
          {activeTab === 'rates' ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenRateModal()}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                borderColor: '#2563eb'
              }}
            >
              Add Rate Item
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenSectionModal()}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderColor: '#059669'
              }}
            >
              Add Steel Section
            </Button>
          )}
        </Space>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: 'rates',
              label: (
                <span>
                  <CalculatorOutlined /> Material & Labour Rates ({rates.length})
                </span>
              ),
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={12} lg={8}>
                      <Input
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Search item name..."
                        value={rateSearchQuery}
                        onChange={(e) => setRateSearchQuery(e.target.value)}
                        allowClear
                      />
                    </Col>
                    <Col xs={24} md={12} lg={6}>
                      <Select
                        value={categoryFilter}
                        onChange={(val) => setCategoryFilter(val)}
                        style={{ width: '100%' }}
                      >
                        <Option value="all">All Categories</Option>
                        {RATE_CATEGORIES.map((c) => (
                          <Option key={c.key} value={c.key}>
                            {c.label}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>

                  <Table
                    columns={rateColumns}
                    dataSource={filteredRates}
                    rowKey="_id"
                    loading={loadingRates}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    locale={{ emptyText: 'No rate items added yet' }}
                  />
                </div>
              )
            },
            {
              key: 'sections',
              label: (
                <span>
                  <DatabaseOutlined /> Steel Section Master ({sections.length})
                </span>
              ),
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={12} lg={8}>
                      <Input
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Search section specification..."
                        value={sectionSearchQuery}
                        onChange={(e) => setSectionSearchQuery(e.target.value)}
                        allowClear
                      />
                    </Col>
                  </Row>

                  <Table
                    columns={sectionColumns}
                    dataSource={filteredSections}
                    rowKey="_id"
                    loading={loadingSections}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    locale={{ emptyText: 'No steel sections registered yet' }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Rate Modal */}
      <Modal
        title={editingRate ? `Edit Rate: ${editingRate.itemName}` : 'Add New Rate Master Item'}
        open={rateModalVisible}
        onCancel={() => setRateModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={rateForm}
          layout="vertical"
          onFinish={handleRateSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="itemName"
            label="Item Name"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input placeholder="e.g. Color Coated Trapezoidal Sheet 0.50mm" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select placeholder="Select category">
                  {RATE_CATEGORIES.map((c) => (
                    <Option key={c.key} value={c.key}>
                      {c.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Unit of Measurement"
                rules={[{ required: true, message: 'Enter unit' }]}
              >
                <Input placeholder="e.g. sq.ft, kg, meter, nos" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="rate"
            label="Unit Rate (₹)"
            rules={[{ required: true, message: 'Enter rate amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.5}
              prefix="₹"
              placeholder="0.00"
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setRateModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingRate ? 'Update Rate' : 'Add Item'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Section Modal */}
      <Modal
        title={editingSection ? `Edit Section: ${editingSection.sectionName}` : 'Add New Steel Section'}
        open={sectionModalVisible}
        onCancel={() => setSectionModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={sectionForm}
          layout="vertical"
          onFinish={handleSectionSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="sectionName"
            label="Section Name / Specification"
            rules={[{ required: true, message: 'Please enter section name' }]}
          >
            <Input placeholder="e.g. 100 x 50 x 2.0mm RHS" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Weight per Meter (kg/m)"
                rules={[{ required: true, message: 'Enter unit weight' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  placeholder="e.g. 4.50"
                  suffix="kg/m"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rate"
                label="Rate per kg (₹)"
                rules={[{ required: true, message: 'Enter rate per kg' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.5}
                  prefix="₹"
                  placeholder="e.g. 82.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="unit" label="Base Unit" initialValue="kg">
            <Input disabled value="kg" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setSectionModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingSection ? 'Update Section' : 'Add Section'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RateMastersPage;
