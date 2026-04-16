const EscrowPayment = require('../models/EscrowPayment');

exports.getEscrowByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const escrow = await EscrowPayment.findOne({ bookingId }).populate('bookingId customerId vendorId');
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });
    res.json({ escrow });
  } catch (err) {
    next(err);
  }
};
