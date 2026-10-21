import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  message
} from 'antd';
import {
  EditOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const STATUS_TAGS = {
  pending: { color: 'default', label: 'Pending' },
  in_progress: { color: 'processing', label: 'In Progress' },
  review: { color: 'warning', label: 'Under Review' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'error', label: 'Rejected' }
};

const DesignTasksPage = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal
  const [editingTask, setEditingTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/design-tasks');
      if (res.data && res.data.data) {
        setTasks(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching design tasks:', e);
      message.error('Failed to load drawing tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenEditModal = (record) => {
    setEditingTask(record);
    form.resetFields();
    form.setFieldsValue({
      status: record.status || 'pending',
      dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
      notes: record.notes || ''
    });
    setModalVisible(true);
  };

  const handleUpdateSubmit = async (values) => {
    setSubmitting(true);
    try {
      await api.patch(`/design-tasks/${editingTask._id}`, {
        status: values.status,
        dueDate: values.dueDate ? values.dueDate.toDate() : undefined,
        notes: values.notes
      });
      message.success('Drawing task updated');
      setModalVisible(false);
      fetchTasks();
    } catch (e) {
      message.error('Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (t.refCode && t.refCode.toLowerCase().includes(q)) ||
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.workOrderId?.refCode && t.workOrderId.refCode.toLowerCase().includes(q)) ||
      (t.workOrderId?.clientName && t.workOrderId.clientName.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'REF #',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (val) => <span className="ref-badge">{val || 'DT-TASK'}</span>
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
      title: 'CLIENT / TITLE',
      key: 'client',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {r.workOrderId?.clientName || 'General Client'}
          </span>
          <div style={{ fontSize: 11, color: '#64748b' }}>{r.title}</div>
        </div>
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
      title: 'DUE DATE',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? dayjs(val).format('DD MMM YYYY') : '—'}
        </span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined style={{ color: '#0b315d' }} />}
          onClick={() => handleOpenEditModal(r)}
        >
          Edit
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Drawing Tasks</h1>
          <p className="page-subtitle">Manage structural drawings for active work orders</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTasks} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by ref, client, or drawing title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 170 }}
        >
          <Option value="all">All Statuses</Option>
          <Option value="pending">Pending</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="review">Under Review</Option>
          <Option value="approved">Approved</Option>
          <Option value="rejected">Rejected</Option>
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
          dataSource={filteredTasks}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          locale={{ emptyText: 'No drawing tasks assigned' }}
        />
      </div>

      {/* ── EDIT STATUS MODAL (width 440px) ── */}
      <Modal
        title="Update Drawing Task"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={440}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="status" label="Drawing Status" rules={[{ required: true }]}>
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="review">Under Review</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
          </Form.Item>

          <Form.Item name="notes" label="Design Notes / Revision Log">
            <TextArea rows={3} placeholder="Add engineering notes, revisions or CAD references..." />
          </Form.Item>

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

export default DesignTasksPage;
