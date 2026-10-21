import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Form,
  InputNumber,
  Select,
  Radio,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Space,
  Tag,
  Divider,
  Descriptions,
  message,
  Modal,
  Table
} from 'antd';
import {
  CalculatorOutlined,
  SaveOutlined,
  PrinterOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  CompassOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  autoEngineering,
  calculateEstimateCosts,
  DEFAULT_RATES
} from '../../utils/engineeringEngine';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const ENGINEERING_MODELS = [
  { key: 'Normal Cantilever', label: 'MODEL 1: Normal Cantilever' },
  { key: 'Auditorium', label: 'MODEL 2: Auditorium' },
  { key: 'PEB Cantilever', label: 'MODEL 3: PEB Cantilever' },
  { key: 'Type 2 Cantilever', label: 'MODEL 4: Type 2 Cantilever' },
  { key: 'Simply Supported', label: 'MODEL 5: Simply Supported' }
];

const EstimationPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const enquiryIdFromQuery = searchParams.get('enquiryId');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [form] = Form.useForm();
  const printRef = useRef(null);

  // Core State
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [estimateId, setEstimateId] = useState(id || null);
  const [savedStatus, setSavedStatus] = useState('draft');
  const [saving, setSaving] = useState(false);

  // Calculation State
  const [calcResults, setCalcResults] = useState(null);
  const [costs, setCosts] = useState(null);
  const [activeRates, setActiveRates] = useState(DEFAULT_RATES);

  // Load modal state
  const [loadModalVisible, setLoadModalVisible] = useState(false);
  const [savedEstimatesList, setSavedEstimatesList] = useState([]);
  const [loadingSavedList, setLoadingSavedList] = useState(false);

  // Print hook
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `iRoof_Estimate_${estimateId || 'Draft'}`
  });

  // ──────────────────────────────────────────
  // FETCH ENQUIRIES & RATES
  // ──────────────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [enqRes, ratesRes] = await Promise.all([
          api.get('/enquiries'),
          api.get('/admin/rates').catch(() => ({ data: { rates: [] } }))
        ]);

        if (enqRes.data && enqRes.data.enquiries) {
          setEnquiries(enqRes.data.enquiries);

          if (enquiryIdFromQuery) {
            const found = enqRes.data.enquiries.find((e) => e._id === enquiryIdFromQuery);
            if (found) {
              setSelectedEnquiry(found);
              form.setFieldsValue({ enquiryId: found._id });
            }
          }
        }

        if (ratesRes.data && ratesRes.data.rates && ratesRes.data.rates.length > 0) {
          const mappedRates = { ...DEFAULT_RATES };
          ratesRes.data.rates.forEach((item) => {
            if (item.category === 'labour') mappedRates.structLabRate = item.rate;
            if (item.category === 'welding') mappedRates.structConRate = item.rate;
            if (item.category === 'sheeting') mappedRates.sheetRate = item.rate;
          });
          setActiveRates(mappedRates);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    fetchInitialData();
  }, [enquiryIdFromQuery, form]);

  // ──────────────────────────────────────────
  // LOAD EXISTING ESTIMATE IF ID IN URL
  // ──────────────────────────────────────────
  const loadEstimateById = useCallback(async (loadId) => {
    try {
      const response = await api.get(`/estimates/${loadId}`);
      if (response.data && response.data.estimate) {
        const est = response.data.estimate;
        setEstimateId(est._id);
        setSavedStatus(est.status || 'draft');

        const inputs = est.inputData || {};
        form.setFieldsValue({
          enquiryId: est.enquiryId?._id || est.enquiryId,
          model: est.model || 'Normal Cantilever',
          angleMode: inputs.angleMode || 'Without Angle',
          span: inputs.span,
          length: inputs.length,
          height: inputs.height,
          distance: inputs.distance
        });

        if (est.enquiryId) {
          setSelectedEnquiry(typeof est.enquiryId === 'object' ? est.enquiryId : null);
        }

        setCalcResults(est.results);
        setCosts(est.results?.costs || calculateEstimateCosts(est.results, est.inputData?.rates || activeRates));
        message.success('Estimate loaded successfully');
      }
    } catch (err) {
      console.error('Failed to load estimate:', err);
      message.error(err.response?.data?.message || 'Failed to load estimate document');
    }
  }, [form, activeRates]);

  useEffect(() => {
    if (id) {
      loadEstimateById(id);
    }
  }, [id, loadEstimateById]);

  // ──────────────────────────────────────────
  // CALCULATION LOGIC
  // ──────────────────────────────────────────
  const runCalculation = useCallback(() => {
    const values = form.getFieldsValue();
    const { model, span, length, height, distance, angleMode } = values;

    if (!model || !span || !length) {
      return;
    }

    const res = autoEngineering(
      model,
      Number(span),
      Number(length),
      Number(height || 0),
      Number(distance || 0),
      angleMode
    );

    setCalcResults(res);

    if (res && !res.error) {
      const calculatedCosts = calculateEstimateCosts(res, activeRates);
      setCosts(calculatedCosts);
    } else {
      setCosts(null);
    }
  }, [form, activeRates]);

  const handleEnquiryChange = (enqId) => {
    const found = enquiries.find((e) => e._id === enqId);
    setSelectedEnquiry(found || null);
    if (found && found.roofType) {
      const matched = ENGINEERING_MODELS.find((m) =>
        found.roofType.toLowerCase().includes(m.key.toLowerCase())
      );
      if (matched) {
        form.setFieldsValue({ model: matched.key });
      }
    }
  };

  // ──────────────────────────────────────────
  // SAVE ESTIMATE HANDLER
  // ──────────────────────────────────────────
  const handleSaveEstimate = async () => {
    if (!calcResults || calcResults.error) {
      message.warning('Please complete valid inputs and calculate before saving');
      return;
    }

    setSaving(true);
    const formVals = form.getFieldsValue();

    const payload = {
      enquiryId: formVals.enquiryId || undefined,
      model: formVals.model,
      inputData: {
        span: Number(formVals.span),
        length: Number(formVals.length),
        height: Number(formVals.height || 0),
        distance: Number(formVals.distance || 0),
        angleMode: formVals.angleMode || 'Without Angle',
        rates: activeRates
      },
      results: {
        ...calcResults,
        costs
      },
      status: savedStatus
    };

    try {
      if (estimateId) {
        await api.put(`/estimates/${estimateId}`, payload);
        message.success('Estimate updated successfully');
      } else {
        const response = await api.post('/estimates', payload);
        const newId = response.data?.estimate?._id;
        setEstimateId(newId);
        message.success('Estimate saved successfully to MongoDB Atlas');
        navigate(`/sales/estimates/${newId}`, { replace: true });
      }
    } catch (err) {
      console.error('Save estimate error:', err);
      message.error(err.response?.data?.message || 'Failed to save estimate');
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────────────
  // OPEN LOAD ESTIMATES MODAL
  // ──────────────────────────────────────────
  const handleOpenLoadModal = async () => {
    setLoadingSavedList(true);
    setLoadModalVisible(true);
    try {
      const response = await api.get('/estimates');
      if (response.data && response.data.estimates) {
        setSavedEstimatesList(response.data.estimates);
      }
    } catch (err) {
      console.error('Error fetching estimates list:', err);
      message.error('Failed to load estimates directory');
    } finally {
      setLoadingSavedList(false);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* ── HEADER ROW ── */}
      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: 20,
          background: 'linear-gradient(to right, #ffffff, #f8fafc)'
        }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 22
                }}
              >
                <CalculatorOutlined />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                  Estimation Engine
                </Title>
                <Text type="secondary">
                  5 Engineering Structural Models (v60 Mathematical Core)
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button icon={<FolderOpenOutlined />} onClick={handleOpenLoadModal}>
                Load Estimate
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                disabled={!calcResults || !!calcResults.error}
              >
                Print / PDF Quote
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSaveEstimate}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  borderColor: '#059669'
                }}
              >
                {estimateId ? 'Update Estimate' : 'Save Estimate'}
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {/* METADATA BAR */}
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>ESTIMATE REF</Text>
            <Text strong style={{ fontSize: 13, color: '#1e293b' }}>
              {estimateId ? `EST-${estimateId.slice(-6).toUpperCase()}` : 'NEW DRAFT'}
            </Text>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>PREPARED BY</Text>
            <Text strong style={{ fontSize: 13 }}>{user?.name || 'Sales Staff'}</Text>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>DATE</Text>
            <Text strong style={{ fontSize: 13 }}>{new Date().toLocaleDateString('en-IN')}</Text>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>CLIENT ACCOUNT</Text>
            <Tag color={selectedEnquiry ? 'blue' : 'default'} style={{ fontSize: 12 }}>
              {selectedEnquiry?.clientName || 'Not Linked to Enquiry'}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* ── INPUT FORM & MODEL SELECTOR ── */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          model: 'Normal Cantilever',
          angleMode: 'Without Angle',
          span: 6,
          length: 12,
          height: 1.5,
          distance: 25
        }}
        onValuesChange={runCalculation}
      >
        <Card
          bordered={false}
          style={{
            borderRadius: 14,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            marginBottom: 20
          }}
        >
          <Row gutter={[20, 16]}>
            {/* LINK ENQUIRY */}
            <Col xs={24} md={12}>
              <Form.Item name="enquiryId" label={<span style={{ fontWeight: 600 }}>Link Client Enquiry</span>}>
                <Select
                  placeholder="Select client enquiry (optional)"
                  allowClear
                  onChange={handleEnquiryChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {enquiries.map((enq) => (
                    <Option key={enq._id} value={enq._id}>
                      {enq.clientName} ({enq.phone}) — {enq.roofType || 'Enquiry'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* MODEL SELECTOR */}
            <Col xs={24} md={12}>
              <Form.Item
                name="model"
                label={<span style={{ fontWeight: 600 }}>Engineering Structural Model</span>}
                rules={[{ required: true, message: 'Please select a model' }]}
              >
                <Select onChange={runCalculation}>
                  {ENGINEERING_MODELS.map((m) => (
                    <Option key={m.key} value={m.key}>
                      {m.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="span"
                label="Clear Span (m)"
                tooltip="Width/Span of the roof structure in meters"
                rules={[{ required: true, message: 'Enter span' }]}
              >
                <InputNumber
                  min={1}
                  max={60}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder="e.g. 6.0"
                  suffix="m"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="length"
                label="Roof Length (m)"
                tooltip="Total length along the shed in meters"
                rules={[{ required: true, message: 'Enter length' }]}
              >
                <InputNumber
                  min={1}
                  max={200}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder="e.g. 15.0"
                  suffix="m"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="height"
                label="Projection / Side Height (m)"
                tooltip="Cantilever height (Max 3.0m for Cantilever models)"
              >
                <InputNumber
                  min={0}
                  max={12}
                  step={0.25}
                  style={{ width: '100%' }}
                  placeholder="e.g. 1.5"
                  suffix="m"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="distance"
                label="Transportation Distance (km)"
                tooltip="Distance from plant to erection site"
              >
                <InputNumber
                  min={0}
                  max={1000}
                  step={5}
                  style={{ width: '100%' }}
                  placeholder="e.g. 25"
                  suffix="km"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[20, 16]} align="middle">
            <Col xs={24} sm={12}>
              <Form.Item name="angleMode" label="Structural Bracing Mode" style={{ marginBottom: 0 }}>
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="Without Angle">Without Angle</Radio.Button>
                  <Radio.Button value="With Angle">With Angle</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={runCalculation}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderColor: '#2563eb',
                  fontWeight: 600
                }}
              >
                Compute Engineering
              </Button>
            </Col>
          </Row>
        </Card>
      </Form>

      {/* ── ERROR ALERT BANNER ── */}
      {calcResults?.error === 'Out of Equation' && (
        <Alert
          message="Engineering Constraint Error: Out of Equation"
          description={calcResults.reason}
          type="error"
          showIcon
          style={{ marginBottom: 20, borderRadius: 10, border: '1px solid #f87171' }}
        />
      )}

      {/* ── RESULTS SECTION (STATISTIC CARDS) ── */}
      {calcResults && !calcResults.error && (
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            Derived Engineering Geometry & Specifications
          </Title>

          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <Statistic
                  title="Profile Cover"
                  value={Math.round((calcResults.cover || 0) * 1000)}
                  suffix="mm"
                  valueStyle={{ color: '#2563eb', fontWeight: 700 }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <Statistic
                  title="Thickness"
                  value={calcResults.th}
                  suffix="mm BMT"
                  valueStyle={{ color: '#059669', fontWeight: 700 }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <Statistic
                  title="Centre Rise"
                  value={Number(calcResults.rise || 0).toFixed(2)}
                  suffix="m"
                  valueStyle={{ color: '#d97706', fontWeight: 700 }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <Statistic
                  title="Bays / Columns"
                  value={`${calcResults.bays}B / ${calcResults.ncol}C`}
                  valueStyle={{ color: '#7c3aed', fontWeight: 700 }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <Statistic
                  title="Total Panels"
                  value={calcResults.panels}
                  suffix="nos"
                  valueStyle={{ color: '#0284c7', fontWeight: 700 }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <Statistic
                  title="Effective Length"
                  value={Number(calcResults.eff || 0).toFixed(2)}
                  suffix="m"
                  valueStyle={{ color: '#475569', fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <Statistic
                  title="Arc Cut Length"
                  value={Number(calcResults.cut || 0).toFixed(3)}
                  suffix="m"
                  valueStyle={{ color: '#0f172a', fontWeight: 700 }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <Statistic
                  title="Final Cut Length"
                  value={Number(calcResults.finalCut || 0).toFixed(3)}
                  suffix="m"
                  valueStyle={{ color: '#0891b2', fontWeight: 700 }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#eff6ff' }}>
                <Statistic
                  title="Calculated Roof Area"
                  value={Number(calcResults.area || 0).toFixed(1)}
                  suffix="ft²"
                  valueStyle={{ color: '#1d4ed8', fontWeight: 800 }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 10, background: '#ecfdf5' }}>
                <Statistic
                  title="Total Sheet Weight"
                  value={Number(calcResults.sheetKg || 0).toFixed(1)}
                  suffix="kg"
                  valueStyle={{ color: '#047857', fontWeight: 800 }}
                />
              </Card>
            </Col>
          </Row>

          {/* ── COST SUMMARY ── */}
          {costs && (
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: 24,
                background: '#ffffff'
              }}
            >
              <Title level={4} style={{ margin: '0 0 16px 0' }}>
                Financial Cost & Commercial Quotation
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={14}>
                  <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Sheet Material Cost">
                      ₹{costs.sheetCost.toLocaleString('en-IN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Structural Labour Cost">
                      ₹{costs.labourCost.toLocaleString('en-IN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Consumables & Hardware">
                      ₹{costs.consumables.toLocaleString('en-IN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Before GST">
                      <Text strong style={{ fontSize: 16 }}>
                        ₹{costs.beforeGst.toLocaleString('en-IN')}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="GST (18%)">
                      ₹{costs.gst.toLocaleString('en-IN')}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                <Col xs={24} md={10}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #0b315d, #123b91)',
                      borderRadius: 16,
                      padding: '24px 20px',
                      color: '#ffffff',
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>
                      Grand Total (All-Inclusive)
                    </Text>
                    <div style={{ fontSize: 36, fontWeight: 800, margin: '8px 0', color: '#ffffff' }}>
                      ₹{costs.grandTotal.toLocaleString('en-IN')}
                    </div>
                    <Text style={{ color: '#cbd5e1', fontSize: 13 }}>
                      ₹{(costs.grandTotal / (calcResults.area || 1)).toFixed(2)} per ft² (incl. GST)
                    </Text>
                    <div style={{ marginTop: 16 }}>
                      <Tag color="gold" style={{ padding: '4px 12px', fontSize: 12 }}>
                        GST 18% Compliant
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </div>
      )}

      {/* ── PRINTABLE QUOTATION CONTAINER (Hidden on Screen, visible on print) ── */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} style={{ padding: '30px', fontFamily: 'Arial, sans-serif', color: '#0f172a' }}>
          <div style={{ borderBottom: '3px solid #0b315d', paddingBottom: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, color: '#0b315d', fontSize: 26, fontWeight: 800 }}>
                  I ROOFING ENTERPRISES
                </h1>
                <p style={{ margin: '4px 0', color: '#64748b', fontSize: 12 }}>
                  Roofing Business Management System | Kerala, India
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, color: '#059669', fontSize: 18 }}>FORMAL ESTIMATE</h3>
                <p style={{ margin: '4px 0', fontSize: 12 }}>
                  Ref: {estimateId ? `EST-${estimateId.slice(-6).toUpperCase()}` : 'DRAFT'}
                </p>
                <p style={{ margin: 0, fontSize: 12 }}>Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          <table style={{ width: '100%', marginBottom: 24, fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', verticalAlign: 'top' }}>
                  <strong>Client Details:</strong>
                  <br />
                  {selectedEnquiry?.clientName || 'Valued Customer'}
                  <br />
                  Phone: {selectedEnquiry?.phone || '—'}
                  <br />
                  Address: {selectedEnquiry?.address || 'Site Location'}
                </td>
                <td style={{ width: '50%', verticalAlign: 'top' }}>
                  <strong>Engineering Specifications:</strong>
                  <br />
                  Model: {calcResults?.type || 'Standard'}
                  <br />
                  Span: {calcResults?.span}m | Length: {calcResults?.length}m | Height: {calcResults?.height}m
                  <br />
                  Roof Area: {calcResults?.area?.toFixed(1)} ft²
                </td>
              </tr>
            </tbody>
          </table>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>Item Description</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>Qty / Spec</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>
                  Roofing Sheets ({calcResults?.th}mm BMT, {Math.round((calcResults?.cover || 0) * 1000)}mm Profile)
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>
                  {calcResults?.panels} panels ({calcResults?.finalCut?.toFixed(2)}m)
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>
                  ₹{costs?.sheetCost.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>
                  Structural Steel Labour & Fabrication ({calcResults?.bays} bays, {calcResults?.ncol} columns)
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>
                  {calcResults?.sheetKg?.toFixed(1)} kg
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>
                  ₹{costs?.labourCost.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>
                  Consumables, Hardware & Sealants
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>Standard Set</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>
                  ₹{costs?.consumables.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>
                  Subtotal (Before GST):
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>
                  ₹{costs?.beforeGst.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>
                  Goods & Services Tax (GST 18%):
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>
                  ₹{costs?.gst.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr style={{ background: '#0b315d', color: '#ffffff', fontWeight: 800, fontSize: 16 }}>
                <td colSpan={2} style={{ border: '1px solid #0b315d', padding: '10px', textAlign: 'right' }}>
                  Grand Total:
                </td>
                <td style={{ border: '1px solid #0b315d', padding: '10px', textAlign: 'right' }}>
                  ₹{costs?.grandTotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 40, borderTop: '1px solid #e2e8f0', paddingTop: 16, fontSize: 11, color: '#64748b' }}>
            <p>1. Estimate valid for 15 days from date of issuance.</p>
            <p>2. Subject to site verification and final structural approval.</p>
            <p>Prepared by I Roofing Enterprises (Auxzon Solutions System)</p>
          </div>
        </div>
      </div>

      {/* ── LOAD ESTIMATE MODAL ── */}
      <Modal
        title="Load Saved Estimate"
        open={loadModalVisible}
        onCancel={() => setLoadModalVisible(false)}
        footer={null}
        width={750}
        destroyOnClose
      >
        <Table
          dataSource={savedEstimatesList}
          rowKey="_id"
          loading={loadingSavedList}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: 'Ref',
              dataIndex: '_id',
              key: 'id',
              render: (id) => <Text code>EST-{id.slice(-6).toUpperCase()}</Text>
            },
            {
              title: 'Client',
              key: 'client',
              render: (_, r) => r.enquiryId?.clientName || 'General Estimate'
            },
            {
              title: 'Model',
              dataIndex: 'model',
              key: 'model',
              render: (m) => <Tag color="blue">{m}</Tag>
            },
            {
              title: 'Total',
              key: 'total',
              render: (_, r) => {
                const total = r.results?.costs?.grandTotal || r.results?.costs?.beforeGst || 0;
                return <Text strong>₹{Number(total).toLocaleString('en-IN')}</Text>;
              }
            },
            {
              title: 'Action',
              key: 'act',
              align: 'right',
              render: (_, r) => (
                <Button
                  type="primary"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  onClick={() => {
                    setLoadModalVisible(false);
                    navigate(`/sales/estimates/${r._id}`);
                  }}
                >
                  Load
                </Button>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default EstimationPage;
