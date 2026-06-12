/**
 * STATUS CONSTANTS — ResolveIt Workflow (Frontend)
 * Mirror of backend/src/constants/status.constants.js
 * Used in all React pages and components for status checks.
 */

export const STATUS = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  OFFER_RECEIVED: 'OFFER_RECEIVED',
  VENDOR_SELECTED: 'VENDOR_SELECTED',
  VENDOR_ASSIGNED: 'VENDOR_ASSIGNED',
  WORK_IN_PROGRESS: 'WORK_IN_PROGRESS',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED_PENDING_RELEASE: 'COMPLETED_PENDING_RELEASE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
};

/** Human-readable labels for display */
export const STATUS_LABEL = {
  BOOKING_CREATED: 'Booking Created',
  OFFER_RECEIVED: 'Offers Received',
  VENDOR_SELECTED: 'Vendor Selected',
  VENDOR_ASSIGNED: 'Vendor Assigned',
  WORK_IN_PROGRESS: 'Work In Progress',
  AWAITING_APPROVAL: 'Awaiting Approval',
  PAYMENT_PENDING: 'Payment Pending',
  COMPLETED_PENDING_RELEASE: 'Awaiting Release',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
  REVISION_REQUESTED: 'Revision Requested',
};

/** Tailwind badge color classes per status */
export const STATUS_BADGE = {
  BOOKING_CREATED: 'bg-slate-100 text-slate-700',
  OFFER_RECEIVED: 'bg-yellow-100 text-yellow-800',
  VENDOR_SELECTED: 'bg-blue-100 text-blue-800',
  VENDOR_ASSIGNED: 'bg-blue-100 text-blue-800',
  WORK_IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  AWAITING_APPROVAL: 'bg-orange-100 text-orange-800',
  PAYMENT_PENDING: 'bg-amber-100 text-amber-800',
  COMPLETED_PENDING_RELEASE: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
  DISPUTED: 'bg-red-100 text-red-800',
  REVISION_REQUESTED: 'bg-yellow-100 text-yellow-800',
};

/** Ordered workflow steps for the progress timeline */
export const WORKFLOW_STEPS = [
  { status: STATUS.BOOKING_CREATED, label: 'Booking Created' },
  { status: STATUS.OFFER_RECEIVED, label: 'Offers Received' },
  { status: STATUS.VENDOR_ASSIGNED, label: 'Vendor Assigned' },
  { status: STATUS.WORK_IN_PROGRESS, label: 'Work In Progress' },
  { status: STATUS.AWAITING_APPROVAL, label: 'Review Proof' },
  { status: STATUS.PAYMENT_PENDING, label: 'Payment Pending' },
  { status: STATUS.COMPLETED_PENDING_RELEASE, label: 'Awaiting Release' },
  { status: STATUS.COMPLETED, label: 'Completed' },
];

export const WORKFLOW_STEP_INDEX = Object.fromEntries(
  WORKFLOW_STEPS.map((s, i) => [s.status, i])
);
