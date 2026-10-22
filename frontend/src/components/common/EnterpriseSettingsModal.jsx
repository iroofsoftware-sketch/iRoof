import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Tabs, message, Alert, Row, Col, Divider } from 'antd';
import {
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  FileProtectOutlined,
  SaveOutlined,
  BuildOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

const DEFAULT_SETTINGS = {
  companyName: 'I Roofing Enterprises',
  tagline: 'Precision Engineered Trussless Roofing & PEB Structures',
  gstin: '33AABCI1234F1Z5',
  pan: 'AABCI1234F',
  email: 'info@iroofing.in',
  phone: '+91 94432 00000',
  address: 'SF No. 142/2, Main Highway Industrial Corridor, Coimbatore - 641001, Tamil Nadu',
  bankName: 'State Bank of India',
  accountNumber: '38920192837',
  ifscCode: 'SBIN0001234',
  branch: 'Commercial Industrial Branch',
  standardTerms: `1. Quoted prices include standard structural manufacturing and installation as per I Roofing master specification.
2. Foundation bolts and crane assistance on site are provided as per confirmed work order scope.
3. Electrical power connection and water supply at site to be arranged by the client.
4. Validity of structural quotation is 15 days from the date of issue.
5. All disputes subject to local jurisdiction only.`,
  paymentTerms: `• 50% Advance with confirmed Work Order & engineering release.
• 40% against material readiness / dispatch from workshop fabrication floor.
• 10% on completion of arch erection & site handover certificate.`
};

const EnterpriseSettingsModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('iroof_enterprise_settings');
        const settings = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
        form.setFieldsValue(settings);
      } catch {
        form.setFieldsValue(DEFAULT_SETTINGS);
      }
    }
  }, [open, form]);

  const handleSave = async (values) => {
    try {
      setSaving(true);
      localStorage.setItem('iroof_enterprise_settings', JSON.stringify(values));
      message.success('Enterprise profile and quotation settings saved successfully');
      onClose();
    } catch (err) {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const items = [
    {
      key: 'general',
      label: (
        <span>
          <BuildOutlined /> Company Profile
        </span>
      ),
      children: (
        <div style={{ marginTop: 12 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={14}>
              <Form.Item
                name="companyName"
                label="Enterprise Registered Name"
                rules={[{ required: true, message: 'Company name required' }]}
              >
                <Input prefix={<BuildOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item
                name="gstin"
                label="GSTIN Number"
                rules={[{ required: true, message: 'GSTIN required' }]}
              >
                <Input prefix={<FileProtectOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="tagline" label="Company Tagline / Subtitle">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Official Contact Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Official Communications Email"
                rules={[{ required: true, message: 'Email required' }, { type: 'email' }]}
              >
                <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="address" label="Registered Workshop & Office Address">
                <TextArea rows={2} prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'banking',
      label: (
        <span>
          <BankOutlined /> Banking & Invoicing
        </span>
      ),
      children: (
        <div style={{ marginTop: 12 }}>
          <Alert
            message="Invoice Banking Details"
            description="These banking details will automatically print on customer quotations, proforma estimates, and tax invoices."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="bankName" label="Bank Name">
                <Input prefix={<BankOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="accountNumber" label="Current Account Number">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="ifscCode" label="IFSC / RTGS Code">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="branch" label="Branch Name & City">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'terms',
      label: (
        <span>
          <SafetyCertificateOutlined /> Terms & Payment Defaults
        </span>
      ),
      children: (
        <div style={{ marginTop: 12 }}>
          <Form.Item name="paymentTerms" label="Default Milestone Payment Terms">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="standardTerms" label="Default Commercial & Site Conditions">
            <TextArea rows={6} />
          </Form.Item>
        </div>
      )
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BuildOutlined style={{ color: '#0b2e59' }} />
          <span>Enterprise Settings & Company Profile</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Tabs items={items} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={saving}
            style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
          >
            Save Enterprise Settings
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EnterpriseSettingsModal;
