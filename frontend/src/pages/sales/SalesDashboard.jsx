import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty, Card } from 'antd';
import {
  FileTextOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import ConversionFunnelChart from '../../components/charts/ConversionFunnelChart';
import StatusDonutChart from '../../components/charts/StatusDonutChart';

const SalesDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    enquiriesCount: 0,
    estimatesCount: 0,
    pendingFollowup: 0,
    wonCount: 0
  });
  const [funnelData, setFunnelData] = useState([]);
  const [stageDonut, setStageDonut] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Estimator';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const [enqRes, estRes, woRes] = await Promise.all([
          api.get('/enquiries').catch(() => ({ data: { enquiries: [] } })),
          api.get('/estimates').catch(() => ({ data: { estimates: [] } })),
          api.get('/workorders').catch(() => ({ data: { data: [] } }))
        ]);

        const enquiries = enqRes.data?.enquiries || [];
        const estimates = estRes.data?.estimates || [];
        const workOrders = woRes.data?.data || [];

        const pending = enquiries.filter((e) => ['new', 'visited'].includes(e.status)).length;
        const visited = enquiries.filter((e) => ['visited', 'estimated', 'approved', 'completed'].includes(e.status)).length;
        const won = workOrders.length;
        const completed = workOrders.filter((w) => w.status === 'completed').length;

        setStats({
          enquiriesCount: enquiries.length,
          estimatesCount: estimates.length,
          pendingFollowup: pending,
          wonCount: won
        });

        setFunnelData([
          { label: 'New Enquiries', count: enquiries.length || 1, color: '#0b2e59' },
          { label: 'Site Inspected', count: visited || 1, color: '#1d4ed8' },
          { label: 'Commercial Estimates', count: estimates.length || 1, color: '#0284c7' },
          { label: 'Work Orders Won', count: won || 1, color: '#c9940a' },
          { label: 'Completed / Handover', count: completed || 1, color: '#15803d' }
        ]);

        // Enquiry status distribution
        const newCount = enquiries.filter((e) => e.status === 'new').length;
        const visitedCount = enquiries.filter((e) => e.status === 'visited').length;
        const estCount = enquiries.filter((e) => e.status === 'estimated').length;
        const appCount = enquiries.filter((e) => ['approved', 'completed'].includes(e.status)).length;

        setStageDonut([
          { label: 'New Leads', count: newCount || 1, color: '#0b2e59' },
          { label: 'Site Visited', count: visitedCount || 1, color: '#1d4ed8' },
          { label: 'Quoted', count: estCount || 1, color: '#0284c7' },
          { label: 'Approved / Won', count: appCount || 1, color: '#15803d' }
        ]);

        const recent = enquiries.slice(0, 5).map((e) => ({
          key: e._id,
          ref: `ENQ-${e._id.slice(-4).toUpperCase()}`,
          customer: e.clientName,
          location: e.address || 'Site Location',
          status: e.status || 'new',
          date: e.enquiryDate ? new Date(e.enquiryDate).toLocaleDateString('en-IN') : '—'
        }));

        setRecentEnquiries(recent);
      } catch (err) {
        console.error('Error loading sales dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const columns = [
    {
      title: 'REF',
      dataIndex: 'ref',
      key: 'ref',
      width: 130,
      render: (text) => <span className="ref-badge">{text}</span>
    },
    {
      title: 'CUSTOMER',
      dataIndex: 'customer',
      key: 'customer',
      render: (name) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{name}</span>
    },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      key: 'location',
      render: (loc) => <span style={{ color: '#64748b' }}>{loc}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <span className={`status-dot status-${status}`}>
          <span style={{ textTransform: 'capitalize' }}>{status}</span>
        </span>
      )
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (d) => <span style={{ color: '#64748b', fontSize: 12.5 }} className="tabular-nums">{d}</span>
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* A) WELCOME ROW */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">
            Good {greetingTime}, {firstName}
          </h1>
          <p className="page-subtitle">
            Sales & Commercial Roofing Pipeline · {formattedDate}
          </p>
        </div>

        <div className="page-header__actions">
          <Button
            icon={<UsergroupAddOutlined />}
            onClick={() => navigate('/sales/customers')}
            style={{ borderColor: '#0b2e59', color: '#0b2e59', fontWeight: 600 }}
          >
            Customers CRM
          </Button>
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => navigate('/sales/enquiries')}
            style={{ borderColor: '#0b2e59', color: '#0b2e59', fontWeight: 600 }}
          >
            Pipeline Kanban
          </Button>
          <Button
            type="primary"
            icon={<CalculatorOutlined />}
            onClick={() => navigate('/sales/estimates/new')}
            style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
          >
            New Estimate
          </Button>
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Active Enquiries</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <FileTextOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.enquiriesCount}</div>
            <div className="stat-card__meta">Total client inquiries</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Pending Follow-up</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: stats.pendingFollowup > 0 ? '#c2410c' : '#1e293b' }}>
              {stats.pendingFollowup}
            </div>
            <div className="stat-card__meta">Awaiting site visit / estimation</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Estimates Created</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CalculatorOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.estimatesCount}</div>
            <div className="stat-card__meta">Commercial quotations</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Projects Won</span>
              <div className="stat-card__icon" style={{ background: '#ecfdf5', color: '#047857' }}>
                <TrophyOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#047857' }}>
              {stats.wonCount}
            </div>
            <div className="stat-card__meta">Converted to work orders</div>
          </div>
        </Col>
      </Row>

      {/* C) ANALYTICS ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ConversionFunnelChart
            title="Sales Conversion Funnel"
            subtitle="Drop-off and stage velocity from enquiry to contract award"
            stages={funnelData}
          />
        </Col>
        <Col xs={24} lg={10}>
          <StatusDonutChart
            title="Lead Stage Distribution"
            subtitle="Current status of all client inquiries"
            centerLabel="Total Leads"
            segments={stageDonut}
          />
        </Col>
      </Row>

      {/* D) RECENT LEADS TABLE */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Recent Inquiries
          </div>
          <Button
            type="link"
            onClick={() => navigate('/sales/enquiries')}
            style={{ fontSize: 12.5, fontWeight: 600, color: '#0b2e59' }}
          >
            View all inquiries →
          </Button>
        </div>
        {recentEnquiries.length === 0 ? (
          <div style={{ padding: '40px 0' }}>
            <Empty description="No recent enquiries logged" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={recentEnquiries}
            pagination={false}
            size="middle"
            onRow={(record) => ({
              onClick: () => navigate('/sales/enquiries'),
              style: { cursor: 'pointer' }
            })}
          />
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;
