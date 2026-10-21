import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Space,
  message
} from 'antd';
import {
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const STATUS_TAGS = {
  pending: { color: 'default', label: 'Pending' },
  approved: { color: 'blue', label: 'Approved' },
  ordered: { color: 'orange', label: 'Ordered' },
  received: { color: 'success', label: 'Received' },
  cancelled: { color: 'error', label: 'Cancelled' }
};

const PurchaseRequestsPage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal
  const [editingRequest, setEditingRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchase-requests');
      if (res.data && res.data.data) {
        setRequests(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching purchase requests:', e);
      message.error('Failed to load purchase requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenEditModal = (record) => {
    setEditingRequest(record);
    form.resetFields();
    form.setFieldsValue({
      status: record.status || 'pending',
      supplierName: record.supplierName || '',
      totalEstimate: record.totalEstimate || 0,
      notes: record.notes || ''
    });
    setModalVisible(true);
  };

  const handleUpdateSubmit = async (values) => {
    setSubmitting(true);
    try {
      await api.patch(`/purchase-requests/${editingRequest._id}`, values);
      message.success('Purchase request updated');
      setModalVisible(false);
      fetchRequests();
    } catch (e) {
      message.error('Failed to update request');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter((pr) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (pr.refCode && pr.refCode.toLowerCase().includes(q)) ||
      (pr.supplierName && pr.supplierName.toLowerCase().includes(q)) ||
      (pr.workOrderId?.refCode && pr.workOrderId.refCode.toLowerCase().includes(q)) ||
      (pr.workOrderId?.clientName && pr.workOrderId.clientName.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || pr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'REF #',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (val) => <span className="ref-badge">{val || 'PR-REQ'}</span>
    },
    {
      title: 'WORK ORDER',
      key: 'wo',
      width: 140,
      render: (_, r) => (
        <span
          className="ref-badge"
          style={{ cursor: 'pointer', fontSize: 11, opacity: 0.85 }}
          onClick={() => navigate(`/projectmanager/workorders/${r.workOrderId?._id}`)}
        >
          {r.workOrderId?.refCode || 'WO-REF'}
        </span>
      )
    },
    {
      title: 'CLIENT',
      key: 'client',
      render: (_, r) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {r.workOrderId?.clientName || 'General Client'}
        </span>
      )
    },
    {
      title: 'ITEMS COUNT',
      key: 'count',
      render: (_, r) => <span style={{ color: '#475569', fontWeight: 500 }} className="tabular-nums">{r.items?.length || 0} items</span>
    },
    {
      title: 'EST. TOTAL',
      dataIndex: 'totalEstimate',
      key: 'totalEstimate',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }} className="tabular-nums">
          ₹ {Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const cfg = STATUS_TAGS[status] || STATUS_TAGS.pending;
        return (
          <span className={`status-dot status-${status}`}>
            <span style={{ textTransform: 'capitalize' }}>{cfg.label}</span>
          </span>
        );
      }
    },
    {
      title: 'SUPPLIER',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (val) => <span style={{ color: '#6b7280' }}>{val || 'Unassigned'}</span>
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space size={4}>
          {r.status === 'approved' && (
            <Button
              type="primary"
              size="small"
              icon={<FileTextOutlined />}
              style={{ background: '#0b315d', borderColor: '#0b315d', fontSize: 12 }}
              onClick={() => navigate(`/purchase/orders?prId=${r._id}`)}
            >
              Create PO
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#0b315d' }} />}
            onClick={() => handleOpenEditModal(r)}
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
          <h1 className="page-title">Purchase Requests</h1>
          <p className="page-subtitle">Manage material procurement for all active projects</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchRequests} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by ref, supplier, or client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 170 }}
        >
          <Option value="all">All Statuses</Option>
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="ordered">Ordered</Option>
          <Option value="received">Received</Option>
          <Option value="cancelled">Cancelled</Option>
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
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          locale={{ emptyText: 'No purchase requests found' }}
        />
      </div>

      {/* ── EDIT MODAL (width 560px) ── */}
      <Modal
        title="Update Purchase Request"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSubmit}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="ordered">Ordered</Option>
                <Option value="received">Received</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>

            <Form.Item name="totalEstimate" label="Estimated Cost (₹)">
              <InputNumber style={{ width: '100%' }} min={0} step={100} />
            </Form.Item>
          </div>

          <Form.Item name="supplierName" label="Assigned Supplier / Vendor">
            <Input placeholder="e.g. Tata BlueScope / Jindal Steel" />
          </Form.Item>

          <Form.Item name="notes" label="Procurement Notes">
            <TextArea rows={2} placeholder="Delivery schedule, truck dimensions, invoicing terms..." />
          </Form.Item>

          {/* Items Read-Only Table */}
          {editingRequest?.items && editingRequest.items.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Bill of Materials (BOM)
              </span>
              <div
                style={{
                  border: '1px solid #dde3ea',
                  borderRadius: 6,
                  maxHeight: 180,
                  overflowY: 'auto',
                  fontSize: 12
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc', color: '#6b7280' }}>
                    <tr>
                      <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #dde3ea' }}>Name</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', borderBottom: '1px solid #dde3ea' }}>Qty</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #dde3ea' }}>Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingRequest.items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f4f8' }}>
                        <td style={{ padding: '6px 10px' }}>{it.name}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                          {it.quantity} {it.unit}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 500 }}>
                          ₹{Number(it.estimatedCost || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #dde3ea'
            }}
          >
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#0b315d', borderColor: '#0b315d' }}
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseRequestsPage;
