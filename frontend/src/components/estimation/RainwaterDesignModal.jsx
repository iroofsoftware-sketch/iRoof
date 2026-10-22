import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Table, Tag, Button, Alert, Divider } from 'antd';
import { CloudDownloadOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { calculateRainwaterDrainage } from '../../utils/engineeringEngine';

const RainwaterDesignModal = ({ visible, onClose, initialDimensions, onAdopt }) => {
  const [form] = Form.useForm();
  const [drainageResults, setDrainageResults] = useState(null);

  useEffect(() => {
    if (visible) {
      const initVals = {
        state: 'Kerala',
        district: 'Ernakulam',
        spans: 1,
        span: initialDimensions?.span || 12,
        rise: initialDimensions?.rise || 2,
        length: initialDimensions?.length || 20,
        slopeRatio: 150,
        endDrops: 2,
        juncDrops: 2,
        rain: 100,
        runoff: 1.0,
        safety: 1.25
      };
      form.setFieldsValue(initVals);
      const res = calculateRainwaterDrainage(initVals);
      setDrainageResults(res);
    }
  }, [visible, initialDimensions, form]);

  const handleValuesChange = (_, allVals) => {
    const res = calculateRainwaterDrainage(allVals);
    setDrainageResults(res);
  };

  const handleAdopt = () => {
    if (onAdopt && drainageResults) {
      onAdopt({
        gutterBase: drainageResults.endGutter?.base,
        gutterDepth: drainageResults.endGutter?.depth?.toFixed(1),
        pipeDia: drainageResults.endPipe?.std,
        flowLs: drainageResults.endGutter?.flow?.toFixed(2)
      });
    }
    onClose();
  };

  const tableData = drainageResults && !drainageResults.error ? [
    {
      key: '1',
      metric: 'Gutter Quantity',
      end: drainageResults.endGutter.qty,
      junc: drainageResults.juncGutter.qty
    },
    {
      key: '2',
      metric: 'Catchment Area / Gutter',
      end: `${drainageResults.endCatchment.toFixed(2)} m²`,
      junc: `${drainageResults.juncCatchment.toFixed(2)} m²`
    },
    {
      key: '3',
      metric: 'Design Flow Q',
      end: `${drainageResults.endGutter.flow.toFixed(3)} L/s`,
      junc: `${drainageResults.juncGutter.flow.toFixed(3)} L/s`
    },
    {
      key: '4',
      metric: 'Downpipe Drops per Gutter',
      end: drainageResults.endGutter.drops,
      junc: drainageResults.juncGutter.drops
    },
    {
      key: '5',
      metric: 'Flow per Drop Q/drop',
      end: `${drainageResults.endGutter.flowPerDrop.toFixed(3)} L/s`,
      junc: `${drainageResults.juncGutter.flowPerDrop.toFixed(3)} L/s`
    },
    {
      key: '6',
      metric: 'Suggested Gutter Base Width',
      end: `${drainageResults.endGutter.base} mm`,
      junc: `${drainageResults.juncGutter.base} mm`
    },
    {
      key: '7',
      metric: 'Required Overall Depth',
      end: `${drainageResults.endGutter.depth.toFixed(1)} mm`,
      junc: `${drainageResults.juncGutter.depth.toFixed(1)} mm`
    },
    {
      key: '8',
      metric: 'Calculated Minimum Pipe ID',
      end: `${drainageResults.endPipe.id.toFixed(1)} mm`,
      junc: `${drainageResults.juncPipe.id.toFixed(1)} mm`
    },
    {
      key: '9',
      metric: 'Suggested Standard Pipe ID',
      end: `${drainageResults.endPipe.std} mm`,
      junc: `${drainageResults.juncPipe.std} mm`
    },
    {
      key: '10',
      metric: 'Hydraulic Feasibility Status',
      end: (
        <Tag color={drainageResults.endGutter.status === 'OK' ? 'success' : 'error'}>
          {drainageResults.endGutter.status}
        </Tag>
      ),
      junc: (
        <Tag color={drainageResults.juncGutter.status === 'OK' ? 'success' : 'error'}>
          {drainageResults.juncGutter.status}
        </Tag>
      )
    }
  ] : [];

  const columns = [
    { title: 'Hydraulic Parameter', dataIndex: 'metric', key: 'metric', width: '40%' },
    { title: 'END Gutter (Eaves)', dataIndex: 'end', key: 'end', align: 'right' },
    { title: 'JUNCTION Gutter (Valley)', dataIndex: 'junc', key: 'junc', align: 'right' }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloudDownloadOutlined style={{ color: '#0b315d', fontSize: 20 }} />
          <span>Rainwater Gutter &amp; Downpipe Hydraulic Design (Master Spec Section 25)</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="adopt"
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleAdopt}
          style={{ background: '#0b315d', borderColor: '#0b315d' }}
        >
          Adopt Gutter &amp; Pipe Specs to Estimate
        </Button>
      ]}
    >
      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="Manning Formula Hydraulic Screening"
        description="Drainage catchment uses horizontal projected roof area. Standard Manning roughness n=0.013, freeboard 20%, maximum gutter depth 250mm. Standard pipe sizes: 75, 90, 110, 125, 140, 160, 200 mm."
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Row gutter={[16, 12]}>
          <Col xs={12} sm={6}>
            <Form.Item name="state" label="State" style={{ marginBottom: 8 }}>
              <Input placeholder="Kerala" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="district" label="District" style={{ marginBottom: 8 }}>
              <Input placeholder="Ernakulam" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="spans" label="Equal Arch Spans" style={{ marginBottom: 8 }}>
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="slopeRatio" label="Gutter Slope (1:X)" style={{ marginBottom: 8 }}>
              <InputNumber min={50} max={500} style={{ width: '100%' }} placeholder="150" />
            </Form.Item>
          </Col>

          <Col xs={12} sm={6}>
            <Form.Item name="span" label="Span Width (m)" style={{ marginBottom: 8 }}>
              <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="rise" label="Centre Rise (m)" style={{ marginBottom: 8 }}>
              <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="length" label="Roof Length (m)" style={{ marginBottom: 8 }}>
              <InputNumber min={1} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="rain" label="Rainfall (mm/hr)" style={{ marginBottom: 8 }}>
              <InputNumber min={10} max={300} style={{ width: '100%' }} placeholder="100" />
            </Form.Item>
          </Col>

          <Col xs={12} sm={6}>
            <Form.Item name="endDrops" label="Drops / End Gutter" style={{ marginBottom: 8 }}>
              <InputNumber min={1} max={12} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="juncDrops" label="Drops / Junc Gutter" style={{ marginBottom: 8 }}>
              <InputNumber min={1} max={12} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="runoff" label="Runoff Coeff" style={{ marginBottom: 8 }}>
              <InputNumber min={0.5} max={1.0} step={0.05} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="safety" label="Safety Factor" style={{ marginBottom: 8 }}>
              <InputNumber min={1.0} max={2.0} step={0.05} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Divider style={{ margin: '16px 0 12px' }} />

      {drainageResults && !drainageResults.error ? (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
            <Tag color="blue">Total Projected Catchment: {drainageResults.totalPlanCatchment?.toFixed(1)} m²</Tag>
            <Tag color="cyan">Arch Radius: {drainageResults.radius?.toFixed(2)} m</Tag>
            <Tag color="purple">Curved Sheet Length: {drainageResults.arcLen?.toFixed(2)} m</Tag>
            <Tag color="geekblue">Design Rain Intensity: {drainageResults.rain} mm/hr</Tag>
          </div>

          <Table
            dataSource={tableData}
            columns={columns}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      ) : (
        <Alert type="warning" message="Please enter positive values for span, rise, and length to calculate drainage." />
      )}
    </Modal>
  );
};

export default RainwaterDesignModal;
