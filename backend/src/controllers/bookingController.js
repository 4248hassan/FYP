const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');
const Service = require('../models/Service');

exports.createBooking = async (req, res, next) => {
  try {
    const { serviceId, bookingDate, timeSlot, description, attachments, location, optionalBudget } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const booking = await Booking.create({
      customerId: req.user.id,
      serviceId,
      bookingDate,
      timeSlot,
      description,
      attachments,
      location,
      optionalBudget,
      // escrowAmount remains 0 until customer pays
      escrowAmount: 0,
      status: 'pending_vendor_selection',
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id }).populate('serviceId vendorId');
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId vendorId customerId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};
