// ONR Business Rules Engine (EMEA) - configurable rules that replace the analyst's manual Excel formulas.
// Aligned to TO-BE process maps (slides 23-25): Local Destruction / 3550-DSV / 3020 demand-suppression.
// Each rule set is DATA (editable in Admin Config -> Business Rules) plus a pure evaluator that returns
// a traceable result: { value, rule, because } so the UI can show WHICH rule fired and WHY.

// 1. LD eligibility: Material Group + TPM must both allow local destruction
export const ruleLDEligibility = {
  id: 'RULE-LD-01',
  name: 'Eligible for Local Destruction',
  desc: 'Eligible for LD = f(Material Group in MATGROUP_LD, TPM in TPM_LD). Both must permit LD.',
  matGroupNoLD: ['10606000'],
  tpmNoLD: ['10117375', '10117381'],
};

// 2. EMEA Formula Sheet - 3-way route determination (TO-BE Step P.5)
export const ruleFormulaRoute = {
  id: 'RULE-ROUTE-01',
  name: 'EMEA Formula Sheet - Route Determination',
  desc: 'Branded production -> Local Destruction (Sc.1); Pending products -> Plant 3550/DSV (Sc.2); Hazardous/Bulk -> Plant 3020 (Sc.3).',
  rows: [
    { when: 'DG = Yes OR material = Bulk', then: 'Scenario 3 - Plant 3020 (demand suppression)', receivingPlant: '3020', approver: 'Finance (after GR)' },
    { when: 'Branded production material AND LD eligible', then: 'Scenario 1 - Local Destruction', receivingPlant: 'N/A (at vendor)', approver: 'Brand' },
    { when: 'Pending product', then: 'Scenario 2 - Plant 3550 / DSV', receivingPlant: '3550', approver: 'Finance (after GR)' },
    { when: 'default', then: 'Needs manual check', receivingPlant: '?', approver: '?' },
  ],
};

// 3. Scrap decision - qty match / cost-difference threshold
export const ruleScrapDecision = {
  id: 'RULE-SCRAP-01',
  name: 'Scrap Decision',
  desc: 'stock qty == DAV/QN qty -> OK to scrap; cost diff < threshold -> OK to scrap; > threshold -> request additional notification.',
  costDiffThreshold: 1000,
  currency: 'EUR',
};

// 4. Scrapping transaction + movement type (TO-BE: MIGO A07 R10, 555=QN write-off, 551=DAV write-off)
export const ruleMovementType = {
  id: 'RULE-MVT-01',
  name: 'Scrapping Transaction & Movement Type',
  desc: 'Scrapping via MIGO A07 R10 (not MB11). MvT 555 = QN write-off; MvT 551 = DAV write-off. Customs FREE/BONDED from CUSTOM_STATUS; IPR -> BONDED. Never mix FREE/BONDED.',
  transaction: 'MIGO A07 R10',
  mvtQN: '555',
  mvtDAV: '551',
  reasonCode: 'R10',
  maxLinesPerMigo: 25,
};

// 5. Approval routing - per-scenario approver + EMEA value thresholds
export const ruleApproval = {
  id: 'RULE-APPR-01',
  name: 'Approval Routing (EMEA)',
  desc: 'Scenario 1 -> BRAND (before destruction). Scenario 2/3 -> FINANCE (only AFTER GR at receiving plant). Value tiers: > EUR1,000 Category Leader; > EUR5,000 Executive Manager.',
  tiers: [
    { min: 0,    max: 1000,   role: 'None',              currency: 'EUR' },
    { min: 1000, max: 5000,   role: 'Category Leader',   currency: 'EUR' },
    { min: 5000, max: 1e12,   role: 'Executive Manager', currency: 'EUR' },
  ],
};

// 6. STO / logistics chain config (TO-BE Scenarios 2 & 3)
export const ruleStoChain = {
  id: 'RULE-STO-01',
  name: 'STO & Logistics Chain (3550 / 3020)',
  desc: 'ME21N STO (UB / BE01 / PP / CoCd 4070) -> VL10B delivery -> VL02N PGI -> MIGO GR at receiving plant, then scrap. Scenario 3 requires immediate ME22N line delete (demand suppression) and restore after receipt.',
  stoType: 'UB', poType: 'BE01', purchaseGroup: 'PP', companyCode: '4070', plantCode: '1000',
  deliveryTcode: 'VL10B', pgiTcode: 'VL02N', grTcode: 'MIGO', deliveryLeadDays: 14,
  demandSuppressionPlants: ['3020'],
};

// 7. Hard guards - non-negotiable safety rules
export const ruleGuards = {
  id: 'RULE-GUARD-01',
  name: 'Hard Guards',
  desc: 'Only Unrestricted/Blocked scrappable; no partial-qty (DSV); max 25 lines/MIGO; resolve delivery complaints first; Finance approval only after GR; Sc.3 STO line must be deleted then restored.',
  items: [
    { code: 'G1', text: 'Only Unrestricted or Blocked stock can be scrapped (QI/Restricted -> QC first)' },
    { code: 'G2', text: 'DSV does NOT accept partial-quantity scrapping' },
    { code: 'G3', text: 'Maximum 25 lines per MIGO transaction' },
    { code: 'G4', text: 'Resolve delivery complaints before scrapping at 3550' },
    { code: 'G5', text: 'Finance approval (Sc.2/3) only AFTER material reaches plant and GR is posted' },
    { code: 'G6', text: 'Scenario 3: delete STO schedule line (ME22N) within seconds of creation; restore only after physical receipt' },
  ],
};

export const ruleCatalog = [ruleLDEligibility, ruleFormulaRoute, ruleScrapDecision, ruleMovementType, ruleApproval, ruleStoChain, ruleGuards];
// backward-compat alias (older imports referenced ruleRouteDecision)
export const ruleRouteDecision = ruleFormulaRoute;

// ----- Helpers -----
function num(v) {
  if (v == null) return 0;
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// ----- Evaluators (each returns a traceable result) -----

export function evalLDEligibility(item) {
  const mgBlocked = ruleLDEligibility.matGroupNoLD.includes(String(item.materialGroup));
  const tpmBlocked = ruleLDEligibility.tpmNoLD.includes(String(item.tpmNumber));
  const eligible = !mgBlocked && !tpmBlocked;
  const because = mgBlocked ? 'Material Group ' + item.materialGroup + ' not LD-eligible'
    : tpmBlocked ? 'TPM ' + item.tpmNumber + ' does not perform LD'
    : 'Material Group + TPM both permit LD';
  return { value: eligible, rule: ruleLDEligibility.id, because };
}

// Formula-sheet route: DG/Bulk -> 3020; branded+LD -> Local; else pending -> 3550
export function evalRoute(item) {
  const ld = evalLDEligibility(item).value;
  if (item.dg === 'Yes' || item.materialClass === 'Bulk')
    return { value: 'Scenario 3 - Plant 3020', rule: ruleFormulaRoute.id + '.3', because: 'Hazardous/Bulk -> demand-suppression route (3020)' };
  if (item.brandedProduction && ld)
    return { value: 'Scenario 1 - Local Destruction', rule: ruleFormulaRoute.id + '.1', because: 'Branded production material + LD eligible -> destroy at TPM' };
  return { value: 'Scenario 2 - Plant 3550 / DSV', rule: ruleFormulaRoute.id + '.2', because: 'Pending product -> transfer to 3550 for DSV destruction' };
}

export function evalScrapDecision(item) {
  const stockQty = num(item.scrapStockQty != null ? item.scrapStockQty : item.qty);
  const notifQty = num(item.qty);
  const unitPrice = num(item.unitPrice) || (num(item.value) / (notifQty || 1));
  if (stockQty === notifQty)
    return { value: 'OK to scrap', rule: ruleScrapDecision.id + '.eq', because: 'Stock qty == DAV/QN qty (' + notifQty + ')' };
  const costDiff = Math.abs(stockQty - notifQty) * unitPrice;
  if (costDiff < ruleScrapDecision.costDiffThreshold)
    return { value: 'OK to scrap', rule: ruleScrapDecision.id + '.lt', because: 'Cost diff EUR' + costDiff.toFixed(0) + ' < EUR' + ruleScrapDecision.costDiffThreshold };
  return { value: 'Request additional notification', rule: ruleScrapDecision.id + '.gt', because: 'Cost diff EUR' + costDiff.toFixed(0) + ' > EUR' + ruleScrapDecision.costDiffThreshold + ' - contact planner' };
}

// MIGO A07 R10; 555 for QN, 551 for DAV (by notification type)
export function evalMovementType(item) {
  const cs = (item.customStatus || 'FREE').toUpperCase();
  const customs = cs === 'IPR' ? 'BONDED' : cs;
  const mvt = item.type === 'QN' ? ruleMovementType.mvtQN : ruleMovementType.mvtDAV;
  return { value: ruleMovementType.transaction + ' / MvT ' + mvt + ' / ' + customs, rule: ruleMovementType.id, because: item.type + ' write-off -> MvT ' + mvt + ' via ' + ruleMovementType.transaction + '; customs ' + customs };
}

// Approver = Brand for Sc.1, Finance-after-GR for Sc.2/3; plus value tier
export function evalApproval(item) {
  const route = evalRoute(item).value;
  const cost = num(item.value);
  const tier = ruleApproval.tiers.find(t => cost > t.min && cost <= t.max) || ruleApproval.tiers[0];
  const isLocal = route.indexOf('Scenario 1') >= 0;
  const gate = isLocal ? 'BRAND (before destruction)' : 'FINANCE (only after GR at receiving plant)';
  const tierNote = tier.role !== 'None' ? tier.role + ' - EUR' + cost.toFixed(0) : 'No value approval (< EUR1,000)';
  return { value: gate + ' | ' + tierNote, rule: ruleApproval.id, because: (isLocal ? 'Local destruction -> Brand owns cost' : 'Material moves to plant -> Finance approves post-GR') + '; value tier ' + tier.role };
}

// STO chain applicability + Scenario-3 demand suppression
export function evalStoChain(item) {
  const route = evalRoute(item).value;
  if (route.indexOf('Scenario 1') >= 0)
    return { value: 'No STO (destroy at vendor)', rule: ruleStoChain.id, because: 'Local destruction - material stays at TPM, no logistics chain' };
  const supp = route.indexOf('3020') >= 0;
  const chain = 'ME21N (' + ruleStoChain.stoType + '/' + ruleStoChain.poType + ') -> VL10B -> VL02N -> MIGO GR';
  return { value: chain + (supp ? ' + ME22N delete/restore (demand suppression)' : ''), rule: ruleStoChain.id, because: supp ? 'Plant 3020 -> STO line deleted after create, restored after receipt' : 'Plant 3550 -> standard STO logistics chain' };
}

export function evalGuards(item) {
  const fired = [];
  if (item.iaStatus && String(item.iaStatus).toLowerCase().indexOf('delivery complaint') >= 0) fired.push('G4');
  if (item.partialQty) fired.push('G2');
  if ((item.dg === 'Yes' || item.materialClass === 'Bulk')) fired.push('G6');
  return { value: fired, rule: ruleGuards.id, because: fired.length ? fired.join(', ') + ' triggered' : 'No hard guard triggered' };
}

export function evaluateItem(item) {
  return {
    ldEligible: evalLDEligibility(item),
    route: evalRoute(item),
    scrap: evalScrapDecision(item),
    movement: evalMovementType(item),
    approval: evalApproval(item),
    stoChain: evalStoChain(item),
    guards: evalGuards(item),
  };
}
