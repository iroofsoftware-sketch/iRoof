import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  DatePicker,
  Alert,
  Tag,
  Space,
  Modal,
  Table,
  Radio,
  Tooltip,
  message
} from 'antd';
import {
  ThunderboltOutlined,
  SaveOutlined,
  PrinterOutlined,
  FolderOpenOutlined,
  ArrowRightOutlined,
  RadiusUpleftOutlined,
  ColumnHeightOutlined,
  ForkOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  CloudDownloadOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  PictureOutlined,
  CheckOutlined,
  HomeOutlined,
  BankOutlined,
  CrownOutlined,
  ShopOutlined,
  TrophyOutlined,
  BranchesOutlined,
  BorderOuterOutlined,
  CloudOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  autoEngineering,
  calculateEstimateCosts,
  DEFAULT_RATES,
  BROCHURE_CATEGORIES
} from '../../utils/engineeringEngine';
import RainwaterDesignModal from '../../components/estimation/RainwaterDesignModal';
import ConfidenceIntelligenceModal from '../../components/estimation/ConfidenceIntelligenceModal';

const { Option } = Select;

const MODEL_CARDS = [
  {
    key: 'Normal Cantilever',
    name: 'Normal Cantilever',
    desc: 'Standard single cantilever',
    icon: <ArrowRightOutlined style={{ fontSize: 22 }} />
  },
  {
    key: 'Auditorium',
    name: 'Auditorium',
    desc: 'Curved arch profile',
    icon: <RadiusUpleftOutlined style={{ fontSize: 22 }} />
  },
  {
    key: 'PEB Cantilever',
    name: 'PEB Cantilever',
    desc: 'Pre-engineered structural',
    icon: <ColumnHeightOutlined style={{ fontSize: 22 }} />
  },
  {
    key: 'Type 2 Cantilever',
    name: 'Type 2 Cantilever',
    desc: 'Reverse slope cantilever',
    icon: <ForkOutlined style={{ fontSize: 22 }} />
  },
  {
    key: 'Simply Supported',
    name: 'Simply Supported',
    desc: 'Double column arch shed',
    icon: <MinusOutlined style={{ fontSize: 22 }} />
  }
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
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  // Selected Model & Category State (Master Spec Section 5)
  const [selectedCategory, setSelectedCategory] = useState(BROCHURE_CATEGORIES[0]);
  const [selectedModel, setSelectedModel] = useState(BROCHURE_CATEGORIES[0].modelKey);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [withAngle, setWithAngle] = useState(false);

  // Column & Beam Logic (Master Spec Section 11)
  const [columnType, setColumnType] = useState('Single'); // 'Single', 'Braced', 'Box'
  const [beamType, setBeamType] = useState('Standard');   // 'Standard', 'Braced', 'Box'

  // Modals for Master Spec Sections 25 & 26
  const [rainwaterModalVisible, setRainwaterModalVisible] = useState(false);
  const [confidenceModalVisible, setConfidenceModalVisible] = useState(false);
  const [drainageSpecs, setDrainageSpecs] = useState(null);

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
    documentTitle: `iRoof_Estimate_${estimateId ? estimateId.slice(-6).toUpperCase() : 'Draft'}`
  });

  // ──────────────────────────────────────────
  // FETCH ENQUIRIES & ACTIVE RATES
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
            if (item.category === 'sheeting' || item.category === 'sheet') mappedRates.sheetRate = item.rate;
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
  // CALCULATION LOGIC
  // ──────────────────────────────────────────
  const runCalculation = useCallback(() => {
    const values = form.getFieldsValue();
    const { span, length, height, distance } = values;

    if (!selectedModel || !span || !length) {
      return;
    }

    const angleMode = withAngle ? 'With Angle' : 'Without Angle';

    const res = autoEngineering(
      selectedModel,
      Number(span),
      Number(length),
      Number(height || 0),
      Number(distance || 0),
      angleMode,
      columnType,
      beamType
    );

    setCalcResults(res);

    if (res && !res.error) {
      const calculatedCosts = calculateEstimateCosts(res, activeRates);
      setCosts(calculatedCosts);
    } else {
      setCosts(null);
    }
  }, [form, selectedModel, withAngle, columnType, beamType, activeRates]);

  // Trigger calculation on first render once form has initial values
  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  // ──────────────────────────────────────────
  // LOAD EXISTING ESTIMATE BY ID
  // ──────────────────────────────────────────
  const loadEstimateById = useCallback(async (loadId) => {
    try {
      const response = await api.get(`/estimates/${loadId}`);
      if (response.data && response.data.estimate) {
        const est = response.data.estimate;
        setEstimateId(est._id);
        setSavedStatus(est.status || 'saved');
        setLastSavedTime(est.updatedAt ? new Date(est.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved');

        const inputs = est.inputData || {};
        const isWithAngle = inputs.angleMode === 'With Angle';
        setWithAngle(isWithAngle);
        setSelectedModel(est.model || 'Normal Cantilever');
        if (inputs.columnType) setColumnType(inputs.columnType);
        if (inputs.beamType) setBeamType(inputs.beamType);
        if (inputs.categoryName) {
          const foundCat = BROCHURE_CATEGORIES.find(
            (c) => c.name === inputs.categoryName && (inputs.subType ? c.subType === inputs.subType : true)
          );
          if (foundCat) setSelectedCategory(foundCat);
        }
        if (inputs.drainageSpecs) setDrainageSpecs(inputs.drainageSpecs);

        form.setFieldsValue({
          enquiryId: est.enquiryId?._id || est.enquiryId,
          estimateDate: dayjs(est.createdAt || undefined),
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

  // Handle Enquiry select change
  const handleEnquiryChange = (enqId) => {
    const found = enquiries.find((e) => e._id === enqId);
    setSelectedEnquiry(found || null);
    if (found && found.roofType) {
      const matchedCat = BROCHURE_CATEGORIES.find((c) =>
        found.roofType.toLowerCase().includes(c.name.toLowerCase()) ||
        found.roofType.toLowerCase().includes(c.modelKey.toLowerCase())
      );
      if (matchedCat) {
        setSelectedCategory(matchedCat);
        setSelectedModel(matchedCat.modelKey);
      }
    }
  };

  // ──────────────────────────────────────────
  // SAVE ESTIMATE
  // ──────────────────────────────────────────
  const handleSaveEstimate = async () => {
    if (!calcResults || calcResults.error) {
      message.warning('Please run a valid calculation before saving');
      return;
    }

    setSaving(true);
    const formVals = form.getFieldsValue();
    const angleMode = withAngle ? 'With Angle' : 'Without Angle';

    const payload = {
      enquiryId: formVals.enquiryId || undefined,
      model: selectedModel,
      inputData: {
        span: Number(formVals.span),
        length: Number(formVals.length),
        height: Number(formVals.height || 0),
        distance: Number(formVals.distance || 0),
        angleMode,
        columnType,
        beamType,
        categoryName: selectedCategory?.name || selectedModel,
        subType: selectedCategory?.subType || 'Standard',
        brochurePage: selectedCategory?.brochurePage || 'p10',
        drainageSpecs,
        rates: activeRates
      },
      results: {
        ...calcResults,
        costs
      },
      status: 'saved'
    };

    try {
      if (estimateId) {
        await api.put(`/estimates/${estimateId}`, payload);
        message.success('Estimate draft updated');
        setSavedStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        const response = await api.post('/estimates', payload);
        const newId = response.data?.estimate?._id;
        setEstimateId(newId);
        setSavedStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        message.success('Estimate saved to database');
        navigate(`/sales/estimates/${newId}`, { replace: true });
      }
    } catch (err) {
      console.error('Save estimate error:', err);
      message.error(err.response?.data?.message || 'Failed to save estimate');
    } finally {
      setSaving(false);
    }
  };

  // Load saved estimates modal
  const handleOpenLoadModal = async () => {
    setLoadingSavedList(true);
    setLoadModalVisible(true);
    try {
      const response = await api.get('/estimates');
      if (response.data && response.data.estimates) {
        setSavedEstimatesList(response.data.estimates);
      }
    } catch (err) {
      message.error('Failed to load estimates');
    } finally {
      setLoadingSavedList(false);
    }
  };

  // Approve estimate
  const handleApproveEstimate = async () => {
    let currentId = estimateId;
    if (!currentId) {
      message.warning('Please save this estimate before approving');
      return;
    }
    setApproving(true);
    try {
      await api.patch(`/estimates/${currentId}`, { status: 'approved' });
      setSavedStatus('approved');
      message.success('Estimate approved. Project Manager can now create a Work Order.');
    } catch (err) {
      console.error('Approve estimate error:', err);
      message.error(err.response?.data?.message || 'Failed to approve estimate');
    } finally {
      setApproving(false);
    }
  };

  const estimateRefString = estimateId ? `EST-${estimateId.slice(-6).toUpperCase()}` : 'EST-DRAFT';

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', paddingBottom: 24 }}>
      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Roof Estimation & Costing</h1>
          <p className="page-subtitle">Configure engineering specifications, structural members & commercial pricing</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="ref-badge">#{estimateRefString}</span>
          <Tag color={savedStatus === 'saved' ? 'success' : savedStatus === 'approved' ? 'green' : 'default'} style={{ borderRadius: 4, fontWeight: 600 }}>
            {savedStatus.toUpperCase()}
          </Tag>
        </div>
      </div>

      {/* ── SECTION 1: PROJECT DETAILS (.content-card) ── */}
      <div className="content-card">
        <div className="content-card__header">
          <span className="content-card__title">Project Details</span>
          <span className="ref-badge">
            #{estimateRefString}
          </span>
        </div>
        <div className="content-card__body">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              estimateDate: dayjs(),
              span: 6,
              length: 12,
              height: 1.5,
              distance: 25
            }}
            onValuesChange={runCalculation}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 20px' }}>
              <Form.Item name="enquiryId" label="Enquiry" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="Search and select enquiry..."
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  onChange={handleEnquiryChange}
                  style={{ width: '100%' }}
                >
                  {enquiries.map((enq) => (
                    <Option key={enq._id} value={enq._id}>
                      {enq.refNo ? `${enq.refNo} · ` : ''}{enq.clientName} ({enq.phone})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Customer" style={{ marginBottom: 0 }}>
                <Input
                  value={selectedEnquiry?.clientName || 'General / Walk-in Customer'}
                  readOnly
                  style={{ background: '#f8fafc', color: '#374151', cursor: 'default' }}
                />
              </Form.Item>

              <Form.Item name="estimateDate" label="Estimate Date" style={{ marginBottom: 0 }}>
                <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
              </Form.Item>

              <Form.Item label="Prepared By" style={{ marginBottom: 0 }}>
                <Input
                  value={user?.name || 'Sales Staff'}
                  readOnly
                  style={{ background: '#f8fafc', color: '#374151', cursor: 'default' }}
                />
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>

      {/* ── SECTION 2: 16 BROCHURE CATEGORIES & ENGINEERING (Master Spec Sections 5 & 11) ── */}
      <div className="content-card">
        <div className="content-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span className="content-card__title">Structure Category Gallery</span>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 10 }}>
              (16 Locked Brochure Categories · Master Spec Section 5)
            </span>
          </div>

          {/* Contextual Intelligence & Hydraulic Tools (Master Spec Sections 25 & 26) */}
          <Space size={8}>
            <Button
              size="small"
              icon={<CloudDownloadOutlined />}
              onClick={() => setRainwaterModalVisible(true)}
              style={{
                background: drainageSpecs ? '#e0f2fe' : '#ffffff',
                borderColor: drainageSpecs ? '#0284c7' : '#cbd5e1',
                color: drainageSpecs ? '#0369a1' : '#334155',
                fontWeight: 600
              }}
            >
              {drainageSpecs ? `Gutter ${drainageSpecs.gutterBase}mm (Adopted)` : 'Rainwater & Drainage'}
            </Button>

            <Button
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => setConfidenceModalVisible(true)}
              style={{
                borderColor: '#cbd5e1',
                color: '#334155',
                fontWeight: 600
              }}
            >
              Confidence Check
            </Button>
          </Space>
        </div>

        <div className="content-card__body">
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
            {[
              { key: 'all', label: 'All 16 Categories' },
              { key: 'Arch Shed', label: 'Arch Sheds (SS)' },
              { key: 'Cantilever', label: 'Cantilevers' },
              { key: 'PEB', label: 'PEB & Multi-Bay' },
              { key: 'Commercial', label: 'Commercial & Arena' },
              { key: 'Institutional', label: 'Institutional & Shrines' },
              { key: 'Residential', label: 'Residential & Bunker' }
            ].map((f) => {
              const active = categoryFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setCategoryFilter(f.key)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    border: `1px solid ${active ? '#0b315d' : '#e2e8f0'}`,
                    background: active ? '#0b315d' : '#f8fafc',
                    color: active ? '#ffffff' : '#475569',
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* 16 Locked Category Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: 10,
              maxHeight: 380,
              overflowY: 'auto',
              padding: '2px 4px 10px',
              marginBottom: 16
            }}
          >
            {BROCHURE_CATEGORIES.filter((c) => {
              if (categoryFilter === 'all') return true;
              if (categoryFilter === 'PEB' && (c.category === 'PEB' || c.category === 'Multi-Bay')) return true;
              if (categoryFilter === 'Residential' && (c.category === 'Residential' || c.category === 'Industrial')) return true;
              return c.category === categoryFilter;
            }).map((cat, idx) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedModel(cat.modelKey);
                    setTimeout(runCalculation, 0);
                  }}
                  style={{
                    border: `1.5px solid ${isSelected ? '#0b315d' : '#e2e8f0'}`,
                    borderRadius: 10,
                    padding: '12px 10px',
                    background: isSelected ? '#f0f7ff' : '#ffffff',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(11,49,93,0.12)' : 'none'
                  }}
                >
                  {/* Top Bar with locked order and brochure page tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isSelected ? '#0b315d' : '#94a3b8' }}>
                      #{idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: isSelected ? '#0b315d' : '#f1f5f9',
                        color: isSelected ? '#f59e0b' : '#64748b'
                      }}
                    >
                      {cat.brochurePage}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isSelected ? '#0b315d' : '#1e293b',
                      lineHeight: 1.25,
                      marginBottom: 2
                    }}
                  >
                    {cat.name}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>
                    {cat.subType}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: '#64748b',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {cat.desc}
                  </div>

                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag
                      style={{
                        fontSize: 9,
                        margin: 0,
                        borderRadius: 3,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      {cat.modelKey}
                    </Tag>
                    {isSelected && (
                      <CheckCircleOutlined style={{ color: '#0b315d', fontSize: 14 }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ENGINEERING SELECTORS STRIP (Master Spec Section 11: Single / Braced / Box) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              padding: '14px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8
            }}
          >
            {/* Column Logic */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                Column Type (Section 11)
              </span>
              <Select
                value={columnType}
                onChange={(val) => {
                  setColumnType(val);
                  setTimeout(runCalculation, 0);
                }}
                style={{ width: '100%' }}
              >
                <Option value="Single">Single Column (1 Col · Standard)</Option>
                <Option value="Braced">Braced Column (2 Cols · Wind Bracing)</Option>
                <Option value="Box">Box Column (4 Cols · Heavy Load)</Option>
              </Select>
            </div>

            {/* Beam Logic */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                Beam Engineering (Section 11)
              </span>
              <Select
                value={beamType}
                onChange={(val) => {
                  setBeamType(val);
                  setTimeout(runCalculation, 0);
                }}
                style={{ width: '100%' }}
              >
                <Option value="Standard">Standard Beam (1.0x)</Option>
                <Option value="Braced">Braced Beam (+25% Steel Weight)</Option>
                <Option value="Box">Box Beam (+50% Structural Steel)</Option>
              </Select>
            </div>

            {/* Angle Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                Angle Pricing
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 32 }}>
                <Switch
                  checked={withAngle}
                  onChange={(checked) => {
                    setWithAngle(checked);
                    setTimeout(runCalculation, 0);
                  }}
                />
                <span style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>
                  {withAngle ? 'With Angle' : 'Without Angle'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: DIMENSIONS (.content-card) ── */}
      <div className="content-card">
        <div className="content-card__header">
          <span className="content-card__title">Dimensions</span>
        </div>
        <div className="content-card__body">
          <Form form={form} layout="vertical" onValuesChange={runCalculation}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 16,
                marginBottom: 20
              }}
            >
              <Form.Item
                name="span"
                label="Span (m)"
                rules={[{ required: true, message: 'Enter span' }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%', height: 38 }}
                  placeholder="e.g. 6.0"
                />
              </Form.Item>

              <Form.Item
                name="length"
                label="Length (m)"
                rules={[{ required: true, message: 'Enter length' }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%', height: 38 }}
                  placeholder="e.g. 12.0"
                />
              </Form.Item>

              <Form.Item
                name="height"
                label="Height (m)"
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%', height: 38 }}
                  placeholder="e.g. 1.5"
                />
              </Form.Item>

              <Form.Item
                name="distance"
                label="Distance (km)"
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  step={1}
                  style={{ width: '100%', height: 38 }}
                  placeholder="e.g. 25"
                />
              </Form.Item>
            </div>

            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={runCalculation}
              style={{
                width: '100%',
                height: 42,
                fontSize: 14,
                fontWeight: 600,
                background: '#0b315d',
                borderColor: '#0b315d'
              }}
            >
              Run Calculation
            </Button>
          </Form>
        </div>
      </div>

      {/* ── SECTION 4: ENGINEERING RESULTS (.content-card, visible after calc) ── */}
      {calcResults && (
        <div className="content-card">
          <div className="content-card__header">
            <span className="content-card__title">Engineering Results</span>
            {calcResults.error ? (
              <Tag color="error" style={{ borderRadius: 4 }}>Error</Tag>
            ) : (
              <Tag color="success" style={{ borderRadius: 4 }}>Engineered OK</Tag>
            )}
          </div>
          <div className="content-card__body">
            {calcResults.error === 'Out of Equation' ? (
              <Alert
                type="error"
                showIcon
                message="Out of Equation"
                description="Cantilever height must be 3.0 m or less. Reduce the height and recalculate."
                style={{ borderRadius: 8 }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* 3x2 Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {/* Row 1 */}
                  <div className="stat-card" style={{ padding: 14, gap: 4 }}>
                    <span className="stat-card__label">Cover Width</span>
                    <span className="stat-card__value" style={{ fontSize: 20 }}>
                      {Math.round((calcResults.cover || 0) * 1000)} mm
                    </span>
                  </div>
                  <div className="stat-card" style={{ padding: 14, gap: 4 }}>
                    <span className="stat-card__label">Sheet Thickness</span>
                    <span className="stat-card__value" style={{ fontSize: 20 }}>
                      {calcResults.th} mm BMT
                    </span>
                  </div>
                  <div className="stat-card" style={{ padding: 14, gap: 4 }}>
                    <span className="stat-card__label">Centre Rise</span>
                    <span className="stat-card__value" style={{ fontSize: 20 }}>
                      {Number(calcResults.rise || 0).toFixed(2)} m
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="stat-card" style={{ padding: 14, gap: 4 }}>
                    <span className="stat-card__label">Panels</span>
                    <span className="stat-card__value" style={{ fontSize: 20 }}>
                      {calcResults.panels}
                    </span>
                  </div>
                  <div className="stat-card" style={{ padding: 14, gap: 4 }}>
                    <span className="stat-card__label">Columns</span>
                    <span className="stat-card__value" style={{ fontSize: 20 }}>
                      {calcResults.ncol}
                    </span>
                  </div>
                  <div className="stat-card" style={{ padding: 14, gap: 4 }}>
                    <span className="stat-card__label">Bays</span>
                    <span className="stat-card__value" style={{ fontSize: 20 }}>
                      {calcResults.bays}
                    </span>
                  </div>
                </div>

                {/* Row 3: Full width 4-item strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12,
                    background: '#f8fafc',
                    border: '1px solid #dde3ea',
                    borderRadius: 8,
                    padding: 16
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Arc Cut Length
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                      {Number(calcResults.cut || 0).toFixed(3)} m
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Final Cut Length
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                      {Number(calcResults.finalCut || 0).toFixed(3)} m
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Roof Area (ft²)
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0b315d' }}>
                      {Number(calcResults.area || 0).toFixed(1)} ft²
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Sheet Weight (kg)
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }}>
                      {Number(calcResults.sheetKg || 0).toFixed(1)} kg
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 5: COST SUMMARY (.content-card) ── */}
      {costs && !calcResults?.error && (
        <div className="content-card">
          <div className="content-card__header">
            <span className="content-card__title">Cost Summary</span>
          </div>
          <div className="content-card__body">
            {/* Structured Line-Item Div Table */}
            <div style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #b8c4ce',
                  fontWeight: 600,
                  fontSize: 11,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <span>Item Label</span>
                <span style={{ textAlign: 'center' }}>Rate</span>
                <span style={{ textAlign: 'center' }}>Qty / Unit</span>
                <span style={{ textAlign: 'right' }}>Amount</span>
              </div>

              {/* Rows */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                  padding: '12px',
                  borderBottom: '1px solid #f0f4f8'
                }}
              >
                <span style={{ fontWeight: 500, color: '#111827' }}>Sheet Material</span>
                <span style={{ textAlign: 'center', color: '#6b7280' }}>
                  ₹{activeRates.sheetRate || 48}/ft²
                </span>
                <span style={{ textAlign: 'center', color: '#6b7280' }}>
                  {calcResults.area?.toFixed(1)} ft²
                </span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                  ₹ {costs.sheetCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                  padding: '12px',
                  borderBottom: '1px solid #f0f4f8'
                }}
              >
                <span style={{ fontWeight: 500, color: '#111827' }}>Structural Labour</span>
                <span style={{ textAlign: 'center', color: '#6b7280' }}>
                  ₹{activeRates.structLabRate || 26}/kg
                </span>
                <span style={{ textAlign: 'center', color: '#6b7280' }}>
                  {calcResults.sheetKg?.toFixed(1)} kg
                </span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                  ₹ {costs.labourCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                  padding: '12px',
                  borderBottom: '1px solid #f0f4f8'
                }}
              >
                <span style={{ fontWeight: 500, color: '#111827' }}>Structure Consumables</span>
                <span style={{ textAlign: 'center', color: '#6b7280' }}>
                  ₹{activeRates.structConRate || 2}/kg
                </span>
                <span style={{ textAlign: 'center', color: '#6b7280' }}>
                  {calcResults.sheetKg?.toFixed(1)} kg
                </span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                  ₹ {Math.round(calcResults.sheetKg * (activeRates.structConRate || 2)).toLocaleString('en-IN')}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                  padding: '12px',
                  borderBottom: '1px solid #dde3ea'
                }}
              >
                <span style={{ fontWeight: 500, color: '#111827' }}>Roofing Consumables</span>
                <span style={{ textAlign: 'center', color: '#6b7280' }}>
                  ₹{activeRates.roofConRate || 2}/ft²
                </span>
                <span style={{ textAlign: 'center', color: '#6b7280' }}>
                  {calcResults.area?.toFixed(1)} ft²
                </span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                  ₹ {Math.round(calcResults.area * (activeRates.roofConRate || 2)).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Subtotal */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4fr 1.2fr',
                  padding: '12px',
                  borderBottom: '1px solid #dde3ea'
                }}
              >
                <span style={{ fontWeight: 600, color: '#374151' }}>Subtotal (Before GST)</span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                  ₹ {costs.beforeGst.toLocaleString('en-IN')}
                </span>
              </div>

              {/* GST */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4fr 1.2fr',
                  padding: '12px',
                  borderBottom: '2px solid #0b315d'
                }}
              >
                <span style={{ color: '#6b7280' }}>GST @ 18%</span>
                <span style={{ textAlign: 'right', color: '#6b7280' }}>
                  ₹ {costs.gst.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Grand Total */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4fr 1.2fr',
                  padding: '16px 12px',
                  background: '#eff6ff',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0b315d' }}>GRAND TOTAL</span>
                <span
                  style={{
                    textAlign: 'right',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#0b315d'
                  }}
                >
                  ₹ {costs.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 11, color: '#9ca3af' }}>
              Rates from: Admin Masters · Last updated {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY FOOTER BAR ── */}
      <div className="sticky-page-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag
            style={{
              background: savedStatus === 'saved' ? '#f0fdf4' : '#f3f6f9',
              color: savedStatus === 'saved' ? '#15803d' : '#6b7280',
              border: '1px solid #dde3ea',
              fontWeight: 600,
              fontSize: 11,
              borderRadius: 4
            }}
          >
            {savedStatus.toUpperCase()}
          </Tag>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {lastSavedTime ? `Last saved at ${lastSavedTime}` : 'Not yet saved'}
          </span>
        </div>

        <Space size={10}>
          <Button icon={<FolderOpenOutlined />} onClick={handleOpenLoadModal}>
            Load Estimate
          </Button>
          <Button
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSaveEstimate}
          >
            Save Draft
          </Button>
          {(savedStatus === 'draft' || savedStatus === 'submitted' || savedStatus === 'saved') && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={approving}
              onClick={handleApproveEstimate}
              style={{ background: '#15803d', borderColor: '#15803d' }}
            >
              Approve Estimate
            </Button>
          )}
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            disabled={!calcResults || !!calcResults.error}
            style={{ background: '#0b315d', borderColor: '#0b315d' }}
          >
            Print Quote
          </Button>
        </Space>
      </div>

      {/* ── HIDDEN PRINTABLE CONTAINER FOR REACT-TO-PRINT ── */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} style={{ padding: '30px', fontFamily: 'Arial, sans-serif', color: '#0f172a' }}>
          <div style={{ borderBottom: '3px solid #0b315d', paddingBottom: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, color: '#0b315d', fontSize: 24, fontWeight: 700 }}>
                  I ROOFING ENTERPRISES
                </h1>
                <p style={{ margin: '4px 0', color: '#64748b', fontSize: 12 }}>
                  Roofing Business Management System | Kerala, India
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, color: '#15803d', fontSize: 16 }}>FORMAL ESTIMATE</h3>
                <p style={{ margin: '4px 0', fontSize: 12 }}>
                  Ref: #{estimateRefString}
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
                  Model: {selectedModel}
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
              <tr style={{ background: '#f8fafc' }}>
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
              <tr style={{ background: '#0b315d', color: '#ffffff', fontWeight: 700, fontSize: 15 }}>
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
        width={720}
        destroyOnClose
      >
        <Table
          dataSource={savedEstimatesList}
          rowKey="_id"
          loading={loadingSavedList}
          pagination={{ pageSize: 5 }}
          size="middle"
          columns={[
            {
              title: 'Ref #',
              dataIndex: '_id',
              key: 'id',
              render: (id) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0b315d' }}>
                  EST-{id.slice(-6).toUpperCase()}
                </span>
              )
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
                return <span style={{ fontWeight: 600 }}>₹{Number(total).toLocaleString('en-IN')}</span>;
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
                  style={{ background: '#0b315d', borderColor: '#0b315d' }}
                >
                  Load
                </Button>
              )
            }
          ]}
        />
      </Modal>

      {/* ── RAINWATER GUTTER & DOWNPIPE HYDRAULIC DESIGN MODAL (Master Spec Section 25) ── */}
      <RainwaterDesignModal
        visible={rainwaterModalVisible}
        onClose={() => setRainwaterModalVisible(false)}
        initialDimensions={{
          span: form.getFieldValue('span'),
          rise: calcResults?.rise || 2,
          length: form.getFieldValue('length')
        }}
        onAdopt={(specs) => {
          setDrainageSpecs(specs);
          message.success(`Adopted Drainage Specs: Base ${specs.gutterBase}mm, Pipe ${specs.pipeDia}mm`);
        }}
      />

      {/* ── ESTIMATOR CONFIDENCE INTELLIGENCE MODAL (Master Spec Section 26) ── */}
      <ConfidenceIntelligenceModal
        visible={confidenceModalVisible}
        onClose={() => setConfidenceModalVisible(false)}
        category={selectedCategory?.name}
        area={calcResults?.area}
        distance={form.getFieldValue('distance')}
      />
    </div>
  );
};

export default EstimationPage;
