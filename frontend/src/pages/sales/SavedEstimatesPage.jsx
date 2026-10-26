import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Input,
  Modal,
  DatePicker,
  Select
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const SavedEstimatesPage = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Issue WO modal state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedEstimateForWO, setSelectedEstimateForWO] = useState(null);
  const [targetDate, setTargetDate] = useState(dayjs().add(45, 'day'));
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [issuing, setIssuing] = useState(false);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/estimates');
      if (response.data && response.data.estimates) {
        setEstimates(response.data.estimates);
      }
    } catch (err) {
      console.error('Error fetching estimates:', err);
      message.error(err.response?.data?.message || 'Failed to load estimates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/estimates/${id}`);
      message.success('Estimate deleted');
      setEstimates((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      message.error(err.response?.data?.message || 'Failed to delete estimate');
    }
  };

  const handleOpenIssueModal = (estimate) => {
    setSelectedEstimateForWO(estimate);
    setTargetDate(dayjs().add(45, 'day'));
    setPriority('medium');
    setNotes('');
    setIssueModalOpen(true);
  };

  const handleConfirmIssueWO = async () => {
    if (!selectedEstimateForWO) return;
    setIssuing(true);
    try {
      const res = await api.post('/workorders/issue-from-sales', {
        estimateId: selectedEstimateForWO._id,
        targetDate: targetDate ? targetDate.toISOString() : undefined,
        priority,
        notes
      });
      message.success('Sales Work Order & Approval issued to Accounts (Gate 1 complete)');
      setIssueModalOpen(false);
      fetchEstimates();
      if (res.data?.workOrder?._id) {
        navigate(`/projectmanager/workorders/${res.data.workOrder._id}`);
      }
    } catch (err) {
      console.error('Issue WO error:', err);
      message.error(err.response?.data?.message || 'Failed to issue work order');
    } finally {
      setIssuing(false);
    }
  };

  const filtered = estimates.filter((e) => {
    const client = e.enquiryId?.clientName || '';
    const model = e.model || '';
    const q = searchQuery.toLowerCase();
    return client.toLowerCase().includes(q) || model.toLowerCase().includes(q) || e._id.includes(q);
  });

  const columns = [
    {
      title: 'REF #',
      dataIndex: '_id',
      key: 'id',
      width: 130,
      render: (id) => (
        <span className="ref-badge">
          EST-{id.slice(-6).toUpperCase()}
        </span>
      )
    },
    {
      title: 'CUSTOMER',
      key: 'client',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.enquiryId?.clientName || 'General Estimate'}</span>
          {r.enquiryId?.phone && (
            <div style={{ fontSize: 11, color: '#64748b' }}>{r.enquiryId.phone}</div>
          )}
        </div>
      )
    },
    {
      title: 'STRUCTURAL MODEL',
      dataIndex: 'model',
      key: 'model',
      render: (val) => (
        <span style={{ fontWeight: 500, color: '#0b2e59' }}>
          {val || '—'}
        </span>
      )
    },
    {
      title: 'DIMENSIONS',
      key: 'dims',
      render: (_, r) => {
        const inp = r.inputData || {};
        return <span style={{ color: '#334155', fontWeight: 500 }} className="tabular-nums">{inp.span || '—'}m × {inp.length || '—'}m</span>;
      }
    },
    {
      title: 'ROOF AREA',
      key: 'area',
      render: (_, r) => {
        const area = r.results?.area;
        return <span style={{ color: '#64748b' }} className="tabular-nums">{area ? `${Number(area).toFixed(1)} ft²` : '—'}</span>;
      }
    },
    {
      title: 'GRAND TOTAL',
      key: 'total',
      align: 'right',
      render: (_, r) => {
        const total = r.results?.costs?.grandTotal || r.results?.costs?.beforeGst || 0;
        return (
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }} className="tabular-nums">
            ₹ {Number(total).toLocaleString('en-IN')}
          </span>
        );
      }
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        if (status === 'work_order_issued') {
          return <Tag color="blue" icon={<CheckCircleOutlined />}>WO Issued</Tag>;
        }
        if (status === 'approved') {
          return <Tag color="green">Approved</Tag>;
        }
        return <Tag>{status || 'draft'}</Tag>;
      }
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => navigate(`/sales/estimates/${record._id}/quotation`)}
            style={{ color: '#0b2e59', borderColor: '#cbd5e1' }}
          >
            Proposal
          </Button>

          {record.status !== 'work_order_issued' && (
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleOpenIssueModal(record)}
              style={{ color: '#059669', borderColor: '#059669', fontWeight: 600 }}
            >
              Issue WO
            </Button>
          )}

          <Button
            type="primary"
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate(`/sales/estimates/${record._id}`)}
            style={{ background: '#0b315d', borderColor: '#0b315d' }}
          >
            Open
          </Button>
          <Popconfirm
            title="Delete Estimate"
            description="Are you sure you want to remove this estimate record?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Estimates</h1>
          <p className="page-subtitle">Archive and directory of all commercial roofing quotations</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchEstimates} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/sales/estimates/new')}
          >
            New Estimate
          </Button>
        </Space>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="filter-card">
        <Input
          placeholder="Filter by customer name, structural model, or ref code..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Total saved records: <strong style={{ color: '#0f172a' }}>{filtered.length}</strong>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="content-card" style={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="middle"
        />
      </div>

      {/* ── ISSUE SALES WORK ORDER MODAL (GATE 1 IN SOP) ── */}
      <Modal
        title="Gate 1: Issue Sales Work Order & Approval to Accounts"
        open={issueModalOpen}
        onCancel={() => setIssueModalOpen(false)}
        onOk={handleConfirmIssueWO}
        confirmLoading={issuing}
        okText="Issue to Accounts"
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
            Client has confirmed the quotation. This hands over the commercial estimate to Accounts to finalize payment terms and release to Design.
          </p>
          {selectedEstimateForWO && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
              <div><strong>Client:</strong> {selectedEstimateForWO.enquiryId?.clientName || 'General Client'}</div>
              <div><strong>Model:</strong> {selectedEstimateForWO.model} ({selectedEstimateForWO.inputData?.span}m × {selectedEstimateForWO.inputData?.length}m)</div>
              <div><strong>Grand Total:</strong> ₹ {Number(selectedEstimateForWO.results?.costs?.grandTotal || 0).toLocaleString('en-IN')}</div>
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Target Completion Date</label>
            <DatePicker
              style={{ width: '100%' }}
              value={targetDate}
              onChange={(d) => setTargetDate(d)}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Priority</label>
            <Select value={priority} onChange={(v) => setPriority(v)} style={{ width: '100%' }}>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Handover Notes for Accounts</label>
            <TextArea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Client confirmation details, agreed mobilization notes..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SavedEstimatesPage;
