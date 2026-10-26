const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  targetRoles: [{ type: String }],
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedModel: { type: String },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
