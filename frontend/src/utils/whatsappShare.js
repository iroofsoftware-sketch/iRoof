/**
 * Clean phone number to WhatsApp international format
 * Defaults to India (+91) for standard 10-digit mobile numbers
 */
export const formatWhatsAppNumber = (phone = '') => {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
};

/**
 * Open WhatsApp Web / App with pre-filled message
 */
export const openWhatsApp = (phone, message) => {
  const cleanPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Share Customer Quotation / Estimate
 */
export const shareQuotationViaWhatsApp = ({
  phone,
  clientName,
  refCode,
  roofModel,
  span,
  length,
  grandTotal
}) => {
  const msg = [
    `*I ROOFING ENTERPRISES* — Quotation Summary`,
    `----------------------------------------`,
    `Dear ${clientName || 'Valued Client'},`,
    ``,
    `Greetings! Please find the commercial estimate for your roofing project:`,
    refCode ? `• *Reference:* ${refCode}` : '',
    roofModel ? `• *Structural Model:* ${roofModel}` : '',
    span && length ? `• *Dimensions:* ${span}m (Span) × ${length}m (Length)` : '',
    grandTotal ? `• *Total Amount:* ₹ ${Number(grandTotal).toLocaleString('en-IN')}` : '',
    ``,
    `Truss-Less Self-Supported Curved Arch Roofing Systems.`,
    `Engineered for superior strength, 100% leak-proof, zero structural maintenance.`,
    ``,
    `Please contact us for site layout and technical verification.`,
    `----------------------------------------`,
    `*I Roofing Enterprises* · Architectural Roofing Systems`
  ]
    .filter(Boolean)
    .join('\n');

  openWhatsApp(phone, msg);
};

/**
 * Share Tax Invoice
 */
export const shareInvoiceViaWhatsApp = ({
  phone,
  clientName,
  refCode,
  totalAmount,
  status
}) => {
  const msg = [
    `*I ROOFING ENTERPRISES* — Tax Invoice Notice`,
    `----------------------------------------`,
    `Dear ${clientName || 'Valued Client'},`,
    ``,
    `Here are your tax invoice details for your project:`,
    refCode ? `• *Invoice Ref:* ${refCode}` : '',
    totalAmount ? `• *Invoice Amount:* ₹ ${Number(totalAmount).toLocaleString('en-IN')}` : '',
    status ? `• *Payment Status:* ${status.toUpperCase()}` : '',
    ``,
    `Thank you for your business!`,
    `----------------------------------------`,
    `*I Roofing Enterprises* · Architectural Roofing Systems`
  ]
    .filter(Boolean)
    .join('\n');

  openWhatsApp(phone, msg);
};
