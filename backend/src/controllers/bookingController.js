const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');
const Service = require('../models/Service');

exports.createBooking = async (req, res, next) => {
  try {
    const { vendorId, serviceId, bookingDate, timeSlot } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    const escrowAmount = service.price;
    const booking = await Booking.create({
      customerId: req.user.id,
      vendorId,
      serviceId,
      bookingDate,
      timeSlot,
      escrowAmount,
    });
    // create escrow record
    await EscrowPayment.create({ bookingId: booking._id, customerId: req.user.id, vendorId, amount: escrowAmount, status: 'held' });
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
