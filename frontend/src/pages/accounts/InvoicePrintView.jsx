import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Result } from 'antd';
import { PrinterOutlined, ArrowLeftOutlined, WhatsAppOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getInvoiceById } from '../../utils/api';
import { shareInvoiceViaWhatsApp } from '../../utils/whatsappShare';

const InvoicePrintView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await getInvoiceById(id);
        if (res.data?.success && res.data.data) {
          setInvoice(res.data.data);
        } else {
          setError('Invoice not found');
        }
      } catch (err) {
        console.error('Error fetching printable invoice:', err);
        setError(err.response?.data?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f6f9' }}>
        <Spin size="large" tip="Loading printable invoice..." />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f6f9' }}>
        <Result
          status="404"
          title="Invoice Error"
          subTitle={error || 'Could not find the requested invoice.'}
          extra={
            <Button type="primary" onClick={() => navigate('/accounts/invoices')} style={{ background: '#0b315d', borderColor: '#0b315d' }}>
              Back to Invoices
            </Button>
          }
        />
      </div>
    );
  }

  const subtotal = invoice.subtotal || 0;
  const gstAmount = invoice.gstAmount || 0;
  const grandTotal = invoice.grandTotal || 0;
  const amountPaid = invoice.amountPaid || 0;
  const amountDue = invoice.amountDue !== undefined ? invoice.amountDue : Math.max(0, grandTotal - amountPaid);

  return (
    <div className="invoice-print-container">
      {/* Non-printable action header */}
      <div className="no-print action-bar">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/accounts/invoices')}>
          Back to Invoices
        </Button>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            onClick={() =>
              shareInvoiceViaWhatsApp({
                phone: invoice.customerPhone || invoice.enquiryId?.phone,
                clientName: invoice.clientName,
                refCode: invoice.refCode,
                totalAmount: invoice.grandTotal,
                status: invoice.status
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
            onClick={handlePrint}
            style={{ background: '#0b315d', borderColor: '#0b315d', fontWeight: 600 }}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="invoice-paper">
        {/* TOP ROW */}
        <div className="top-row">
          <div className="company-info">
            <img
              src="/logos/iroofing_wordmark_blue_small.png"
              alt="I Roofing Enterprises"
              style={{ maxHeight: 36, objectFit: 'contain', marginBottom: 6 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="company-sub" style={{ fontWeight: 600, color: '#0b2e59' }}>Truss-Less Self-Supported Arch Roofing Systems</div>
            <div className="company-contact">Central Fabrication Hub, Chennai / Kochi, India</div>
            <div className="company-contact">Phone: +91 98470 00000 | Email: billing@iroofing.in</div>
            <div className="company-contact">GSTIN: 32AABCU9603R1ZM</div>
          </div>
          <div className="invoice-badge-block">
            <div className="invoice-title">TAX INVOICE</div>
            <div className="invoice-ref">{invoice.refCode}</div>
            <div className="meta-text"><strong>Date:</strong> {dayjs(invoice.invoiceDate).format('DD MMM YYYY')}</div>
            <div className="meta-text"><strong>Due Date:</strong> {dayjs(invoice.dueDate).format('DD MMM YYYY')}</div>
            {invoice.workOrderId?.refCode && (
              <div className="meta-text"><strong>Work Order:</strong> {invoice.workOrderId.refCode}</div>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="invoice-divider" />

        {/* BILL TO BLOCK */}
        <div className="bill-to-block">
          <div className="bill-to-label">BILL TO:</div>
          <div className="client-name">{invoice.clientName}</div>
          {invoice.clientAddress && <div className="client-detail">{invoice.clientAddress}</div>}
          <div className="client-detail">
            {invoice.clientPhone && <span>Phone: {invoice.clientPhone}</span>}
            {invoice.clientPhone && invoice.clientEmail && <span> · </span>}
            {invoice.clientEmail && <span>Email: {invoice.clientEmail}</span>}
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>#</th>
              <th>Description</th>
              <th style={{ width: 60, textAlign: 'center' }}>Qty</th>
              <th style={{ width: 70, textAlign: 'center' }}>Unit</th>
              <th style={{ width: 110, textAlign: 'right' }}>Rate (₹)</th>
              <th style={{ width: 120, textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              invoice.lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', color: '#6b7280' }}>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{item.description}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity || 1}</td>
                  <td style={{ textAlign: 'center', textTransform: 'capitalize' }}>{item.unit || 'lot'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Number(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>
                    {Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
                  No items specified
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* TOTALS BLOCK */}
        <div className="totals-section">
          <div className="payment-terms-box">
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
              Payment Terms & Notes
            </div>
            <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
              <strong>Terms:</strong> {invoice.paymentTerms || '30 days'}
            </div>
            {invoice.notes && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, whiteSpace: 'pre-wrap' }}>
                {invoice.notes}
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 11, color: '#4b5563' }}>
              <div><strong>Bank Details for NEFT / RTGS:</strong></div>
              <div>Bank: State Bank of India</div>
              <div>A/C No: 409823489210</div>
              <div>IFSC Code: SBIN0004521</div>
            </div>
          </div>

          <div className="totals-table-wrapper">
            <table className="totals-table">
              <tbody>
                <tr>
                  <td className="tot-label">Subtotal:</td>
                  <td className="tot-val">₹ {Number(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="tot-label">GST ({invoice.gstRate || 18}%):</td>
                  <td className="tot-val">₹ {Number(gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="grand-total-row">
                  <td className="tot-label" style={{ fontWeight: 700, color: '#0b315d', fontSize: 14 }}>GRAND TOTAL:</td>
                  <td className="tot-val" style={{ fontWeight: 700, color: '#0b315d', fontSize: 16 }}>
                    ₹ {Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="tot-label" style={{ color: '#15803d', fontWeight: 600 }}>Amount Paid:</td>
                  <td className="tot-val" style={{ color: '#15803d', fontWeight: 600 }}>
                    ₹ {Number(amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="tot-label" style={{ color: amountDue > 0 ? '#b91c1c' : '#15803d', fontWeight: 600 }}>
                    Amount Due:
                  </td>
                  <td className="tot-val" style={{ color: amountDue > 0 ? '#b91c1c' : '#15803d', fontWeight: 700 }}>
                    ₹ {Number(amountDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div className="invoice-footer">
          <div className="footer-line" />
          <div className="footer-text">This is a computer-generated invoice.</div>
          <div className="footer-text">Thank you for your business.</div>
        </div>
      </div>

      <style>{`
        .invoice-print-container {
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

        .invoice-paper {
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

        .invoice-badge-block {
          text-align: right;
        }

        .invoice-title {
          font-size: 20px;
          font-weight: 700;
          color: #0b315d;
          letter-spacing: 0.05em;
        }

        .invoice-ref {
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

        .invoice-divider {
          height: 2px;
          background: #0b315d;
          margin: 24px 0 20px 0;
        }

        .bill-to-block {
          margin-bottom: 24px;
        }

        .bill-to-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .client-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 4px 0 2px 0;
        }

        .client-detail {
          font-size: 13px;
          color: #374151;
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

        .payment-terms-box {
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

        .invoice-footer {
          margin-top: 36px;
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
          .invoice-print-container {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-paper {
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

export default InvoicePrintView;
