const Customer = require('../models/Customer');

const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }];
    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: customers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer };
