import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Tag,
  Space,
  Select,
  Modal,
  Avatar,
  message,
  Spin,
  Steps,
  Alert,
  Table,
  Input,
  InputNumber,
  Divider,
  Timeline
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  BuildOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  EnvironmentOutlined,
  PrinterOutlined,
  UploadOutlined,
  FilePdfOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  PlusOutlined,
  MessageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import AttachmentManager from '../../components/common/AttachmentManager';

const { Option } = Select;
const { TextArea } = Input;

export const STAGE_CONFIG = {
  pending_accounts_approval: {
    color: '#d97706',
    bg: '#fef3c7',
    label: '1. Pending Accounts Commercial Approval',
    short: 'Accounts Approval',
    department: 'Accounts',
    step: 1
  },
  pending_design: {
    color: '#2563eb',
    bg: '#dbeafe',
    label: '2. In Design (CAD Drawings Preparation)',
    short: 'Design Drawings',
    department: 'Design',
    step: 2
  },
  pending_pm_review: {
    color: '#7c3aed',
    bg: '#ede9fe',
    label: '3. PM Review (Drawing Check & Material List)',
    short: 'PM Review',
    department: 'Project Manager',
    step: 3
  },
  drawing_revision: {
    color: '#dc2626',
    bg: '#fee2e2',
    label: '3b. Drawing Revision Requested by PM',
    short: 'Drawing Revision',
    department: 'Design',
    step: 2
  },
  pending_purchase: {
    color: '#0891b2',
    bg: '#cffafe',
    label: '4. Material List Released (Procurement)',
    short: 'Purchase Procurement',
    department: 'Purchase',
    step: 4
  },
  pending_delivery: {
    color: '#4f46e5',
    bg: '#e0e7ff',
    label: '5. Purchase Order Issued (Awaiting Delivery)',
    short: 'Awaiting Delivery',
    department: 'Suppliers',
    step: 5
  },
  materials_received: {
    color: '#059669',
    bg: '#d1fae5',
    label: '6a. Physical Materials Verified at Workshop',
    short: 'GRN Verified',
    department: 'Workshop',
    step: 6
  },
  in_fabrication: {
    color: '#0b2e59',
    bg: '#e2e8f0',
    label: '6b. Fabrication & Profiling in Progress',
    short: 'In Fabrication',
    department: 'Workshop',
    step: 6
  },
  completed: {
    color: '#15803d',
    bg: '#bbf7d0',
    label: '7. Fabrication Complete / Work Proceeds',
    short: 'Completed',
    department: 'Handover',
    step: 7
  },
  active: {
    color: '#3b82f6',
    bg: '#eff6ff',
    label: 'Active',
    short: 'Active',
    department: 'Operations',
    step: 1
  },
  draft: {
    color: '#6b7280',
    bg: '#f1f5f9',
    label: 'Draft',
    short: 'Draft',
    department: 'Sales',
    step: 0
  },
  on_hold: {
    color: '#f59e0b',
    bg: '#fef3c7',
    label: 'On Hold',
    short: 'On Hold',
    department: 'Operations',
    step: 0
  },
  cancelled: {
    color: '#ef4444',
    bg: '#fee2e2',
    label: 'Cancelled',
    short: 'Cancelled',
    department: 'Operations',
    step: 0
  }
};

const WorkOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals for stage transitions
  const [accountsModal, setAccountsModal] = useState(false);
  const [paymentTermsInput, setPaymentTermsInput] = useState('20% Advance, 60% on Material Dispatch, 20% on Completion');
  const [advanceInput, setAdvanceInput] = useState(0);
  const [accountsNotes, setAccountsNotes] = useState('');

  const [designModal, setDesignModal] = useState(false);
  const [drawingNameInput, setDrawingNameInput] = useState('');
  const [drawingUrlInput, setDrawingUrlInput] = useState('');
  const [designNotes, setDesignNotes] = useState('');

  const [pmReviseModal, setPmReviseModal] = useState(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/workorders/${id}`);
      if (res.data && res.data.data) {
        setWorkOrder(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching work order:', e);
      message.error('Failed to load work order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // ── GATE 2: ACCOUNTS APPROVAL ──
  const handleAccountsApprove = async () => {
    setActionLoading(true);
    try {
      await api.post(`/workorders/${id}/accounts-approve`, {
        paymentTerms: paymentTermsInput,
        advanceReceived: advanceInput,
        notes: accountsNotes
      });
      message.success('Commercial quotation confirmed. Work order released to Design.');
      setAccountsModal(false);
      fetchDetail();
    } catch (e) {
      message.error(e.response?.data?.message || 'Accounts approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── GATE 3: DESIGN DRAWINGS SUBMISSION ──
  const handleDesignSubmit = async () => {
    if (!drawingNameInput.trim()) {
      message.warning('Please enter a drawing title/reference');
      return;
    }
    setActionLoading(true);
    try {
      const newDrawings = [
        {
          name: drawingNameInput.trim(),
          url: drawingUrlInput.trim() || '/uploads/blueprint_arch.pdf',
          fileType: 'application/pdf',
          size: 1048576,
          uploadedAt: new Date()
        }
      ];
      await api.post(`/workorders/${id}/design-submit`, {
        drawingFiles: newDrawings,
        notes: designNotes
      });
      message.success('Drawings handed over to Project Manager.');
      setDesignModal(false);
      setDrawingNameInput('');
      setDrawingUrlInput('');
      setDesignNotes('');
      fetchDetail();
    } catch (e) {
      message.error(e.response?.data?.message || 'Submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── GATE 4A: PM REQUESTS DRAWING REVISION ──
  const handlePmRequestRevision = async () => {
    if (!revisionNotesInput.trim()) {
      message.warning('Please enter the required drawing revisions');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/workorders/${id}/pm-review`, {
        decision: 'revise',
        revisionNotes: revisionNotesInput.trim()
      });
      message.warning('Revision requested. Work order returned to Design.');
      setPmReviseModal(false);
      setRevisionNotesInput('');
      fetchDetail();
    } catch (e) {
      message.error(e.response?.data?.message || 'Revision request failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── GATE 4B: PM APPROVES & RELEASES MATERIAL LIST (BOM) ──
  const handlePmApproveRelease = async () => {
    setActionLoading(true);
    try {
      await api.post(`/workorders/${id}/pm-review`, {
        decision: 'approve',
        materialList: workOrder.materialList || [],
        notes: 'Material List (BOM) and drawings verified by Project Manager'
      });
      message.success('Approval, Drawings and Material List released to Purchase and Accounts.');
      fetchDetail();
    } catch (e) {
      message.error(e.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── GATE 5: PURCHASE ORDERS MATERIALS FROM SUPPLIERS ──
  const handlePurchaseOrdered = async () => {
    setActionLoading(true);
    try {
      await api.post(`/workorders/${id}/purchase-ordered`, {
        supplierName: 'Authorized Material Suppliers',
        notes: 'Purchase order confirmed with steel & coil suppliers'
      });
      message.success('Materials ordered. Awaiting delivery to Workshop.');
      fetchDetail();
    } catch (e) {
      message.error(e.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── GATE 6A: WORKSHOP VERIFIES PHYSICAL MATERIALS (GRN) ──
  const handleWorkshopVerifyMaterials = async () => {
    setActionLoading(true);
    try {
      await api.post(`/workorders/${id}/workshop-verify-materials`, {
        notes: 'Delivered coils, structural beams & hardware verified against Material List'
      });
      message.success('Goods Receipt Verified against Material List. Ready for fabrication.');
      fetchDetail();
    } catch (e) {
      message.error(e.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── GATE 6B: WORKSHOP STARTS FABRICATION ──
  const handleWorkshopStartFabrication = async () => {
    setActionLoading(true);
    try {
      await api.post(`/workorders/${id}/workshop-start-fabrication`, {
        notes: 'Arch panel profiling and truss fabrication in progress'
      });
      message.success('Fabrication commenced in Workshop.');
      fetchDetail();
    } catch (e) {
      message.error(e.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── GATE 7: WORKSHOP COMPLETION ──
  const handleWorkshopComplete = async () => {
    setActionLoading(true);
    try {
      await api.post(`/workorders/${id}/workshop-complete`, {
        notes: 'Fabrication completed, passed QA, ready for erection'
      });
      message.success('Production completed! Project proceeding to handover.');
      fetchDetail();
    } catch (e) {
      message.error(e.response?.data?.message || 'Completion failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── ATTACHMENTS PERSISTENCE ──
  const handleAttachmentsChange = async (updatedAttachments) => {
    try {
      setWorkOrder((prev) => ({ ...prev, attachments: updatedAttachments }));
      await api.patch(`/workorders/${id}/attachments`, { attachments: updatedAttachments });
      message.success('Project attachments updated successfully');
    } catch (err) {
      console.error('Failed to update attachments:', err);
      message.error('Failed to save attachments to server');
    }
  };

  // ── LOG MANUAL AUDIT NOTE ──
  const [noteModal, setNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const handleLogNote = async () => {
    if (!noteText.trim()) {
      message.warning('Please enter a note');
      return;
    }
    try {
      setNoteLoading(true);
      const res = await api.post(`/workorders/${id}/log-note`, { note: noteText.trim() });
      if (res && res.data) {
        message.success('Note logged to audit trail');
        setNoteText('');
        setNoteModal(false);
        fetchDetail();
      }
    } catch (err) {
      console.error('Failed to log note:', err);
      message.error('Failed to log note to audit trail');
    } finally {
      setNoteLoading(false);
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
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projectmanager/workorders')}>
          Back to Work Orders
        </Button>
        <div style={{ marginTop: 24, fontSize: 16 }}>Work order not found.</div>
      </div>
    );
  }

  const stageCfg = STAGE_CONFIG[workOrder.status] || STAGE_CONFIG.draft;
  const currentStep = stageCfg.step || 1;

  // Step definition matching the 7 department gates
  const stepsItems = [
    { title: 'Sales Issued', description: 'Work Order & Estimate' },
    { title: 'Accounts Approval', description: 'Commercial Confirmation' },
    { title: 'Design Drawings', description: 'CAD Drawings' },
    { title: 'PM Material List', description: 'BOM Verification' },
    { title: 'Purchase Orders', description: 'Supplier Procurement' },
    { title: 'Workshop GRN', description: 'Materials Verified' },
    { title: 'Fabrication', description: 'Work Proceeds' }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }} className="wo-detail-container">
      {/* ── PRINT-ONLY BRAND HEADER ── */}
      <div className="print-only-brand-header" style={{ display: 'none', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #0b2e59' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <img
              src="/logos/iroofing_wordmark_blue_small.png"
              alt="iRoofing Enterprises"
              style={{ maxHeight: 38, objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{ fontSize: 11, color: '#0b2e59', fontWeight: 600, marginTop: 4 }}>
              Truss-Less Self-Supported Arch Roofing Systems
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0b2e59' }}>PRODUCTION JOB CARD</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
              Work Order Ref: <strong>{workOrder.refCode}</strong>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Printed: {dayjs().format('DD MMM YYYY, hh:mm A')}
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP HEADER ── */}
      <div className="page-header no-print">
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
          <span
            style={{
              background: stageCfg.bg,
              color: stageCfg.color,
              padding: '5px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 700
            }}
          >
            {stageCfg.label}
          </span>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
          >
            Print Job Card
          </Button>
        </Space>
      </div>

      {/* ── 1. STAGE-GATE PIPELINE STEPPER CARD (MATCHING DIAGRAM) ── */}
      <div className="content-card no-print" style={{ marginBottom: 20 }}>
        <div className="content-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="content-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AuditOutlined style={{ color: '#c9940a' }} /> Department-Wise Chain of Custody Pipeline
          </span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Current Custody: <strong style={{ color: '#0b2e59' }}>{stageCfg.department}</strong>
          </span>
        </div>
        <div className="content-card__body" style={{ padding: '24px 20px 10px 20px' }}>
          <Steps
            size="small"
            current={workOrder.status === 'completed' ? 7 : currentStep - 1}
            status={workOrder.status === 'drawing_revision' ? 'error' : 'process'}
            items={stepsItems}
          />
        </div>
      </div>

      {/* ── 2. STAGE ACTION CONTROL CARD (DYNAMIC BY ROLE & STAGE) ── */}
      <div className="content-card no-print" style={{ marginBottom: 20, border: '1px solid #cbd5e1', background: '#fbfcfd' }}>
        <div className="content-card__header" style={{ background: '#0b2e59', color: '#ffffff', borderRadius: '7px 7px 0 0' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            Active Stage Action Gate · {stageCfg.short}
          </span>
        </div>
        <div className="content-card__body">
          {/* STAGE 1: PENDING ACCOUNTS APPROVAL */}
          {workOrder.status === 'pending_accounts_approval' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>Gate 2: Commercial Quotation & Payment Confirmation</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Accounts must contact client to confirm agreed quotation and payment terms before handing over to Design.
                </p>
              </div>
              {(role === 'accounts' || role === 'admin') ? (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setAccountsModal(true)}
                  style={{ background: '#059669', borderColor: '#059669', fontWeight: 600 }}
                >
                  Approve Quotation & Release to Design
                </Button>
              ) : (
                <Tag color="orange" style={{ padding: '6px 12px', fontSize: 12 }}>
                  Awaiting Accounts Commercial Approval
                </Tag>
              )}
            </div>
          )}

          {/* STAGE 2: PENDING DESIGN OR DRAWING REVISION */}
          {(workOrder.status === 'pending_design' || workOrder.status === 'drawing_revision') && (
            <div>
              {workOrder.status === 'drawing_revision' && (
                <Alert
                  type="error"
                  showIcon
                  message="Drawing Revision Required by Project Manager"
                  description={workOrder.revisionNotes || 'Please inspect comments, revise drawings, and re-submit to PM.'}
                  style={{ marginBottom: 16, borderRadius: 6 }}
                />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>Gate 3: Structural Drawings Preparation</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                    Design Department prepares CAD/DWG drawings and hands over Approval + Drawings to Project Manager.
                  </p>
                </div>
                {(role === 'design' || role === 'admin') ? (
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => setDesignModal(true)}
                    style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
                  >
                    Hand Over Drawings to Project Manager
                  </Button>
                ) : (
                  <Tag color="blue" style={{ padding: '6px 12px', fontSize: 12 }}>
                    Drawings Under Preparation by Design Engineer
                  </Tag>
                )}
              </div>
            </div>
          )}

          {/* STAGE 3: PENDING PM REVIEW */}
          {workOrder.status === 'pending_pm_review' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>Gate 4: PM Drawing Review & Material List Release</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Project Manager reviews structural drawings from Design and prepares the Material List (BOM).
                </p>
              </div>

              {(role === 'projectmanager' || role === 'admin') ? (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => setPmReviseModal(true)}
                    loading={actionLoading}
                  >
                    Request Drawing Revision (Loop to Design)
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handlePmApproveRelease}
                    loading={actionLoading}
                    style={{ background: '#059669', borderColor: '#059669', fontWeight: 600 }}
                  >
                    Approve & Release Material List to Purchase & Accounts
                  </Button>
                </div>
              ) : (
                <Tag color="purple" style={{ padding: '6px 12px', fontSize: 12 }}>
                  Awaiting Project Manager Review & BOM Release
                </Tag>
              )}
            </div>
          )}

          {/* STAGE 4: PENDING PURCHASE */}
          {workOrder.status === 'pending_purchase' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>Gate 5: Material Procurement & Purchase Orders</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Purchase Department receives Material List and issues formal POs to relevant suppliers.
                </p>
              </div>
              {(role === 'purchase' || role === 'admin') ? (
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={handlePurchaseOrdered}
                  loading={actionLoading}
                  style={{ background: '#0891b2', borderColor: '#0891b2', fontWeight: 600 }}
                >
                  Confirm Purchase Orders Issued to Suppliers
                </Button>
              ) : (
                <Tag color="cyan" style={{ padding: '6px 12px', fontSize: 12 }}>
                  Material Procurement in Progress by Purchase
                </Tag>
              )}
            </div>
          )}

          {/* STAGE 5: PENDING DELIVERY (AWAITING PHYSICAL GOODS) */}
          {workOrder.status === 'pending_delivery' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>Gate 6A: Workshop Goods Receipt & Verification</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Suppliers dispatch materials to Workshop. Workshop must physically inspect and match items against the Material List.
                </p>
              </div>
              {(role === 'workshop' || role === 'admin') ? (
                <Button
                  type="primary"
                  icon={<SafetyCertificateOutlined />}
                  onClick={handleWorkshopVerifyMaterials}
                  loading={actionLoading}
                  style={{ background: '#059669', borderColor: '#059669', fontWeight: 600 }}
                >
                  Confirm Material Delivery (GRN Verified against BOM)
                </Button>
              ) : (
                <Tag color="geekblue" style={{ padding: '6px 12px', fontSize: 12 }}>
                  Awaiting Delivery of Materials to Central Workshop
                </Tag>
              )}
            </div>
          )}

          {/* STAGE 6A: MATERIALS RECEIVED */}
          {workOrder.status === 'materials_received' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>Gate 6B: Start Fabrication & Profiling</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Physical materials verified against BOM. Start fabrication and arch panel production as per approval.
                </p>
              </div>
              {(role === 'workshop' || role === 'admin') ? (
                <Button
                  type="primary"
                  icon={<ToolOutlined />}
                  onClick={handleWorkshopStartFabrication}
                  loading={actionLoading}
                  style={{ background: '#0b2e59', borderColor: '#0b2e59', fontWeight: 600 }}
                >
                  Start Fabrication (Sheet & Frame Production)
                </Button>
              ) : (
                <Tag color="green" style={{ padding: '6px 12px', fontSize: 12 }}>
                  Materials Ready for Fabrication
                </Tag>
              )}
            </div>
          )}

          {/* STAGE 6B: IN FABRICATION */}
          {workOrder.status === 'in_fabrication' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>Gate 7: Production Completion / Work Proceeds</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Fabrication and profiling currently running in workshop. Mark complete when ready for site dispatch.
                </p>
              </div>
              {(role === 'workshop' || role === 'projectmanager' || role === 'admin') ? (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleWorkshopComplete}
                  loading={actionLoading}
                  style={{ background: '#15803d', borderColor: '#15803d', fontWeight: 600 }}
                >
                  Mark Fabrication Complete (End of Workflow)
                </Button>
              ) : (
                <Tag color="blue" style={{ padding: '6px 12px', fontSize: 12 }}>
                  Active Production in Workshop
                </Tag>
              )}
            </div>
          )}

          {/* STAGE 7: COMPLETED */}
          {workOrder.status === 'completed' && (
            <Alert
              type="success"
              showIcon
              message="Work Proceeds — Workflow Complete"
              description="Project has successfully completed all department gates from sales to fabrication."
            />
          )}
        </div>
      </div>

      {/* ── 3. PROJECT ENGINEERING & COMMERCIAL DETAILS CARD ── */}
      <div className="content-card" style={{ marginBottom: 20 }}>
        <div className="content-card__header">
          <span className="content-card__title">Project Engineering & Commercial Specifications</span>
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

      {/* ── 4. MATERIAL LIST (BOM) CARD (CORE DELIVERABLE) ── */}
      <div className="content-card" style={{ marginBottom: 20 }}>
        <div className="content-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="content-card__title">
            Material List / Bill of Materials (BOM)
          </span>
          {workOrder.materialsVerified?.verified && (
            <Tag color="green" icon={<CheckCircleOutlined />}>Delivered Goods Verified against BOM</Tag>
          )}
        </div>
        <div className="content-card__body" style={{ padding: 0 }}>
          <Table
            dataSource={workOrder.materialList || []}
            rowKey={(r, idx) => r._id || idx}
            pagination={false}
            size="small"
            columns={[
              {
                title: '#',
                width: 50,
                render: (_, __, i) => i + 1
              },
              {
                title: 'MATERIAL DESCRIPTION',
                dataIndex: 'name',
                key: 'name',
                render: (val, r) => (
                  <div>
                    <strong style={{ color: '#0f172a' }}>{val}</strong>
                    {r.specification && <div style={{ fontSize: 12, color: '#64748b' }}>{r.specification}</div>}
                  </div>
                )
              },
              {
                title: 'QUANTITY',
                dataIndex: 'quantity',
                key: 'quantity',
                width: 140,
                render: (val, r) => <strong>{val?.toLocaleString('en-IN')} {r.unit}</strong>
              },
              {
                title: 'ESTIMATED COST',
                dataIndex: 'estimatedCost',
                key: 'estimatedCost',
                align: 'right',
                width: 150,
                render: (val) => val ? `₹ ${Number(val).toLocaleString('en-IN')}` : '—'
              }
            ]}
          />
        </div>
      </div>

      {/* ── 5. STRUCTURAL DRAWINGS & ATTACHMENTS ── */}
      <div className="content-card" style={{ marginBottom: 20 }}>
        <div className="content-card__header">
          <span className="content-card__title">Approved Drawings & Engineering Files</span>
        </div>
        <div className="content-card__body">
          {(!workOrder.drawingFiles || workOrder.drawingFiles.length === 0) ? (
            <div style={{ color: '#64748b', fontSize: 13 }}>No structural drawings attached yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workOrder.drawingFiles.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FilePdfOutlined style={{ fontSize: 20, color: '#dc2626' }} />
                    <div>
                      <strong style={{ color: '#0f172a' }}>{f.name}</strong>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Uploaded: {f.uploadedAt ? dayjs(f.uploadedAt).format('DD MMM YYYY, hh:mm A') : '—'}
                      </div>
                    </div>
                  </div>
                  <Button size="small" type="link" href={f.url} target="_blank">
                    Open File
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 6. PROJECT ATTACHMENTS (SITE PHOTOS, MTC) ── */}
      <div className="content-card no-print" style={{ marginBottom: 20 }}>
        <div className="content-card__header">
          <span className="content-card__title">Site Photos, Test Certificates (MTC) & Documents</span>
        </div>
        <div className="content-card__body">
          <AttachmentManager
            attachments={workOrder.attachments || []}
            onChange={handleAttachmentsChange}
            module="workorders"
          />
        </div>
      </div>

      {/* ── 7. CHAIN-OF-CUSTODY AUDIT TRAIL ── */}
      <div className="content-card no-print" style={{ marginBottom: 20 }}>
        <div className="content-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="content-card__title">Chain of Custody Audit Trail</span>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setNoteModal(true)}
            style={{ fontSize: 12, borderRadius: 4 }}
          >
            Log Operational Note / Call Record
          </Button>
        </div>
        <div className="content-card__body">
          {(!workOrder.stageHistory || workOrder.stageHistory.length === 0) ? (
            <div style={{ color: '#64748b', fontSize: 13 }}>No audit logs recorded yet.</div>
          ) : (
            <Timeline
              items={workOrder.stageHistory.map((s) => ({
                color: '#0b2e59',
                children: (
                  <div style={{ paddingBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: '#0f172a' }}>{s.stage?.replace(/_/g, ' ').toUpperCase()}</strong>
                      <Tag color="blue">{s.actionRole?.toUpperCase()}</Tag>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        by {s.actionBy?.name || 'Staff User'} on {dayjs(s.timestamp).format('DD MMM YYYY, hh:mm A')}
                      </span>
                    </div>
                    {s.notes && (
                      <div style={{ fontSize: 13, color: '#475569', marginTop: 4, background: '#f8fafc', padding: '6px 12px', borderRadius: 4 }}>
                        {s.notes}
                      </div>
                    )}
                  </div>
                )
              }))}
            />
          )}
        </div>
      </div>

      {/* ── LOG OPERATIONAL NOTE MODAL ── */}
      <Modal
        title="Log Operational Note / Site Call Record"
        open={noteModal}
        onCancel={() => {
          setNoteModal(false);
          setNoteText('');
        }}
        onOk={handleLogNote}
        confirmLoading={noteLoading}
        okText="Log to Audit Trail"
      >
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Add official remarks, client communications, site clearance updates, or delay notices to the permanent chronological audit log.
        </p>
        <TextArea
          rows={4}
          placeholder="e.g. Spoke with client regarding site clearance on North bay; foundation concrete setting on schedule for Friday dispatch..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          style={{ borderRadius: 6, marginTop: 8 }}
        />
      </Modal>

      {/* ── MODALS ── */}
      {/* 1. Accounts Commercial Approval Modal */}
      <Modal
        title="Gate 2: Commercial Quotation & Payment Terms Approval"
        open={accountsModal}
        onCancel={() => setAccountsModal(false)}
        onOk={handleAccountsApprove}
        confirmLoading={actionLoading}
        okText="Approve & Release to Design"
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ fontSize: 13, color: '#475569' }}>
            Confirm customer quotation agreement and advance mobilization deposit before Design begins structural drawings.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Agreed Payment Terms</label>
            <Input
              value={paymentTermsInput}
              onChange={(e) => setPaymentTermsInput(e.target.value)}
              placeholder="e.g. 20% advance, 60% dispatch, 20% completion"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Advance Received (₹)</label>
            <InputNumber
              style={{ width: '100%' }}
              value={advanceInput}
              onChange={(val) => setAdvanceInput(val || 0)}
              formatter={(val) => `₹ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/₹\s?|(,*)/g, '')}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Accounts Approval Notes</label>
            <TextArea
              rows={3}
              value={accountsNotes}
              onChange={(e) => setAccountsNotes(e.target.value)}
              placeholder="Bank transaction ref, payment terms or commercial notes..."
            />
          </div>
        </div>
      </Modal>

      {/* 2. Design Submit Drawings Modal */}
      <Modal
        title="Gate 3: Hand Over Structural Drawings to Project Manager"
        open={designModal}
        onCancel={() => setDesignModal(false)}
        onOk={handleDesignSubmit}
        confirmLoading={actionLoading}
        okText="Hand Over to PM"
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Drawing Title / Reference</label>
            <Input
              value={drawingNameInput}
              onChange={(e) => setDrawingNameInput(e.target.value)}
              placeholder="e.g. Roof_Arch_Fabrication_Profile_Rev1.dwg"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Drawing Document URL / Path</label>
            <Input
              value={drawingUrlInput}
              onChange={(e) => setDrawingUrlInput(e.target.value)}
              placeholder="e.g. /uploads/drawings/roof_plan.pdf"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Engineering Notes for PM</label>
            <TextArea
              rows={3}
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
              placeholder="Specific steel section specifications, arc height notes..."
            />
          </div>
        </div>
      </Modal>

      {/* 3. PM Request Drawing Revision Modal */}
      <Modal
        title="Request Drawing Revision (Loop to Design)"
        open={pmReviseModal}
        onCancel={() => setPmReviseModal(false)}
        onOk={handlePmRequestRevision}
        confirmLoading={actionLoading}
        okText="Send Revision to Design"
        okButtonProps={{ danger: true }}
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ fontSize: 13, color: '#475569' }}>
            Enter specific engineering feedback for the Design engineer to correct in the drawing.
          </p>
          <TextArea
            rows={4}
            value={revisionNotesInput}
            onChange={(e) => setRevisionNotesInput(e.target.value)}
            placeholder="Explain required changes (e.g. column thickness, arc radius, end plate details)..."
          />
        </div>
      </Modal>

      <style>{`
        @media print {
          .no-print, header, .ant-layout-sider, .ant-layout-header, .ant-breadcrumb, .flowbar {
            display: none !important;
          }
          .print-only-brand-header {
            display: block !important;
          }
          body, .ant-layout, .ant-layout-content {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .wo-detail-container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .content-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            break-inside: avoid;
            margin-bottom: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkOrderDetailPage;
