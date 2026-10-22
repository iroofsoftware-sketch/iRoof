import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty, Card, message } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ControlOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import RevenueAreaChart from '../../components/charts/RevenueAreaChart';
import ConversionFunnelChart from '../../components/charts/ConversionFunnelChart';
import StatusDonutChart from '../../components/charts/StatusDonutChart';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    usersCount: 0,
    enquiriesCount: 0,
    estimatesCount: 0,
    workOrdersCount: 0
  });
  const [workOrdersList, setWorkOrdersList] = useState([]);
  const [pipelineTotal, setPipelineTotal] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [donutData, setDonutData] = useState([]);
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Administrator';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [usersRes, enqRes, estRes, woRes] = await Promise.all([
          api.get('/admin/users').catch(() => ({ data: { users: [] } })),
          api.get('/enquiries').catch(() => ({ data: { enquiries: [] } })),
          api.get('/estimates').catch(() => ({ data: { estimates: [] } })),
          api.get('/workorders').catch(() => ({ data: { data: [] } }))
        ]);

        const users = usersRes.data?.users || [];
        const enquiries = enqRes.data?.enquiries || [];
        const estimates = estRes.data?.estimates || [];
        const workOrders = woRes.data?.data || [];

        setStats({
          usersCount: users.length,
          enquiriesCount: enquiries.length,
          estimatesCount: estimates.length,
          workOrdersCount: workOrders.length
        });
        setWorkOrdersList(workOrders);
        const totalVal = workOrders.reduce((sum, w) => sum + (Number(w.grandTotal) || 0), 0);
        setPipelineTotal(totalVal);

        // Compute conversion funnel counts
        const visitedCount = enquiries.filter((e) => ['visited', 'estimated', 'approved', 'completed'].includes(e.status)).length;
        const estimatedCount = estimates.length;
        const wonCount = workOrders.length;
        const completedCount = workOrders.filter((w) => w.status === 'completed').length;

        setFunnelData([
          { label: 'Total Enquiries', count: enquiries.length || 1, color: '#0b2e59' },
          { label: 'Site Inspected', count: visitedCount || 1, color: '#1d4ed8' },
          { label: 'Quoted Estimates', count: estimatedCount || 1, color: '#0284c7' },
          { label: 'Work Orders Won', count: wonCount || 1, color: '#c9940a' },
          { label: 'Handover Completed', count: completedCount || 1, color: '#15803d' }
        ]);

        // Compute work order breakdown
        const activeWO = workOrders.filter((w) => w.status === 'active').length;
        const compWO = workOrders.filter((w) => w.status === 'completed').length;
        const holdWO = workOrders.filter((w) => w.status === 'on_hold').length;
        const draftWO = workOrders.filter((w) => ['draft', 'pending'].includes(w.status)).length;

        setDonutData([
          { label: 'Active Projects', count: activeWO || 1, color: '#0b2e59' },
          { label: 'Completed', count: compWO || 1, color: '#15803d' },
          { label: 'On Hold', count: holdWO || 0, color: '#d97706' },
          { label: 'Drafted', count: draftWO || 0, color: '#64748b' }
        ]);

        // Combined activity feed
        const activities = [
          ...enquiries.slice(0, 3).map((e) => ({
            key: e._id,
            ref: `ENQ-${e._id.slice(-4).toUpperCase()}`,
            type: 'Enquiry',
            detail: `${e.clientName} (${e.roofType || 'Standard'})`,
            status: e.status || 'new',
            date: e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : '—'
          })),
          ...estimates.slice(0, 3).map((est) => ({
            key: est._id,
            ref: `EST-${est._id.slice(-4).toUpperCase()}`,
            type: 'Estimate',
            detail: `${est.model} · ₹${(est.results?.costs?.grandTotal || 0).toLocaleString('en-IN')}`,
            status: est.status || 'estimated',
            date: est.createdAt ? new Date(est.createdAt).toLocaleDateString('en-IN') : '—'
          }))
        ].slice(0, 5);

        setRecentActivities(activities);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleExportWorkOrdersCSV = () => {
    if (!workOrdersList || workOrdersList.length === 0) {
      message.info('No work orders available to export');
      return;
    }
    const headers = ['Ref Code', 'Client Name', 'Status', 'Roof Model', 'Span (m)', 'Length (m)', 'Grand Total (INR)', 'Created Date'];
    const rows = workOrdersList.map((w) => [
      `"${w.refCode || ''}"`,
      `"${(w.clientName || '').replace(/"/g, '""')}"`,
      `"${w.status || ''}"`,
      `"${w.roofModel || ''}"`,
      w.span || '',
      w.length || '',
      w.grandTotal || 0,
      `"${dayjs(w.createdAt).format('YYYY-MM-DD')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `iRoof_WorkOrders_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Work orders exported to CSV successfully');
  };

  const columns = [
    {
      title: 'REF',
      dataIndex: 'ref',
      key: 'ref',
      width: 130,
      render: (text) => <span className="ref-badge">{text}</span>
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{type}</span>
    },
    {
      title: 'DETAIL',
      dataIndex: 'detail',
      key: 'detail',
      render: (detail) => <span style={{ color: '#334155' }}>{detail}</span>
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
            Executive Roofing Enterprise Overview · {formattedDate}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="page-header__actions">
          <Button
            icon={<UsergroupAddOutlined />}
            onClick={() => navigate('/admin/customers')}
            style={{ borderColor: '#0b2e59', color: '#0b2e59', fontWeight: 600 }}
          >
            Customers CRM
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/users')}
            style={{ borderColor: '#0b2e59', color: '#0b2e59', fontWeight: 500 }}
          >
            Add User
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate('/admin/enquiries')}
            style={{ borderColor: '#0b2e59', color: '#0b2e59', fontWeight: 500 }}
          >
            Pipeline
          </Button>
          <Button
            icon={<ControlOutlined />}
            onClick={() => navigate('/admin/rate-masters')}
            style={{ borderColor: '#0b2e59', color: '#0b2e59', fontWeight: 500 }}
          >
            Rate Masters
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportWorkOrdersCSV}
            style={{ background: '#0b2e59', color: '#ffffff', borderColor: '#0b2e59', fontWeight: 600 }}
          >
            Export Work Orders (CSV)
          </Button>
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total Staff Users</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <TeamOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.usersCount}</div>
            <div className="stat-card__meta">Across 8 operational roles</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Enquiries & Leads</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <FileTextOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.enquiriesCount}</div>
            <div className="stat-card__meta">Active commercial inquiries</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Engineering Estimates</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CalculatorOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.estimatesCount}</div>
            <div className="stat-card__meta">Locked structural calculations</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Active Project Pipeline</span>
              <div className="stat-card__icon" style={{ background: '#ecfdf5', color: '#047857' }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ fontSize: pipelineTotal > 0 ? 20 : 28 }}>
              {pipelineTotal > 0 ? `₹ ${Math.round(pipelineTotal).toLocaleString('en-IN')}` : stats.workOrdersCount}
            </div>
            <div className="stat-card__meta">
              {stats.workOrdersCount} Work Orders awarded
            </div>
          </div>
        </Col>
      </Row>

      {/* C) VISUAL ANALYTICS ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <RevenueAreaChart />
        </Col>
        <Col xs={24} lg={9}>
          <ConversionFunnelChart stages={funnelData} />
        </Col>
      </Row>

      {/* D) OPERATIONS & RECENT ACTIVITY ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <StatusDonutChart segments={donutData} />
        </Col>
        <Col xs={24} lg={15}>
          <div className="content-card" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
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
                Recent Operational Activity
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>Live system ledger</span>
            </div>
            {recentActivities.length === 0 ? (
              <div style={{ padding: '40px 0' }}>
                <Empty description="No recent system transactions" />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={recentActivities}
                pagination={false}
                size="middle"
              />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
