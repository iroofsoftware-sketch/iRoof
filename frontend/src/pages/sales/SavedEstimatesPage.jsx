import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Input
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SavedEstimatesPage = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
      width: 140,
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
      render: (m) => (
        <Tag bordered={false} style={{ background: '#f0f5fa', color: '#0b2e59', borderRadius: 4, fontWeight: 600, border: '1px solid rgba(11, 46, 89, 0.12)' }}>
          {m}
        </Tag>
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
      title: 'DATE',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => (
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          {val
            ? new Date(val).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : '—'}
        </span>
      )
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

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by client, model, or ref..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ maxWidth: 360 }}
        />
        {searchQuery && (
          <Button type="link" onClick={() => setSearchQuery('')} style={{ color: '#6b7280', fontSize: 13, padding: 0 }}>
            Clear search
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
          locale={{ emptyText: 'No estimates found' }}
        />
      </div>
    </div>
  );
};

export default SavedEstimatesPage;
