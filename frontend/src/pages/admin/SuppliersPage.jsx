import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Drawer,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const DEFAULT_MATERIAL_OPTIONS = [
  'Roofing Sheets (GI / Color Coated)',
  'Galvalume Sheets',
  'Structural Steel Tubes (SHS/RHS)',
  'Purlins (C & Z)',
  'Self-Drilling Screws & Fasteners',
  'EPDM Washers & Sealants',
  'Polycarbonate Skylights',
  'Turbo Ventilators',
  'Gutters & Downpipes',
  'Primer & Anti-Corrosion Paint'
];

const PAYMENT_TERMS_OPTIONS = [
  'On Delivery',
  '7 Days',
  '15 Days',
  '30 Days',
  '45 Days',
  '60 Days',
  '100% Advance'
];

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Add/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      if (res.data?.success && res.data.data) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      message.error(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    form.resetFields();
    form.setFieldsValue({
      paymentTerms: '30 Days',
      materials: []
    });
    setModalVisible(true);
  };

  const handleOpenEditModal = (supplier) => {
    setEditingSupplier(supplier);
    form.resetFields();
    form.setFieldsValue({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      gstin: supplier.gstin,
      materials: supplier.materials || [],
      paymentTerms: supplier.paymentTerms || '30 Days',
      bankName: supplier.bankName,
      bankAccount: supplier.bankAccount,
      ifscCode: supplier.ifscCode,
      notes: supplier.notes
    });
    setModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingSupplier) {
        const res = await api.patch(`/suppliers/${editingSupplier._id}`, values);
        message.success('Supplier updated successfully');
        if (selectedSupplier && selectedSupplier._id === editingSupplier._id) {
          setSelectedSupplier(res.data.supplier);
        }
      } else {
        await api.post('/suppliers', values);
        message.success('Supplier added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchSuppliers();
    } catch (err) {
      console.error('Error saving supplier:', err);
      message.error(err.response?.data?.message || 'Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (supplier) => {
    try {
      const newStatus = !supplier.isActive;
      await api.patch(`/suppliers/${supplier._id}`, { isActive: newStatus });
      message.success(
        newStatus
          ? `Supplier ${supplier.name} activated`
          : `Supplier ${supplier.name} deactivated`
      );
      if (selectedSupplier && selectedSupplier._id === supplier._id) {
        setSelectedSupplier((prev) => ({ ...prev, isActive: newStatus }));
      }
      fetchSuppliers();
    } catch (err) {
      message.error('Failed to change supplier status');
    }
  };

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.materials && s.materials.some((m) => m.toLowerCase().includes(q)));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.isActive) ||
      (statusFilter === 'inactive' && !s.isActive);

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'SUPPLIER NAME',
      dataIndex: 'name',
      key: 'name',
      render: (val, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0b315d' }}>{val}</span>
          {r.gstin && (
            <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
              GST: {r.gstin}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'CONTACT PERSON',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (val) => <span style={{ color: '#6b7280', fontSize: 12 }}>{val || '—'}</span>
    },
    {
      title: 'PHONE',
      dataIndex: 'phone',
      key: 'phone',
      render: (val) => <span style={{ fontSize: 12, color: '#374151' }}>{val || '—'}</span>
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? <a href={`mailto:${val}`} onClick={(e) => e.stopPropagation()}>{val}</a> : '—'}
        </span>
      )
    },
    {
      title: 'MATERIALS',
      dataIndex: 'materials',
      key: 'materials',
      render: (mats = []) => {
        if (!mats || mats.length === 0) return <span style={{ color: '#9ca3af', fontSize: 11 }}>—</span>;
        const visible = mats.slice(0, 2);
        const remainder = mats.length - visible.length;
        return (
          <Space size={4} wrap>
            {visible.map((m, idx) => (
              <Tag
                key={idx}
                bordered={false}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: 11,
                  borderRadius: 4
                }}
              >
                {m}
              </Tag>
            ))}
            {remainder > 0 && (
              <Tag bordered={false} style={{ background: '#e2e8f0', color: '#475569', fontSize: 11 }}>
                +{remainder} more
              </Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'PAYMENT TERMS',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      render: (val) => <span style={{ fontSize: 12, color: '#6b7280' }}>{val || '30 Days'}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <span className={`status-dot status-${active ? 'active' : 'draft'}`}>
          <span>{active ? 'Active' : 'Inactive'}</span>
        </span>
      )
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
              setSelectedSupplier(r);
              setDrawerVisible(true);
            }}
          >
            View
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#6b7280' }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(r);
            }}
          >
            Edit
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
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage your approved vendor master list and material suppliers</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchSuppliers} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
            Add Supplier
          </Button>
        </Space>
      </div>

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
          placeholder="Search by supplier name, contact, material..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ width: 320 }}
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 140 }}
        >
          <Option value="all">All Status</Option>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
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
          dataSource={filteredSuppliers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          locale={{ emptyText: 'No suppliers registered yet' }}
          onRow={(record) => ({
            onClick: () => {
              setSelectedSupplier(record);
              setDrawerVisible(true);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      {/* ── DETAIL DRAWER (560px) ── */}
      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={560}
        destroyOnClose
        title={
          selectedSupplier ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {selectedSupplier.name}
              </span>
              <Tag color={selectedSupplier.isActive ? 'green' : 'default'}>
                {selectedSupplier.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </div>
          ) : (
            'Supplier Details'
          )
        }
        footer={
          selectedSupplier && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Button
                  onClick={() => {
                    handleOpenEditModal(selectedSupplier);
                  }}
                >
                  Edit
                </Button>
                <Popconfirm
                  title={
                    selectedSupplier.isActive
                      ? 'Deactivate this supplier?'
                      : 'Reactivate this supplier?'
                  }
                  onConfirm={() => handleToggleStatus(selectedSupplier)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger={selectedSupplier.isActive}>
                    {selectedSupplier.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </Popconfirm>
              </Space>
              <Button onClick={() => setDrawerVisible(false)}>Close</Button>
            </div>
          )
        }
      >
        {selectedSupplier && (
          <div>
            {/* Section 1: Contact Details */}
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
                Contact Details
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
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>CONTACT PERSON</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>
                    {selectedSupplier.contactPerson || '—'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>PHONE NUMBER</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>
                    {selectedSupplier.phone || '—'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>EMAIL ADDRESS</span>
                  <span style={{ color: '#1e40af' }}>{selectedSupplier.email || '—'}</span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>GSTIN NUMBER</span>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {selectedSupplier.gstin || '—'}
                  </span>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>BUSINESS ADDRESS</span>
                  <span style={{ color: '#374151' }}>{selectedSupplier.address || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Materials Supplied */}
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
                Materials Supplied
              </h3>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedSupplier.materials && selectedSupplier.materials.length > 0 ? (
                  selectedSupplier.materials.map((m, idx) => (
                    <Tag
                      key={idx}
                      color="blue"
                      style={{ padding: '4px 10px', fontSize: 12, borderRadius: 4 }}
                    >
                      {m}
                    </Tag>
                  ))
                ) : (
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>No material categories assigned</span>
                )}
              </div>
            </div>

            {/* Section 3: Payment & Banking */}
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
                Payment & Banking Details
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
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>PAYMENT TERMS</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {selectedSupplier.paymentTerms || '30 Days'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>BANK NAME</span>
                  <span style={{ fontWeight: 500 }}>{selectedSupplier.bankName || '—'}</span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>ACCOUNT NUMBER</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {selectedSupplier.bankAccount || '—'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>IFSC CODE</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {selectedSupplier.ifscCode || '—'}
                  </span>
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
                Supplier Notes
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
                {selectedSupplier.notes || 'No notes specified.'}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── ADD / EDIT SUPPLIER MODAL (560px) ── */}
      <Modal
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Supplier Name"
              rules={[{ required: true, message: 'Please enter supplier name' }]}
            >
              <Input placeholder="e.g. Tata Steel BSL Ltd" />
            </Form.Item>

            <Form.Item name="contactPerson" label="Contact Person">
              <Input placeholder="e.g. Rajesh Kumar" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="e.g. +91 98470 12345" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[{ type: 'email', message: 'Enter a valid email' }]}
            >
              <Input placeholder="e.g. sales@supplier.com" />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Business Address">
            <TextArea rows={2} placeholder="Office/Warehouse address" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="gstin" label="GSTIN">
              <Input placeholder="e.g. 32AABCU9603R1ZM" />
            </Form.Item>

            <Form.Item name="paymentTerms" label="Payment Terms">
              <Select placeholder="Select terms">
                {PAYMENT_TERMS_OPTIONS.map((t) => (
                  <Option key={t} value={t}>{t}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="materials" label="Materials Supplied">
            <Select
              mode="tags"
              placeholder="Select or type material categories..."
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            >
              {DEFAULT_MATERIAL_OPTIONS.map((m) => (
                <Option key={m} value={m}>{m}</Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="bankName" label="Bank Name">
              <Input placeholder="e.g. HDFC Bank" />
            </Form.Item>

            <Form.Item name="bankAccount" label="Account Number">
              <Input placeholder="e.g. 50200012345678" />
            </Form.Item>
          </div>

          <Form.Item name="ifscCode" label="IFSC Code">
            <Input placeholder="e.g. HDFC0001234" />
          </Form.Item>

          <Form.Item name="notes" label="Notes & Remarks">
            <TextArea rows={2} placeholder="Delivery speed, special discounts, etc." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#0b315d', borderColor: '#0b315d' }}
            >
              {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
