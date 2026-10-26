import React, { useState } from 'react';
import { Upload, Button, Modal, message, Tag, Typography } from 'antd';
import {
  UploadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { uploadService } from '../../services/uploadService';

const { Text } = Typography;

export const AttachmentManager = ({
  attachments = [],
  onChange,
  readOnly = false,
  title = 'Site Photos & Engineering Blueprints'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res && res.data) {
        const newAttachment = {
          name: res.data.name,
          url: res.data.url,
          fileType: res.data.mimetype,
          size: res.data.size,
          uploadedAt: res.data.uploadedAt
        };
        const updated = [...(attachments || []), newAttachment];
        if (onChange) onChange(updated);
        message.success(`${file.name} uploaded successfully`);
        onSuccess(res.data);
      }
    } catch (err) {
      console.error('File upload failed:', err);
      message.error(err.response?.data?.message || 'File upload failed');
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index) => {
    const updated = (attachments || []).filter((_, i) => i !== index);
    if (onChange) onChange(updated);
    message.info('Attachment removed');
  };

  const getFileIcon = (fileType = '', name = '') => {
    const lower = (fileType + name).toLowerCase();
    if (lower.includes('image') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return <FileImageOutlined style={{ color: '#0284c7', fontSize: 20 }} />;
    }
    if (lower.includes('pdf') || lower.endsWith('.pdf')) {
      return <FilePdfOutlined style={{ color: '#b91c1c', fontSize: 20 }} />;
    }
    return <FileOutlined style={{ color: '#64748b', fontSize: 20 }} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{title}</div>
          <div style={{ fontSize: 11.5, color: '#64748b' }}>
            Supported formats: Images (JPG, PNG), CAD Blueprints (PDF, DWG), Documents (up to 25MB)
          </div>
        </div>

        {!readOnly && (
          <Upload
            customRequest={handleCustomUpload}
            showUploadList={false}
            multiple={false}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
              style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
            >
              Upload Document
            </Button>
          </Upload>
        )}
      </div>

      {/* Grid of attachments */}
      {(!attachments || attachments.length === 0) ? (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: 8,
            color: '#64748b',
            fontSize: 12
          }}
        >
          No blueprints or site images attached yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {attachments.map((item, idx) => {
            const isImage = (item.fileType || item.name || '').toLowerCase().match(/image|png|jpg|jpeg|webp/);
            const fullUrl = getFullUrl(item.url);

            return (
              <div
                key={idx}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 10,
                  background: '#ffffff',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 8
                }}
              >
                {/* Preview Thumbnail if Image */}
                {isImage && item.url ? (
                  <div
                    style={{
                      height: 100,
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setPreviewImage(fullUrl);
                      setPreviewOpen(true);
                    }}
                  >
                    <img
                      src={fullUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 80,
                      borderRadius: 6,
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    {getFileIcon(item.fileType, item.name)}
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                      {item.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                )}

                {/* File info */}
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>
                    <span>{formatFileSize(item.size)}</span>
                    <span>{item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                  {isImage && (
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setPreviewImage(fullUrl);
                        setPreviewOpen(true);
                      }}
                      title="Preview"
                    />
                  )}
                  <Button
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(fullUrl, '_blank')}
                    title="Download / View"
                  />
                  {!readOnly && (
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(idx)}
                      title="Delete"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal for images */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={720}
        centered
      >
        <img
          alt="Preview"
          style={{ width: '100%', borderRadius: 8, marginTop: 16 }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default AttachmentManager;
