import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Card,
  Typography,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Input
} from 'antd';
import {
  PlusOutlined,
  CalculatorOutlined,
  ReloadOutlined,
  DeleteOutlined,
  SearchOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;

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
      title: 'Estimate Ref',
      dataIndex: '_id',
      key: 'id',
      render: (id) => (
        <Text strong code style={{ color: '#1e293b' }}>
          EST-{id.slice(-6).toUpperCase()}
        </Text>
      )
    },
    {
      title: 'Client / Enquiry',
      key: 'client',
      render: (_, r) => (
        <div>
          <Text strong>{r.enquiryId?.clientName || 'General Estimate'}</Text>
          {r.enquiryId?.phone && (
            <div style={{ fontSize: 12, color: '#64748b' }}>{r.enquiryId.phone}</div>
          )}
        </div>
      )
    },
    {
      title: 'Structural Model',
      dataIndex: 'model',
      key: 'model',
      render: (m) => <Tag color="blue">{m}</Tag>
    },
    {
      title: 'Span x Length',
      key: 'dims',
      render: (_, r) => {
        const inp = r.inputData || {};
        return `${inp.span || '—'}m x ${inp.length || '—'}m`;
      }
    },
    {
      title: 'Roof Area',
      key: 'area',
      render: (_, r) => {
        const area = r.results?.area;
        return area ? `${Number(area).toFixed(1)} ft²` : '—';
      }
    },
    {
      title: 'Grand Total',
      key: 'total',
      align: 'right',
      render: (_, r) => {
        const total = r.results?.costs?.grandTotal || r.results?.costs?.beforeGst || 0;
        return (
          <Text strong style={{ color: '#059669', fontSize: 14 }}>
            ₹{Number(total).toLocaleString('en-IN')}
          </Text>
        );
      }
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : '—'
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/sales/estimates/${record._id}`)}
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>Saved Estimates</Title>
          <Text type="secondary">
            Archive of all commercial and engineering roofing estimates.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchEstimates} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/sales/estimates/new')}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderColor: '#2563eb'
            }}
          >
            New Estimate
          </Button>
        </Space>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={10}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search by client, model, or ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: 'No estimates created yet' }}
        />
      </Card>
    </div>
  );
};

export default SavedEstimatesPage;
