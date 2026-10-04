// NA Destruction Scenario Engine
// Grounded in Jack May's 9 sample email scenarios (tpm-3217-na-destruction-all-scenarios).
// Each scenario defines: vendor route, stepper stages, gates, and pre-filled email templates.
// BR-17: cost/value is NEVER included in vendor-facing emails.

export const NA_PO_POOL = 'PO 1720 / 991000 / 5081155';

// Map a destruction row -> NA scenario id (1..9) using route/haz/vendor cues.
export function resolveNaScenario(item) {
  const route = (item.route || '').toLowerCase();
  if (route.includes('aca')) return 1;
  if (route.includes('env resources') || route.includes('environmental')) return 2;
  if (route.includes('mxi') || route.includes('dynamic')) return 3;
  if (route.includes('internal') || route.includes('voyant')) return 4;
  if (route.includes('refurbco')) return 5;
  if (route.includes('no cost') || route.includes('no charge') || route.includes('mexico')) return 6;
  if (route.includes('canada')) return 7;
  if (route.includes('veolia') || route.includes('ross')) return 8;
  return 4; // default to internal quote/PO path
}

// Stepper templates per scenario. {key,label} - status is derived at runtime from row + progress.
const S = {
  confirmQty: { key: 'confirmQty', label: 'Confirm Qty + Pallet/Drum Count with TPM' },
  elcSecurity: { key: 'elcSecurity', label: 'ELC Security Approval (ship to ACA)' },
  notifyCarrier: { key: 'notifyCarrier', label: 'Notify TPM to Contact Daybreak Carrier' },
  vendorPickup: { key: 'vendorPickup', label: 'Vendor Schedules Pickup' },
  quote: { key: 'quote', label: 'TPM Provides Quote' },
  acceptQuote: { key: 'acceptQuote', label: 'IA Accepts Quote -> Provide PO' },
  ehs: { key: 'ehs', label: 'Confirm Haz Class w/ EAS/EHS Team' },
  noCharge: { key: 'noCharge', label: 'Confirm NO CHARGE to ELC' },
  canadaCoord: { key: 'canadaCoord', label: 'Route to Canada Contacts (Naresh/Naynesh)' },
  invoiceApprove: { key: 'invoiceApprove', label: 'Approve Invoice -> Release Payment (Mary Lafferty)' },
  cod: { key: 'cod', label: 'Receive COD / BOL / Destruction Confirmation' },
  postSap: { key: 'postSap', label: 'Post Write-Off in SAP (MvT 551/555)' },
  close: { key: 'close', label: 'Close Work Item + Notify Planner' },
};

export const NA_SCENARIOS = {
  1: {
    id: 1, name: 'ACA Waste - Non-Haz / Haz UN3077-3082 (East Coast)',
    vendor: 'ACA Waste Services', contact: '40 Eads St, West Babylon NY 11704 | Carrier: Daybreak',
    gate: 'ELC Security',
    steps: [S.confirmQty, S.elcSecurity, S.notifyCarrier, S.vendorPickup, S.cod, S.postSap, S.close],
    bol: 'Third party billing to The Estee Lauder Companies c/o TTC, 30 Hemlock Dr, Congers NY 10920',
  },
  2: {
    id: 2, name: 'Environmental Resources (West Coast)',
    vendor: 'Environmental Resources', contact: 'Chuck Tapia | Porter Ranch, CA | (818)',
    steps: [S.confirmQty, S.vendorPickup, S.cod, S.postSap, S.close],
  },
  3: {
    id: 3, name: 'MXI / Dynamic Recycling - Haz UN1266 (Flammable)',
    vendor: 'MXI / Dynamic Recycling', contact: 'Jon Ramsey | Cannot ship to ACA',
    steps: [S.confirmQty, S.vendorPickup, S.cod, S.postSap, S.close],
  },
  4: {
    id: 4, name: 'Internal Disposal - Subcontractor Destroys (Quote/PO)',
    vendor: 'Voyant / Oxygen DR / Vitro / B.I.P. / Albea', contact: 'Provide quote - DO NOT action until directed',
    steps: [S.quote, S.acceptQuote, S.vendorPickup, S.cod, S.invoiceApprove, S.postSap, S.close],
    po: NA_PO_POOL,
  },
  5: {
    id: 5, name: 'Refurbco Rework - Invoice Approval (Payment Release)',
    vendor: 'Refurbco, Inc.', contact: 'Denise Serra | Mt. Vernon NY',
    steps: [S.invoiceApprove, S.postSap, S.close],
    note: 'Destruction already completed - this is payment release only.',
  },
  6: {
    id: 6, name: 'TPM Disposes at No Charge to ELC',
    vendor: 'Subcontractor (internal)', contact: 'Only if NO CHARGE - else follow DAV/QN quote process (Sc 4)',
    steps: [S.noCharge, S.vendorPickup, S.cod, S.postSap, S.close],
  },
  7: {
    id: 7, name: 'Canada Subcontractors (Haz / Non-Haz)',
    vendor: 'ELC Canada', contact: 'Naresh Patel / Araceli Ramilo / Naynesh Shah',
    steps: [S.confirmQty, S.canadaCoord, S.vendorPickup, S.cod, S.postSap, S.close],
  },
  8: {
    id: 8, name: 'Veolia / Ross - Hazardous (Vendor cannot destroy)',
    vendor: 'Veolia', contact: 'For haz that cannot go to ACA | ' + NA_PO_POOL,
    gate: 'EAS/EHS',
    steps: [S.confirmQty, S.ehs, S.vendorPickup, S.cod, S.invoiceApprove, S.postSap, S.close],
    po: NA_PO_POOL,
  },
  9: {
    id: 9, name: 'Follow-Up (Aging / Overdue TPM)',
    vendor: 'Any', contact: 'Escalation ladder', reminders: [7, 14, 30],
    steps: [S.confirmQty, S.vendorPickup, S.cod, S.postSap, S.close],
  },
};

// Pre-filled email templates keyed by scenario + stage. Vendor-facing = no cost (BR-17).
export function buildNaEmail(scenario, stageKey, item) {
  const v = item.tpmVendor || 'Subcontractor';
  const mat = item.material + ' - ' + (item.materialDesc || '');
  const qty = item.qty;
  const po = scenario.po || NA_PO_POOL;
  const T = (to, cc, subject, body) => ({ to, cc, subject, body, vendorFacing: true });
  switch (scenario.id + ':' + stageKey) {
    case '1:confirmQty':
      return T(v, 'jmay@estee.com', 'DAV List - Confirm Destruction Qty (Col O) + Pallet Count',
        'Good morning,\n\nPlease see the attached list of current DAVs. As per new initiative, all DAVs will ship to an ELC authorized disposal company - subcontractors should not be destroying on ELCs behalf.\n\nOnce destruction quantities are confirmed (enter in Column O) and pallet count provided, we will arrange removal from your facility.\n\nMaterial: ' + mat + '\nQty: ' + qty + '\n\nThank you,\nJack May');
    case '1:elcSecurity':
      return { to: 'elc.security@estee.com', cc: 'jmay@estee.com', subject: 'Approval Request - ' + v + ' DAV Pallets Ready to Ship (ACA)',
        body: 'Good morning,\n\n' + v + ' has ' + qty + ' non-haz DAV pallets (raws, wips, finished goods, bulk mass, components) ready to ship. Could you approve? Carrier will be Daybreak.\n\nThank you,\nJack May', vendorFacing: false };
    case '1:notifyCarrier':
      return T(v, 'jmay@estee.com', 'Approved - Contact Daybreak for Pickup',
        'Good morning,\n\nPlease contact Daybreak to arrange pickup - must be delivered to the address below and include a copy of the attached ELC Security approval with the shipment paperwork. Please provide a copy of the BOL once shipped.\n\nDestination:\nACA Waste Services\n40 Eads Street\nWest Babylon, NY 11704\n631-391-9300\n\nMark the BOL:\n' + scenario.bol + '\n\nThank you,\nJack May');
    case '2:confirmQty':
      return T(v, 'chuck@ehsresource.com; jmay@estee.com', 'DAV List - Confirm Qty (Col O) + Pallet Count',
        'Good morning,\n\nPlease see the attachment for the list of current DAVs. All DAVs will ship to an ELC authorized disposal company. Once quantities are confirmed (Column O) and pallet count provided, we will arrange removal.\n\nMaterial: ' + mat + '\nQty: ' + qty + '\n\nThank you,\nJack May');
    case '2:vendorPickup':
      return { to: 'chuck@ehsresource.com', cc: 'jmay@estee.com', subject: 'RE: DAV ' + v + ' - Schedule Pickup',
        body: 'Chuck,\n\nAll components confirmed and pulled. Please schedule pickup.\n\nThank you', vendorFacing: false };
    case '3:confirmQty':
      return T(v, 'jmay@estee.com', 'Change in ELC Disposal Process - Confirm Drums/Pails + Pallets',
        'Good morning,\n\nThere has been a change in the ELC disposal process, and hazardous chemicals cannot ship to ACA Waste.\n\nCan you confirm on-hand inventory and total number of drums/pails along with total pallets so I can provide to Dynamic Recycling to arrange the pickup?\n\nMaterial: ' + mat + ' (UN1266 Flammable)\n\nThank you,\nJack May');
    case '3:vendorPickup':
      return { to: 'jon.ramsey@dynamicrecycling.com', cc: 'jmay@estee.com', subject: 'Schedule Pickup - Haz UN1266 at ' + v,
        body: 'Jon,\n\nIs there anything else you need to schedule the pickup for the below hazardous stock?\n\nLocation: ' + v + '\nMaterial: ' + mat + '\n\nThank you', vendorFacing: false };
    case '4:quote':
      return T(v, 'jmay@estee.com', 'New DAV List - Provide Quote (DO NOT action)',
        'Good morning,\n\nPlease see the new DAV list attached. Please remember to provide the quote so it can be reviewed and actioned.\n\nDO NOT action anything until I provide direction.\n\nMaterial: ' + mat + '\n\nThank you,\nJack May');
    case '4:acceptQuote':
      return T(v, 'jmay@estee.com', 'Approved - Proceed with Disposal',
        'Good morning,\n\nThank you for the update and info. Please proceed with the disposal and provide the invoice once completed so I can submit for payment. Please use ' + po + ' when invoicing.\n\nThank you,\nJack May');
    case '4:invoiceApprove':
    case '8:invoiceApprove':
      return { to: 'mlaffert@estee.com', cc: 'jmay@estee.com', subject: 'Process Invoice Request - ' + v,
        body: 'Mary,\n\nGood afternoon, could you process this invoice request? PO ' + po + ' is written on the invoice.\n\nThank you,\nJack May', vendorFacing: false };
    case '5:invoiceApprove':
      return { to: 'mlaffert@estee.com', cc: 'jmay@estee.com', subject: 'FW: Payment Request - REFURBCO invoice',
        body: 'Good afternoon,\n\nI approve this invoice.\n\nJack', vendorFacing: false };
    case '6:noCharge':
      return T(v, 'jmay@estee.com', 'Can You Dispose at No Charge to ELC?',
        'Good morning,\n\nPlease confirm whether you can dispose of the listed stock through your internal disposal company at no charge to ELC Companies. If there will be a fee, we will need to discuss next steps.\n\nMaterial: ' + mat + '\n\nThank you,\nJack May');
    case '6:vendorPickup':
      return T(v, 'jmay@estee.com', 'Proceed - Internal Disposal (No Charge Only)',
        'Good afternoon,\n\nPlease proceed with the internal disposal only if there is no charge to ELC Companies. If there is a charge, we will follow the DAV/QN process.\n\nThank you,\nJack May');
    case '7:confirmQty':
      return T(v, 'naresh.patel@estee.com; naynesh.shah@estee.com; jmay@estee.com', 'Canada DAV List - Confirm Qty (Col O) + Pallet Count',
        'Good morning,\n\nPlease see the attached list of current DAVs. All DAVs will ship to an ELC authorized disposal company. Once quantities are confirmed (Column O) and pallet count provided, we will arrange removal.\n\nMaterial: ' + mat + '\n\nThank you,\nJack May');
    case '7:canadaCoord':
      return { to: 'naynesh.shah@estee.com; naresh.patel@estee.com', cc: 'jmay@estee.com', subject: 'Schedule Canada Pickup - ' + v,
        body: 'Naynesh/Naresh,\n\n' + v + ' has ' + qty + ' of non-haz materials (small quantity of raw materials and labels) - can you schedule the pickup?\n\nThank you', vendorFacing: false };
    case '8:confirmQty':
      return T(v, 'jmay@estee.com', 'DAV List - Confirm Qty (Col O) + Prepare for Pickup',
        'Good morning,\n\nPlease see the attached list of current DAVs. All DAVs will ship to an ELC authorized disposal company. Once quantities are confirmed and stock prepared, we will arrange removal.\n\nMaterial: ' + mat + '\n\nThank you,\nJack May');
    case '8:ehs':
      return { to: 'eas.ehs@estee.com', cc: 'jmay@estee.com', subject: 'Haz Classification Check - ' + mat,
        body: 'Hi EAS/EHS team,\n\nPlease confirm hazardous classification for the below material before we route to Veolia (cannot follow normal destruction process).\n\nMaterial: ' + mat + '\n\nThank you,\nJack May', vendorFacing: false };
    case '8:vendorPickup':
      return { to: 'veolia.team@veolia.com', cc: 'jmay@estee.com', subject: 'Hazardous Bulk Mass Pickup at ' + v,
        body: 'Veolia team,\n\nGood afternoon, there is a hazardous bulk mass stock that needs to be picked up at ' + v + ' to be destroyed. Could you advise what information you would need to proceed with the pickup?\n\nOnce disposal is completed, please submit an invoice (using ' + po + ') to Mary Lafferty (mlaffert@estee.com) with me on copy. Please make sure the PO number is written on the invoice.\n\nThank you,\nJack May', vendorFacing: false };
    case '9:confirmQty':
    default:
      if (stageKey === 'cod')
        return { to: v, cc: 'jmay@estee.com', subject: 'Confirm Destruction Complete - ' + item.davQn, body: 'Please provide the Certificate of Destruction / BOL confirmation for ' + mat + '.\n\nThank you', vendorFacing: true };
      if (stageKey === 'vendorPickup')
        return { to: v, cc: 'jmay@estee.com', subject: 'Pickup Coordination - ' + item.davQn, body: 'Good morning,\n\nPlease coordinate pickup for the confirmed stock.\n\nMaterial: ' + mat + '\nQty: ' + qty + '\n\nThank you,\nJack May', vendorFacing: true };
      // generic follow-up (Sc9)
      return { to: v, cc: 'jmay@estee.com', subject: 'Follow-Up - ' + item.davQn + ' Update Requested',
        body: 'Good afternoon,\n\nJust wanted to check in and see when you anticipate having the requested stock ready to ship. Please provide an update.\n\nThank you,\nJack May', vendorFacing: true };
  }
}
