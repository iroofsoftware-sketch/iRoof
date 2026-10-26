import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Input, Modal, Form, Space, Tag, Row, Col,
  Select, Typography, message, Statistic, Drawer, Divider, InputNumber
} from 'antd';
import {
  PlusOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined,
  ClockCircleOutlined, PrinterOutlined, WhatsAppOutlined
} from '@ant-design/icons';
import axios from '../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors = {
  draft: 'default', sent: 'blue', partial: 'orange', paid: 'green', cancelled: 'red'
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form] = Form.useForm();
  const [payForm] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (search) params.push(`search=${search}`);
      const r = await axios.get(`/invoices${params.length ? '?' + params.join('&') : ''}`);
      setInvoices(r.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter, search]);

  const stats = {
    total: invoices.length,
    totalValue: invoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
    paid: invoices.filter(i => i.status === 'paid').length,
    outstanding: invoices.filter(i => ['sent', 'partial'].includes(i.status)).reduce((s, i) => s + (i.balanceAmount || 0), 0),
  };

  const handleCreate = async (values) => {
    try {
      const items = [{ description: values.description, quantity: 1, unit: 'job', rate: values.subtotal, amount: values.subtotal }];
      await axios.post('/invoices', { ...values, items });
      message.success('Invoice created');
      setShowCreate(false);
      form.resetFields();
      load();
    } catch {
      message.error('Failed to create invoice');
    }
  };

  const handlePayment = async (values) => {
    try {
      await axios.post(`/invoices/${selected._id}/payment`, values);
      message.success('Payment recorded');
      setShowPayModal(false);
      payForm.resetFields();
      load();
    } catch {
      message.error('Failed to record payment');
    }
  };

  const openDrawer = async (inv) => {
    try {
      const r = await axios.get(`/invoices/${inv._id}`);
      setSelected(r.data.data);
      setShowDrawer(true);
    } catch {
      setSelected(inv);
      setShowDrawer(true);
    }
  };

  const columns = [
    {
      title: 'Invoice', dataIndex: 'refCode', key: 'refCode',
      render: (v, r) => <Button type="link" onClick={() => openDrawer(r)} style={{ padding: 0 }}>{v}</Button>
    },
    { title: 'Client', dataIndex: 'clientName', key: 'clientName' },
    {
      title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount',
      render: v => `₹${(v || 0).toLocaleString('en-IN')}`
    },
    {
      title: 'Balance', dataIndex: 'balanceAmount', key: 'balanceAmount',
      render: v => <Text type={v > 0 ? 'danger' : 'success'}>₹{(v || 0).toLocaleString('en-IN')}</Text>
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: v => <Tag color={statusColors[v]}>{v?.toUpperCase()}</Tag>
    },
    {
      title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate',
      render: v => v ? new Date(v).toLocaleDateString('en-IN') : '—'
    },
    {
      title: '', key: 'actions',
      render: (_, r) => (
        <Space>
          {['sent', 'partial'].includes(r.status) && (
            <Button size="small" type="primary" onClick={() => { setSelected(r); setShowPayModal(true); }}>
              Pay
            </Button>
          )}
          <Button size="small" icon={<PrinterOutlined />} href={`/accounts/invoices/${r._id}/print`} target="_blank" />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Invoices & Payments</Title></Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>New Invoice</Button>
        </Col>
      </Row>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Total Invoices', value: stats.total, icon: <FileTextOutlined />, color: '#0b315d' },
          { title: 'Total Billed', value: `₹${stats.totalValue.toLocaleString('en-IN')}`, icon: <DollarOutlined />, color: '#c9940a' },
          { title: 'Fully Paid', value: stats.paid, icon: <CheckCircleOutlined />, color: '#15803d' },
          { title: 'Outstanding', value: `₹${stats.outstanding.toLocaleString('en-IN')}`, icon: <ClockCircleOutlined />, color: '#b91c1c' },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card>
              <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color }} prefix={s.icon} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }}>
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
          <Option value="all">All Status</Option>
          <Option value="draft">Draft</Option>
          <Option value="sent">Sent</Option>
          <Option value="partial">Partial</Option>
          <Option value="paid">Paid</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
        <Input.Search
          placeholder="Search invoice or client…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={() => load()}
          allowClear onClear={() => setSearch('')}
          style={{ width: 260 }}
        />
      </Space>

      <Card>
        <Table columns={columns} dataSource={invoices} rowKey="_id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      {/* Create Invoice Modal */}
      <Modal title="Create New Invoice" open={showCreate} onCancel={() => setShowCreate(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="clientName" label="Client Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="clientPhone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Work Description" rules={[{ required: true }]}>
                <Input.TextArea rows={2} placeholder="e.g. Roofing work at Aluva site..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="subtotal" label="Subtotal (₹)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cgstRate" label="CGST %" initialValue={9}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sgstRate" label="SGST %" initialValue={9}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" initialValue="draft">
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="sent">Sent to Client</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label="Due Date">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        title={`Record Payment — ${selected?.refCode}`}
        open={showPayModal}
        onCancel={() => { setShowPayModal(false); payForm.resetFields(); }}
        onOk={() => payForm.submit()}
        okText="Record Payment"
      >
        {selected && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
            <Text>Total: <strong>₹{selected.totalAmount?.toLocaleString('en-IN')}</strong></Text>
            {'  '}
            <Text type="secondary">Balance: <Text type="danger"><strong>₹{selected.balanceAmount?.toLocaleString('en-IN')}</strong></Text></Text>
          </div>
        )}
        <Form form={payForm} layout="vertical" onFinish={handlePayment}>
          <Form.Item name="amount" label="Amount Received (₹)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} max={selected?.balanceAmount} />
          </Form.Item>
          <Form.Item name="paymentMode" label="Payment Mode" initialValue="bank_transfer">
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="upi">UPI</Option>
              <Option value="bank_transfer">Bank Transfer / NEFT</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="transactionRef" label="Transaction Reference">
            <Input placeholder="UTR / Cheque No." />
          </Form.Item>
          <Form.Item name="paymentDate" label="Payment Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Invoice Drawer */}
      <Drawer title={`Invoice: ${selected?.invoice?.refCode || selected?.refCode}`} open={showDrawer} onClose={() => setShowDrawer(false)} width={480}>
        {selected && (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Card size="small" title="Invoice Details">
              <p><Text type="secondary">Client:</Text> <strong>{selected.invoice?.clientName || selected.clientName}</strong></p>
              <p><Text type="secondary">Total:</Text> <strong>₹{((selected.invoice?.totalAmount || selected.totalAmount) || 0).toLocaleString('en-IN')}</strong></p>
              <p><Text type="secondary">Paid:</Text> <strong>₹{((selected.invoice?.paidAmount || selected.paidAmount) || 0).toLocaleString('en-IN')}</strong></p>
              <p><Text type="secondary">Balance:</Text> <Text type="danger"><strong>₹{((selected.invoice?.balanceAmount || selected.balanceAmount) || 0).toLocaleString('en-IN')}</strong></Text></p>
            </Card>
            {selected.payments?.length > 0 && (
              <Card size="small" title="Payment History">
                {selected.payments.map((p, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 }}>
                    <Text strong>₹{p.amount.toLocaleString('en-IN')}</Text>
                    <Text type="secondary"> via {p.paymentMode} — {new Date(p.paymentDate).toLocaleDateString('en-IN')}</Text>
                    {p.transactionRef && <Text type="secondary"> ({p.transactionRef})</Text>}
                  </div>
                ))}
              </Card>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
}
