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
  message,
  Tooltip
} from 'antd';
import {
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const STATUS_FLOW = ['pending', 'material_ready', 'in_progress', 'quality_check', 'completed'];

const STATUS_CONFIG = {
  pending: { color: 'default', label: 'Pending' },
  material_ready: { color: 'processing', label: 'Material Ready' },
  in_progress: { color: 'orange', label: 'In Progress' },
  quality_check: { color: 'purple', label: 'Quality Check' },
  completed: { color: 'success', label: 'Completed' }
};

const WorkshopJobsPage = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal
  const [editingJob, setEditingJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/workshop-jobs');
      if (res.data && res.data.data) {
        setJobs(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching workshop jobs:', e);
      message.error('Failed to load fabrication jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleOpenEditModal = (record) => {
    setEditingJob(record);
    form.resetFields();
    form.setFieldsValue({
      status: record.status || 'pending',
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
      notes: record.notes || ''
    });
    setModalVisible(true);
  };

  const handleUpdateSubmit = async (values) => {
    setSubmitting(true);
    try {
      await api.patch(`/workshop-jobs/${editingJob._id}`, {
        status: values.status,
        startDate: values.startDate ? values.startDate.toDate() : undefined,
        endDate: values.endDate ? values.endDate.toDate() : undefined,
        notes: values.notes
      });
      message.success('Fabrication job updated');
      setModalVisible(false);
      fetchJobs();
    } catch (e) {
      message.error('Failed to update job');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Advance Status chip click
  const handleQuickAdvance = async (record, nextStatus) => {
    try {
      await api.patch(`/workshop-jobs/${record._id}`, { status: nextStatus });
      message.success(`Status updated to ${STATUS_CONFIG[nextStatus].label}`);
      setJobs((prev) =>
        prev.map((j) => (j._id === record._id ? { ...j, status: nextStatus } : j))
      );
    } catch (e) {
      message.error('Failed to advance status');
    }
  };

  const filtered = jobs.filter((j) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (j.refCode && j.refCode.toLowerCase().includes(q)) ||
      (j.title && j.title.toLowerCase().includes(q)) ||
      (j.workOrderId?.refCode && j.workOrderId.refCode.toLowerCase().includes(q)) ||
      (j.workOrderId?.clientName && j.workOrderId.clientName.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'REF #',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (val) => <span className="ref-badge">{val || 'WJ-JOB'}</span>
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
      title: 'STATUS PIPELINE',
      key: 'pipeline',
      width: 240,
      render: (_, r) => {
        const currentIdx = STATUS_FLOW.indexOf(r.status || 'pending');
        const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag color={STATUS_CONFIG[r.status]?.color} style={{ borderRadius: 4, fontWeight: 500 }}>
              {STATUS_CONFIG[r.status]?.label || r.status}
            </Tag>
            {nextStatus && (
              <Tooltip title={`Advance to: ${STATUS_CONFIG[nextStatus].label}`}>
                <Button
                  size="small"
                  type="text"
                  icon={<RightOutlined style={{ fontSize: 10, color: '#0b315d' }} />}
                  onClick={() => handleQuickAdvance(r, nextStatus)}
                  style={{ background: '#f3f6f9', height: 22, width: 22, padding: 0 }}
                />
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      title: 'START DATE',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? dayjs(val).format('DD MMM YYYY') : '—'}
        </span>
      )
    },
    {
      title: 'END DATE',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? dayjs(val).format('DD MMM YYYY') : '—'}
        </span>
      )
    },
    {
      title: 'ASSIGNED',
      key: 'assigned',
      render: (_, r) => (
        <span style={{ fontSize: 12, color: '#374151' }}>
          {r.assignedTo?.name || 'Workshop Floor'}
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
          <h1 className="page-title">Fabrication Jobs</h1>
          <p className="page-subtitle">Track workshop fabrication progress and production milestones</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchJobs} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* ── PIPELINE FLOW OVERVIEW ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde3ea',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
          Production Lifecycle:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_FLOW.map((step, idx) => (
            <React.Fragment key={step}>
              <Tag color={STATUS_CONFIG[step].color} style={{ borderRadius: 4, margin: 0 }}>
                {idx + 1}. {STATUS_CONFIG[step].label}
              </Tag>
              {idx < STATUS_FLOW.length - 1 && (
                <span style={{ color: '#9ca3af', fontSize: 11 }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by ref, job title, or client..."
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
          {STATUS_FLOW.map((s) => (
            <Option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </Option>
          ))}
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
          locale={{ emptyText: 'No fabrication jobs found' }}
        />
      </div>

      {/* ── EDIT MODAL (width 440px) ── */}
      <Modal
        title="Update Fabrication Job"
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
          <Form.Item name="status" label="Fabrication Status" rules={[{ required: true }]}>
            <Select>
              {STATUS_FLOW.map((s) => (
                <Option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="startDate" label="Start Date">
              <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
            </Form.Item>

            <Form.Item name="endDate" label="Target End Date">
              <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Workshop Production Notes">
            <TextArea rows={3} placeholder="Weld test results, beam cutting status, delays..." />
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

export default WorkshopJobsPage;
