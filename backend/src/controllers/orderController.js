const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');

exports.createOrder = async (req, res, next) => {
  try {
    const { serviceId, vendorId, city, address, date } = req.body;
    if (!serviceId || !city || !address || !date) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    let vendor = null;
    if (vendorId) {
      vendor = await User.findById(vendorId);
    } else {
      vendor = await User.findOne({ role: 'vendor' });
    }

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(400).json({ message: 'Valid vendor is required' });
    }

    const order = await Order.create({
      userId: req.user.id,
      serviceId,
      vendorId: vendor._id,
      city,
      address,
      date,
      amount: service.basePrice,
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('serviceId vendorId', '-password')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.json({ order });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('serviceId vendorId userId', '-password');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};
