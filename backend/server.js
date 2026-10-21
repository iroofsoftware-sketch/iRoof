const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const enquiryRoutes = require('./src/routes/enquiryRoutes');
const estimateRoutes = require('./src/routes/estimateRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads (blueprints, site photos, documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    system: 'iRoof v2 Backend API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/customers', require('./src/routes/customerRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/workorders', require('./src/routes/workOrderRoutes'));
app.use('/api/design-tasks', require('./src/routes/designTaskRoutes'));
app.use('/api/purchase-requests', require('./src/routes/purchaseRequestRoutes'));
app.use('/api/workshop-jobs', require('./src/routes/workshopJobRoutes'));
app.use('/api/site-visits', require('./src/routes/siteVisitRoutes'));
app.use('/api/invoices', require('./src/routes/invoiceRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/suppliers', require('./src/routes/supplierRoutes'));
app.use('/api/purchase-orders', require('./src/routes/purchaseOrderRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/search', require('./src/routes/searchRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 iRoof v2 Backend server running on port ${PORT}`);
});

module.exports = { app, server };
