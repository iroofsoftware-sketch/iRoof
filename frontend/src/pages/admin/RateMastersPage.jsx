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
  Space,
  Typography,
  Popconfirm,
  message,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Text } = Typography;
const { Option } = Select;

const RateMastersPage = ({ defaultTab }) => {
  const [activeTabKey, setActiveTabKey] = useState(defaultTab || 'sheet');

  useEffect(() => {
    if (defaultTab) {
      setActiveTabKey(defaultTab);
    }
  }, [defaultTab]);

  // Rates State
  const [rates, setRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // Add Rate Modal
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [rateForm] = Form.useForm();

  // Sections State (for Steel Sections tab)
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionWeight, setEditingSectionWeight] = useState(null);
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
    } finally {
      setLoadingSections(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    fetchSections();
  }, [fetchRates, fetchSections]);

  // Seed default rates if empty so the tables are immediately usable
  useEffect(() => {
    const seedDefaultsIfEmpty = async () => {
      if (!loadingRates && rates.length === 0) {
        const defaultSeeds = [
          // Sheet Rates
          { itemName: 'Colour Coated Sheet (0.47mm BMT)', category: 'sheet', unit: 'kg', rate: 95 },
          { itemName: 'Colour Coated Sheet (0.50mm BMT)', category: 'sheet', unit: 'kg', rate: 102 },
          { itemName: 'Bare Galvalume Sheet (0.47mm BMT)', category: 'sheet', unit: 'kg', rate: 88 },
          { itemName: 'Polycarbonate Clear Skylight Sheet', category: 'sheet', unit: 'sqft', rate: 145 },

          // Labour & Consumables
          { itemName: 'Structural Steel Fabrication & Erection', category: 'labour', unit: 'kg', rate: 18 },
          { itemName: 'Roof Sheeting Installation Labour', category: 'labour', unit: 'sqft', rate: 6.5 },
          { itemName: 'Welding Electrodes & Consumables', category: 'labour', unit: 'kg', rate: 4.2 },
          { itemName: 'Self-Drilling Fasteners & Screws', category: 'labour', unit: 'box', rate: 420 },
          { itemName: 'Silicone Sealant & Gasket Tape', category: 'labour', unit: 'tube', rate: 260 },

          // Margins & GST
          { itemName: 'Contractor Overhead Margin', category: 'margin', unit: '%', rate: 12 },
          { itemName: 'Company Net Profit Margin', category: 'margin', unit: '%', rate: 10 },
          { itemName: 'Goods & Services Tax (GST Standard)', category: 'margin', unit: '%', rate: 18 },
          { itemName: 'Contingency / Wastage Allowance', category: 'margin', unit: '%', rate: 3 },

          // Transport & Stay
          { itemName: 'Base Transport Charge (Up to 50 km)', category: 'transport', unit: 'trip', rate: 4500 },
          { itemName: 'Per KM Surcharge (> 50 km)', category: 'transport', unit: 'km', rate: 45 },
          { itemName: 'Site Crew Lodging / Boarding per Day', category: 'transport', unit: 'day', rate: 1800 },
          { itemName: 'Mobile Crane / Lifting Equipment Hire', category: 'transport', unit: 'shift', rate: 12000 }
        ];

        try {
          for (const item of defaultSeeds) {
            await api.post('/admin/rates', item).catch(() => {});
          }
          fetchRates();
        } catch (e) {
          console.error('Seed defaults error:', e);
        }
      }
    };

    seedDefaultsIfEmpty();
  }, [rates.length, loadingRates, fetchRates]);

  // ──────────────────────────────────────────
  // INLINE RATE EDITING
  // ──────────────────────────────────────────
  const startEditing = (record) => {
    setEditingId(record._id);
    setEditingValue(record.rate);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue(null);
  };

  const saveEditing = async (record) => {
    if (editingValue === null || isNaN(editingValue)) {
      message.error('Please enter a valid numeric rate');
      return;
    }
    setSavingId(record._id);
    try {
      await api.patch(`/admin/rates/${record._id}`, { rate: Number(editingValue) });
      message.success(`Updated "${record.itemName}" to ₹${editingValue}`);
      setRates((prev) =>
        prev.map((r) => (r._id === record._id ? { ...r, rate: Number(editingValue) } : r))
      );
      setEditingId(null);
      setEditingValue(null);
    } catch (err) {
      console.error('Rate update error:', err);
      // Fallback to PUT if PATCH fails
      try {
        await api.put(`/admin/rates/${record._id}`, { rate: Number(editingValue) });
        message.success(`Updated "${record.itemName}" to ₹${editingValue}`);
        setRates((prev) =>
          prev.map((r) => (r._id === record._id ? { ...r, rate: Number(editingValue) } : r))
        );
        setEditingId(null);
        setEditingValue(null);
      } catch (putErr) {
        message.error('Failed to update rate');
      }
    } finally {
      setSavingId(false);
    }
  };

  const handleDeleteRate = async (id) => {
    try {
      await api.delete(`/admin/rates/${id}`);
      message.success('Rate item deleted');
      setRates((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      message.error('Failed to delete rate item');
    }
  };

  const handleAddRateSubmit = async (values) => {
    try {
      await api.post('/admin/rates', values);
      message.success('New rate item added');
      setRateModalVisible(false);
      rateForm.resetFields();
      fetchRates();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add rate item');
    }
  };

  // ──────────────────────────────────────────
  // FILTER RATES BY TAB
  // ──────────────────────────────────────────
  const getTabRates = (tabKey) => {
    switch (tabKey) {
      case 'sheet':
        return rates.filter(
          (r) =>
            r.category === 'sheet' ||
            r.category === 'sheeting' ||
            r.itemName.toLowerCase().includes('sheet')
        );
      case 'labour':
        return rates.filter(
          (r) =>
            r.category === 'labour' ||
            r.category === 'welding' ||
            r.category === 'hardware' ||
            r.category === 'accessories' ||
            r.itemName.toLowerCase().includes('labour') ||
            r.itemName.toLowerCase().includes('weld') ||
            r.itemName.toLowerCase().includes('consumable') ||
            r.itemName.toLowerCase().includes('screw') ||
            r.itemName.toLowerCase().includes('sealant')
        );
      case 'margin':
        return rates.filter(
          (r) =>
            r.category === 'margin' ||
            r.category === 'general' ||
            r.itemName.toLowerCase().includes('margin') ||
            r.itemName.toLowerCase().includes('gst') ||
            r.itemName.toLowerCase().includes('profit') ||
            r.itemName.toLowerCase().includes('contingency')
        );
      case 'transport':
        return rates.filter(
          (r) =>
            r.category === 'transport' ||
            r.itemName.toLowerCase().includes('transport') ||
            r.itemName.toLowerCase().includes('stay') ||
            r.itemName.toLowerCase().includes('lodging') ||
            r.itemName.toLowerCase().includes('crane')
        );
      default:
        return rates;
    }
  };

  const rateColumns = [
    {
      title: 'Rate Item',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (val) => <span style={{ fontWeight: 500, color: '#111827' }}>{val}</span>
    },
    {
      title: 'Current Value',
      dataIndex: 'rate',
      key: 'rate',
      width: 220,
      render: (val, record) => {
        const isEditing = editingId === record._id;
        if (isEditing) {
          return (
            <InputNumber
              value={editingValue}
              onChange={(val) => setEditingValue(val)}
              min={0}
              step={record.unit === '%' ? 0.5 : 1}
              style={{ width: 140 }}
              autoFocus
              onPressEnter={() => saveEditing(record)}
            />
          );
        }
        return (
          <span style={{ fontWeight: 600, color: '#0b315d', fontSize: 13 }}>
            {record.unit === '%' ? `${val}%` : `₹ ${Number(val).toLocaleString('en-IN')}`}
          </span>
        );
      }
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 140,
      render: (val) => (
        <span style={{ color: '#6b7280', fontSize: 12, background: '#f3f6f9', padding: '2px 8px', borderRadius: 4 }}>
          {val || '—'}
        </span>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const isEditing = editingId === record._id;
        if (isEditing) {
          return (
            <Space size={6}>
              <Tooltip title="Save">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={savingId === record._id}
                  onClick={() => saveEditing(record)}
                  style={{ background: '#15803d', borderColor: '#15803d' }}
                />
              </Tooltip>
              <Tooltip title="Cancel">
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={cancelEditing}
                />
              </Tooltip>
            </Space>
          );
        }
        return (
          <Space size={6}>
            <Tooltip title="Edit Rate">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ color: '#0b315d' }} />}
                onClick={() => startEditing(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this rate item?"
              onConfirm={() => handleDeleteRate(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  // ──────────────────────────────────────────
  // STEEL SECTIONS TABLE
  // ──────────────────────────────────────────
  const sectionColumns = [
    {
      title: 'Section Code / Name',
      dataIndex: 'sectionName',
      key: 'sectionName',
      render: (val) => <span style={{ fontWeight: 500, color: '#111827' }}>{val}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (val) => <span style={{ color: '#6b7280', fontSize: 12 }}>{val || 'Steel Section'}</span>
    },
    {
      title: 'Weight per Meter',
      dataIndex: 'weightPerMeter',
      key: 'weightPerMeter',
      render: (val, record) => {
        const isEditing = editingSectionId === record._id;
        if (isEditing) {
          return (
            <InputNumber
              value={editingSectionWeight}
              onChange={(v) => setEditingSectionWeight(v)}
              min={0}
              step={0.1}
              style={{ width: 120 }}
              autoFocus
            />
          );
        }
        return <span style={{ fontWeight: 600 }}>{val} kg/m</span>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const isEditing = editingSectionId === record._id;
        if (isEditing) {
          return (
            <Space size={6}>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={async () => {
                  try {
                    await api.put(`/admin/sections/${record._id}`, { weightPerMeter: Number(editingSectionWeight) });
                    message.success('Section weight updated');
                    setSections((prev) =>
                      prev.map((s) => (s._id === record._id ? { ...s, weightPerMeter: Number(editingSectionWeight) } : s))
                    );
                    setEditingSectionId(null);
                  } catch (e) {
                    message.error('Failed to update section');
                  }
                }}
              />
              <Button size="small" icon={<CloseOutlined />} onClick={() => setEditingSectionId(null)} />
            </Space>
          );
        }
        return (
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#0b315d' }} />}
            onClick={() => {
              setEditingSectionId(record._id);
              setEditingSectionWeight(record.weightPerMeter);
            }}
          />
        );
      }
    }
  ];

  const renderTabContent = (categoryKey) => {
    const tabRates = getTabRates(categoryKey);
    return (
      <div>
        <div className="content-card" style={{ marginBottom: 12 }}>
          <Table
            columns={rateColumns}
            dataSource={tabRates}
            rowKey="_id"
            loading={loadingRates}
            pagination={false}
            size="middle"
          />
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', paddingLeft: 4 }}>
          Changes take effect on all new estimates immediately.
        </p>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'sheet',
      label: 'Sheet Rates',
      children: renderTabContent('sheet')
    },
    {
      key: 'labour',
      label: 'Labour & Consumables',
      children: renderTabContent('labour')
    },
    {
      key: 'margin',
      label: 'Margins & GST',
      children: renderTabContent('margin')
    },
    {
      key: 'transport',
      label: 'Transport & Stay',
      children: renderTabContent('transport')
    },
    {
      key: 'sections',
      label: 'Steel Sections',
      children: (
        <div>
          <div className="content-card" style={{ marginBottom: 12 }}>
            <Table
              columns={sectionColumns}
              dataSource={sections}
              rowKey="_id"
              loading={loadingSections}
              pagination={false}
              size="middle"
            />
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', paddingLeft: 4 }}>
            Changes take effect on all structural load computations immediately.
          </p>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Rate Masters</h1>
          <p className="page-subtitle">
            Manage commercial pricing benchmarks, labor wages, margins, and transport constants
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => { fetchRates(); fetchSections(); }}>
            Refresh
          </Button>
          {activeTabKey === 'sections' ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                sectionForm.resetFields();
                setSectionModalVisible(true);
              }}
            >
              Add Section
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                rateForm.resetFields();
                rateForm.setFieldsValue({
                  category: activeTabKey === 'sheet' ? 'sheet' : activeTabKey,
                  unit: activeTabKey === 'sheet' ? 'kg' : 'sqft',
                  rate: 0
                });
                setRateModalVisible(true);
              }}
            >
              Add Rate Item
            </Button>
          )}
        </Space>
      </div>

      {/* ── TABS (type="line", left-aligned under page header) ── */}
      <Tabs
        activeKey={activeTabKey}
        onChange={(k) => setActiveTabKey(k)}
        type="line"
        items={tabItems}
        style={{ marginBottom: 24 }}
      />

      {/* ── ADD RATE MODAL ── */}
      <Modal
        title="Add Rate Master Item"
        open={rateModalVisible}
        onCancel={() => setRateModalVisible(false)}
        footer={null}
        destroyOnClose
        width={480}
      >
        <Form form={rateForm} layout="vertical" onFinish={handleAddRateSubmit} style={{ marginTop: 16 }}>
          <Form.Item
            name="itemName"
            label="Rate Item Name"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input placeholder="e.g. Colour Coated Sheet (0.50mm BMT)" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category Tab"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              <Option value="sheet">Sheet Rates</Option>
              <Option value="labour">Labour & Consumables</Option>
              <Option value="margin">Margins & GST</Option>
              <Option value="transport">Transport & Stay</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="rate"
              label="Default Rate Value"
              rules={[{ required: true, message: 'Enter rate value' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={1} />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Pricing Unit"
              rules={[{ required: true, message: 'Enter unit' }]}
            >
              <Input placeholder="e.g. kg, sqft, trip, %" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button onClick={() => setRateModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Rate Item
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── ADD SECTION MODAL ── */}
      <Modal
        title="Add Steel Section"
        open={sectionModalVisible}
        onCancel={() => setSectionModalVisible(false)}
        footer={null}
        destroyOnClose
        width={480}
      >
        <Form
          form={sectionForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await api.post('/admin/sections', values);
              message.success('Section created');
              setSectionModalVisible(false);
              fetchSections();
            } catch (e) {
              message.error('Failed to create section');
            }
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="sectionName"
            label="Section Designation"
            rules={[{ required: true, message: 'Enter section name' }]}
          >
            <Input placeholder="e.g. ISMC 150x75" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Section Type"
            rules={[{ required: true, message: 'Enter type' }]}
          >
            <Input placeholder="e.g. Channel, Pipe, Angle" />
          </Form.Item>

          <Form.Item
            name="weightPerMeter"
            label="Weight per Meter (kg/m)"
            rules={[{ required: true, message: 'Enter weight' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button onClick={() => setSectionModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Section
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RateMastersPage;
