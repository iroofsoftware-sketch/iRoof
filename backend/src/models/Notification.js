const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['all', 'admin', 'sales', 'accounts', 'design', 'projectmanager', 'purchase', 'workshop', 'sitevisitor'],
      default: 'all'
    },
    recipientUser: {
      type: ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'action_required', 'success', 'warning'],
      default: 'info'
    },
    link: {
      type: String // e.g. /projectmanager/workorders/64f8...
    },
    refCode: {
      type: String // e.g. WO-2026-0001
    },
    readBy: [
      {
        user: { type: ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
      }
    ],
    createdBy: {
      type: ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
