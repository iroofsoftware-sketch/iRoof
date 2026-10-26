import React, { useState } from 'react';
import { Card, Space, Typography } from 'antd';

const { Text } = Typography;

const formatINR = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

export const RevenueAreaChart = ({
  title = 'Commercial Cashflow & Revenue Velocity',
  subtitle = 'Monthly comparison of billed contracts vs cash collected',
  data: propData
}) => {
  const defaultMonths = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const data = (propData && propData.length > 0)
    ? propData
    : defaultMonths.map((m) => ({ month: m, billed: 0, collected: 0 }));

  const [hoverIndex, setHoverIndex] = useState(null);

  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allMax = Math.max(...data.map((d) => Math.max(d.billed || 0, d.collected || 0)), 0);
  const maxVal = allMax > 0 ? allMax * 1.15 : 100000;

  const getX = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (val) => padding.top + chartHeight - (val / maxVal) * chartHeight;

  // Build SVG smooth path strings
  const buildSmoothPath = (key) => {
    return data.reduce((acc, point, i) => {
      const x = getX(i);
      const y = getY(point[key] || 0);
      if (i === 0) return `M ${x} ${y}`;
      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1][key] || 0);
      const cx1 = prevX + (x - prevX) / 2;
      const cy1 = prevY;
      const cx2 = prevX + (x - prevX) / 2;
      const cy2 = y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`;
    }, '');
  };

  const billedPath = buildSmoothPath('billed');
  const collectedPath = buildSmoothPath('collected');

  const billedArea = `${billedPath} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;
  const collectedArea = `${collectedPath} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

  const totalBilled = data.reduce((s, d) => s + (d.billed || 0), 0);
  const totalCollected = data.reduce((s, d) => s + (d.collected || 0), 0);
  const collectionRate = totalBilled ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <Card
      styles={{ body: { padding: '20px 22px' } }}
      style={{
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15,23,42,0.03)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{subtitle}</div>
        </div>

        {/* Legend & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0b2e59' }} />
            <Text style={{ fontSize: 12, color: '#475569' }}>
              Billed: <strong style={{ color: '#0f172a' }}>{formatINR(totalBilled)}</strong>
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#c9940a' }} />
            <Text style={{ fontSize: 12, color: '#475569' }}>
              Collected: <strong style={{ color: '#0f172a' }}>{formatINR(totalCollected)}</strong>
            </Text>
          </div>
          <div
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0'
            }}
          >
            {collectionRate}% Realized
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div style={{ width: '100%', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b2e59" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0b2e59" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9940a" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#c9940a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartHeight * (1 - pct);
            const val = maxVal * pct;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={pct === 0 ? '0' : '4 4'}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {formatINR(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={billedArea} fill="url(#billedGrad)" />
          <path d={collectedArea} fill="url(#collectedGrad)" />

          {/* Lines */}
          <path
            d={billedPath}
            fill="none"
            stroke="#0b2e59"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d={collectedPath}
            fill="none"
            stroke="#c9940a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Data Points & Hover interaction */}
          {data.map((d, i) => {
            const x = getX(i);
            const yB = getY(d.billed || 0);
            const yC = getY(d.collected || 0);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Billed dot */}
                <circle
                  cx={x}
                  cy={yB}
                  r={isHovered ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#0b2e59"
                  strokeWidth="2"
                />

                {/* Collected dot */}
                <circle
                  cx={x}
                  cy={yC}
                  r={isHovered ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#c9940a"
                  strokeWidth="2"
                />

                {/* X axis labels */}
                <text
                  x={x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#0f172a' : '#64748b'}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {d.month}
                </text>

                {/* Invisible hover trigger area */}
                <rect
                  x={x - chartWidth / (data.length * 2)}
                  y={padding.top}
                  width={chartWidth / data.length}
                  height={chartHeight + padding.bottom}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: `${(getX(hoverIndex) / width) * 100}%`,
              transform: 'translateX(-50%)',
              background: '#081a36',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4, marginBottom: 4 }}>
              {data[hoverIndex].month} Performance
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ color: '#93c5fd' }}>Billed:</span>
              <strong>{formatINR(data[hoverIndex].billed)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
              <span style={{ color: '#fde047' }}>Collected:</span>
              <strong>{formatINR(data[hoverIndex].collected)}</strong>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RevenueAreaChart;
