import api from '../services/api';

export { api };
export default api;

// Work Orders
export const getWorkOrders = (params) => api.get('/workorders', { params });
export const getWorkOrderStats = () => api.get('/workorders/stats');
export const getWorkOrderById = (id) => api.get(`/workorders/${id}`);
export const createWorkOrder = (data) => api.post('/workorders', data);
export const updateWorkOrder = (id, data) => api.patch(`/workorders/${id}`, data);
export const deleteWorkOrder = (id) => api.delete(`/workorders/${id}`);

// Estimates
export const approveEstimate = (id) => api.patch(`/estimates/${id}`, { status: 'approved' });

// Design Tasks
export const getDesignTasks = (params) => api.get('/design-tasks', { params });
export const getMyDesignTasks = (params) => api.get('/design-tasks/mine', { params });
export const updateDesignTask = (id, data) => api.patch(`/design-tasks/${id}`, data);

// Purchase Requests
export const getPurchaseRequests = (params) => api.get('/purchase-requests', { params });
export const getMyPurchaseRequests = (params) => api.get('/purchase-requests/mine', { params });
export const updatePurchaseRequest = (id, data) => api.patch(`/purchase-requests/${id}`, data);

// Workshop Jobs
export const getWorkshopJobs = (params) => api.get('/workshop-jobs', { params });
export const getMyWorkshopJobs = (params) => api.get('/workshop-jobs/mine', { params });
export const updateWorkshopJob = (id, data) => api.patch(`/workshop-jobs/${id}`, data);

// Site Visits
export const getSiteVisits = (params) => api.get('/site-visits', { params });
export const getMySiteVisits = (params) => api.get('/site-visits/mine', { params });
export const updateSiteVisit = (id, data) => api.patch(`/site-visits/${id}`, data);

// Invoices
export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoiceStats = () => api.get('/invoices/stats');
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoice = (id, data) => api.patch(`/invoices/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);

// Payments
export const recordPayment = (data) => api.post('/payments', data);
export const getPaymentsByInvoice = (invoiceId) => api.get(`/payments?invoiceId=${invoiceId}`);
export const deletePayment = (id) => api.delete(`/payments/${id}`);
