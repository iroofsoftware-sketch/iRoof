import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Button, Spin, Tag } from 'antd';
import {
  FileOutlined,
  DollarOutlined,
  WarningOutlined,
  CalculatorOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import { getInvoiceStats, getInvoices } from '../../utils/api';

const AccountsDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    overdueCount: 0,
    thisMonthReceived: 0,
    totalOutstanding: 0,
    thisMonthBilled: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Accounts';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, invoicesRes] = await Promise.all([
        getInvoiceStats(),
        getInvoices({ limit: 5 })
      ]);

      if (statsRes.data?.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
      if (invoicesRes.data?.success && invoicesRes.data.data) {
        setRecentInvoices(invoicesRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching accounts dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'INVOICE #',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 150,
      render: (t) => <span className="ref-badge">{t}</span>
    },
    {
      title: 'CLIENT',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (t) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{t}</span>
    },
    {
      title: 'GRAND TOTAL',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }} className="tabular-nums">
          ₹ {Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (st, record) => {
        const isOverdue =
          st !== 'paid' &&
          st !== 'cancelled' &&
          record.dueDate &&
          new Date(record.dueDate) < new Date();
        const displayStatus = isOverdue ? 'overdue' : st;

        return (
          <span className={`status-dot status-${displayStatus}`}>
            <span style={{ textTransform: 'capitalize' }}>{displayStatus}</span>
          </span>
        );
      }
    },
    {
      title: 'DUE DATE',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      render: (d, record) => {
        const isOverdue =
          record.status !== 'paid' &&
          record.status !== 'cancelled' &&
          d &&
          new Date(d) < new Date();
        return (
          <span style={{ color: isOverdue ? '#b91c1c' : '#64748b', fontSize: 12.5, fontWeight: isOverdue ? 600 : 400 }} className="tabular-nums">
            {d ? dayjs(d).format('DD MMM YYYY') : '—'}
          </span>
        );
      }
    }
  ];

  const gstPayable = Math.round((stats.totalOutstanding || 0) * 0.18);

  return (
    <div>
      {/* A) WELCOME ROW */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
          Commercial Finance & Ledger Console · {formattedDate}
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Invoices Due</span>
              <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                <FileOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: stats.overdueCount > 0 ? '#b91c1c' : '#111827' }}>
              {stats.overdueCount || 0}
            </div>
            <div className="stat-card__meta">Overdue balance accounts</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Received This Month</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <DollarOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#15803d' }}>
              ₹ {Number(stats.thisMonthReceived || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">Direct client receipts</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Outstanding Amount</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <WarningOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#c2410c' }}>
              ₹ {Number(stats.totalOutstanding || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">Pending client collection</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">GST Payable</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <CalculatorOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#1e40af' }}>
              ₹ {Number(gstPayable).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">18% output tax liability</div>
          </div>
        </Col>
      </Row>

      {/* C) QUICK ACTIONS */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/accounts/invoices')}
          style={{ background: '#0b315d', borderColor: '#0b315d', fontWeight: 500 }}
        >
          New Invoice
        </Button>
        <Button
          icon={<CheckCircleOutlined />}
          onClick={() => navigate('/accounts/invoices')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          Record Payment
        </Button>
      </div>

      {/* D) RECENT ACTIVITY TABLE */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <div className="content-card__title">Recent Activity</div>
          <span
            style={{ color: '#0b315d', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
            onClick={() => navigate('/accounts/invoices')}
          >
            View all →
          </span>
        </div>
        <Table
          columns={columns}
          dataSource={recentInvoices}
          rowKey="_id"
          size="small"
          pagination={false}
          loading={loading}
          onRow={(record) => ({
            onClick: () => navigate('/accounts/invoices'),
            style: { cursor: 'pointer' }
          })}
        />
      </div>
    </div>
  );
};

export default AccountsDashboard;
