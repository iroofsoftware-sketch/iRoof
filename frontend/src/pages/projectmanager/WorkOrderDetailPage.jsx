import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Tag,
  Space,
  Select,
  Modal,
  Avatar,
  message,
  Spin
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  BuildOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AttachmentManager from '../../components/common/AttachmentManager';

const { Option } = Select;

const STATUS_CONFIG = {
  draft: { color: '#6b7280', label: 'Draft' },
  active: { color: '#3b82f6', label: 'Active' },
  on_hold: { color: '#f59e0b', label: 'On Hold' },
  completed: { color: '#10b981', label: 'Completed' },
  cancelled: { color: '#ef4444', label: 'Cancelled' }
};

const WorkOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/workorders/${id}`);
      if (res.data && res.data.data) {
        setWorkOrder(res.data.data);
        setSelectedStatus(res.data.data.status);
      }
    } catch (e) {
      console.error('Error fetching work order:', e);
      message.error('Failed to load work order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/workorders/${id}`, { status: selectedStatus });
      message.success(`Status updated to ${selectedStatus}`);
      setStatusModalVisible(false);
      fetchDetail();
    } catch (e) {
      message.error('Failed to update status');
    }
  };

  const handleAttachmentsChange = async (newAttachments) => {
    try {
      await api.patch(`/workorders/${id}`, { attachments: newAttachments });
      setWorkOrder((prev) => ({ ...prev, attachments: newAttachments }));
      message.success('Project attachments updated');
    } catch (e) {
      message.error('Failed to update attachments');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projectmanager/workorders')}>
          Back to Work Orders
        </Button>
        <div style={{ marginTop: 24 }}>Work order not found.</div>
      </div>
    );
  }

  const sCfg = STATUS_CONFIG[workOrder.status] || STATUS_CONFIG.draft;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/projectmanager/workorders')}
          >
            Work Orders
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="ref-badge" style={{ fontSize: 13, padding: '3px 9px' }}>
                {workOrder.refCode}
              </span>
              <h1 className="page-title" style={{ margin: 0 }}>
                {workOrder.clientName}
              </h1>
            </div>
            <p className="page-subtitle">
              {workOrder.siteAddress || 'Site Location'} · Target:{' '}
              {workOrder.targetDate ? dayjs(workOrder.targetDate).format('DD MMM YYYY') : 'Not set'}
            </p>
          </div>
        </div>

        <Space>
          <span className={`status-dot status-${workOrder.status}`} style={{ fontSize: 12.5, padding: '4px 12px' }}>
            {sCfg.label}
          </span>
          <Button onClick={() => setStatusModalVisible(true)}>Change Status</Button>
        </Space>
      </div>

      {/* ── PROJECT DETAILS CARD ── */}
      <div className="content-card">
        <div className="content-card__header">
          <span className="content-card__title">Project Engineering & Commercials</span>
        </div>
        <div className="content-card__body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>
                Roof Structural Model
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                {workOrder.roofModel || 'Standard'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>
                Clear Span × Length
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                {workOrder.span || '—'}m × {workOrder.length || '—'}m
              </span>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>
                Projection Height
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                {workOrder.height || '0'}m
              </span>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>
                Commercial Grand Total
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#0b315d' }}>
                ₹ {Number(workOrder.grandTotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>
                Assigned Project Manager
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                {workOrder.assignedPM?.name || 'Project Manager'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DOWNSTREAM OPERATIONAL TASKS (4 CARDS) ── */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 14 }}>
          Operational Workstreams
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {/* Design Task */}
          <div className="stat-card" style={{ gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#0b315d' }}>
                <BuildOutlined /> 1. Structural Design
              </span>
              <Tag color="blue">{workOrder.designTask?.status || 'pending'}</Tag>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {workOrder.designTask?.title || 'Drawing Package'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Due: {workOrder.designTask?.dueDate ? dayjs(workOrder.designTask.dueDate).format('DD MMM YYYY') : 'Not set'}
            </div>
            <Button
              type="link"
              onClick={() => navigate('/design/drawings')}
              style={{ padding: 0, textAlign: 'left', fontWeight: 600 }}
            >
              Open Drawing Task →
            </Button>
          </div>

          {/* Purchase Request */}
          <div className="stat-card" style={{ gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#0b315d' }}>
                <ShoppingCartOutlined /> 2. Material Procurement
              </span>
              <Tag color="orange">{workOrder.purchaseRequest?.status || 'pending'}</Tag>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {workOrder.purchaseRequest?.refCode || 'Purchase Request'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {workOrder.purchaseRequest?.items?.length || 0} line items registered
            </div>
            <Button
              type="link"
              onClick={() => navigate('/purchase/requests')}
              style={{ padding: 0, textAlign: 'left', fontWeight: 600 }}
            >
              Open Purchase Request →
            </Button>
          </div>

          {/* Workshop Job */}
          <div className="stat-card" style={{ gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#0b315d' }}>
                <ToolOutlined /> 3. Workshop Fabrication
              </span>
              <Tag color="purple">{workOrder.workshopJob?.status || 'pending'}</Tag>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {workOrder.workshopJob?.title || 'Fabrication Job'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Target: {workOrder.workshopJob?.endDate ? dayjs(workOrder.workshopJob.endDate).format('DD MMM YYYY') : 'In line'}
            </div>
            <Button
              type="link"
              onClick={() => navigate('/workshop/jobs')}
              style={{ padding: 0, textAlign: 'left', fontWeight: 600 }}
            >
              Open Fabrication Job →
            </Button>
          </div>

          {/* Site Visit */}
          <div className="stat-card" style={{ gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#0b315d' }}>
                <EnvironmentOutlined /> 4. Site Inspection
              </span>
              <Tag color="green">{workOrder.siteVisit?.status || 'scheduled'}</Tag>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {workOrder.siteVisit?.refCode || 'Site Inspection'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Scheduled: {workOrder.siteVisit?.scheduledDate ? dayjs(workOrder.siteVisit.scheduledDate).format('DD MMM YYYY') : 'Planned'}
            </div>
            <Button
              type="link"
              onClick={() => navigate('/sitevisitor/visits')}
              style={{ padding: 0, textAlign: 'left', fontWeight: 600 }}
            >
              Open Site Visit Report →
            </Button>
          </div>
        </div>
      </div>

      {/* ── NOTES ── */}
      <div className="content-card">
        <div className="content-card__header">
          <span className="content-card__title">Project Notes & Instructions</span>
        </div>
        <div className="content-card__body">
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #dde3ea',
              borderRadius: 6,
              padding: 16,
              fontSize: 13,
              color: '#374151',
              whiteSpace: 'pre-wrap',
              minHeight: 60
            }}
          >
            {workOrder.notes || 'No project notes entered.'}
          </div>
        </div>

        {/* ── ATTACHMENTS & BLUEPRINTS ── */}
        <div style={{ marginTop: 24 }}>
          <AttachmentManager
            title="CAD Drawings, Blueprints & Inspection Certificates"
            attachments={workOrder.attachments || []}
            onChange={handleAttachmentsChange}
          />
        </div>
      </div>

      {/* ── STATUS MODAL ── */}
      <Modal
        title="Update Work Order Status"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={handleUpdateStatus}
        width={400}
      >
        <div style={{ padding: '16px 0' }}>
          <Select
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            style={{ width: '100%' }}
          >
            <Option value="draft">Draft</Option>
            <Option value="active">Active</Option>
            <Option value="on_hold">On Hold</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default WorkOrderDetailPage;
