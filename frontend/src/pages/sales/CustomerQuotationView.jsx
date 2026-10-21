import React, { useState, useEffect } from 'react';
import { Button, Spin, message } from 'antd';
import {
  PrinterOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  WhatsAppOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { shareQuotationViaWhatsApp } from '../../utils/whatsappShare';

const formatINR = (val) => {
  if (val === undefined || val === null) return '₹0';
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

const CustomerQuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/estimates/${id}`);
        if (res.data) {
          setEstimate(res.data.estimate || res.data);
        }
      } catch (err) {
        console.error('Error fetching estimate for quotation:', err);
        message.error('Failed to load estimate');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEstimate();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#64748b' }}>Generating commercial quotation...</div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <h3>Estimate not found</h3>
        <Button onClick={() => navigate('/sales/estimates')}>Back to Estimates</Button>
      </div>
    );
  }

  const { inputData = {}, results = {}, enquiryId = {} } = estimate;
  const costs = results.costs || {};
  const roof = results.roof || {};
  const struct = results.structure || {};

  const clientName = enquiryId.clientName || inputData.clientName || 'Valued Client';
  const clientPhone = enquiryId.phone || inputData.phone || '—';
  const clientAddress = enquiryId.address || inputData.location || inputData.address || '—';
  const projectName = inputData.projectName || enquiryId.roofType || estimate.model || 'Arch Roofing Project';

  const span = inputData.span || roof.span || '—';
  const length = inputData.length || roof.length || '—';
  const thickness = inputData.thickness || roof.thickness || '0.6';
  const profile = inputData.sheetProfile || roof.profile || 'Self-Supported Arch Panel';
  const roofArea = Math.round(roof.roofAreaSqFt || results.roofArea || 0);
  const sqftRate = Math.round(costs.roofingRatePerSqFt || (roofArea ? costs.grandTotal / roofArea : 0));
  const structWeight = Math.round(struct.totalWeightKg || results.totalWeightKg || 0);
  const structRate = Math.round(costs.structureRatePerKg || 0);

  const grandTotal = results.grandTotal || costs.grandTotal || 0;
  const estRef = `EST-${id.slice(-6).toUpperCase()}`;
  const dateStr = new Date(estimate.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const validUntilStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px 16px' }}>
      {/* Top Action Bar */}
      <div
        className="no-print"
        style={{
          maxWidth: 1050,
          margin: '0 auto 16px auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            onClick={() =>
              shareQuotationViaWhatsApp({
                phone: clientPhone,
                clientName,
                refCode: estRef,
                roofModel: estimate.model,
                span,
                length,
                grandTotal
              })
            }
            icon={<WhatsAppOutlined />}
            style={{
              background: '#25D366',
              borderColor: '#25D366',
              color: '#ffffff',
              fontWeight: 600
            }}
          >
            Share via WhatsApp
          </Button>

          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
          >
            Print Quotation / Save PDF
          </Button>
        </div>
      </div>

      {/* Official Estimate Page following the approved CSS layout */}
      <div className="estimate-page">
        <div className="est-topline" />

        {/* Head */}
        <div className="est-head">
          <div className="est-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src="/logos/iroofing_wordmark_blue_small.png"
              alt="iRoofing"
              style={{ maxHeight: 38, objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{ fontSize: 9, fontStyle: 'normal', color: '#173c65', letterSpacing: '0.04em', marginTop: 3 }}>
              A Roof Without Truss
            </div>
          </div>

          <div className="est-title">
            <h1>COMMERCIAL ESTIMATE</h1>
            <b>A ROOF WITHOUT TRUSS</b>
            <span style={{ fontSize: 11, color: '#475569', letterSpacing: '0.04em' }}>
              TRUSS-LESS SELF-SUPPORTED ARCH ROOFING SYSTEM
            </span>
          </div>

          <div className="est-meta">
            <div>
              <b>Estimate No.</b>
              <span>:</span>
              <span className="ref-badge">{estRef}</span>
            </div>
            <div>
              <b>Date</b>
              <span>:</span>
              <span>{dateStr}</span>
            </div>
            <div>
              <b>Valid Upto</b>
              <span>:</span>
              <span>{validUntilStr}</span>
            </div>
            <div>
              <b>Prepared By</b>
              <span>:</span>
              <span>Sales Engineering, I Roofing Enterprises</span>
            </div>
          </div>
        </div>

        {/* Client & Project Details */}
        <div className="est-grid2">
          <div className="est-box">
            <div className="est-cap">CUSTOMER DETAILS</div>
            <div className="est-field">
              <b>Name</b>
              <span>:</span>
              <span>{clientName}</span>
            </div>
            <div className="est-field">
              <b>Phone</b>
              <span>:</span>
              <span>{clientPhone}</span>
            </div>
            <div className="est-field">
              <b>Place</b>
              <span>:</span>
              <span>{clientAddress}</span>
            </div>
          </div>

          <div className="est-box">
            <div className="est-cap">PROJECT DETAILS</div>
            <div className="est-field">
              <b>Project</b>
              <span>:</span>
              <span>{projectName}</span>
            </div>
            <div className="est-field">
              <b>Location</b>
              <span>:</span>
              <span>{clientAddress}</span>
            </div>
            <div className="est-field">
              <b>Model</b>
              <span>:</span>
              <span>{estimate.model}</span>
            </div>
          </div>
        </div>

        {/* Overview & Scope */}
        <div className="est-grid2" style={{ marginTop: 24 }}>
          <div className="est-box est-overview">
            <div className="est-cap">PROJECT SCOPE</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, padding: '4px 0', color: '#334155' }}>
              Design, engineering, fabrication, supply, and on-site arch-forming installation of
              truss-less self-supported curved steel roofing system with integrated rainwater gutters and
              structural foundation connections.
            </div>
          </div>

          <div className="est-box">
            <div className="est-cap">SYSTEM HIGHLIGHTS</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#334155', padding: '4px 0' }}>
              • 100% Leak-Proof continuous mechanical seaming<br />
              • Zero internal truss obstruction / maximum vertical clearance<br />
              • High-tensile galvalume / pre-coated steel formulation<br />
              • Rapid on-site mobile roll forming & mechanized erection
            </div>
          </div>
        </div>

        {/* Engineering Specifications & Structure Details */}
        <div className="est-mid">
          <div className="est-box est-spec">
            <div className="est-cap">ROOF SPECIFICATIONS</div>
            <div className="est-specrow">
              <b>Clear Span</b>
              <span className="est-line">{span}</span>
              <span>m</span>
            </div>
            <div className="est-specrow">
              <b>Roof Length</b>
              <span className="est-line">{length}</span>
              <span>m</span>
            </div>
            <div className="est-specrow">
              <b>Panel Thickness</b>
              <span className="est-line">{thickness}</span>
              <span>mm</span>
            </div>
            <div className="est-specrow">
              <b>Sheet Profile</b>
              <span className="est-line">{profile}</span>
              <span />
            </div>
            <div className="est-specrow">
              <b>Approx. Roof Area</b>
              <span className="est-line">{roofArea.toLocaleString('en-IN')}</span>
              <span>Sq.ft</span>
            </div>
            <div className="est-specrow">
              <b>Sq.ft Unit Rate</b>
              <span className="est-line">{formatINR(sqftRate)}</span>
              <span>/-</span>
            </div>
          </div>

          <div className="est-box est-struct">
            <div className="est-cap">STRUCTURAL SPECIFICATIONS</div>
            <div className="est-specrow">
              <b>Structure Weight</b>
              <span className="est-line">{structWeight.toLocaleString('en-IN')}</span>
              <span>KG</span>
            </div>
            <div className="est-specrow">
              <b>Fabrication Finish</b>
              <span className="est-line">MS Epoxy Primer</span>
              <span />
            </div>
            <div className="est-specrow">
              <b>Erection Crane</b>
              <span className="est-line">Included</span>
              <span />
            </div>
            <div className="est-specrow">
              <b>Scaffolding Setup</b>
              <span className="est-line">Included</span>
              <span />
            </div>
            <div className="est-specrow">
              <b>Gutters & Trims</b>
              <span className="est-line">Included</span>
              <span />
            </div>
          </div>
        </div>

        {/* Grand Total Box */}
        <div className="est-grand">
          <div className="gtitle">
            COMMERCIAL GRAND TOTAL
            <small>ALL-INCLUSIVE (TAXES & ERECTION INCLUDED)</small>
          </div>
          <div className="gamt">{formatINR(grandTotal)}</div>
        </div>

        {/* Payment Terms */}
        <div className="est-box est-wide">
          <div className="est-cap">PAYMENT TERMS & MILESTONES</div>
          <div className="est-wide-content" style={{ fontSize: 13, lineHeight: 1.6 }}>
            1. <strong>50% Advance</strong> upon signing proposal and releasing Purchase Order.<br />
            2. <strong>40% On Material Dispatch</strong> to site before commencement of curved panel profiling.<br />
            3. <strong>10% On Completion</strong> and successful handover of roof structure.
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="est-box est-notes">
          <b>IMPORTANT CONDITIONS</b>
          <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#475569' }}>
            • Quotation is valid for 30 calendar days from the date of issue.<br />
            • Three-phase power (415V, 30HP) and clear ground access for roll-forming machinery to be provided at site by client.<br />
            • Civil foundation, anchor bolt grouting, and water supply to be completed prior to site mobilization.<br />
            • Any statutory local permissions/clearances to be handled by customer.
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
            marginTop: 40,
            padding: '0 40px'
          }}
        >
          <div>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: 8, textAlign: 'center', fontSize: 12, color: '#475569' }}>
              <strong>Client Acceptance</strong><br />
              Signature & Seal
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: 8, textAlign: 'center', fontSize: 12, color: '#475569' }}>
              <strong>For I ROOFING ENTERPRISES</strong><br />
              Authorized Signatory
            </div>
          </div>
        </div>

        <div className="est-foot" />
      </div>

      <style>{`
        .estimate-page {
          max-width: 1050px;
          margin: 0 auto;
          background: #ffffff;
          border: 2px solid #0b315d;
          padding: 24px 28px 16px;
          color: #152536;
          min-height: 1200px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border-radius: 4px;
        }
        .est-topline {
          height: 10px;
          background: #0b315d;
          border-right: 38px solid #c9940a;
          margin-bottom: 16px;
        }
        .est-head {
          display: grid;
          grid-template-columns: 180px 1fr 310px;
          gap: 18px;
          align-items: center;
        }
        .est-logo {
          font-size: 28px;
          font-weight: 800;
          font-style: italic;
          color: #0b2e59;
          text-align: center;
          line-height: 1.1;
        }
        .est-title {
          text-align: center;
        }
        .est-title h1 {
          font-size: 26px;
          letter-spacing: 2px;
          margin: 0;
          color: #0b315d;
          font-weight: 800;
        }
        .est-title b {
          display: block;
          font-size: 13px;
          margin-top: 4px;
          color: #c9940a;
          letter-spacing: 1px;
        }
        .est-meta, .est-box {
          border: 1px solid #7890a5;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
          background: #fbfdff;
        }
        .est-meta {
          padding: 12px 16px;
          font-size: 11.5px;
        }
        .est-meta div {
          display: grid;
          grid-template-columns: 85px 8px 1fr;
          margin: 5px 0;
        }
        .est-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 20px;
        }
        .est-box {
          padding: 0 16px 14px;
          position: relative;
        }
        .est-cap {
          background: #0b315d;
          color: #ffffff;
          font-weight: 700;
          border-radius: 6px;
          padding: 6px 14px;
          margin: -1px -2px 10px;
          display: inline-block;
          font-size: 11.5px;
          letter-spacing: 0.04em;
        }
        .est-field {
          display: grid;
          grid-template-columns: 90px 10px 1fr;
          gap: 5px;
          margin: 6px 8px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 3px;
          font-size: 12.5px;
        }
        .est-overview {
          min-height: 100px;
        }
        .est-mid {
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          gap: 24px;
          margin-top: 24px;
          align-items: stretch;
        }
        .est-specrow {
          display: grid;
          grid-template-columns: 160px 1fr 45px;
          gap: 8px;
          margin: 8px 14px;
          align-items: end;
          font-size: 12.5px;
        }
        .est-line {
          border-bottom: 1px solid #aab8c4;
          text-align: right;
          font-weight: 700;
          color: #0b2e59;
        }
        .est-grand {
          width: 440px;
          margin: 28px auto 24px;
          background: #0b315d;
          border-radius: 8px 8px 20px 20px;
          padding-bottom: 18px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(11,46,89,0.2);
        }
        .est-grand .gtitle {
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          padding: 10px 14px 6px;
          letter-spacing: 0.05em;
        }
        .est-grand .gtitle small {
          display: block;
          color: #fde047;
          font-size: 10.5px;
          margin-top: 2px;
        }
        .est-grand .gamt {
          width: 280px;
          margin: 8px auto 0;
          background: #ffffff;
          border: 2px solid #c9940a;
          border-radius: 8px;
          padding: 12px;
          font-size: 24px;
          font-weight: 800;
          color: #0b2e59;
        }
        .est-wide {
          margin: 20px 0;
          padding: 0 16px 14px;
        }
        .est-wide .est-cap {
          background: #0b315d;
          color: #ffffff;
        }
        .est-wide-content {
          padding: 4px 10px;
        }
        .est-notes {
          margin: 20px 0;
          padding: 14px 20px;
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 15px;
        }
        .est-foot {
          height: 10px;
          background: #0b315d;
          margin-top: 28px;
          border-radius: 2px;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          .estimate-page {
            border: 0;
            padding: 0;
            box-shadow: none;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerQuotationView;
