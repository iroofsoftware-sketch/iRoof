import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Button, Spin, Tag } from 'antd';
import {
  FileOutlined,
  DollarOutlined,
  WarningOutlined,
  CalculatorOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import { getInvoiceStats, getInvoices } from '../../utils/api';
import RevenueAreaChart from '../../components/charts/RevenueAreaChart';
import StatusDonutChart from '../../components/charts/StatusDonutChart';

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
  const [invoiceDonut, setInvoiceDonut] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
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
        getInvoices({ limit: 100 })
      ]);

      if (statsRes.data?.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
      if (invoicesRes.data?.success && invoicesRes.data.data) {
        const invs = invoicesRes.data.data;
        setRecentInvoices(invs.slice(0, 5));

        // Invoice status breakdown
        const paidCount = invs.filter((i) => i.status === 'paid').length;
        const partialCount = invs.filter((i) => i.status === 'partial').length;
        const sentCount = invs.filter((i) => ['sent', 'draft'].includes(i.status)).length;
        const overdueCount = invs.filter((i) => i.status === 'overdue' || (i.amountDue > 0 && new Date(i.dueDate) < new Date())).length;

        setInvoiceDonut([
          { label: 'Fully Paid', count: paidCount, color: '#15803d' },
          { label: 'Partially Paid', count: partialCount, color: '#0284c7' },
          { label: 'Pending Payment', count: sentCount, color: '#d97706' },
          { label: 'Overdue', count: overdueCount, color: '#b91c1c' }
        ]);

        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = dayjs().subtract(i, 'month');
          months.push({
            month: d.format('MMM'),
            ym: d.format('YYYY-MM'),
            billed: 0,
            collected: 0
          });
        }
        invs.forEach((inv) => {
          if (inv.createdAt && inv.status !== 'cancelled') {
            const ym = dayjs(inv.createdAt).format('YYYY-MM');
            const target = months.find((m) => m.ym === ym);
            if (target) {
              target.billed += Number(inv.grandTotal) || 0;
              target.collected += Number(inv.amountPaid) || 0;
            }
          }
        });
        setRevenueData(months.map(({ month, billed, collected }) => ({ month, billed, collected })));
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
      title: 'DUE AMOUNT',
      dataIndex: 'amountDue',
      key: 'amountDue',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: val > 0 ? '#b91c1c' : '#15803d' }} className="tabular-nums">
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
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Button
          type="text"
          size="small"
          onClick={() => navigate('/accounts/invoices')}
          style={{ color: '#0b2e59', fontWeight: 600 }}
        >
          View
        </Button>
      )
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
            Accounts, Invoicing & Receivables Ledger · {formattedDate}
          </p>
        </div>

        <div className="page-header__actions">
          <Button
            icon={<UsergroupAddOutlined />}
            onClick={() => navigate('/accounts/customers')}
            style={{ borderColor: '#0b2e59', color: '#0b2e59', fontWeight: 600 }}
          >
            Customer Ledger
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/accounts/invoices')}
            style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
          >
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">This Month Billed</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <FileOutlined />
              </div>
            </div>
            <div className="stat-card__value">₹ {Number(stats.thisMonthBilled || 0).toLocaleString('en-IN')}</div>
            <div className="stat-card__meta">Tax invoices generated</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Collected This Month</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <DollarOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#15803d' }}>
              ₹ {Number(stats.thisMonthReceived || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">Realized cash receipts</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total Outstanding AR</span>
              <div className="stat-card__icon" style={{ background: '#fffbeb', color: '#b45309' }}>
                <CalculatorOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: stats.totalOutstanding > 0 ? '#b91c1c' : '#15803d' }}>
              ₹ {Number(stats.totalOutstanding || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">Pending client dues</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Overdue Invoices</span>
              <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                <WarningOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#b91c1c' }}>
              {stats.overdueCount || 0}
            </div>
            <div className="stat-card__meta">Requires immediate collection</div>
          </div>
        </Col>
      </Row>

      {/* C) FINANCIAL VISUAL ANALYTICS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <RevenueAreaChart
            title="Commercial Billing vs Realized Collections"
            subtitle="Trailing 6-month cashflow velocity and realization rate"
            data={revenueData}
          />
        </Col>
        <Col xs={24} lg={9}>
          <StatusDonutChart
            title="Invoice Payment Status"
            subtitle="Aging and payment realization distribution"
            centerLabel="Invoices"
            segments={invoiceDonut}
          />
        </Col>
      </Row>

      {/* D) RECENT INVOICES */}
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
            Recent Invoices
          </div>
          <Button
            type="link"
            onClick={() => navigate('/accounts/invoices')}
            style={{ fontSize: 12.5, fontWeight: 600, color: '#0b2e59' }}
          >
            View all invoices →
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={recentInvoices}
          rowKey="_id"
          pagination={false}
          size="middle"
        />
      </div>
    </div>
  );
};

export default AccountsDashboard;
