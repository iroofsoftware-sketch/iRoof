// Arc length formula (used for sheet cut length)
export function arc(c, h) {
  if (h <= 0) return c;
  let r = c * c / (8 * h) + h / 2;
  return r * 2 * Math.asin(c / (2 * r));
}

// 5 Engineering Models Calculator — ported with ZERO changes from v60
export function autoEngineering(type, span, length, height, distance, angleMode) {
  span = +span || 0;
  length = +length || 0;
  height = +height || 0;
  distance = +distance || 0;
  angleMode = angleMode || 'Without Angle';

  if (span <= 0 || length <= 0) return null;

  // *** CANTILEVER HEIGHT CHECK — do not remove ***
  if (['Normal Cantilever', 'PEB Cantilever', 'Type 2 Cantilever'].includes(type) && height > 3) {
    return {
      error: 'Out of Equation',
      type,
      span,
      length,
      height,
      distance,
      angleMode,
      reason: 'Cantilever effective / projection height must be 3.0 m or less.'
    };
  }

  let cover = 0.305, th = 0.6, rise = 0, offset = 0;
  let bays = 1, ncol = 0;
  let panels, eff, cut, finalCut, area, sheetKg;

  // ── MODEL 2: AUDITORIUM ──────────────────────────────────────
  if (type === 'Auditorium') {
    cover = span <= 18 ? 0.701 : 0.626;
    th = cover === 0.305 ? 0.6
       : span <= 13 ? 0.8
       : span <= 23.5 ? 1
       : span <= 28.9 ? 1.2 : 1.3;
    rise = +(span < 9 ? span / 7.5 : span / 5).toFixed(2);
    panels = Math.round(length / cover);
    eff = panels * cover;
    cut = arc(span, rise);
    finalCut = cut;
    area = finalCut * cover * panels * 10.76;
    ncol = span <= 18
      ? (Math.ceil((length - 1) / 4) + 1) * 2
      : (Math.ceil((length - 1) / 6) + 1) * 2;
  }

  // ── MODEL 1: NORMAL CANTILEVER ───────────────────────────────
  else if (type === 'Normal Cantilever') {
    cover = 0.305;
    th = 0.6;
    rise = +(height / 2).toFixed(2);
    offset = height;
    ncol = Math.ceil((length - 1) / 3) + 1;
    panels = Math.ceil(length / cover);
    eff = panels * cover;
    cut = arc(span, rise);
    finalCut = cut + offset * 2.8;
    area = finalCut * cover * panels * 10.76;
  }

  // ── MODEL 3: PEB CANTILEVER ──────────────────────────────────
  else if (type === 'PEB Cantilever') {
    bays = Math.max(1, Math.ceil(span / 6));
    let baySpan = span / bays;
    cover = 0.305; th = 0.6;
    rise = +(baySpan / 15).toFixed(2);
    ncol = bays + 1;
    panels = Math.round(length / cover) * bays;
    eff = panels * cover;
    cut = arc(baySpan, rise);
    finalCut = cut + offset * 2.8;
    area = finalCut * cover * panels * 10.76;
  }

  // ── MODEL 4: TYPE 2 CANTILEVER ───────────────────────────────
  else if (type === 'Type 2 Cantilever') {
    bays = Math.max(1, Math.ceil(span / 6));
    let baySpan = span / bays;
    cover = 0.305; th = 0.6;
    rise = +(baySpan / 15).toFixed(2);
    offset = height;
    ncol = bays + 1;
    panels = Math.round(length / cover) * bays;
    eff = panels * cover;
    cut = arc(baySpan, rise);
    finalCut = cut + offset * 2.8;
    area = finalCut * cover * panels * 10.76;
  }

  // ── MODEL 5: SIMPLY SUPPORTED ────────────────────────────────
  else if (type === 'Simply Supported') {
    bays = Math.max(1, Math.ceil(span / 6));
    let baySpan = Math.ceil(span / bays * 2) / 2;
    cover = 0.305; th = 0.6;
    rise = +(baySpan / 15).toFixed(2);
    ncol = 2 + 2 * bays;
    panels = Math.round(length / cover) * bays;
    eff = panels * cover;
    cut = arc(baySpan, rise);
    finalCut = cut + offset * 2.8;
    area = finalCut * cover * panels * 10.76;
  }

  // Sheet weight (kg per thickness)
  const thicknessFactors = { 0.6: 3.558, 0.8: 4.743, 1.0: 5.929, 1.2: 7.115, 1.3: 7.708 };
  const factor = thicknessFactors[th] || 3.558;
  sheetKg = factor * panels * finalCut;

  return {
    type,
    span,
    length,
    height,
    distance,
    angleMode,
    cover,
    th,
    rise,
    offset,
    bays,
    ncol,
    panels,
    eff,
    cut,
    finalCut,
    area,
    sheetKg
  };
}

// Admin Rate Defaults
export const DEFAULT_RATES = {
  sheetRate: 48,          // ₹/ft² Sheet base material
  structLabRate: 26,      // ₹/kg  Structural Labour
  structConRate: 2,       // ₹/kg  Structure Consumables
  roofConRate: 2,         // ₹/ft² Roofing Consumables
  paintRate: 12.7,        // ₹/ft² Painting
  scafRate: 20,           // ₹/ft² Scaffolding
  rentRate: 600,          // ₹/day Fabrication Rent
  structMargin: 24,       // ₹/kg  Min Structure Margin
  projectMargin: 10,      // %     Standard Project Margin
  localRate: 1400,        // ₹     Sheeting Local Labour
  siteRate: 1700,         // ₹     Sheeting Site Labour
  roomRent: 1000,         // ₹/room/night
  extraBed: 300,          // ₹/4th person
  gstRate: 18             // %
};

// Calculate cost summary using active rates
export function calculateEstimateCosts(results, rates = DEFAULT_RATES) {
  if (!results || results.error) {
    return {
      sheetCost: 0,
      labourCost: 0,
      consumables: 0,
      beforeGst: 0,
      gst: 0,
      grandTotal: 0
    };
  }

  const r = { ...DEFAULT_RATES, ...rates };
  const area = results.area || 0;
  const sheetKg = results.sheetKg || 0;

  const sheetCost = Math.round(area * (r.sheetRate || 48));
  const labourCost = Math.round(sheetKg * (r.structLabRate || 26));
  const consumables = Math.round(
    sheetKg * (r.structConRate || 2) + area * (r.roofConRate || 2)
  );

  const beforeGst = sheetCost + labourCost + consumables;
  const gst = Math.round(beforeGst * ((r.gstRate || 18) / 100));
  const grandTotal = beforeGst + gst;

  return {
    sheetCost,
    labourCost,
    consumables,
    beforeGst,
    gst,
    grandTotal
  };
}
