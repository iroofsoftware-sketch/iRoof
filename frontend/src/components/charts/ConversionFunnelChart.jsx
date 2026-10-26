import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

export const ConversionFunnelChart = ({
  title = 'Sales Conversion Pipeline',
  subtitle = 'Opportunity progression across CRM engineering milestones',
  stages = [
    { label: 'New Enquiries', count: 48, color: '#0b2e59' },
    { label: 'Site Visits', count: 34, color: '#1d4ed8' },
    { label: 'Estimates Quoted', count: 26, color: '#0284c7' },
    { label: 'Work Orders Won', count: 18, color: '#c9940a' },
    { label: 'Completed / Handover', count: 14, color: '#15803d' }
  ]
}) => {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const initialCount = stages[0]?.count || 1;
  const overallConversion = Math.round(((stages[stages.length - 1]?.count || 0) / initialCount) * 100);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{subtitle}</div>
        </div>
        <div
          style={{
            textAlign: 'right',
            padding: '4px 10px',
            background: '#eff6ff',
            borderRadius: 6,
            border: '1px solid #bfdbfe'
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: '#1e40af', textTransform: 'uppercase' }}>
            Win Rate
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>
            {overallConversion}%
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        {stages.map((stage, idx) => {
          const widthPct = Math.max(15, Math.round((stage.count / maxCount) * 100));
          const stepConv = idx === 0 ? 100 : Math.round((stage.count / (stages[idx - 1]?.count || 1)) * 100);

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: stage.color
                    }}
                  />
                  <Text strong style={{ color: '#1e293b' }}>
                    {stage.label}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {idx > 0 && `${stepConv}% conv`}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#0f172a',
                      minWidth: 28,
                      textAlign: 'right'
                    }}
                  >
                    {stage.count}
                  </span>
                </div>
              </div>

              {/* Progress bar with smooth gradient */}
              <div
                style={{
                  height: 10,
                  width: '100%',
                  background: '#f1f5f9',
                  borderRadius: 5,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${stage.color}cc 0%, ${stage.color} 100%)`,
                    borderRadius: 5,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ConversionFunnelChart;
