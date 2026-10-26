import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Input, Modal, Form, Space, Tag, Drawer,
  Row, Col, Statistic, Typography, message, Tooltip
} from 'antd';
import {
  PlusOutlined, SearchOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, EnvironmentOutlined, EditOutlined, IdcardOutlined
} from '@ant-design/icons';
import axios from '../../api/axios';

const { Title, Text } = Typography;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  const load = async (q = '') => {
    try {
      setLoading(true);
      const r = await axios.get(`/customers${q ? `?search=${q}` : ''}`);
      setCustomers(r.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (values) => {
    try {
      if (editMode && selected) {
        await axios.patch(`/customers/${selected._id}`, values);
        message.success('Customer updated');
      } else {
        await axios.post('/customers', values);
        message.success('Customer added');
      }
      setShowModal(false);
      form.resetFields();
      setEditMode(false);
      load();
    } catch {
      message.error('Failed to save customer');
    }
  };

  const columns = [
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (v, r) => (
        <Button type="link" onClick={() => { setSelected(r); setShowDrawer(true); }} style={{ padding: 0, fontWeight: 600 }}>
          {v}
        </Button>
      )
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: v => v || '—' },
    { title: 'City', dataIndex: 'city', key: 'city', render: v => v || '—' },
    {
      title: 'GSTIN', dataIndex: 'gstin', key: 'gstin',
      render: v => v ? <Tag color="blue">{v}</Tag> : <Text type="secondary">None</Text>
    },
    {
      title: '', key: 'actions',
      render: (_, r) => (
        <Tooltip title="Edit">
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setSelected(r); setEditMode(true); form.setFieldsValue(r); setShowModal(true);
          }} />
        </Tooltip>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Customer Master</Title>
          <Text type="secondary">{customers.length} customers total</Text>
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="Search name or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onSearch={v => load(v)}
              allowClear
              onClear={() => load()}
              style={{ width: 260 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditMode(false); form.resetFields(); setShowModal(true); }}>
              Add Customer
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editMode ? 'Edit Customer' : 'Add New Customer'}
        open={showModal}
        onCancel={() => { setShowModal(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editMode ? 'Update' : 'Save'}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Customer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} placeholder="+91 99999 99999" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input prefix={<MailOutlined />} placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gstin" label="GSTIN">
                <Input prefix={<IdcardOutlined />} placeholder="22AAAAA0000A1Z5" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Address">
                <Input.TextArea rows={2} placeholder="Full address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="city" label="City">
                <Input placeholder="e.g. Kochi" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pincode" label="Pincode">
                <Input placeholder="682001" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="Notes">
                <Input.TextArea rows={2} placeholder="Internal notes…" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 360° Profile Drawer */}
      <Drawer
        title={selected?.name}
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        width={440}
      >
        {selected && (
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <Card size="small" title="Contact Details">
              <p><PhoneOutlined /> <strong>Phone:</strong> {selected.phone}</p>
              {selected.email && <p><MailOutlined /> <strong>Email:</strong> {selected.email}</p>}
              {selected.address && <p><EnvironmentOutlined /> <strong>Address:</strong> {selected.address}, {selected.city}</p>}
              {selected.gstin && <p><IdcardOutlined /> <strong>GSTIN:</strong> {selected.gstin}</p>}
            </Card>
            {selected.notes && (
              <Card size="small" title="Notes">
                <Text type="secondary">{selected.notes}</Text>
              </Card>
            )}
            <Button
              block
              icon={<EditOutlined />}
              onClick={() => {
                setShowDrawer(false);
                setEditMode(true);
                form.setFieldsValue(selected);
                setShowModal(true);
              }}
            >
              Edit Customer
            </Button>
          </Space>
        )}
      </Drawer>
    </div>
  );
}
