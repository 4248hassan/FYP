/**
 * STATUS CONSTANTS — ResolveIt Workflow
 * Single source of truth for ALL booking lifecycle states.
 * Used everywhere in backend controllers and routes.
 * Never use raw strings — always import from here.
 */

const STATUS = {
  // ─── Booking Created ───────────────────────────────────────────────────────
  // Customer submits booking. Open for vendors to browse and send offers.
  BOOKING_CREATED: 'BOOKING_CREATED',

  // ─── Offer Received ────────────────────────────────────────────────────────
  // At least one vendor has sent an offer. Customer can review and choose.
  OFFER_RECEIVED: 'OFFER_RECEIVED',

  // ─── Vendor Selected ───────────────────────────────────────────────────────
  // Customer has accepted one offer. Booking is assigned to that vendor.
  VENDOR_SELECTED: 'VENDOR_SELECTED',

  // ─── Vendor Assigned ───────────────────────────────────────────────────────
  // Vendor has been confirmed. Customer is prompted to secure payment in escrow.
  VENDOR_ASSIGNED: 'VENDOR_ASSIGNED',

  // ─── Work In Progress ──────────────────────────────────────────────────────
  // Vendor has started working. Escrow payment is locked.
  WORK_IN_PROGRESS: 'WORK_IN_PROGRESS',

  // ─── Awaiting Approval ─────────────────────────────────────────────────────
  // Vendor has submitted proof of work. Customer must review and decide.
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',

  // ─── Payment Pending ───────────────────────────────────────────────────────
  // Admin/customer approved proof. Payment is now ready to be released.
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED_PENDING_RELEASE: 'COMPLETED_PENDING_RELEASE',

  // ─── Completed ─────────────────────────────────────────────────────────────
  // Escrow released to vendor. Job fully closed.
  COMPLETED: 'COMPLETED',

  // ─── Cancelled ─────────────────────────────────────────────────────────────
  // Booking was cancelled (refund issued if escrow was held).
  CANCELLED: 'CANCELLED',

  // ─── Disputed ──────────────────────────────────────────────────────────────
  // Customer raised a dispute on proof of work. Awaiting admin arbitration.
  DISPUTED: 'DISPUTED',

  // ─── Revision Requested ────────────────────────────────────────────────────
  // Customer requested revision. Vendor goes back to WORK_IN_PROGRESS.
  REVISION_REQUESTED: 'REVISION_REQUESTED',

  // ─── Legacy Lowercase Aliases (For Backward Compatibility) ──────────────────
  pending_vendor_selection: 'pending_vendor_selection',
  offers_received: 'offers_received',
  booking_created: 'booking_created',
  offer_received: 'offer_received',
  vendor_assigned: 'vendor_assigned',
  work_in_progress: 'work_in_progress',
  awaiting_approval: 'awaiting_approval',
  payment_pending: 'payment_pending',
  completed: 'completed',
  cancelled: 'cancelled',
  disputed: 'disputed',
  revision_requested: 'revision_requested',
};

module.exports = STATUS;
