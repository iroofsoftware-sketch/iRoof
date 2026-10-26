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
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const STATUS_TAGS = {
  scheduled: { color: 'blue', label: 'Scheduled' },
  in_progress: { color: 'orange', label: 'In Progress' },
  completed: { color: 'success', label: 'Completed' },
  cancelled: { color: 'error', label: 'Cancelled' }
};

const TYPE_TAGS = {
  initial: 'Initial Kickoff',
  progress: 'Progress Check',
  final: 'Final Inspection',
  inspection: 'Technical Audit'
};

const SiteVisitsPage = () => {
  const navigate = useNavigate();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Modal
  const [editingVisit, setEditingVisit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-visits');
      if (res.data && res.data.data) {
        setVisits(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching site visits:', e);
      message.error('Failed to load site visits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleOpenReportModal = (record) => {
    setEditingVisit(record);
    form.resetFields();
    form.setFieldsValue({
      status: record.status === 'scheduled' ? 'completed' : record.status,
      completedDate: dayjs(),
      report: record.report || '',
      notes: record.notes || ''
    });
    setModalVisible(true);
  };

  const handleSubmitReport = async (values) => {
    setSubmitting(true);
    try {
      await api.patch(`/site-visits/${editingVisit._id}`, {
        status: values.status,
        completedDate: values.completedDate ? values.completedDate.toDate() : new Date(),
        report: values.report,
        notes: values.notes
      });
      message.success('Site inspection report submitted');
      setModalVisible(false);
      fetchVisits();
    } catch (e) {
      message.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = visits.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (v.refCode && v.refCode.toLowerCase().includes(q)) ||
      (v.workOrderId?.refCode && v.workOrderId.refCode.toLowerCase().includes(q)) ||
      (v.workOrderId?.clientName && v.workOrderId.clientName.toLowerCase().includes(q)) ||
      (v.workOrderId?.siteAddress && v.workOrderId.siteAddress.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'REF #',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (val) => <span className="ref-badge">{val || 'SV-VISIT'}</span>
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
      title: 'CLIENT / LOCATION',
      key: 'client',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {r.workOrderId?.clientName || 'General Client'}
          </span>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {r.workOrderId?.siteAddress || 'Site Location'}
          </div>
        </div>
      )
    },
    {
      title: 'VISIT TYPE',
      dataIndex: 'visitType',
      key: 'visitType',
      render: (val) => (
        <span style={{ color: '#374151', fontSize: 12 }}>{TYPE_TAGS[val] || val}</span>
      )
    },
    {
      title: 'SCHEDULED',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? dayjs(val).format('DD MMM YYYY') : '—'}
        </span>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const cfg = STATUS_TAGS[status] || STATUS_TAGS.scheduled;
        return (
          <Tag color={cfg.color} style={{ borderRadius: 4, fontWeight: 500 }}>
            {cfg.label}
          </Tag>
        );
      }
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Button
          type="text"
          size="small"
          icon={<FileTextOutlined style={{ color: '#0b315d' }} />}
          onClick={() => handleOpenReportModal(r)}
        >
          Submit Report
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Site Visits</h1>
          <p className="page-subtitle">Schedule, inspect and record field engineering visits</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchVisits} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by ref, client, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 160 }}
        >
          <Option value="all">All Statuses</Option>
          <Option value="scheduled">Scheduled</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="completed">Completed</Option>
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
          locale={{ emptyText: 'No site visits found' }}
        />
      </div>

      {/* ── SUBMIT REPORT MODAL (width 560px) ── */}
      <Modal
        title={`Site Visit Report — ${editingVisit?.workOrderId?.refCode || 'Inspection'}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitReport}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="status" label="Inspection Status" rules={[{ required: true }]}>
              <Select>
                <Option value="scheduled">Scheduled</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>

            <Form.Item name="completedDate" label="Visit / Completed Date">
              <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="report"
            label="Field Inspection Report"
            rules={[{ required: true, message: 'Please write site observation report' }]}
          >
            <TextArea
              rows={5}
              placeholder="Describe site conditions, alignment, foundation readiness, crane access, issues..."
            />
          </Form.Item>

          <Form.Item name="notes" label="Additional Notes">
            <TextArea rows={2} placeholder="Reminders, customer remarks..." />
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
              Submit Report
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SiteVisitsPage;
