// Arc length formula (used for sheet cut length)
export function arc(c, h) {
  if (h <= 0) return c;
  let r = c * c / (8 * h) + h / 2;
  return r * 2 * Math.asin(c / (2 * r));
}

// 5 Engineering Models Calculator — ported with ZERO changes from v60
export function autoEngineering(type, span, length, height, distance, angleMode, columnType = 'Single', beamType = 'Standard') {
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

  // Single / Braced / Box column multiplier logic (Master Spec Section 11)
  const colMult = columnType === 'Box' ? 4 : columnType === 'Braced' ? 2 : 1;
  const effectiveNcol = ncol * colMult;

  // Beam multiplier (Standard: 1.0, Braced: 1.25, Box: 1.5)
  const beamMult = beamType === 'Box' ? 1.5 : beamType === 'Braced' ? 1.25 : 1.0;
  const structSteelKg = Math.round((sheetKg * 0.95 * beamMult) + (effectiveNcol * 42));

  return {
    type,
    span,
    length,
    height,
    distance,
    angleMode,
    columnType: columnType || 'Single',
    beamType: beamType || 'Standard',
    cover,
    th,
    rise,
    offset,
    bays,
    ncol,
    effectiveNcol,
    panels,
    eff,
    cut,
    finalCut,
    area,
    sheetKg,
    structSteelKg
  };
}

// ── 16 BROCHURE CATEGORIES (Master Spec Section 5) ─────────────
export const BROCHURE_CATEGORIES = [
  { id: 'ss-a', name: 'Simply Supported', subType: 'Type A', brochurePage: 'p42', modelKey: 'Simply Supported', category: 'Arch Shed', desc: 'Standard double-column curved arch shed' },
  { id: 'ss-b', name: 'Simply Supported', subType: 'Type B', brochurePage: 'p16', modelKey: 'Simply Supported', category: 'Arch Shed', desc: 'Heavy-duty warehouse simply supported shed' },
  { id: 'ss-c', name: 'Simply Supported', subType: 'Type C', brochurePage: 'p14', modelKey: 'Simply Supported', category: 'Arch Shed', desc: 'Long-span column supported arch enclosure' },
  { id: 'cant-a', name: 'Cantilever', subType: 'Type A', brochurePage: 'p10', modelKey: 'Normal Cantilever', category: 'Cantilever', desc: 'Forward projection single column cantilever' },
  { id: 'cant-b', name: 'Cantilever', subType: 'Type B', brochurePage: 'p50', modelKey: 'Type 2 Cantilever', category: 'Cantilever', desc: 'Reverse slope double-reach cantilever' },
  { id: 'peb-a', name: 'PEB Model', subType: 'Type A', brochurePage: 'p41', modelKey: 'PEB Cantilever', category: 'PEB', desc: 'Pre-engineered structural steel frame' },
  { id: 'mb-a', name: 'Multiple Bay', subType: 'Type A', brochurePage: 'p7', modelKey: 'Simply Supported', category: 'Multi-Bay', desc: 'Multi-span interconnected valley gutter shed' },
  { id: 'bunker', name: 'Bunker Model', subType: 'Base Model', brochurePage: 'p40', modelKey: 'Auditorium', category: 'Industrial', desc: 'Reinforced bunker & storage arch cover' },
  { id: 'res', name: 'Residential Projects', subType: 'Base Model', brochurePage: 'p36', modelKey: 'Normal Cantilever', category: 'Residential', desc: 'Rooftop & terrace architectural canopy' },
  { id: 'edu', name: 'Educational Institutions', subType: 'Base Model', brochurePage: 'p19', modelKey: 'Auditorium', category: 'Institutional', desc: 'School & college assembly court cover' },
  { id: 'rel', name: 'Religious Shrines', subType: 'Base Model', brochurePage: 'p47', modelKey: 'Auditorium', category: 'Institutional', desc: 'Spiritual temple & church high-clearance hall' },
  { id: 'court', name: 'Courtyard', subType: 'Base Model', brochurePage: 'p30', modelKey: 'Simply Supported', category: 'Arch Shed', desc: 'Internal atrium & quadrangle weather dome' },
  { id: 'sports', name: 'Sports Complex', subType: 'Base Model', brochurePage: 'p8', modelKey: 'Auditorium', category: 'Commercial', desc: 'Badminton & indoor stadium column-free arena' },
  { id: 'pool', name: 'Swimming Pool', subType: 'Base Model', brochurePage: 'p46', modelKey: 'Auditorium', category: 'Commercial', desc: 'Aquatic center anti-corrosive curved canopy' },
  { id: 'comm', name: 'Commercial', subType: 'Base Model', brochurePage: 'p23', modelKey: 'PEB Cantilever', category: 'Commercial', desc: 'Automobile showroom & retail trade shed' },
  { id: 'audit', name: 'Auditorium', subType: 'Base Model', brochurePage: 'p33', modelKey: 'Auditorium', category: 'Commercial', desc: 'Large span acoustic banquet & auditorium' }
];

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
  const structWeight = results.structSteelKg || results.sheetKg || 0;

  const sheetCost = Math.round(area * (r.sheetRate || 48));
  const labourCost = Math.round(structWeight * (r.structLabRate || 26));
  const consumables = Math.round(
    structWeight * (r.structConRate || 2) + area * (r.roofConRate || 2)
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

// ── RAINWATER DRAINAGE ENGINE (Master Spec Section 25) ──────────
export function calculateRainwaterDrainage({
  spans = 3,
  span = 12,
  rise = 2,
  length = 20,
  slopeRatio = 150,
  endDrops = 2,
  juncDrops = 2,
  rain = 100,
  runoff = 1.0,
  safety = 1.25
}) {
  const baseWidths = [150, 200, 250, 300, 350, 400];
  const pipeIDs = [75, 90, 110, 125, 140, 160, 200];
  const n = 0.013;
  const freeboard = 0.2;
  const maxDepth = 250;
  const slope = 1 / (Number(slopeRatio) || 150);

  const s = Number(span) || 1;
  const r = Number(rise) || 0.1;
  const l = Number(length) || 1;
  const sp = Math.max(1, Number(spans) || 1);

  const radius = (s * s) / (8 * r) + r / 2;
  const angle = 2 * Math.asin(s / (2 * radius));
  const arcLen = radius * angle;
  const planCatchment = s * l;
  const totalPlanCatchment = planCatchment * sp;
  const endCatchment = planCatchment / 2;
  const juncCatchment = planCatchment;

  const flow = (catchmentArea) => (catchmentArea * (Number(rain) || 100) / 3600) * (Number(runoff) || 1.0) * (Number(safety) || 1.25);

  const calcGutter = (flowLs, qty, drops) => {
    const dCount = Math.max(1, Number(drops) || 1);
    const flowPerDrop = flowLs / dCount;
    let selectedBase = '>400';
    let selectedDepth = 999;
    for (const b of baseWidths) {
      const d = (Math.pow(((flowLs / 1000) * n) / ((b / 1000) * Math.sqrt(slope)), 3 / 5) / (1 - freeboard)) * 1000;
      if (d <= maxDepth) {
        selectedBase = b;
        selectedDepth = d;
        break;
      }
    }
    return {
      qty,
      flow: flowLs,
      drops: dCount,
      flowPerDrop,
      base: selectedBase,
      depth: selectedDepth,
      status: selectedDepth <= maxDepth ? 'OK' : 'ADD DROPS / REDESIGN'
    };
  };

  const calcPipe = (flowPerDrop) => {
    const pipeId = 1000 * Math.pow(((flowPerDrop / 1000) * n) / ((Math.PI / 4) * Math.pow(1 / 4, 2 / 3) * Math.sqrt(slope)), 3 / 8);
    const std = pipeIDs.find((x) => pipeId <= x) || '>200';
    return { id: pipeId, std, status: typeof std === 'number' ? 'OK' : 'REVIEW' };
  };

  const endGutter = calcGutter(flow(endCatchment), 2, endDrops);
  const juncQty = Math.max(0, sp - 1);
  const juncGutter = calcGutter(flow(juncCatchment), juncQty, juncDrops);

  const endPipe = calcPipe(endGutter.flowPerDrop);
  const juncPipe = calcPipe(juncGutter.flowPerDrop);

  return {
    radius,
    angle,
    arcLen,
    planCatchment,
    totalPlanCatchment,
    endCatchment,
    juncCatchment,
    endGutter,
    juncGutter,
    endPipe,
    juncPipe,
    rain,
    slopeRatio
  };
}

// ── CONFIDENCE INTELLIGENCE ENGINE (Master Spec Section 26) ────
export function calculateConfidenceCheck({
  category = 'Simply Supported',
  subType = 'Type A',
  area = 1500,
  distance = 25,
  estimatorValues = {}
}) {
  const benchmarks = {
    'Labour': { median: 26, unit: '₹/kg' },
    'Transportation': { median: Math.max(2500, distance * 45), unit: '₹' },
    'Crane / Equipment': { median: 12000, unit: '₹' },
    'Work Expenses': { median: Math.max(5000, area * 1.5), unit: '₹' },
    'Structural ₹/kg': { median: 85, unit: '₹/kg' },
    'Roofing ₹/sq.ft': { median: 68, unit: '₹/sq.ft' },
    'Wastage %': { median: 3.5, unit: '%' }
  };

  const results = {};
  const scores = [];

  Object.entries(benchmarks).forEach(([key, bench]) => {
    const val = Number(estimatorValues[key]) || 0;
    if (val <= 0) {
      results[key] = {
        value: val,
        median: bench.median,
        unit: bench.unit,
        status: 'Enter value first',
        badge: 'default',
        action: '—'
      };
      return;
    }

    const deviation = Math.abs(val - bench.median) / bench.median;
    const confidence = Math.max(0, 100 - deviation * 100);
    scores.push(confidence);

    let status = `${confidence.toFixed(1)}% High Confidence`;
    let badge = 'success';
    let action = 'Proceed';

    if (deviation >= 0.25) {
      status = `${confidence.toFixed(1)}% Review Needed`;
      badge = 'error';
      action = 'Manager Review';
    } else if (confidence >= 95) {
      status = `${confidence.toFixed(1)}% High Confidence`;
      badge = 'success';
      action = 'Proceed';
    } else if (confidence >= 90) {
      status = `${confidence.toFixed(1)}% Good Confidence`;
      badge = 'processing';
      action = 'Proceed / Normal Review';
    } else {
      status = `${confidence.toFixed(1)}% Recheck Recommended`;
      badge = 'warning';
      action = 'Recheck estimator value';
    }

    results[key] = {
      value: val,
      median: bench.median,
      unit: bench.unit,
      confidence: confidence.toFixed(1),
      status,
      badge,
      action
    };
  });

  const overallScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
  let overallAction = 'Insufficient Data';
  let overallBadge = 'default';

  if (overallScore) {
    if (overallScore >= 95) {
      overallAction = 'High Confidence';
      overallBadge = 'success';
    } else if (overallScore >= 90) {
      overallAction = 'Good Confidence';
      overallBadge = 'processing';
    } else if (overallScore >= 75) {
      overallAction = 'Recheck Recommended';
      overallBadge = 'warning';
    } else {
      overallAction = 'Manager Review Required';
      overallBadge = 'error';
    }
  }

  return {
    components: results,
    overallScore,
    overallAction,
    overallBadge
  };
}
