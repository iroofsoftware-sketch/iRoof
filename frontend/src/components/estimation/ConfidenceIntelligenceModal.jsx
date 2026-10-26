import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Table, Tag, Button, Alert, Row, Col, Progress, Typography } from 'antd';
import { SafetyCertificateOutlined, CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { calculateConfidenceCheck } from '../../utils/engineeringEngine';

const { Text } = Typography;

const ConfidenceIntelligenceModal = ({ visible, onClose, category, area, distance }) => {
  const [form] = Form.useForm();
  const [checkResult, setCheckResult] = useState(null);

  useEffect(() => {
    if (visible) {
      const initVals = {
        'Labour': 26,
        'Transportation': Math.round(Math.max(2500, (distance || 25) * 45)),
        'Crane / Equipment': 12000,
        'Work Expenses': Math.round(Math.max(5000, (area || 1500) * 1.5)),
        'Structural ₹/kg': 85,
        'Roofing ₹/sq.ft': 68,
        'Wastage %': 3.5
      };
      form.setFieldsValue(initVals);
      const res = calculateConfidenceCheck({
        category: category || 'Simply Supported',
        area: area || 1500,
        distance: distance || 25,
        estimatorValues: initVals
      });
      setCheckResult(res);
    }
  }, [visible, category, area, distance, form]);

  const handleValuesChange = (_, allVals) => {
    const res = calculateConfidenceCheck({
      category: category || 'Simply Supported',
      area: area || 1500,
      distance: distance || 25,
      estimatorValues: allVals
    });
    setCheckResult(res);
  };

  const components = checkResult?.components || {};

  const tableData = Object.entries(components).map(([key, item], idx) => ({
    key: String(idx),
    component: key,
    enteredVal: `${item.value} ${item.unit}`,
    historicalRef: `${item.median} ${item.unit}`,
    confidence: item.confidence ? `${item.confidence}%` : '—',
    status: (
      <Tag color={item.badge}>
        {item.status}
      </Tag>
    ),
    action: item.action
  }));

  const columns = [
    { title: 'Cost Component', dataIndex: 'component', key: 'component', width: '25%' },
    { title: 'Estimator Entry', dataIndex: 'enteredVal', key: 'enteredVal', align: 'right' },
    { title: 'Historical Benchmark', dataIndex: 'historicalRef', key: 'historicalRef', align: 'right' },
    { title: 'Confidence', dataIndex: 'confidence', key: 'confidence', align: 'center' },
    { title: 'Evaluation', dataIndex: 'status', key: 'status', align: 'center' },
    { title: 'Recommended Action', dataIndex: 'action', key: 'action' }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateOutlined style={{ color: '#0b315d', fontSize: 20 }} />
          <span>Estimator Confidence Intelligence (Master Spec Section 26)</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ background: '#0b315d', borderColor: '#0b315d' }}>
          Done / Close Intelligence
        </Button>
      ]}
    >
      <Alert
        type="info"
        showIcon
        message="Blind Historical Confidence Protocol"
        description="Estimator enters proposed costing parameters without viewing targets in advance. The system verifies variance against verified completed project datasets. Large deviations (≥25%) require manager review before quote release."
        style={{ marginBottom: 16 }}
      />

      {checkResult && checkResult.overallScore && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #dde3ea',
            borderRadius: 8,
            padding: '16px 20px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Overall Project Estimation Confidence
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0b315d', marginTop: 4 }}>
              {checkResult.overallScore}% · {checkResult.overallAction}
            </div>
            <Progress
              percent={Number(checkResult.overallScore)}
              status={checkResult.overallBadge === 'error' ? 'exception' : 'active'}
              strokeColor={
                Number(checkResult.overallScore) >= 95
                  ? '#10b981'
                  : Number(checkResult.overallScore) >= 90
                  ? '#0284c7'
                  : Number(checkResult.overallScore) >= 75
                  ? '#f59e0b'
                  : '#ef4444'
              }
              style={{ marginTop: 8 }}
            />
          </div>
          <Tag
            color={checkResult.overallBadge}
            style={{ fontSize: 13, padding: '6px 12px', borderRadius: 6, fontWeight: 600 }}
          >
            {checkResult.overallAction.toUpperCase()}
          </Tag>
        </div>
      )}

      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Row gutter={[16, 8]}>
          <Col xs={12} sm={6}>
            <Form.Item name="Labour" label="Labour (₹/kg)">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="Transportation" label="Transport (₹)">
              <InputNumber min={0} step={500} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="Crane / Equipment" label="Crane (₹)">
              <InputNumber min={0} step={1000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="Work Expenses" label="Expenses (₹)">
              <InputNumber min={0} step={500} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="Structural ₹/kg" label="Structural (₹/kg)">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="Roofing ₹/sq.ft" label="Roofing (₹/sq.ft)">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="Wastage %" label="Wastage (%)">
              <InputNumber min={0} max={20} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        dataSource={tableData}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        style={{ marginTop: 12 }}
      />
    </Modal>
  );
};

export default ConfidenceIntelligenceModal;
