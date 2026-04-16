const Service = require('../models/Service');

exports.listServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json({ services });
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const { name, description, image, basePrice, category } = req.body;
    const s = await Service.create({ name, description, image, basePrice, category });
    res.status(201).json({ service: s });
  } catch (err) {
    next(err);
  }
};

exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (err) {
    next(err);
  }
};
