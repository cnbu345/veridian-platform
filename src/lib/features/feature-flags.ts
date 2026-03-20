// lib/features/feature-flags.ts
export const FEATURES = {
  // Report Features
  MULTI_STATE_COMPARE: 'multi_state_compare',
  UNLIMITED_REPORTS: 'unlimited_reports',
  CUSTOM_TEMPLATES: 'custom_templates',
  WHITE_LABEL: 'white_label',
  API_ACCESS: 'api_access',
  
  // Support Features
  PRIORITY_SUPPORT: 'priority_support',
  DEDICATED_ACCOUNT_MANAGER: 'dedicated_account_manager',
  QUARTERLY_STRATEGY_CALLS: 'quarterly_strategy_calls',
  
  // Data Features
  REAL_TIME_ALERTS: 'real_time_alerts',
  EXPORT_DATA: 'export_data',
  
  // Team Features
  TEAM_ACCESS: 'team_access',
  ROLE_BASED_ACCESS: 'role_based_access'
}

export const TIER_FEATURES = {
  free: [], // No reports? Or limited?
  single: [FEATURES.EXPORT_DATA],
  quarterly: [FEATURES.EXPORT_DATA, FEATURES.REAL_TIME_ALERTS],
  monthly: [
    FEATURES.EXPORT_DATA,
    FEATURES.REAL_TIME_ALERTS,
    FEATURES.CUSTOM_TEMPLATES,
    FEATURES.WHITE_LABEL,
    FEATURES.TEAM_ACCESS,
    FEATURES.QUARTERLY_STRATEGY_CALLS
  ],
  custom: [
    FEATURES.EXPORT_DATA,
    FEATURES.REAL_TIME_ALERTS,
    FEATURES.CUSTOM_TEMPLATES,
    FEATURES.WHITE_LABEL,
    FEATURES.TEAM_ACCESS,
    FEATURES.QUARTERLY_STRATEGY_CALLS,
    FEATURES.UNLIMITED_REPORTS,
    FEATURES.API_ACCESS,
    FEATURES.DEDICATED_ACCOUNT_MANAGER
  ]
}