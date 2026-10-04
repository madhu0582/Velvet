/**
 * Approval Workflow Configuration
 * Region-specific value thresholds and business rules for all 3 process areas
 */

// Regional Approval Threshold Matrix
export const approvalThresholds = {
  EMEA: {
    currency: 'EUR',
    levels: [
      { min: 0, max: 1000, approver: null, label: 'No Approval Required', autoApproved: true },
      { min: 1000, max: 5000, approver: 'Category Leader', label: 'Category Leader Approval', autoApproved: false },
      { min: 5000, max: 25000, approver: 'Sr. Planner / Manager', label: 'Manager Approval', autoApproved: false },
      { min: 25000, max: Infinity, approver: 'Executive Manager', label: 'Executive Approval', autoApproved: false }
    ],
    approvers: {
      'Category Leader': { name: 'Marc Dubois', email: 'marc.dubois@elcompanies.com', title: 'Category Leader EMEA' },
      'Sr. Planner / Manager': { name: 'Anna Polkowska (Lead)', email: 'anna.polkowska@elcompanies.com', title: 'Sr. TPM Planner EMEA' },
      'Executive Manager': { name: 'Thomas Mueller', email: 'thomas.mueller@elcompanies.com', title: 'Executive Manager Supply Chain EMEA' }
    }
  },
  APAC: {
    currency: 'USD',
    levels: [
      { min: 0, max: 1000, approver: null, label: 'No Approval Required', autoApproved: true },
      { min: 1000, max: 3000, approver: 'Sr. Planner', label: 'Sr. Planner Approval', autoApproved: false },
      { min: 3000, max: 15000, approver: 'Planning Manager', label: 'Planning Manager Approval', autoApproved: false },
      { min: 15000, max: Infinity, approver: 'Executive Manager', label: 'Executive Approval', autoApproved: false }
    ],
    approvers: {
      'Sr. Planner': { name: 'Steven Zhang', email: 'steven.zhang@elcompanies.com', title: 'Sr. Planner APAC' },
      'Planning Manager': { name: 'Steven Zhang', email: 'steven.zhang@elcompanies.com', title: 'Planning Manager APAC' },
      'Executive Manager': { name: 'David Chen', email: 'david.chen@elcompanies.com', title: 'Executive Manager Supply Chain APAC' }
    }
  },
  NA: {
    currency: 'USD',
    levels: [
      { min: 0, max: 2000, approver: null, label: 'No Approval Required', autoApproved: true },
      { min: 2000, max: 10000, approver: 'Category Manager', label: 'Category Manager Approval', autoApproved: false },
      { min: 10000, max: 50000, approver: 'Director Supply Chain', label: 'Director Approval', autoApproved: false },
      { min: 50000, max: Infinity, approver: 'VP Operations', label: 'VP Approval', autoApproved: false }
    ],
    approvers: {
      'Category Manager': { name: 'Jennifer Adams', email: 'jennifer.adams@elcompanies.com', title: 'Category Manager NA' },
      'Director Supply Chain': { name: 'Robert Wilson', email: 'robert.wilson@elcompanies.com', title: 'Director Supply Chain NA' },
      'VP Operations': { name: 'Michael Torres', email: 'michael.torres@elcompanies.com', title: 'VP Operations NA' }
    }
  }
};

// Process-area-specific rules
export const processAreaRules = {
  adjustment: {
    label: '3.2.1.2 Subsequent Quantity Adjustment',
    alwaysRequiresApproval: false,
    additionalRules: [
      'Batch corrections always require Category Leader minimum regardless of value',
      'Consumption corrections below threshold are auto-approved',
      'Stock discrepancies with BLCK/EXFER root cause may bypass threshold if system error confirmed'
    ]
  },
  transfer: {
    label: '3.2.1.5 Transfer to Other TPMs or EL Plant',
    alwaysRequiresApproval: false,
    additionalRules: [
      'Cross-plant STO transfers require Planner confirmation (not value-based)',
      'Same-plant 542/541 transfers below threshold are auto-approved',
      'Transfers to EL plants (non-TPM) always require Manager approval',
      'Samples/Cost Center transfers require Brand/Marketing CC confirmation'
    ]
  },
  destruction: {
    label: '3.2.1.7 Scrapping & Destruction',
    alwaysRequiresApproval: true,
    additionalRules: [
      'ALL destruction/write-off postings require minimum Category Leader approval',
      'Dangerous Goods (DG) materials require additional EHS team sign-off',
      'DAV items above €5K/€$5K require Finance Controller approval',
      'QN-based destruction requires QA Manager sign-off before write-off'
    ]
  }
};

/**
 * Determine approval requirement for a given value and region
 */
export function getApprovalRequirement(value, region, processArea) {
  const regionConfig = approvalThresholds[region];
  if (!regionConfig) return { required: true, level: 'Unknown Region', approver: null };

  const level = regionConfig.levels.find(l => value >= l.min && value < l.max);
  if (!level) return { required: true, level: 'Exceeds all thresholds', approver: null };

  // Destruction always requires approval
  if (processArea === 'destruction' && level.autoApproved) {
    const minApprovalLevel = regionConfig.levels.find(l => !l.autoApproved);
    return {
      required: true,
      level: minApprovalLevel?.label || 'Category Leader Approval',
      approver: regionConfig.approvers[minApprovalLevel?.approver] || null,
      currency: regionConfig.currency,
      threshold: minApprovalLevel?.min || 0,
      reason: 'All destruction postings require approval regardless of value'
    };
  }

  return {
    required: !level.autoApproved,
    level: level.label,
    approver: level.approver ? regionConfig.approvers[level.approver] : null,
    currency: regionConfig.currency,
    threshold: level.autoApproved ? null : level.min,
    autoApproved: level.autoApproved
  };
}

/**
 * Get the full approval chain for a value (all levels that apply)
 */
export function getApprovalChain(value, region) {
  const regionConfig = approvalThresholds[region];
  if (!regionConfig) return [];

  return regionConfig.levels
    .filter(l => !l.autoApproved && value >= l.min)
    .map(l => ({
      level: l.label,
      approver: regionConfig.approvers[l.approver],
      threshold: `${regionConfig.currency === 'EUR' ? '€' : '$'}${l.min.toLocaleString()}`
    }));
}
