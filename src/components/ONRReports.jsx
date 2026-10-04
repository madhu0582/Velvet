import { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { evaluateItem, ruleCatalog } from '../data/onrBusinessRules';

// Consolidated QN + DAV data (ingested hourly from SAP ZQRGT 237701 & 237700)
const onrItems = [
  { id: 'QN-400125', type: 'QN', material: 'N7DX090501', materialDesc: 'CLINIQUE MOISTURE SURGE 72H 50ML', qty: '800 EA', classification: 'Non-Hazardous', vendor: 'COSMAX', plant: '6030', value: '€18,500', aging: 35, status: 'Pending Planner Approval', assignee: 'Unassigned', region: 'EMEA', dg: 'No' },
  { id: 'QN-400128', type: 'QN', material: 'R3FG070803', materialDesc: 'TOM FORD NOIR EDP 100ML', qty: '320 EA', classification: 'Non-Hazardous', vendor: 'Arcade Beauty', plant: '4010', value: '€9,280', aging: 28, status: 'Pending Brand Approval', assignee: 'Anna Polkowska', region: 'EMEA', dg: 'No' },
  { id: 'DAV-50001234', type: 'DAV', material: 'W2ST080405', materialDesc: 'AVEDA BOTANICAL REPAIR 200ML', qty: '150 EA', classification: 'Hazardous', vendor: 'Arcade Beauty', plant: '3550', value: '€6,750', aging: 31, status: 'Pending Brand Approval', assignee: 'Anna Polkowska', region: 'EMEA', dg: 'Yes' },
  { id: 'QN-400131', type: 'QN', material: 'X4YZ020301', materialDesc: 'MAC STUDIO FIX POWDER 15G', qty: '200 EA', classification: 'Non-Hazardous', vendor: 'COSMAX', plant: '6030', value: '€4,100', aging: 14, status: 'Pending Planner Approval', assignee: 'Unassigned', region: 'APAC', dg: 'No' },
  { id: 'QN-400133', type: 'QN', material: 'A1BC050708', materialDesc: 'ORIGINS GINGER BODY WASH 200ML', qty: '100 EA', classification: 'Non-Hazardous', vendor: 'C-Care', plant: '2020', value: '€2,300', aging: 7, status: 'Pending Planner Approval', assignee: 'Unassigned', region: 'NA', dg: 'No' },
  { id: 'DAV-50001238', type: 'DAV', material: 'D2EF080102', materialDesc: 'JO MALONE COLOGNE 100ML', qty: '60 EA', classification: 'Hazardous', vendor: 'Hanes Erie', plant: '4010', value: '€11,200', aging: 21, status: 'Pending Brand Approval', assignee: 'Anna Polkowska', region: 'EMEA', dg: 'Yes' },
  { id: 'DAV-50001240', type: 'DAV', material: '5566778899', materialDesc: 'TOM FORD BLACK ORCHID EDP 50ML', qty: '200 EA', classification: 'Non-Hazardous', vendor: 'COSMAX Japan', plant: '6020', value: '$8,900', aging: 42, status: 'Pending Planner Approval', assignee: 'Unassigned', region: 'APAC', dg: 'No' },
  { id: 'QN-400156', type: 'QN', material: '7788990011', materialDesc: 'CLINIQUE MOISTURE SURGE INTENSE 50ML', qty: '30 KG', classification: 'Non-Hazardous', vendor: 'Intercos MIC', plant: '6050', value: '$1,200', aging: 10, status: 'Approved — Assigned to IA', assignee: 'Chris Wang', region: 'APAC', dg: 'No' },
  { id: 'DAV-50001250', type: 'DAV', material: '4520891034', materialDesc: 'ORIGINS MEGA-MUSHROOM CREAM 50ML', qty: '100 KG', classification: 'Non-Hazardous', vendor: 'Intercos China', plant: '6010', value: '$2,450', aging: 18, status: 'Approved — Assigned to IA', assignee: 'Chris Wang', region: 'APAC', dg: 'No' },
  { id: 'QN-400162', type: 'QN', material: '1234567890', materialDesc: 'AVEDA BOTANICAL REPAIR MASK 150ML', qty: '15 KG', classification: 'Non-Hazardous', vendor: 'Kolmar Korea', plant: '6030', value: '$890', aging: 14, status: 'Approved — Assigned to IA', assignee: 'Chris Wang', region: 'APAC', dg: 'No' },
  { id: 'DAV-50001255', type: 'DAV', material: 'M3HX010000', materialDesc: 'MAC PREP+PRIME FIX+ 100ML', qty: '500 EA', classification: 'Hazardous', vendor: 'COSMAX USA', plant: '2020', value: '$3,200', aging: 38, status: 'Pending Planner Approval', assignee: 'Unassigned', region: 'NA', dg: 'Yes' },
  { id: 'DAV-500599188', type: 'DAV', material: 'T1Z2010611', materialDesc: 'PLQ BTL 250ML BO RESERVE (Tom Ford)', qty: '280 EA', classification: 'Non-Hazardous', vendor: 'HEINZ GLAS GmbH & Co.KG', plant: '2020', value: '€556.51', aging: 89, status: 'Pending Brand Approval', assignee: 'Anna Polkowska', region: 'EMEA', dg: 'No', reasonCode: '03 - Discontinued', customStatus: 'FREE', decisionTool: 'OK to scrap at 3550', iaStatus: 'In process - Scrapping 3550', movementType: '551 (Unrestricted)', eligibleLD: 'No LD - scrap at 3550', currency: 'EUR', coordinator: 'OCACEVSK', scrapReady: true, materialGroup: '10430000', tpmNumber: '10011528', stockAtTPM: 0, stockAt3550: 280, blockedQty: 0, unitPrice: 1.99, scrapStockQty: 280, partialQty: false, brandedProduction: true, materialClass: 'Component', route: 'Scenario 1 - Local Destruction' },
  { id: 'DAV-500594676', type: 'DAV', material: 'PYL5010704', materialDesc: 'DECO JAR ANR EYE SC GEL (Estee Lauder)', qty: '402 EA', classification: 'Non-Hazardous', vendor: 'ENGLEWOOD LAB INC', plant: '2020', value: '€362.99', aging: 42, status: 'Approved — Assigned to IA', assignee: 'Anna Polkowska', region: 'EMEA', dg: 'No', reasonCode: '03 - Discontinued', customStatus: 'FREE', decisionTool: 'OK to scrap - qty match', iaStatus: 'Ready for MIGO 551', movementType: '551 (Unrestricted)', eligibleLD: 'No LD - scrap at 3550', currency: 'EUR', coordinator: 'MATOTH', scrapReady: true, materialGroup: '10250000', tpmNumber: '10012394', stockAtTPM: 0, stockAt3550: 402, blockedQty: 0, unitPrice: 0.90, scrapStockQty: 402, partialQty: false, brandedProduction: false, materialClass: 'Pending', route: 'Scenario 2 - Plant 3550 / DSV' },
  { id: 'QN-203986159', type: 'QN', material: 'TE1603C01U', materialDesc: 'IVORY SILK SOFT MATTE (Tom Ford)', qty: '174 KG', classification: 'Non-Hazardous', vendor: 'Vendor 0010011904', plant: '2020', value: '€20,916.20', aging: 74, status: 'Pending Brand Approval', assignee: 'Unassigned', region: 'EMEA', dg: 'No', reasonCode: 'F3 - Related defect', customStatus: 'BONDED', decisionTool: 'Needs Exec Manager approval (>€5000)', iaStatus: 'Pending for Action', movementType: '555 (Blocked)', eligibleLD: 'No LD', currency: 'EUR', coordinator: 'ASCOLA', scrapReady: false, materialGroup: '40000018', tpmNumber: '10011904', stockAtTPM: 0, stockAt3550: 0, blockedQty: 174, unitPrice: 120.21, scrapStockQty: 150, partialQty: true, brandedProduction: false, materialClass: 'Bulk', route: 'Scenario 3 - Plant 3020' },
  { id: 'DAV-500591933', type: 'DAV', material: '000009000F', materialDesc: 'SHIPPER/TOTEPACK (Laleham)', qty: '600 EA', classification: 'Non-Hazardous', vendor: 'LALEHAM HEALTH AND BEAUTY', plant: '4020', value: '£329.35', aging: 186, status: 'Approved — Assigned to IA', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: '01 - Undersell/Forecast', customStatus: 'FREE', decisionTool: 'OK - Return to 3010', iaStatus: 'In process - LD', movementType: 'Local Destruction', eligibleLD: 'LD eligible', currency: 'GBP', coordinator: 'IMOLNAR', scrapReady: false, materialGroup: '10430000', tpmNumber: '10011556', stockAtTPM: 600, stockAt3550: 0, blockedQty: 0, unitPrice: 0.55, scrapStockQty: 600, partialQty: false, brandedProduction: true, materialClass: 'Component', route: 'Scenario 1 - Local Destruction' },
  { id: 'QN-203924782', type: 'QN', material: '0TAX00W02U', materialDesc: 'GINZING ULTR-HYDRTING (Origins)', qty: '25 KG', classification: 'Non-Hazardous', vendor: 'Arcade Beauty (fka Socoplan)', plant: '4010', value: '€442.47', aging: 179, status: 'Approved — Assigned to IA', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: 'F2 - Vendor defect', customStatus: 'BONDED', decisionTool: '1 - No stock for this batch', iaStatus: 'In process - Returns', movementType: 'Return to Plant 3020', eligibleLD: 'LD eligible', currency: 'EUR', coordinator: 'TGECSE', scrapReady: false, materialGroup: '40000018', tpmNumber: '10011615', stockAtTPM: 0, stockAt3550: 0, blockedQty: 0, unitPrice: 17.70, scrapStockQty: 0, partialQty: false, brandedProduction: false, materialClass: 'Pending', route: 'Scenario 2 - Plant 3550 / DSV' },

  // === Scenario-representative records sourced from "2609 ONR Sep 2026" (EMEA ONR tab) ===
  // S-A | OK - LD: eligible for Local Destruction, stock sits at the TPM, status all clear.
  { id: 'DAV-500603394', type: 'DAV', material: '1000010841', materialDesc: 'BULK FILLED COMPONENT (EMEA)', qty: '500 EA', classification: 'Non-Hazardous', vendor: 'TPM 10045694', plant: '4010', value: '€1,250.00', aging: 41, status: 'Approved — Assigned to IA', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: '03 - Discontinued', customStatus: 'FREE', decisionTool: 'OK - LD', iaStatus: 'Ready for Local Destruction (MIGO 551)', movementType: 'Local Destruction', eligibleLD: 'LD', currency: 'EUR', coordinator: 'EMEA-ONR', scrapReady: true, materialGroup: '10991000', tpmNumber: '10045694', stockAtTPM: 500, stockAt3550: 0, blockedQty: 0, unitPrice: 2.50, scrapStockQty: 500, partialQty: false, brandedProduction: true, materialClass: 'Component', route: 'OK - LD (Local Destruction)', scenarioTag: 'S-A · OK-LD' },
  // S-B | OK - Return to 3010: virtual plant 4020, stock at TPM, extended to 3010, status not-07.
  { id: 'DAV-500591890', type: 'DAV', material: '1597010230', materialDesc: 'FOLDING CARTON (EMEA)', qty: '32 EA', classification: 'Non-Hazardous', vendor: 'TPM 10011556', plant: '4020', value: '€96.00', aging: 120, status: 'Approved — Assigned to IA', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: '01 - Undersell/Forecast', customStatus: '4020', decisionTool: 'OK - RETURN TO 3010', iaStatus: 'In process - Returns (STO to 3010)', movementType: 'Return to Plant 3010', eligibleLD: 'YES', currency: 'EUR', coordinator: 'EMEA-ONR', scrapReady: false, materialGroup: '10462000', tpmNumber: '10011556', stockAtTPM: 32, stockAt3550: 0, blockedQty: 0, unitPrice: 3.00, scrapStockQty: 0, partialQty: false, brandedProduction: true, materialClass: 'Component', route: 'OK - Return to 3010', scenarioTag: 'S-B · Return 3010' },
  // S-C | OK - Return to 3550: BONDED, no TPM stock, stock physically at 3550 (DSV), extended to 3550.
  { id: 'DAV-500586048', type: 'DAV', material: '3AA5010032', materialDesc: 'BONDED COMPONENT (EMEA)', qty: '5765 EA', classification: 'Non-Hazardous', vendor: 'TPM 10012458', plant: '4010', value: '€4,900.00', aging: 150, status: 'Approved — Assigned to IA', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: 'F2 - Vendor defect', customStatus: 'BONDED', decisionTool: 'OK - RETURN TO 3550', iaStatus: 'In process - Returns', movementType: 'Return to Plant 3550 (DSV)', eligibleLD: 'YES', currency: 'EUR', coordinator: 'EMEA-ONR', scrapReady: false, materialGroup: '10301000', tpmNumber: '10012458', stockAtTPM: 0, stockAt3550: 5765, blockedQty: 0, unitPrice: 0.85, scrapStockQty: 0, partialQty: false, brandedProduction: true, materialClass: 'Component', route: 'OK - Return to 3550 / DSV', scenarioTag: 'S-C · Return 3550' },
  // S-D | OK - Return to 3020: plant-specific status at return plant 3020 = 07 (BLOCKED) → status gate trips, stock at 4010.
  { id: 'QN-203636947', type: 'QN', material: '9999302541', materialDesc: 'MASS / BULK (EMEA)', qty: '400 KG', classification: 'Non-Hazardous', vendor: 'TPM 10117375', plant: '4010', value: '€6,800.00', aging: 95, status: 'HOLD — Plant status 07 (EDM)', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: 'F3 - Related defect', customStatus: 'FREE', decisionTool: 'OK - RETURN TO 3020', iaStatus: 'HOLD - Plant status 07 at 3020 (EDM fix pending)', movementType: 'Return to Plant 3020', eligibleLD: 'NO', currency: 'EUR', coordinator: 'EMEA-ONR', scrapReady: false, materialGroup: '20601000', tpmNumber: '10117375', stockAtTPM: 0, stockAt3550: 0, blockedQty: 0, unitPrice: 17.00, scrapStockQty: 0, partialQty: false, brandedProduction: false, materialClass: 'Bulk', route: 'OK - Return to 3020', scenarioTag: 'S-D · Return 3020 (status 07)' },
  // S-E | 1 - No stock for this Mat/Batch/Plant: zero everywhere → Close-No-Stock.
  { id: 'QN-203924782-NS', type: 'QN', material: '0TAX00W02U', materialDesc: 'GINZING ULTR-HYDRTING (Origins) — batch 0007028688', qty: '25 KG', classification: 'Non-Hazardous', vendor: 'Arcade Beauty', plant: '4010', value: '€442.47', aging: 179, status: 'Closed — No Stock', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: 'F2 - Vendor defect', customStatus: 'BONDED', decisionTool: '1 - No stock for this Mat/Batch/Plant', iaStatus: 'Closed - No stock for Mat/Batch/Plant', movementType: 'Close - No Stock', eligibleLD: 'YES', currency: 'EUR', coordinator: 'EMEA-ONR', scrapReady: false, materialGroup: '40000018', tpmNumber: '10011615', stockAtTPM: 0, stockAt3550: 0, blockedQty: 0, unitPrice: 17.70, scrapStockQty: 0, partialQty: false, brandedProduction: false, materialClass: 'Pending', route: '1 - No stock for this Mat/Batch/Plant', batch: '0007028688', scenarioTag: 'S-E · No stock' },
  // S-F | 3 - Extension needed: mass code (mat-group starts 4), status #N/A (not extended), route to EDM for extension to 3020.
  { id: 'QN-203854359', type: 'QN', material: '5LNT00W11U', materialDesc: 'MASS CODE (no dimensions)', qty: '107 KG', classification: 'Non-Hazardous', vendor: 'TPM 10070470', plant: '4010', value: '€1,900.00', aging: 60, status: 'HOLD — Extension pending (EDM)', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: 'F2 - Vendor defect', customStatus: 'BONDED', decisionTool: '3 - Extension needed', iaStatus: 'HOLD - Extension to 3020 requested from EDM', movementType: 'Return to Plant 3020 (after extension)', eligibleLD: 'YES', currency: 'EUR', coordinator: 'EMEA-ONR', scrapReady: false, materialGroup: '40000030', tpmNumber: '10070470', stockAtTPM: 0, stockAt3550: 0, blockedQty: 0, unitPrice: 17.68, scrapStockQty: 0, partialQty: false, brandedProduction: false, materialClass: 'Mass', route: 'OK - Return to 3020', batch: '0007044240', scenarioTag: 'S-F · Extension needed' },
  // S-G | Status 07 blocked at cross-plant AND return plant: 64P1010797 cross=7, plant-sp=7 → hard block, route EDM.
  { id: 'DAV-500599765', type: 'DAV', material: '64P1010797', materialDesc: 'DISCONTINUED COMPONENT (EMEA)', qty: '18157 EA', classification: 'Non-Hazardous', vendor: 'TPM 10011463', plant: '4020', value: '€9,800.00', aging: 72, status: 'HOLD — Cross-plant + 3010 status 07 (EDM)', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: '03 - Discontinued', customStatus: '4020', decisionTool: 'OK - RETURN TO 3010', iaStatus: 'HOLD - Cross-plant 07 + 3010 plant status 07 (EDM fix pending)', movementType: 'Return to Plant 3010 (status-blocked)', eligibleLD: 'NO', currency: 'EUR', coordinator: 'EMEA-ONR', scrapReady: false, materialGroup: '10604000', tpmNumber: '10011463', stockAtTPM: 18157, stockAt3550: 0, blockedQty: 0, unitPrice: 0.54, scrapStockQty: 0, partialQty: false, brandedProduction: true, materialClass: 'Component', route: 'OK - Return to 3010', scenarioTag: 'S-G · Status 07 blocked' },
  // S-H | Plant/Batch granularity: same material 9999511381 split across plants/batches (keyed Plant+Batch).
  { id: 'QN-203949697', type: 'QN', material: '9999511381', materialDesc: 'MULTI-PLANT MASS — batch 0007161183', qty: '7 KG', classification: 'Non-Hazardous', vendor: 'TPM 10038252', plant: '4010', value: '€119.00', aging: 48, status: 'Approved — Assigned to IA', assignee: 'Agnes Ujj', region: 'EMEA', dg: 'No', reasonCode: 'F2 - Vendor defect', customStatus: 'BONDED', decisionTool: 'OK - RETURN TO 3020', iaStatus: 'In process - Returns (STO to 3020, per Plant+Batch)', movementType: 'Return to Plant 3020', eligibleLD: 'YES', currency: 'EUR', coordinator: 'EMEA-ONR', scrapReady: false, materialGroup: '20350000', tpmNumber: '10038252', stockAtTPM: 5.8, stockAt3550: 0, blockedQty: 0, unitPrice: 17.50, scrapStockQty: 0, partialQty: true, brandedProduction: false, materialClass: 'Mass', route: 'OK - Return to 3020', batch: '0007161183', scenarioTag: 'S-H · Plant/Batch split' },

];

// --- EMEA stock-bucket enrichment (SAP MB52, split by location) ---
// Each location carries the four SAP stock buckets + Transit & Transfer. Keys per location:
//   TPM special stock (indicator O) = Plant+TPM+Material+Batch; virtual 4010/4020/2020 = Plant+Material+Batch; 3550 (DSV) = Material+Batch.
// Only Unrestricted + Blocked are scrappable; QI + Restricted must be moved by QC first (EMEA-ONR scrappability rule).
const emeaStockByItem = {
  'DAV-500599188': { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:280,qi:0,res:0,blk:0,tt:0} },
  'DAV-500594676': { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:402,qi:0,res:0,blk:0,tt:0} },
  'QN-203986159':  { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:24,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:174,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'DAV-500591933': { tpm:{unr:600,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:40}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'QN-203924782':  { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'QN-400128':     { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:120,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:60,qi:0,res:0,blk:0,tt:20} },
  'DAV-50001234':  { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:90,qi:0,res:30,blk:30,tt:0} },
  'DAV-50001238':  { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:40,qi:0,res:0,blk:20,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'QN-400125':     { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  // --- Scenario-representative records from 2609 ONR Sep 2026 (stock split as per MB52 columns: TPM / 4010-4020 / 3550) ---
  'DAV-500603394':   { tpm:{unr:500,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'DAV-500591890':   { tpm:{unr:32,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'DAV-500586048':   { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:5765,qi:0,res:0,blk:0,tt:0} },
  'QN-203636947':    { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:400,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'QN-203924782-NS': { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'QN-203854359':    { tpm:{unr:0,qi:0,res:0,blk:0,tt:0}, p4010:{unr:107,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'DAV-500599765':   { tpm:{unr:18157,qi:0,res:0,blk:0,tt:0}, p4010:{unr:0,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
  'QN-203949697':    { tpm:{unr:5.8,qi:0,res:0,blk:0,tt:0}, p4010:{unr:1,qi:0,res:0,blk:0,tt:0}, p4020:{unr:0,qi:0,res:0,blk:0,tt:0}, p2020:{unr:0,qi:0,res:0,blk:0,tt:0}, p3550:{unr:0,qi:0,res:0,blk:0,tt:0} },
};

// Derive per-location totals, grand total, scrappable (Unrestricted+Blocked) and a compact summary string.
function stockSummary(item) {
  const s = emeaStockByItem[item.id];
  if (!item.region || item.region !== 'EMEA' || !s) return null;
  const locTotal = (b) => b.unr + b.qi + b.res + b.blk; // excludes Transit & Transfer
  const loc = {
    TPM: locTotal(s.tpm), '4010': locTotal(s.p4010), '4020': locTotal(s.p4020), '2020': locTotal(s.p2020), '3550': locTotal(s.p3550),
  };
  const transit = s.tpm.tt + s.p4010.tt + s.p4020.tt + s.p2020.tt + s.p3550.tt;
  const total = Object.values(loc).reduce((a, b) => a + b, 0);
  const scrappable = (s.tpm.unr + s.tpm.blk) + (s.p4010.unr + s.p4010.blk) + (s.p4020.unr + s.p4020.blk) + (s.p2020.unr + s.p2020.blk) + (s.p3550.unr + s.p3550.blk);
  const parts = Object.entries(loc).filter(([, v]) => v > 0).map(([k, v]) => `${k} ${v}`);
  const chip = parts.length ? parts.join(' / ') : 'No stock';
  return { buckets: s, loc, transit, total, scrappable, chip };
}

// --- EMEA material / cross-plant / D-chain status (SQVI "EXTENDED2", "Status" tab) ---
// Per ONR line: cross-plant status, plant-specific status at each plant (3010/3020/3550/4010/4020), and D-chain status at WHS.
// Readiness rule (Note2): status 07 anywhere in {cross-plant, plant-sp 3550/3020/3010, D-chain} = BLOCKED;
// plant-specific status at 4010 is IGNORED. Values shown mirror the SQVI sample (5/6/7).
const emeaMatStatusByItem = {
  'DAV-500599188': { cross:'5', dchain:'5', plantSp:{ '3010':'6', '3020':'6', '3550':'5', '4010':'5', '4020':'5' } },
  'DAV-500594676': { cross:'5', dchain:'5', plantSp:{ '3010':'6', '3020':'6', '3550':'5', '4010':'5', '4020':'5' } },
  'QN-203986159':  { cross:'7', dchain:'5', plantSp:{ '3010':'6', '3020':'7', '3550':'7', '4010':'7', '4020':'5' } },
  'DAV-500591933': { cross:'5', dchain:'6', plantSp:{ '3010':'6', '3020':'5', '3550':'5', '4010':'7', '4020':'5' } },
  'QN-203924782':  { cross:'5', dchain:'5', plantSp:{ '3010':'5', '3020':'6', '3550':'6', '4010':'7', '4020':'6' } },
  'QN-400128':     { cross:'5', dchain:'5', plantSp:{ '3010':'5', '3020':'5', '3550':'5', '4010':'6', '4020':'5' } },
  'DAV-50001234':  { cross:'5', dchain:'5', plantSp:{ '3010':'5', '3020':'5', '3550':'5', '4010':'5', '4020':'5' } },
  'DAV-50001238':  { cross:'7', dchain:'5', plantSp:{ '3010':'6', '3020':'6', '3550':'6', '4010':'5', '4020':'5' } },
  'QN-400125':     { cross:'5', dchain:'5', plantSp:{ '3010':'5', '3020':'5', '3550':'5', '4010':'5', '4020':'5' } },
  // --- Scenario-representative records from 2609 ONR Sep 2026 (EXTENDED / Cross-plant / Return-plant-sp / D-chain) ---
  // Return-plant status is placed on the record's actual return plant; other plants carry a benign 5.
  'DAV-500603394':   { cross:'LD', dchain:'LD', plantSp:{ '3010':'5', '3020':'5', '3550':'5', '4010':'5', '4020':'5' }, note:'LD — no return, status n/a' },      // S-A OK-LD
  'DAV-500591890':   { cross:'5', dchain:'5', plantSp:{ '3010':'5', '3020':'5', '3550':'5', '4010':'5', '4020':'5' } },                                            // S-B Return 3010 (5/5/5)
  'DAV-500586048':   { cross:'6', dchain:'5', plantSp:{ '3010':'5', '3020':'5', '3550':'6', '4010':'5', '4020':'5' } },                                            // S-C Return 3550 (6/6/5)
  'QN-203636947':    { cross:'5', dchain:'5', plantSp:{ '3010':'5', '3020':'7', '3550':'5', '4010':'5', '4020':'5' } },                                            // S-D Return 3020, plant-sp 07 BLOCK
  'QN-203924782-NS': { cross:'5', dchain:'5', plantSp:{ '3010':'5', '3020':'5', '3550':'5', '4010':'5', '4020':'5' } },                                            // S-E no stock (status fine, closes on stock=0)
  'QN-203854359':    { cross:'NA', dchain:'NA', plantSp:{ '3010':'5', '3020':'NA', '3550':'5', '4010':'5', '4020':'5' }, extensionNeeded:true },                   // S-F extension needed (#N/A = not extended)
  'DAV-500599765':   { cross:'7', dchain:'5', plantSp:{ '3010':'7', '3020':'5', '3550':'5', '4010':'5', '4020':'7' } },                                            // S-G cross=07 + return 3010=07 BLOCK
  'QN-203949697':    { cross:'5', dchain:'5', plantSp:{ '3010':'5', '3020':'5', '3550':'5', '4010':'5', '4020':'5' } },                                            // S-H plant/batch split (clear)
};

// Governing plants for the return-readiness check (4010 is intentionally excluded).
const STATUS_GOVERNING_PLANTS = ['3550', '3020', '3010'];
const BLOCK_CODE = '07';

// Derive status readiness: BLOCKED if any governing field = 07; names the fields that tripped it, maps to EDM/ME routing.
function statusReadiness(item) {
  const s = emeaMatStatusByItem[item.id];
  if (!item.region || item.region !== 'EMEA' || !s) return null;
  // Material routed to LD (local destruction) carries no return-plant status check.
  if (s.cross === 'LD') return { data: s, ready: true, blockers: [], routeTo: null, routeCode: null, ldOnly: true };
  const blockers = [];
  const NOT_EXTENDED = (v) => v === 'NA' || v === '#N/A' || v === undefined || v === null;
  // Extension-needed / not-extended is itself a block → route to EDM for extension.
  if (s.extensionNeeded || NOT_EXTENDED(s.cross)) blockers.push('Not extended');
  if (s.cross === BLOCK_CODE) blockers.push('Cross-plant=07');
  if (s.dchain === BLOCK_CODE) blockers.push('D-chain=07');
  STATUS_GOVERNING_PLANTS.forEach(p => { if (s.plantSp[p] === BLOCK_CODE) blockers.push(`${p}=07`); });
  const ready = blockers.length === 0;
  // Routing hint (Decision-Tool codes 3/4/5): extension -> EDM; D-chain -> ME; cross-plant/plant-status -> EDM.
  let routeTo = null, routeCode = null;
  if (!ready) {
    if (s.extensionNeeded || NOT_EXTENDED(s.cross)) { routeTo = 'EDM (extend material)'; routeCode = '3 - Extension needed'; }
    else if (s.dchain === BLOCK_CODE && blockers.length === 1) { routeTo = 'ME (LPWB + EDM -> D-chain)'; routeCode = '5 - Change Mat D.chain status'; }
    else if (s.cross === BLOCK_CODE) { routeTo = 'EDM (extend / plant status)'; routeCode = '3/4 - Extension / plant status'; }
    else { routeTo = 'EDM (plant status)'; routeCode = '4 - Change Mat Plt status'; }
  }
  return { data: s, ready, blockers, routeTo, routeCode };
}

export default function ONRReports() {
  const { showToast } = useToast();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDG, setFilterDG] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [emailModal, setEmailModal] = useState(null);
  const [itemStatuses, setItemStatuses] = useState({});
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [expandedStock, setExpandedStock] = useState(null); // ONR item id whose EMEA stock breakdown is expanded
  const [expandedMatStatus, setExpandedMatStatus] = useState(null); // ONR item id whose material-status breakdown is expanded
  const [expandedTrace, setExpandedTrace] = useState(null); // 'itemId#idx' of the open past email
  const [batchApprovalModal, setBatchApprovalModal] = useState(null);
  const [followUp, setFollowUp] = useState({});
  const [sapApproved, setSapApproved] = useState({});
  const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const REMINDER_DAYS = 7; // 7 working days before a reminder becomes due
  const [clockDays, setClockDays] = useState(0); // demo clock offset to visualize the 7-day window
  const [showRulesFor, setShowRulesFor] = useState(null); // ONR item id whose business-rules trace is expanded
  const nowMs = () => Date.now() + clockDays * 86400000;
  const daysSince = (ts) => ts ? Math.floor((nowMs() - ts) / 86400000) : 0;

  // Filter + sort by aging (highest first)
  const filtered = useMemo(() => {
    return onrItems.filter(item => {
      const currentStatus = itemStatuses[item.id] || item.status;
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending-planner' && !currentStatus.includes('Planner')) return false;
        if (filterStatus === 'pending-brand' && !currentStatus.includes('Brand')) return false;
        if (filterStatus === 'assigned' && !currentStatus.includes('Assigned')) return false;
        if (filterStatus === 'pending' && currentStatus.includes('Assigned')) return false;
        if (filterStatus === 'high-priority' && item.aging <= 30) return false;
      }
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (filterDG !== 'all' && item.dg !== filterDG) return false;
      if (filterRegion !== 'all' && item.region !== filterRegion) return false;
      return true;
    }).sort((a, b) => b.aging - a.aging);
  }, [filterStatus, filterType, filterDG, filterRegion, itemStatuses]);

  const selectedCount = Object.keys(selectedItems).filter(k => selectedItems[k]).length;
  // Type-lock: multi-select is restricted to a single type (DAV-only or QN-only) because QN and DAV have different approvers.
  const selectedIds = Object.keys(selectedItems).filter(k => selectedItems[k]);
  const selectedType = selectedIds.length ? (onrItems.find(i => i.id === selectedIds[0]) || {}).type : null;
  const pendingCount = onrItems.filter(i => !(itemStatuses[i.id] || i.status).includes('Assigned')).length;
  const effStatus = (item) => sapApproved[item.id] ? 'Approved - Assigned to IA' : (itemStatuses[item.id] || item.status);
  const isApproved = (item) => effStatus(item).includes('Assigned');
  const fu = (id) => followUp[id] || { state: 'Not Sent', reminderCount: 0 };
  // A sent record whose approver has not acted within 7 working days is 'reminder due'.
  const isReminderDue = (item) => { const f = fu(item.id); if (isApproved(item)) return false; if (f.state !== 'Requested' && f.state !== 'Reminded') return false; return daysSince(f.lastAt || f.sentAt) >= REMINDER_DAYS; };
  const toggleEmail = (id) => setExpandedEmail(prev => prev === id ? null : id);

  // Build a structured approval/reminder email for one or more QN or DAV records that share an approver.
  // Returns { to, cc, subject, greeting, intro, why, rows[], footerLines[], kind } for tabular rendering.
  const buildApprovalEmail = (itemsArg, kind, approverArg) => {
    const items = Array.isArray(itemsArg) ? itemsArg : [itemsArg];
    const first = items[0];
    const isReminderMail = kind && kind.toLowerCase().indexOf('reminder') === 0;
    const isDav = first.type === 'DAV';
    const approver = approverArg || (first.assignee && first.assignee !== 'Unassigned' ? first.assignee : (isDav ? 'DAV Approver (MRPC / Brand)' : 'QN Reviewer / Approver'));
    const to = (approver && approver !== 'Unassigned' && !approver.startsWith('Coordinator'))
      ? (approver.toLowerCase().replace(/[^a-z]/g, '.') + '@elcompanies.com')
      : (isDav ? 'dav.approver@elcompanies.com' : 'qn.reviewer@elcompanies.com');
    const subject = (isReminderMail ? 'REMINDER: ' : '') + 'Action Required - ' + items.length + ' ' + first.type + '(s) Awaiting Your ' + (isDav ? 'Approval' : 'Review/Approval') + ' | ' + first.region + ' | SynOps ONR';
    const intro = isDav
      ? 'The following Destruction Approval Voucher(s) (DAV) in the SynOps ONR queue are awaiting your approval. Please review and approve/reject so we can proceed with destruction execution.'
      : 'The following Quality Notification(s) (QN) in the SynOps ONR queue are awaiting your review/approval. Please provide your decision so the items can move to destruction disposition.';
    const why = isDav
      ? 'Routed to you per the DAV approval matrix (high-value -> Brand/Business approval before Inventory execution).'
      : 'These QNs sit in your review chain and are pending your decision.';
    return {
      kind: kind || 'Approval Request',
      to, cc: 'sunand.tiwari@elcompanies.com (Inventory Analyst)', subject,
      greeting: 'Hi ' + approver + ',',
      reminderNote: isReminderMail ? ('[' + kind + '] This is a follow-up reminder; the item(s) below are still awaiting your approval.') : '',
      intro, why, type: first.type,
      rows: items.map(it => ({ id: it.id, material: it.material, materialDesc: it.materialDesc, plant: it.plant, qty: it.qty, value: it.value, aging: it.aging, haz: it.dg === 'Yes' ? 'Yes' : 'No' })),
      footerLines: [
        'Action needed:  Approve -> moves to Inventory for ' + (isDav ? 'vendor coordination and destruction.' : 'destruction disposition.') + '   Reject/Query -> reply with the reason and SynOps will route it back.',
        'Please action within 7 days. If no response is received in one week, SynOps will send an automatic reminder.',
        'Note: Internal approval email - cost/value included. No Excel attachment (Excel format is used only for vendor follow-ups).',
        'Thanks, Sunand Tiwari | TPM Inventory Analyst - ' + first.region + ' | Sent via SynOps ONR - QN/DAV Consolidated Report'
      ]
    };
  };

  // Shared renderer: To/Cc/Subject + a line-item table with Decision (Approve/Reject) and Comment columns.
  const EmailView = ({ em }) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: '11px' }}>
      <div><strong>To:</strong> {em.to}</div>
      <div><strong>Cc:</strong> {em.cc}</div>
      <div><strong>Subject:</strong> {em.subject}</div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
      <div style={{ marginBottom: '6px' }}>{em.greeting}</div>
      {em.reminderNote && <div style={{ marginBottom: '6px', color: '#D97706', fontWeight: 600 }}>{em.reminderNote}</div>}
      <div style={{ marginBottom: '8px' }}>{em.intro}</div>
      <table style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead><tr style={{ textAlign: 'left', background: 'var(--primary-light)' }}>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{em.type}#</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Material</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Description</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Plant</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Qty</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Value</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Aging</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Haz</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Decision</th>
          <th style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>Comment</th>
        </tr></thead>
        <tbody>
          {em.rows.map(r => (
            <tr key={r.id}>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}><strong>{r.id}</strong></td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{r.material}</td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{r.materialDesc}</td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{r.plant}</td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{r.qty}</td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{r.value}</td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{r.aging}d</td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{r.haz}</td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>
                <select defaultValue="" style={{ fontSize: '10px', padding: '2px 4px' }}>
                  <option value="">-- Select --</option>
                  <option value="Approve">Approve</option>
                  <option value="Reject">Reject</option>
                </select>
              </td>
              <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>
                <input type="text" placeholder="Comment" style={{ fontSize: '10px', padding: '2px 4px', width: '120px' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const toggleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    const sel = {};
    if (next) {
      // Lock Select All to one type: use the type already in progress, else the Type filter, else the first pending row's type.
      const pendingRows = filtered.filter(i => !(itemStatuses[i.id] || i.status).includes('Assigned'));
      const lockType = selectedType || (filterType !== 'all' ? filterType : (pendingRows[0] && pendingRows[0].type));
      pendingRows.filter(i => i.type === lockType).forEach(item => { sel[item.id] = true; });
    }
    setSelectedItems(sel);
  };

  const toggleItem = (id, type) => {
    // If selecting (not unselecting) and a different type is already selected, block it.
    if (!selectedItems[id] && selectedType && type !== selectedType) {
      showToast('You can select only ' + selectedType + ' records together. Clear the selection to switch to ' + type + '.');
      return;
    }
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getRowClass = (item) => {
    if (item.aging > 30) return 'row-red';
    if (item.aging > 20) return 'row-amber';
    return '';
  };

  const handleRemind = (item) => {
    const status = itemStatuses[item.id] || item.status;
    setEmailModal({ item, type: status.includes('Planner') ? 'planner' : 'brand' });
  };

  const handleApproveAssign = (item) => {
    setItemStatuses(prev => ({ ...prev, [item.id]: 'Approved — Assigned to IA' }));
    showToast(`${item.id}: Approved & assigned to Inventory Analyst for destruction execution.`);
  };

  const handleBatchRemind = () => {
    if (selectedCount === 0) { showToast('Select items first'); return; }
    // Exclude already-approved rows - they must not be re-sent or reminded.
    const rows = onrItems.filter(i => selectedItems[i.id] && !isApproved(i));
    if (rows.length === 0) { showToast('All selected records are already approved. Nothing to send.'); return; }
    const groups = {};
    rows.forEach(r => {
      const key = (r.assignee && r.assignee !== 'Unassigned') ? r.assignee : 'Coordinator / MRPC (escalation - blank assignee)';
      (groups[key] = groups[key] || []).push(r);
    });
    setBatchApprovalModal({ type: selectedType, groups });
  };

  const confirmBatchApproval = () => {
    const rows = onrItems.filter(i => selectedItems[i.id] && !isApproved(i));
    const isReminder = rows.some(r => fu(r.id).state === 'Requested' || fu(r.id).state === 'Reminded');
    const batchId = 'B' + Date.now().toString().slice(-6);
    const d = today();
    setItemStatuses(prev => { const next = { ...prev }; rows.forEach(r => { next[r.id] = 'Approval Requested - Pending SAP Sync'; }); return next; });
    setFollowUp(prev => {
      const next = { ...prev };
      // Group this batch's rows by approver so the captured email lists all that approver's line items (tabular).
      const grp = {};
      rows.forEach(r => { const a = (r.assignee && r.assignee !== 'Unassigned') ? r.assignee : 'Coordinator/MRPC'; (grp[a] = grp[a] || []).push(r); });
      rows.forEach(r => {
        const ex = next[r.id];
        const appr = (r.assignee && r.assignee !== 'Unassigned') ? r.assignee : 'Coordinator/MRPC';
        const groupItems = grp[appr];
        if (ex && (ex.state === 'Requested' || ex.state === 'Reminded')) {
          const rc = (ex.reminderCount || 0) + 1;
          const kindLbl = 'Reminder #' + rc;
          const email = buildApprovalEmail(groupItems, kindLbl, appr);
          const trace = [...(ex.trace || []), { kind: kindLbl, date: d, to: appr, batchId, email }];
          next[r.id] = { ...ex, state: 'Reminded', lastReminderDate: d, lastAt: nowMs(), reminderCount: rc, batchId, trace };
        } else {
          const kindLbl = 'Approval Request (1st mail)';
          const email = buildApprovalEmail(groupItems, kindLbl, appr);
          const trace = [{ kind: kindLbl, date: d, to: appr, batchId, email }];
          next[r.id] = { state: 'Requested', firstSentDate: d, sentAt: nowMs(), lastAt: nowMs(), lastReminderDate: null, reminderCount: 0, batchId, approver: appr, trace };
        }
      });
      return next;
    });
    showToast((isReminder ? 'Reminder' : 'Approval request') + ' sent for ' + rows.length + ' ' + (selectedType || '') + ' record(s) [batch ' + batchId + ']. SAP confirms on next extract.');
    setBatchApprovalModal(null); setSelectedItems({}); setSelectAll(false);
  };

  const simulateSapSync = () => {
    const pending = onrItems.filter(i => (fu(i.id).state === 'Requested' || fu(i.id).state === 'Reminded') && !isApproved(i));
    if (pending.length === 0) { showToast('No pending approval requests to reconcile. Send for approval first.'); return; }
    const target = pending[0];
    setSapApproved(prev => ({ ...prev, [target.id]: true }));
    setFollowUp(prev => { const cur = fu(target.id); const trace = [...(cur.trace || []), { kind: 'SAP extract: Approved (Task Assignee -> Inventory)', date: today(), to: 'SAP -> SynOps' }]; return { ...prev, [target.id]: { ...cur, state: 'Responded', respondedDate: today(), trace } }; });
    setSelectedItems(prev => { const n = { ...prev }; delete n[target.id]; return n; }); // clear it from any active selection
    showToast('SAP extract: ' + target.id + ' Task Assignee -> Inventory. Status = Approved. ' + (pending.length - 1) + ' still pending.');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius)', border: '1px solid #D8B4FE' }}>
        <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '14px', color: 'var(--primary-dark)', marginBottom: '4px' }}>
          QN & DAV Consolidated Report — Destruction Pipeline
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Source: SAP ZQRGT 237701 (QN) & 237700 (DAV) | Hourly refresh | Grouped by QN/DAV#, Material, Classification (Haz/Non-Haz), Aging, Approval Status
        </div>
      </div>

      {/* Summary KPIs — Clickable to filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div onClick={() => { setFilterStatus('all'); setFilterType('all'); setFilterDG('all'); setFilterRegion('all'); }} style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: filterStatus === 'all' && filterDG === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius)', borderTop: '3px solid var(--primary)', cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Open</div>
          <div style={{ fontSize: '22px', fontFamily: 'Graphik-Bold', color: 'var(--primary)' }}>{onrItems.length}</div>
        </div>
        <div onClick={() => { setFilterStatus('pending'); setFilterType('all'); setFilterDG('all'); setFilterRegion('all'); }} style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: filterStatus === 'pending' ? '2px solid var(--warning)' : '1px solid var(--border)', borderRadius: 'var(--radius)', borderTop: '3px solid var(--warning)', cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pending Approval</div>
          <div style={{ fontSize: '22px', fontFamily: 'Graphik-Bold', color: 'var(--warning)' }}>{pendingCount}</div>
        </div>
        <div onClick={() => { setFilterStatus('high-priority'); setFilterType('all'); setFilterDG('all'); setFilterRegion('all'); }} style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: filterStatus === 'high-priority' ? '2px solid var(--danger)' : '1px solid var(--border)', borderRadius: 'var(--radius)', borderTop: '3px solid var(--danger)', cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>High Priority (&gt;30d)</div>
          <div style={{ fontSize: '22px', fontFamily: 'Graphik-Bold', color: 'var(--danger)' }}>{onrItems.filter(i => i.aging > 30).length}</div>
        </div>
        <div onClick={() => { setFilterStatus('all'); setFilterType('all'); setFilterDG('Yes'); setFilterRegion('all'); }} style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: filterDG === 'Yes' ? '2px solid #c62828' : '1px solid var(--border)', borderRadius: 'var(--radius)', borderTop: '3px solid #c62828', cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hazardous</div>
          <div style={{ fontSize: '22px', fontFamily: 'Graphik-Bold', color: '#c62828' }}>{onrItems.filter(i => i.dg === 'Yes').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">All Pending Approval</option>
          <option value="pending-planner">Pending Planner Approval</option>
          <option value="pending-brand">Pending Brand Approval</option>
          <option value="assigned">Approved — Assigned to IA</option>
          <option value="high-priority">High Priority (&gt;30d aging)</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="QN">QN Only</option>
          <option value="DAV">DAV Only</option>
        </select>
        <select value={filterDG} onChange={e => setFilterDG(e.target.value)}>
          <option value="all">All Classification</option>
          <option value="Yes">Hazardous Only</option>
          <option value="No">Non-Hazardous Only</option>
        </select>
        <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
          <option value="all">All Regions</option>
          <option value="EMEA">EMEA</option>
          <option value="NA">NA</option>
          <option value="APAC">APAC</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <div style={{ margin: '12px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {(() => {
          const sel = onrItems.filter(i => selectedItems[i.id] && !isApproved(i));
          const anySent = sel.some(r => fu(r.id).state === 'Requested' || fu(r.id).state === 'Reminded');
          const rc = (sel.length ? Math.max(0, ...sel.map(r => (fu(r.id).reminderCount || 0))) : 0) + 1;
          const reminderMode = anySent; // any selected already-sent -> this is a reminder action
          const anyDue = sel.some(r => isReminderDue(r));
          // First approval send: enabled when items selected. Reminder: enabled only if 7 working days elapsed on at least one selected item.
          const disabled = selectedCount === 0 || (reminderMode && !anyDue);
          const label = reminderMode ? ('Send Reminder #' + rc) : ('Send ' + (selectedType || '') + ' for Approval');
          const title = reminderMode && !anyDue ? 'Reminder not due yet - approver has ' + REMINDER_DAYS + ' working days to respond' : '';
          return (
            <button className="btn btn-info" onClick={handleBatchRemind} disabled={disabled} title={title}>
              ✉ {label} ({selectedCount}){reminderMode && anyDue ? '  ⏰ Due' : ''}
            </button>
          );
        })()}
        <button className="btn btn-secondary" onClick={simulateSapSync} title="Demo: reconcile next SAP extract">↻ Simulate SAP Sync</button>
        <button className="btn btn-secondary" onClick={() => setClockDays(c => c + 7)} title="Demo: advance the clock 7 days to make reminders due">⏩ Advance 7 days{clockDays ? ' (+' + clockDays + 'd)' : ''}</button>
        {selectedCount > 0 && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{selectedCount} selected</span>}
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>Showing {filtered.length} of {onrItems.length} | Sorted by aging (highest first)</span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /></th>
              <th>QN/DAV#</th>
              <th>Type</th>
              <th>Material</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Classification</th>
              <th>Aging</th>
              <th>Status</th>
              <th>Follow-Up</th>
              <th>Assignee</th>
              <th>Value</th>
              {filterRegion === 'EMEA' && <th title="EMEA-only: on-hand stock across TPM, virtual plants (4010/4020/2020) and 3550 (DSV). Click to expand full bucket breakdown.">EMEA Stock</th>}
              {filterRegion === 'EMEA' && <th title="EMEA-only: Extension / material-status readiness. Cross-plant, plant-specific (3550/3020/3010) and D-chain status must all be not-07; 4010 ignored. Click to expand.">Mat. Status</th>}
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const eff = effStatus(item);
              const currentStatus = eff;
              const isPending = !eff.includes('Assigned');
              return (
                <>
                <tr key={item.id} className={getRowClass(item)}>
                  <td><input type="checkbox" checked={!!selectedItems[item.id]} disabled={(!selectedItems[item.id] && selectedType && item.type !== selectedType) || isApproved(item)} onChange={() => toggleItem(item.id, item.type)} title={isApproved(item) ? 'Approved - not selectable' : (!selectedItems[item.id] && selectedType && item.type !== selectedType ? ('Locked - ' + selectedType + ' selection in progress') : '')} /></td>
                  <td><strong>{item.id}</strong></td>
                  <td><span className={`type-badge ${item.type === 'DAV' ? 'type-destruction' : 'type-qn'}`}>{item.type}</span></td>
                  <td>{item.material}</td>
                  <td style={{ fontSize: '11px', maxWidth: '180px' }}>{item.materialDesc}</td>
                  <td>{item.qty}</td>
                  <td>{item.dg === 'Yes' ? <span style={{ color: '#c62828', fontWeight: 700 }}>⚠ Hazardous</span> : <span style={{ color: '#047857' }}>Non-Haz</span>}</td>
                  <td><strong style={{ color: item.aging > 30 ? '#DC2626' : item.aging > 20 ? '#D97706' : 'inherit' }}>{item.aging}d</strong></td>
                  <td>{(() => {
                    const isHold = eff.startsWith('HOLD');
                    const isClosed = eff.startsWith('Closed');
                    const bg = isHold ? '#FEF2F2' : isClosed ? '#F3F4F6' : (eff.includes('Assigned') ? undefined : undefined);
                    const fg = isHold ? '#B91C1C' : isClosed ? '#6B7280' : undefined;
                    if (isHold || isClosed) {
                      return <span style={{ fontSize: '10px', fontWeight: 700, color: fg, background: bg, border: `1px solid ${isHold ? '#FECACA' : '#E5E7EB'}`, borderRadius: '10px', padding: '2px 8px', whiteSpace: 'nowrap' }}>{isHold ? '⛔ ' : '✓ '}{eff}</span>;
                    }
                    return <span className={`status-badge ${eff.includes('Assigned') ? 'status-completed' : 'status-pending'}`} style={{ fontSize: '10px' }}>{eff}</span>;
                  })()}</td>
                  <td style={{ fontSize: '10px' }}>{(() => {
                    const f = fu(item.id);
                    if (isApproved(item)) return <span style={{ color: '#047857', fontWeight: 600 }}>✓ Responded</span>;
                    if (f.state === 'Requested' || f.state === 'Reminded') {
                      const due = isReminderDue(item);
                      const remain = REMINDER_DAYS - daysSince(f.lastAt || f.sentAt);
                      const label = f.state === 'Reminded' ? ('Reminder x' + f.reminderCount + ' (' + f.lastReminderDate + ')') : ('Requested (' + f.firstSentDate + ')');
                      return (<div>
                        <div style={{ color: f.state === 'Reminded' ? '#D97706' : 'var(--primary)', fontWeight: 600 }}>{label}</div>
                        {due
                          ? <span style={{ display: 'inline-block', marginTop: '2px', background: '#DC2626', color: '#fff', borderRadius: '3px', padding: '1px 5px', fontSize: '9px', fontWeight: 700 }}>⏰ Reminder Due</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>due in {remain}d</span>}
                      </div>);
                    }
                    return <span style={{ color: 'var(--text-muted)' }}>Not Sent</span>;
                  })()}</td>
                  <td style={{ fontSize: '11px' }}>{eff.includes('Assigned') ? (item.assignee !== 'Unassigned' ? item.assignee : 'Chris Wang') : item.assignee}</td>
                  <td>{item.value}</td>
                  {filterRegion === 'EMEA' && <td style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{(() => {
                    const ss = stockSummary(item);
                    if (!ss) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
                    return (
                      <button onClick={() => setExpandedStock(expandedStock === item.id ? null : item.id)} title="Click to view full stock breakdown by location and bucket"
                        style={{ border: '1px solid var(--border)', background: ss.total === 0 ? '#FEF2F2' : 'var(--surface)', cursor: 'pointer', borderRadius: '4px', padding: '3px 6px', fontSize: '10px', lineHeight: 1.3, textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: ss.total === 0 ? '#DC2626' : 'var(--primary-dark)' }}>Σ {ss.total}{ss.transit ? ` (+${ss.transit} transit)` : ''}</div>
                        <div style={{ color: ss.total === 0 ? '#DC2626' : 'var(--text-secondary)' }}>{ss.total === 0 ? 'No stock → Close' : ss.chip}</div>
                        {ss.total > 0 && <div style={{ color: '#047857', fontSize: '9px' }}>Scrappable {ss.scrappable} {expandedStock === item.id ? '▲' : '▼'}</div>}
                        {ss.total === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{expandedStock === item.id ? '▲' : '▼'}</div>}
                      </button>
                    );
                  })()}</td>}
                  {filterRegion === 'EMEA' && <td style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{(() => {
                    const st = statusReadiness(item);
                    if (!st) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
                    // Route plant for this line (3010/3020/3550) → show its own status in the ready chip.
                    const rp = (item.route && (item.route.match(/\b(3010|3020|3550)\b/) || [])[1]) || null;
                    const rpVal = rp ? st.data.plantSp[rp] : null;
                    const readyLabel = rp ? `${rp} ok · D-chain ok` : 'no 07 in governing fields';
                    return (
                      <button onClick={() => setExpandedMatStatus(expandedMatStatus === item.id ? null : item.id)} title={rp ? `Route plant ${rp} status ${rpVal}; click for full matrix` : 'Click to view cross-plant / plant-specific / D-chain status by plant'}
                        style={{ border: '1px solid var(--border)', background: st.ready ? '#F0FDF4' : '#FEF2F2', cursor: 'pointer', borderRadius: '4px', padding: '3px 6px', fontSize: '10px', lineHeight: 1.3, textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: st.ready ? '#047857' : '#DC2626' }}>{st.ready ? '✓ Ready' : '✗ Blocked'} {rp ? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({rp})</span> : null} {expandedMatStatus === item.id ? '▲' : '▼'}</div>
                        {!st.ready && <div style={{ color: '#B91C1C' }}>{st.blockers.join(', ')}</div>}
                        {!st.ready && <div style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>→ {st.routeTo}</div>}
                        {st.ready && <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{readyLabel}</div>}
                      </button>
                    );
                  })()}</td>}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button onClick={() => toggleEmail(item.id)} title="View approval email & trace"
                      style={{ border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--primary)', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>
                      ✉ {expandedEmail === item.id ? 'Hide' : 'View email'}
                    </button>
                    <button onClick={() => setShowRulesFor(showRulesFor === item.id ? null : item.id)} title="Show which business rules derived this decision"
                      style={{ border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--primary-dark)', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', marginLeft: '4px' }}>
                      {'⚙'} {showRulesFor === item.id ? 'Hide rules' : 'Rules'}
                    </button>
                  </td>
                </tr>
                {expandedStock === item.id && (() => {
                  const ss = stockSummary(item);
                  if (!ss) return null;
                  const b = ss.buckets;
                  const allLocs = [
                    { key: 'TPM', label: 'TPM (special stock O)', sub: 'Plant+TPM+Material+Batch', d: b.tpm },
                    { key: '4010', label: 'Plant 4010 (virtual)', sub: 'Plant+Material+Batch', d: b.p4010 },
                    { key: '4020', label: 'Plant 4020 (virtual)', sub: 'Plant+Material+Batch', d: b.p4020 },
                    { key: '2020', label: 'Plant 2020 (virtual)', sub: 'Plant+Material+Batch', d: b.p2020 },
                    { key: '3550', label: 'Plant 3550 (DSV / DC)', sub: 'Material+Batch (not-in-transit)', d: b.p3550 },
                  ];
                  const hasPos = (d) => (d.unr + d.qi + d.res + d.blk + d.tt) > 0;
                  // Show only locations where this line actually carries a position (relevant to its route);
                  // keep every location for the Total so figures still reconcile.
                  const locs = allLocs.filter(l => hasPos(l.d));
                  const hidden = allLocs.filter(l => !hasPos(l.d)).map(l => l.key);
                  const cell = { padding: '4px 8px', border: '1px solid var(--border)' };
                  const num = (v, hi) => <td style={{ ...cell, textAlign: 'right', fontWeight: v > 0 ? 700 : 400, color: v > 0 ? (hi ? '#047857' : 'var(--text-primary)') : 'var(--text-muted)' }}>{v}</td>;
                  const tot = (sel) => allLocs.reduce((a, l) => a + sel(l.d), 0);
                  return (
                  <tr key={item.id + '-stock'}>
                    <td colSpan={15} style={{ background: '#F0FDF4', padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', marginBottom: '6px' }}>
                        {'\u25A0'} EMEA Stock Position — {item.id} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '10px' }}>(SAP MB52. Showing only locations where this {item.type} actually holds stock{item.route ? ` — route: ${item.route}` : ''}. Only Unrestricted + Blocked are scrappable; QI &amp; Restricted must be moved by QC first.)</span>
                      </div>
                      {ss.total === 0 ? (
                        <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700, padding: '6px 8px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px' }}>
                          No stock in any location for this {item.type} → Close-No-Stock route. Nothing to scrap or return.
                        </div>
                      ) : (
                      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ textAlign: 'left', background: 'var(--primary-light)' }}>
                          <th style={cell}>Location</th>
                          <th style={{ ...cell, textAlign: 'right' }}>Unrestricted</th>
                          <th style={{ ...cell, textAlign: 'right' }}>In Qual. Insp.</th>
                          <th style={{ ...cell, textAlign: 'right' }}>Restricted-Use</th>
                          <th style={{ ...cell, textAlign: 'right' }}>Blocked</th>
                          <th style={{ ...cell, textAlign: 'right' }}>Transit &amp; Transfer</th>
                          <th style={{ ...cell, textAlign: 'right' }}>Location Total</th>
                          <th style={{ ...cell, textAlign: 'right' }}>Scrappable</th>
                        </tr></thead>
                        <tbody>
                          {locs.map(l => {
                            const locTot = l.d.unr + l.d.qi + l.d.res + l.d.blk;
                            const scr = l.d.unr + l.d.blk;
                            return (
                              <tr key={l.key}>
                                <td style={cell}><strong>{l.label}</strong><div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{l.sub}</div></td>
                                {num(l.d.unr, true)}{num(l.d.qi)}{num(l.d.res)}{num(l.d.blk, true)}{num(l.d.tt)}
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>{locTot}</td>
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 700, color: scr > 0 ? '#047857' : 'var(--text-muted)' }}>{scr}</td>
                              </tr>
                            );
                          })}
                          {locs.length > 1 && (
                          <tr style={{ background: '#ECFDF5' }}>
                            <td style={{ ...cell, fontWeight: 700 }}>Total (all locations)</td>
                            {num(tot(d => d.unr), true)}{num(tot(d => d.qi))}{num(tot(d => d.res))}{num(tot(d => d.blk), true)}{num(tot(d => d.tt))}
                            <td style={{ ...cell, textAlign: 'right', fontWeight: 800, color: 'var(--primary-dark)' }}>{ss.total}</td>
                            <td style={{ ...cell, textAlign: 'right', fontWeight: 800, color: '#047857' }}>{ss.scrappable}</td>
                          </tr>
                          )}
                        </tbody>
                      </table>
                      )}
                      {ss.total > 0 && hidden.length > 0 && (
                        <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                          Hidden (zero stock): {hidden.join(', ')}. Scrappable = Unrestricted + Blocked.
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })()}
                {expandedMatStatus === item.id && (() => {
                  const st = statusReadiness(item);
                  if (!st) return null;
                  const s = st.data;
                  const cell = { padding: '4px 8px', border: '1px solid var(--border)' };
                  // Target plant for this line, derived from its route (e.g. "Scenario 3 - Plant 3020" -> 3020).
                  const routePlant = (item.route && (item.route.match(/\b(3010|3020|3550)\b/) || [])[1]) || null;
                  const psRows = [
                    { key: 'ps3010', plant: '3010', val: s.plantSp['3010'], governing: true, note: 'Receiving / return plant' },
                    { key: 'ps3020', plant: '3020', val: s.plantSp['3020'], governing: true, note: 'Hub plant' },
                    { key: 'ps3550', plant: '3550', val: s.plantSp['3550'], governing: true, note: 'DSV / destruction DC' },
                    { key: 'ps4010', plant: '4010', val: s.plantSp['4010'], governing: false, note: 'Virtual plant — IGNORED for the gate' },
                    { key: 'ps4020', plant: '4020', val: s.plantSp['4020'], governing: false, note: 'Virtual plant — informational' },
                  ];
                  // Relevant plant rows = this line's route plant + any plant currently blocking (07). Others collapse to a note.
                  const relevant = psRows.filter(r => r.plant === routePlant || (r.governing && r.val === BLOCK_CODE));
                  const collapsed = psRows.filter(r => !(r.plant === routePlant || (r.governing && r.val === BLOCK_CODE)));
                  const fields = [
                    { key: 'cross', label: 'Cross-plant status', plant: '—', val: s.cross, governing: true, note: 'Material basic status (all plants)' },
                    ...relevant.map(r => ({ ...r, label: 'Plant-specific status' + (r.plant === routePlant ? ' (this route)' : '') })),
                    { key: 'dchain', label: 'Distribution-chain status', plant: 'WHS', val: s.dchain, governing: true, note: 'D-chain (sales/distribution) at WHS' },
                  ];
                  return (
                  <tr key={item.id + '-matstatus'}>
                    <td colSpan={15} style={{ background: st.ready ? '#F0FDF4' : '#FEF2F2', padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', marginBottom: '4px' }}>
                        {'\u25A0'} Material / Cross-plant / D-chain Status — {item.id} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '10px' }}>(SQVI "EXTENDED2" → Status tab. SOrg 4070/4540, DChl 10. A status of <strong>07</strong> on any governing field blocks the return; plant 4010 is excluded from the gate.)</span>
                      </div>
                      {/* WHEN this check runs in the SynOps flow */}
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px', padding: '4px 8px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
                        <strong>Triggered:</strong> automatically during ONR ingestion/refresh, after Decision-Tool routing (EMEA-ONR-10) and before any return/STO is drafted — re-runs whenever the line is re-evaluated or an EDM/ME fix is confirmed.
                      </div>
                      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ textAlign: 'left', background: 'var(--primary-light)' }}>
                          <th style={cell}>Status Field</th>
                          <th style={cell}>Plant / Scope</th>
                          <th style={{ ...cell, textAlign: 'center' }}>Status</th>
                          <th style={{ ...cell, textAlign: 'center' }}>In Gate?</th>
                          <th style={cell}>Meaning</th>
                        </tr></thead>
                        <tbody>
                          {fields.map(f => {
                            const isBlock = f.val === BLOCK_CODE;
                            const counts = f.governing;
                            return (
                              <tr key={f.key} style={{ background: isBlock && counts ? '#FEE2E2' : 'transparent' }}>
                                <td style={cell}>{f.label}</td>
                                <td style={cell}><strong>{f.plant}</strong></td>
                                <td style={{ ...cell, textAlign: 'center', fontWeight: 700, color: isBlock ? '#DC2626' : '#047857' }}>{f.val}{isBlock ? ' ⛔' : ''}</td>
                                <td style={{ ...cell, textAlign: 'center', color: counts ? 'var(--text-primary)' : 'var(--text-muted)' }}>{counts ? 'Yes' : 'ignored'}</td>
                                <td style={{ ...cell, color: 'var(--text-secondary)', fontSize: '10px' }}>{f.note}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {collapsed.length > 0 && (
                        <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                          Other plants not relevant to this line's route: {collapsed.map(r => `${r.plant}=${r.val}${r.governing ? '' : ' (ignored)'}`).join(', ')} — none blocking.
                        </div>
                      )}
                      {/* Verdict + routing */}
                      <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, color: st.ready ? '#047857' : '#B91C1C' }}>
                        {st.ready
                          ? '✓ Ready — all governing status fields are not-07; the return/STO can proceed.'
                          : `✗ Blocked — ${st.blockers.join(', ')}. Route to ${st.routeTo} (Decision-Tool code ${st.routeCode}).`}
                      </div>
                      {/* WHAT the IA can do on the UI */}
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {!st.ready && (
                          <button onClick={() => showToast(`Master-data fix request raised to ${st.routeTo.includes('ME') ? 'ME (TPMMEEMEA@elcompanies.net)' : 'EDM'} for ${item.id} — ${st.routeCode}. Item held until confirmed.`, 'success')}
                            style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #DC2626', background: '#FEF2F2', color: '#B91C1C', cursor: 'pointer', fontWeight: 600 }}>
                            Raise {st.routeTo.includes('ME') ? 'ME' : 'EDM'} fix request
                          </button>
                        )}
                        <button onClick={() => showToast(`SQVI EXTENDED2 status re-pulled for ${item.id} from SAP.`, 'info')}
                          style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--primary)', background: 'var(--surface)', color: 'var(--primary-dark)', cursor: 'pointer', fontWeight: 600 }}>
                          Refresh status (re-run SQVI)
                        </button>
                        {!st.ready && (
                          <button onClick={() => showToast(`${item.id} held on 'Material-Status' until EDM/ME confirms the fix. Return/STO suppressed.`, 'warning')}
                            style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #D97706', background: '#FFFBEB', color: '#92400E', cursor: 'pointer', fontWeight: 600 }}>
                            Hold line until fixed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })()}
                {showRulesFor === item.id && (() => {
                  const R = evaluateItem(item);
                  const rows = [
                    { label: 'Eligible for LD', r: R.ldEligible, val: R.ldEligible.value ? 'Yes' : 'No' },
                    { label: 'Route / Decision Tool', r: R.route, val: R.route.value },
                    { label: 'Scrap Decision', r: R.scrap, val: R.scrap.value },
                    { label: 'Movement Type / Customs', r: R.movement, val: R.movement.value },
                    { label: 'STO / Logistics Chain', r: R.stoChain, val: R.stoChain.value },
                    { label: 'Approval Routing', r: R.approval, val: R.approval.value },
                    { label: 'Hard Guards', r: R.guards, val: (R.guards.value.length ? R.guards.value.join(', ') : 'None triggered') },
                  ];
                  return (
                  <tr key={item.id + '-rules'}>
                    <td colSpan={filterRegion === 'EMEA' ? 15 : 13} style={{ background: '#FAF5FF', padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', marginBottom: '6px' }}>{'\u2699'} Business Rules Engine - derived decision for {item.id} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '10px' }}>(each value below is computed by a configurable rule, not typed by the analyst)</span></div>
                      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ textAlign: 'left', background: 'var(--primary-light)' }}>
                          <th style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>Rule</th>
                          <th style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>Derived Value</th>
                          <th style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>Rule ID</th>
                          <th style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>Because</th>
                        </tr></thead>
                        <tbody>
                          {rows.map((x, i) => (
                            <tr key={i}>
                              <td style={{ padding: '4px 8px', border: '1px solid var(--border)', fontWeight: 600 }}>{x.label}</td>
                              <td style={{ padding: '4px 8px', border: '1px solid var(--border)', color: 'var(--primary-dark)', fontWeight: 700 }}>{x.val}</td>
                              <td style={{ padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '10px' }}>{x.r.rule}</td>
                              <td style={{ padding: '4px 8px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{x.r.because}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  );
                })()}
                {expandedEmail === item.id && (() => { const em = buildApprovalEmail(item); return (
                  <tr key={item.id + '-email'}>
                    <td colSpan={filterRegion === 'EMEA' ? 15 : 13} style={{ background: 'var(--primary-light)', padding: '12px 16px' }}>
                      {(() => { const f = fu(item.id); const tr = f.trace || []; return (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', marginBottom: '4px' }}>Email Trace - {item.id}</div>
                          {tr.length === 0 ? (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No email sent yet. Select this record and click Send for Approval.</div>
                          ) : (
                            <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '10px' }}>
                              {tr.map((t, idx) => { const key = item.id + '#' + idx; const open = expandedTrace === key; return (
                                <div key={idx} style={{ fontSize: '11px', marginBottom: '4px' }}>
                                  <div style={{ cursor: t.email ? 'pointer' : 'default' }} onClick={() => t.email && setExpandedTrace(open ? null : key)}>
                                    <span style={{ display: 'inline-block', minWidth: '58px', color: 'var(--text-secondary)' }}>{t.date}</span>
                                    <strong style={{ color: t.kind.startsWith('SAP') ? '#047857' : (t.kind.startsWith('Reminder') ? '#D97706' : 'var(--primary)') }}>{t.kind}</strong>
                                    <span style={{ color: 'var(--text-secondary)' }}> {'->'} {t.to}{t.batchId ? ' [batch ' + t.batchId + ']' : ''}</span>
                                    {t.email && <span style={{ marginLeft: '8px', color: 'var(--primary)', fontSize: '10px' }}>{open ? '[hide email]' : '[open email]'}</span>}
                                  </div>
                                  {open && t.email && (
                                    <div style={{ margin: '4px 0 4px 58px' }}>
                                      <EmailView em={t.email} />
                                    </div>
                                  )}
                                </div>
                              ); })}
                            </div>
                          )}
                        </div>
                      ); })()}
                      <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', marginBottom: '6px' }}>
                        {'\u2709'} Compose Next Email (draft) - {item.type} Approver ({isPending ? 'Pending Approval' : 'Assigned'})
                      </div>
                      <EmailView em={em} />
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => { showToast('Approval email sent for ' + item.id + ' (' + item.type + ')'); setExpandedEmail(null); }}>Send for Approval</button>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => setExpandedEmail(null)}>Close</button>
                      </div>
                    </td>
                  </tr>
                ); })()}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Consolidated Batch Approval Modal (grouped by approver) */}
      {batchApprovalModal && (
        <div className="modal-overlay show" onClick={() => setBatchApprovalModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2>{'\u2709'} Send {batchApprovalModal.type} for Approval - Consolidated Email (grouped by approver)</h2>
              <button className="modal-close" onClick={() => setBatchApprovalModal(null)}>x</button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', padding: '8px 10px', background: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
                One email is generated per approver. Internal approval email (cost/value included, no Excel attachment). On Send, SynOps sets status to <strong>Approval Requested - Pending SAP Sync</strong>; the next SAP ZQRGT extract confirms the approval and flips status to <strong>Approved - Assigned to IA</strong> (SAP is the system of record).
              </div>
              {Object.entries(batchApprovalModal.groups).map(([approver, items]) => (
                <div key={approver} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '12px' }}>
                  <div style={{ background: 'var(--surface-alt, #f7f7f8)', padding: '8px 12px', fontFamily: 'Graphik-Semibold', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>
                    To: {approver}  |  {items.length} {batchApprovalModal.type} record(s) (one email per approver)
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    {(() => { const anyRem = items.some(it => fu(it.id).state === 'Requested' || fu(it.id).state === 'Reminded'); const rc = Math.max(0, ...items.map(it => (fu(it.id).reminderCount || 0))) + 1; const kind = anyRem ? ('Reminder #' + rc) : 'Approval Request'; const em = buildApprovalEmail(items, kind, approver); return <EmailView em={em} />; })()}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setBatchApprovalModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmBatchApproval}>Send {Object.keys(batchApprovalModal.groups).length} Email(s) & Trigger Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Reminder Modal */}
      {emailModal && (
        <div className="modal-overlay show" onClick={() => setEmailModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>✉ {emailModal.type === 'planner' ? 'Remind Planner for Approval' : 'Remind Brand for Approval'}</h2>
              <button className="modal-close" onClick={() => setEmailModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="field-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="field-item">
                  <label>TO</label>
                  <input type="text" defaultValue={emailModal.type === 'planner' ? 'tpm.planner@elcompanies.com' : 'brand.approver@elcompanies.com'} style={{ width: '100%' }} />
                </div>
                <div className="field-item">
                  <label>CC</label>
                  <input type="text" defaultValue="tpm.inventory@elcompanies.com" style={{ width: '100%' }} />
                </div>
                <div className="field-item">
                  <label>SUBJECT</label>
                  <input type="text" defaultValue={`Action Required: ${emailModal.item.id} — ${emailModal.type === 'planner' ? 'Planner' : 'Brand'} Approval Pending (${emailModal.item.aging}d aging)`} style={{ width: '100%' }} />
                </div>
                <div className="field-item">
                  <label>BODY</label>
                  <textarea defaultValue={`Dear ${emailModal.type === 'planner' ? 'Planner' : 'Brand Team'},\n\nThe following ${emailModal.item.type} item is pending your approval for destruction:\n\n• Reference: ${emailModal.item.id}\n• Material: ${emailModal.item.material} — ${emailModal.item.materialDesc}\n• Quantity: ${emailModal.item.qty}\n• Classification: ${emailModal.item.classification}\n• Value: ${emailModal.item.value}\n• Aging: ${emailModal.item.aging} days\n• Vendor: ${emailModal.item.vendor}\n• Plant: ${emailModal.item.plant}\n\nPlease approve or reject this item for destruction processing.\n\nIf no response within 48 hours, this will be escalated.\n\nRegards,\nSynOps Inventory Team`} style={{ width: '100%', minHeight: '200px' }} />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEmailModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setEmailModal(null); showToast(`✓ Reminder sent to ${emailModal.type === 'planner' ? 'Planner' : 'Brand'} for ${emailModal.item.id}`); }}>Send Reminder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
