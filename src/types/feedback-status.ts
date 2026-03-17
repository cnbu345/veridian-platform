// src/types/feedback-status.ts
// Database enum values
export type FeedbackStatus = 
  | 'pending_review'
  | 'reviewed'
  | 'action_planned'
  | 'implemented'
  | 'closed';

// Display names for clients
export const statusDisplayNames: Record<FeedbackStatus, string> = {
  pending_review: 'Pending Review',
  reviewed: 'Reviewed',
  action_planned: 'Action Planned',
  implemented: 'Implemented',
  closed: 'Closed'
};

// Status colors for UI
export const statusColors: Record<FeedbackStatus, string> = {
  pending_review: 'bg-amber-100 text-amber-800 border-amber-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  action_planned: 'bg-purple-100 text-purple-800 border-purple-200',
  implemented: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-slate-100 text-slate-800 border-slate-200'
};

// Client-friendly descriptions
export const statusDescriptions: Record<FeedbackStatus, string> = {
  pending_review: 'We\'ve received your feedback and are reviewing it',
  reviewed: 'Our team has reviewed your feedback',
  action_planned: 'We\'ve planned actions based on your feedback',
  implemented: 'Changes have been implemented',
  closed: 'This feedback has been closed'
};