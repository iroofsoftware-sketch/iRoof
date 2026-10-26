import React, { useState } from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

export const StatusDonutChart = ({
  title = 'Work Order Distribution',
  subtitle = 'Active lifecycle breakdown',
  centerLabel = 'Total Orders',
  segments = [
    { label: 'Active / In-Progress', count: 12, color: '#0b2e59' },
    { label: 'Completed', count: 18, color: '#15803d' },
    { label: 'On Hold', count: 4, color: '#d97706' },
    { label: 'Draft', count: 6, color: '#64748b' }
  ]
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const total = segments.reduce((sum, s) => sum + (s.count || 0), 0);
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <Card
      styles={{ body: { padding: '20px 22px' } }}
      style={{
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
        height: '100%'
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{subtitle}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: 'rotate(-90deg)', width: size, height: size }}
          >
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((seg, i) => {
              const pct = total ? seg.count / total : 0;
              const dashLength = pct * circumference;
              const dashOffset = (1 - accumulatedPercent) * circumference;
              accumulatedPercent += pct;

              const isHovered = hoverIndex === i;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {hoverIndex !== null && segments[hoverIndex]
                ? segments[hoverIndex].count
                : total}
            </div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: 3 }}>
              {hoverIndex !== null && segments[hoverIndex]
                ? segments[hoverIndex].label
                : centerLabel}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {segments.map((seg, i) => {
            const pct = total ? Math.round((seg.count / total) * 100) : 0;
            const isHovered = hoverIndex === i;

            return (
              <div
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: isHovered ? '#f8fafc' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: seg.color
                    }}
                  />
                  <Text style={{ fontSize: 12, color: isHovered ? '#0f172a' : '#475569', fontWeight: isHovered ? 600 : 500 }}>
                    {seg.label}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{pct}%</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', minWidth: 20, textAlign: 'right' }}>
                    {seg.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default StatusDonutChart;
