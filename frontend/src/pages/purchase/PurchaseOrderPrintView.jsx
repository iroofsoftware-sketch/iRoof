import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Result } from 'antd';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPurchaseOrderById } from '../../utils/api';

const PurchaseOrderPrintView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPO = async () => {
      try {
        setLoading(true);
        const res = await getPurchaseOrderById(id);
        if (res.data?.success && res.data.data) {
          setPo(res.data.data);
        } else {
          setError('Purchase order not found');
        }
      } catch (err) {
        console.error('Error fetching printable PO:', err);
        setError(err.response?.data?.message || 'Failed to load purchase order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPO();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f6f9' }}>
        <Spin size="large" tip="Loading printable purchase order..." />
      </div>
    );
  }

  if (error || !po) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f6f9' }}>
        <Result
          status="404"
          title="Purchase Order Error"
          subTitle={error || 'Could not find the requested purchase order.'}
          extra={
            <Button
              type="primary"
              onClick={() => navigate('/purchase/orders')}
              style={{ background: '#0b315d', borderColor: '#0b315d' }}
            >
              Back to Purchase Orders
            </Button>
          }
        />
      </div>
    );
  }

  const supplier = po.supplierId || {};
  const subtotal = po.subtotal || 0;
  const gstAmount = po.gstAmount || 0;
  const grandTotal = po.grandTotal || 0;

  return (
    <div className="po-print-container">
      {/* Non-printable action header */}
      <div className="no-print action-bar">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/purchase/orders')}>
          Back to Purchase Orders
        </Button>
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ background: '#0b315d', borderColor: '#0b315d', fontWeight: 600 }}
        >
          Print PO
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="po-paper">
        {/* TOP ROW */}
        <div className="top-row">
          <div className="company-info">
            <div className="company-name">I Roofing Enterprises</div>
            <div className="company-sub">Engineering & Industrial Roofing Procurement</div>
            <div className="company-contact">Central Workshop & Logistics Hub, Kochi, Kerala, India</div>
            <div className="company-contact">Phone: +91 98470 00000 | Email: purchase@iroofing.in</div>
            <div className="company-contact">GSTIN: 32AABCU9603R1ZM</div>
          </div>
          <div className="po-badge-block">
            <div className="po-title">PURCHASE ORDER</div>
            <div className="po-ref">{po.refCode}</div>
            <div className="meta-text"><strong>Date:</strong> {dayjs(po.poDate).format('DD MMM YYYY')}</div>
            <div className="meta-text"><strong>Expected Delivery:</strong> {dayjs(po.expectedDelivery).format('DD MMM YYYY')}</div>
            {po.purchaseRequestId?.refCode && (
              <div className="meta-text"><strong>PR Ref:</strong> {po.purchaseRequestId.refCode}</div>
            )}
            {po.workOrderId?.refCode && (
              <div className="meta-text"><strong>WO Ref:</strong> {po.workOrderId.refCode}</div>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="po-divider" />

        {/* TWO-COLUMN BLOCK */}
        <div className="two-col-block">
          {/* LEFT — Supplier */}
          <div className="col-box">
            <div className="box-label">SUPPLIER / VENDOR:</div>
            <div className="vendor-name">{supplier.name || 'Valued Supplier'}</div>
            {supplier.contactPerson && <div className="vendor-detail">Attn: {supplier.contactPerson}</div>}
            <div className="vendor-detail">
              {supplier.phone && <span>Phone: {supplier.phone}</span>}
              {supplier.phone && supplier.email && <span> · </span>}
              {supplier.email && <span>Email: {supplier.email}</span>}
            </div>
            {supplier.address && <div className="vendor-detail">{supplier.address}</div>}
            {supplier.gstin && <div className="vendor-detail"><strong>GSTIN:</strong> {supplier.gstin}</div>}
          </div>

          {/* RIGHT — Deliver To */}
          <div className="col-box">
            <div className="box-label">DELIVER TO:</div>
            <div className="vendor-name">I Roofing Enterprises Project Site / Workshop</div>
            <div className="vendor-detail" style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
              {po.deliveryAddress || 'Central Workshop & Fabrication Yard, Kochi, Kerala'}
            </div>
            <div className="vendor-detail" style={{ marginTop: 6 }}>
              <strong>Receiving Contact:</strong> Logistics Coordinator (+91 98470 55555)
            </div>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>#</th>
              <th>Description / Specification</th>
              <th style={{ width: 60, textAlign: 'center' }}>Qty</th>
              <th style={{ width: 70, textAlign: 'center' }}>Unit</th>
              <th style={{ width: 110, textAlign: 'right' }}>Rate (₹)</th>
              <th style={{ width: 120, textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {po.lineItems && po.lineItems.length > 0 ? (
              po.lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', color: '#6b7280' }}>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{item.description}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'center', textTransform: 'capitalize' }}>{item.unit || 'kg'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Number(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
                  No materials specified
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* TOTALS & TERMS */}
        <div className="totals-section">
          <div className="terms-box">
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
              Terms & Instructions
            </div>
            <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
              <strong>Payment Terms:</strong> {supplier.paymentTerms || '30 Days'}
            </div>
            {po.notes && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, whiteSpace: 'pre-wrap' }}>
                <strong>Instructions:</strong> {po.notes}
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 11, color: '#4b5563' }}>
              • Material Test Certificate (MTC) required along with delivery challan.<br />
              • Deliveries accepted strictly between 8:30 AM and 5:30 PM.
            </div>
          </div>

          <div className="totals-table-wrapper">
            <table className="totals-table">
              <tbody>
                <tr>
                  <td className="tot-label">Subtotal:</td>
                  <td className="tot-val">
                    ₹ {Number(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="tot-label">GST ({po.gstRate || 18}%):</td>
                  <td className="tot-val">
                    ₹ {Number(gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="grand-total-row">
                  <td className="tot-label" style={{ fontWeight: 700, color: '#0b315d', fontSize: 14 }}>
                    GRAND TOTAL:
                  </td>
                  <td className="tot-val" style={{ fontWeight: 700, color: '#0b315d', fontSize: 16 }}>
                    ₹ {Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AUTHORISATION BLOCK */}
        <div className="auth-block">
          <div className="sig-box">
            <div className="sig-line" />
            <div className="sig-title">Prepared By: {po.createdBy?.name || 'Procurement Executive'}</div>
            <div className="sig-sub">Purchase & Procurement Dept.</div>
          </div>
          <div className="sig-box">
            <div className="sig-line" />
            <div className="sig-title">Authorised By: Managing Director / Operations Head</div>
            <div className="sig-sub">I Roofing Enterprises</div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="po-footer">
          <div className="footer-line" />
          <div className="footer-text">This is a computer-generated purchase order.</div>
          <div className="footer-text">Thank you for your business.</div>
        </div>
      </div>

      <style>{`
        .po-print-container {
          background-color: #f3f6f9;
          min-height: 100vh;
          padding: 24px 16px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .action-bar {
          max-width: 800px;
          margin: 0 auto 16px auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .po-paper {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: #ffffff;
          border: 1px solid #dde3ea;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          color: #111827;
        }

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .company-name {
          font-size: 22px;
          font-weight: 700;
          color: #0b315d;
          letter-spacing: -0.01em;
        }

        .company-sub {
          font-size: 13px;
          color: #6b7280;
          margin-top: 2px;
        }

        .company-contact {
          font-size: 12px;
          color: #4b5563;
          margin-top: 3px;
        }

        .po-badge-block {
          text-align: right;
        }

        .po-title {
          font-size: 20px;
          font-weight: 700;
          color: #0b315d;
          letter-spacing: 0.05em;
        }

        .po-ref {
          font-size: 14px;
          font-family: monospace;
          font-weight: 700;
          color: #0b315d;
          margin: 4px 0 6px 0;
        }

        .meta-text {
          font-size: 12px;
          color: #4b5563;
          line-height: 1.4;
        }

        .po-divider {
          height: 2px;
          background: #0b315d;
          margin: 24px 0 20px 0;
        }

        .two-col-block {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .col-box {
          background: #f8fafc;
          border: 1px solid #dde3ea;
          border-radius: 6px;
          padding: 14px;
        }

        .box-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .vendor-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }

        .vendor-detail {
          font-size: 12px;
          color: #374151;
          margin-top: 2px;
          line-height: 1.4;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        .items-table th {
          background-color: #0b315d;
          color: #ffffff;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 10px 12px;
          font-weight: 600;
          border: 1px solid #0b315d;
        }

        .items-table td {
          padding: 10px 12px;
          font-size: 12px;
          border: 1px solid #dde3ea;
        }

        .items-table tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }

        .items-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }

        .totals-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 30px;
        }

        .terms-box {
          flex: 1;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid #dde3ea;
          border-radius: 6px;
        }

        .totals-table-wrapper {
          width: 320px;
          margin-left: auto;
        }

        .totals-table {
          width: 100%;
          border-collapse: collapse;
        }

        .totals-table td {
          padding: 6px 8px;
          font-size: 13px;
        }

        .tot-label {
          text-align: right;
          color: #4b5563;
        }

        .tot-val {
          text-align: right;
          font-weight: 500;
          color: #111827;
        }

        .grand-total-row {
          border-top: 2px solid #0b315d;
          border-bottom: 1px solid #dde3ea;
        }

        .grand-total-row td {
          padding: 10px 8px;
        }

        .auth-block {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 40px;
          margin-bottom: 30px;
        }

        .sig-box {
          text-align: center;
        }

        .sig-line {
          height: 1px;
          background: #374151;
          margin-bottom: 8px;
        }

        .sig-title {
          font-size: 12px;
          font-weight: 600;
          color: #111827;
        }

        .sig-sub {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }

        .po-footer {
          margin-top: 24px;
          text-align: center;
        }

        .footer-line {
          height: 1px;
          background: #dde3ea;
          margin-bottom: 12px;
        }

        .footer-text {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.5;
        }

        @media print {
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .po-print-container {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .po-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
};

export default PurchaseOrderPrintView;
