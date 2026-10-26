import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Button } from 'antd';
import {
  ShoppingCartOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PlusOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import { getPurchaseOrderStats, getPurchaseOrders } from '../../utils/api';

const STATUS_CONFIG = {
  draft: { color: '#6b7280', label: 'Draft' },
  sent: { color: '#3b82f6', label: 'Sent' },
  acknowledged: { color: '#8b5cf6', label: 'Acknowledged' },
  delivered: { color: '#10b981', label: 'Delivered' },
  cancelled: { color: '#ef4444', label: 'Cancelled' }
};

const PurchaseDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    openPOs: 0,
    pendingDelivery: 0,
    totalValue: 0,
    thisMonthValue: 0
  });
  const [recentPOs, setRecentPOs] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Purchase Officer';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, poRes] = await Promise.all([
        getPurchaseOrderStats(),
        getPurchaseOrders({ limit: 5 })
      ]);

      if (statsRes.data?.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
      if (poRes.data?.success && poRes.data.data) {
        setRecentPOs(poRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching purchase dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'PO #',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 150,
      render: (t) => <span className="ref-badge">{t}</span>
    },
    {
      title: 'SUPPLIER',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (s) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {s?.name || 'Assigned Vendor'}
        </span>
      )
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
      width: 140,
      render: (st) => {
        const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.draft;
        return (
          <span className={`status-dot status-${st}`}>
            <span style={{ textTransform: 'capitalize' }}>{cfg.label}</span>
          </span>
        );
      }
    },
    {
      title: 'EXPECTED DELIVERY',
      dataIndex: 'expectedDelivery',
      key: 'expectedDelivery',
      width: 150,
      render: (d, record) => {
        const isPastDue =
          d &&
          new Date(d) < new Date() &&
          record.status !== 'delivered' &&
          record.status !== 'cancelled';
        return (
          <span
            style={{
              color: isPastDue ? '#b91c1c' : '#64748b',
              fontSize: 12.5,
              fontWeight: isPastDue ? 600 : 400
            }}
            className="tabular-nums"
          >
            {d ? dayjs(d).format('DD MMM YYYY') : '—'}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      {/* A) WELCOME ROW */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">
            Good {greetingTime}, {firstName}
          </h1>
          <p className="page-subtitle">
            Procurement & Supply Chain Console · {formattedDate}
          </p>
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Open Orders</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#c2410c' }}>
              {stats.openPOs || 0}
            </div>
            <div className="stat-card__meta">Draft, sent, or acknowledged</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Pending Delivery</span>
              <div className="stat-card__icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <TruckOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#b45309' }}>
              {stats.pendingDelivery || 0}
            </div>
            <div className="stat-card__meta">In transit / awaited from vendor</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total PO Value</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <DollarOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#15803d' }}>
              ₹ {Number(stats.totalValue || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">All committed purchases</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">This Month</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <ShoppingCartOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#1e40af' }}>
              ₹ {Number(stats.thisMonthValue || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-card__meta">Orders issued this month</div>
          </div>
        </Col>
      </Row>

      {/* C) QUICK ACTIONS */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/purchase/orders')}
          style={{ background: '#0b315d', borderColor: '#0b315d', fontWeight: 500 }}
        >
          Create Purchase Order
        </Button>
        <Button
          icon={<ShopOutlined />}
          onClick={() => navigate('/purchase/suppliers')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          Suppliers Master
        </Button>
      </div>

      {/* D) RECENT ACTIVITY TABLE */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <div className="content-card__title">Recent Purchase Orders</div>
          <span
            style={{ color: '#0b315d', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
            onClick={() => navigate('/purchase/orders')}
          >
            View all →
          </span>
        </div>
        <Table
          columns={columns}
          dataSource={recentPOs}
          rowKey="_id"
          size="small"
          pagination={false}
          loading={loading}
          locale={{ emptyText: 'No purchase orders generated yet' }}
          onRow={(record) => ({
            onClick: () => navigate('/purchase/orders'),
            style: { cursor: 'pointer' }
          })}
        />
      </div>
    </div>
  );
};

export default PurchaseDashboard;
