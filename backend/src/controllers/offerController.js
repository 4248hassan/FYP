const Offer = require('../models/Offer');
const Booking = require('../models/Booking');
const socket = require('../utils/socket');
const Notification = require('../models/Notification');

exports.createOffer = async (req, res, next) => {
  try {
    const { bookingId, estimatedCost, estimatedTime, message } = req.body;
    // vendor must be verified
    if (!req.user.isVerified || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only verified vendors can submit offers' });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending_vendor_selection' && booking.status !== 'offers_received') {
      return res.status(400).json({ message: 'Booking not open for offers' });
    }

    const offer = await Offer.create({ bookingId, vendorId: req.user.id, estimatedCost, estimatedTime, message });

    // update booking status to offers_received
    booking.status = 'offers_received';
    await booking.save();

    // notify customer via socket if connected
    const io = socket.get();
    // save notification
    await Notification.create({ userId: booking.customerId, type: 'new_offer', payload: { bookingId: booking._id, offerId: offer._id } });
    if (io && booking.customerId) io.to(`user:${booking.customerId}`).emit('notification', { type: 'new_offer', bookingId: booking._id, offer });

    res.status(201).json({ offer });
  } catch (err) {
    next(err);
  }
};

exports.getOffersForBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const offers = await Offer.find({ bookingId }).populate('vendorId');
    res.json({ offers });
  } catch (err) {
    next(err);
  }
};

exports.acceptOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    const booking = await Booking.findById(offer.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // only customer who created booking can accept
    if (String(booking.customerId) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });

    // mark all other offers as rejected
    await Offer.updateMany({ bookingId: booking._id, _id: { $ne: offer._id } }, { status: 'rejected' });

    // accept this offer
    offer.status = 'accepted';
    await offer.save();

    booking.vendorId = offer.vendorId;
    booking.escrowAmount = offer.estimatedCost;
    booking.status = 'vendor_assigned';
    await booking.save();

    const io = socket.get();
    await Notification.create({ userId: offer.vendorId, type: 'vendor_assigned', payload: { bookingId: booking._id, offerId: offer._id } });
    if (io && offer.vendorId) io.to(`user:${offer.vendorId}`).emit('notification', { type: 'vendor_assigned', bookingId: booking._id, offer });

    res.json({ booking, offer });
  } catch (err) {
    next(err);
  }
};
