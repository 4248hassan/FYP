const Offer = require('../models/Offer');
const Booking = require('../models/Booking');
const socket = require('../utils/socket');
const Notification = require('../models/Notification');
const STATUS = require('../constants/status.constants');

// ─── Vendor Submits an Offer ─────────────────────────────────────────────────
exports.createOffer = async (req, res, next) => {
  try {
    const { bookingId, estimatedCost, estimatedTime, message } = req.body;

    if (!req.user.isVerified || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only verified vendors can submit offers' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const openStatuses = [STATUS.BOOKING_CREATED, STATUS.OFFER_RECEIVED];
    if (!openStatuses.includes(booking.status)) {
      return res.status(400).json({ message: 'Booking is not open for offers' });
    }

    // Check if this vendor already submitted an offer for this booking
    const existing = await Offer.findOne({ bookingId, vendorId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted an offer for this booking' });
    }

    const offer = await Offer.create({
      bookingId,
      vendorId: req.user.id,
      estimatedCost,
      estimatedTime,
      message,
    });

    // Update booking status to OFFER_RECEIVED
    if (booking.status === STATUS.BOOKING_CREATED) {
      booking.status = STATUS.OFFER_RECEIVED;
      await booking.save();
    }

    // Notify customer
    const io = socket.get();
    await Notification.create({
      userId: booking.customerId,
      type: 'new_offer',
      payload: { bookingId: booking._id, offerId: offer._id },
    });
    if (io && booking.customerId) {
      io.to(`user:${booking.customerId}`).emit('notification', {
        type: 'new_offer', bookingId: booking._id, offer,
      });
    }

    res.status(201).json({ offer });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Offers for a Booking ────────────────────────────────────────────
exports.getOffersForBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const offers = await Offer.find({ bookingId }).populate('vendorId');
    res.json({ offers });
  } catch (err) {
    next(err);
  }
};

// ─── Customer Accepts an Offer (Selects a Vendor) ────────────────────────────
exports.acceptOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    const booking = await Booking.findById(offer.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Reject all other offers for this booking
    await Offer.updateMany(
      { bookingId: booking._id, _id: { $ne: offer._id } },
      { status: 'rejected' }
    );

    // Accept selected offer
    offer.status = 'accepted';
    await offer.save();

    // Assign vendor and set escrow amount
    booking.vendorId = offer.vendorId;
    booking.escrowAmount = offer.estimatedCost;
    booking.status = STATUS.VENDOR_ASSIGNED;
    await booking.save();

    // Notify the selected vendor
    const io = socket.get();
    await Notification.create({
      userId: offer.vendorId,
      type: 'vendor_assigned',
      payload: { bookingId: booking._id, offerId: offer._id },
    });
    if (io && offer.vendorId) {
      io.to(`user:${offer.vendorId}`).emit('notification', {
        type: 'vendor_assigned', bookingId: booking._id, offer,
      });
    }

    res.json({ booking, offer });
  } catch (err) {
    next(err);
  }
};
