/**
 * Investigation Scenario Data for TO-BE Process Steps 4-16
 * Each work item maps to a specific investigation scenario with realistic SAP data
 * Used in the Inventory Optimization drill-down views and stakeholder presentations
 */

const scenarioDatabase = {
  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1052: FAST PATH - Consumption Correction
  // COSMAX Korea, Plant 6030, Material 4520891034, 20 KG
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1052': {
    scenario: 1,
    // Full Sunand-model evidence-gathering investigation (gather -> validate -> present -> recommend -> planner decides)
    investigationV2: {
      workItemId: 'WI-1052',
      title: 'Subsequent Quantity Adjustment (3.2.1.2) - Over-Consumption Correction',
      classification: 'Subsequent Quantity Adjustment - Over-Consumption (MvT 543)',
      request: {
        source: 'TPM Vendor Email (COSMAX Korea via Soyeon Kim)',
        vendor: 'COSMAX Korea (MRP area 10089234)',
        material: '4520891034',
        materialDesc: 'ORIGINS MEGA-MUSHROOM CREAM 50ML (bulk)',
        plant: '6030 (Korea)',
        specialStock: 'O + COSMAX Korea',
        po: '4500891034',
        reportedQty: '20 KG over-consumed (actual 200 KG vs 180 KG booked)',
        uom: 'KG',
        reason: 'During the production run on PO 4500891034 the vendor consumed 200 KG of the Mega-Mushroom bulk, but SAP only booked 180 KG of consumption. The extra 20 KG (higher scrap due to a line set-up issue) must be consumed in SAP. GR, invoice and the original consumption are complete on the PO.',
        note: 'No physical material to return - the 20 KG was physically used/scrapped on the line. This is a consumption correction (inventory adjustment), not a DAV. Over-consumption => stock must go DOWN by 20 KG.'
      },
      checks: [
        {
          id: '1',
          transaction: 'MB52',
          title: 'Stock Picture - All Statuses',
          purpose: 'Confirm the SAP on-hand position across all statuses before adjusting.',
          status: 'PASS',
          statusLabel: 'Verified',
          rows: [
            { label: 'Unrestricted', value: '200 KG', highlight: 'accent' },
            { label: 'Restricted (QI)', value: '0 KG' },
            { label: 'Blocked', value: '0 KG' },
            { label: 'EXFER - pending transfer', value: '0 KG' },
            { label: 'In-Transit', value: '0 KG' },
            { label: 'Phantom on hand vs physical', value: '20 KG over-stated' }
          ],
          finding: 'SAP shows 200 KG unrestricted at plant 6030 under COSMAX Korea, nothing in BLCK/QI/EXFER/transit. Because only 180 KG was booked as consumed, SAP still shows 20 KG that the vendor has already used - a phantom balance to be consumed.'
        },
        {
          id: '2',
          transaction: 'ME23N',
          title: 'PO Header & Component / BOM',
          purpose: 'Read the PO to correct (4500891034) and its component / BOM.',
          status: 'PASS',
          statusLabel: 'PO Verified',
          rows: [
            { label: 'PO to correct (consumption)', value: '4500891034', highlight: 'accent' },
            { label: 'Vendor', value: 'COSMAX Korea' },
            { label: 'Component Material', value: '4520891034 - ORIGINS MEGA-MUSHROOM CREAM 50ML' },
            { label: 'Component qty (planned)', value: '180 KG' },
            { label: 'Plant', value: '6030' },
            { label: 'Batch', value: '000891034A' }
          ],
          finding: 'PO 4500891034 planned 180 KG of component 4520891034. The vendor reports 200 KG actually consumed - a 20 KG over-consumption to be posted against this PO.'
        },
        {
          id: '3',
          transaction: 'ME23N / MD04',
          title: 'PO Goods Receipt Completion',
          purpose: 'Confirm GR and consumption are complete - a subsequent adjustment corrects consumption AFTER GR is done.',
          status: 'PASS',
          statusLabel: 'GR Complete',
          rows: [
            { label: 'PO GR status', value: 'Complete (GR + Invoice posted)', highlight: 'good' },
            { label: 'Original consumption posted', value: 'Yes - 180 KG consumed on PO' },
            { label: 'STO / ASN', value: 'N/A - subcontracting PO (no STO)' },
            { label: 'Delivery date', value: '10/07/2026' }
          ],
          finding: 'GR, invoice and the 180 KG consumption are complete on PO 4500891034 -> subsequent adjustment (MIGO) path, not a GR reversal or DAV.'
        },
        {
          id: '4',
          transaction: 'MB51',
          title: 'Consumption History (543) - Quantify Correction',
          purpose: 'Read consumption postings against the PO to quantify the 20 KG over-consumption and confirm no prior correction.',
          status: 'PASS',
          statusLabel: 'Correction Open',
          movements: [
            { date: '10/07/2026', mvt: '543', mvtDesc: 'Original consumption on PO 4500891034', qty: '180- KG', doc: '5051180630', user: 'X_CWANG' }
          ],
          netConsumedLabel: 'Additional over-consumption to post',
          netConsumed: '20 KG (open)',
          finding: 'MB51 shows 180 KG consumed (543). The vendor used 200 KG, so a further 20 KG of consumption must be posted. No prior over-consumption correction exists for this PO.'
        }
      ],
      variance: {
        vendorActual: '200 KG actually consumed (vendor confirmed)',
        sapConsumed: '180 KG booked (sum of 543 on PO)',
        deltaVsComponent: 'Variance = +20 KG (vendor used MORE than SAP)',
        classification: 'OVER-CONSUMPTION -> POST MIGO 543 (consume the extra 20 KG, stock DOWN)',
        classColor: 'good'
      },
      recommendation: {
        headline: 'Recommended: MIGO Subsequent Adjustment -> MvT 543 for 20 KG (over-consumption)',
        rationale: 'MB52 confirms 20 KG phantom on hand, ME23N confirms PO 4500891034 with 180 KG planned (GR/invoice complete), and MB51 shows 180 KG consumed vs 200 KG vendor actual. Per 3.2.1.2 the extra 20 KG is consumed via MIGO subsequent adjustment (MvT 543). Value $680 is below the $3,000 APAC threshold -> no approval required.',
        note: 'SynOps recommends - it does not auto-post. Review the fields below, edit if needed, then click Post in SAP to complete the 20 KG over-consumption correction.',
        fields: [
          { key: 'transaction', label: 'Transaction', value: 'MIGO - Subsequent Adjustment (option 11)', editable: false },
          { key: 'underConsumption', label: 'Under Consumption', value: 'No (vendor used MORE than SAP)', editable: false },
          { key: 'movementType', label: 'Movement Type', value: '543', editable: true },
          { key: 'po', label: 'PO', value: '4500891034', editable: true },
          { key: 'material', label: 'Material', value: '4520891034', editable: true },
          { key: 'plant', label: 'Plant', value: '6030', editable: true },
          { key: 'specialStock', label: 'Special Stock / Vendor', value: 'O + COSMAX Korea', editable: true },
          { key: 'batch', label: 'Batch', value: '000891034A', editable: true },
          { key: 'qty', label: 'Quantity', value: '20', editable: true },
          { key: 'uom', label: 'UoM', value: 'KG', editable: true },
          { key: 'headerText', label: 'Header Text', value: 'WI-1052 Over-consumption COSMAX Korea PO 4500891034', editable: true }
        ]
      },
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Validate PO Qty (ME23N) & Stock Availability (MB52)',
        description: 'SynOps auto-queries PO component quantity in ME23N and checks MB52 unrestricted stock at plant.',
        checks: [
          {
            checkName: 'ME23N — PO Component Quantity',
            transaction: 'ME23N',
            data: {
              po: '4500891034',
              line: '10',
              material: '4520891034',
              componentQty: '200 KG',
              grQty: '180 KG',
              openQty: '20 KG',
              vendorClaimed: '20 KG'
            },
            result: 'MATCH',
            resultDetail: 'PO open qty (20 KG) = Vendor claimed consumption (20 KG)',
            passed: true
          },
          {
            checkName: 'MB52 — Unrestricted Stock at Plant',
            transaction: 'MB52',
            data: {
              material: '4520891034',
              plant: '6030',
              sloc: 'MRP Area',
              unrestricted: '180 KG',
              blocked: '0 KG',
              qi: '0 KG',
              specialStock: 'O (Subcontracting)'
            },
            result: 'AVAILABLE',
            resultDetail: 'Unrestricted stock 180 KG available. Sufficient for 20 KG adjustment.',
            passed: true
          }
        ],
        outcome: 'BOTH MATCH — Qty in PO aligns with vendor claim AND stock available in unrestricted. Fast-path eligible.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Execute MIGO — Subsequent Adjustment',
        description: 'Qty matches confirmed. SynOps pre-populates MIGO for subsequent adjustment posting.',
        migoData: {
          transaction: 'MIGO',
          movementType: '543',
          mvtDescription: 'Subsequent Adjustment — Over Consumption (consume extra 20 KG)',
          po: '4500891034',
          poLine: '10',
          material: '4520891034',
          materialDesc: 'ORIGINS MEGA-MUSHROOM CREAM 50ML',
          plant: '6030',
          sloc: 'MRP Area',
          batch: '000891034A',
          qty: '20 KG',
          underConsumption: false,
          postingDate: '2026-07-15',
          reasonCode: '201',
          reasonDesc: 'Over-consumption correction (line scrap)',
          headerText: 'WI-1052 Over-consumption COSMAX 6030',
          referenceDoc: 'WI-1052'
        },
        postResult: {
          documentNumber: '4900098712',
          postingStatus: 'Success',
          newMB52Unrestricted: '180 KG',
          verified: true
        },
        outcomeStatus: 'success'
      }
    ],

    // Legacy fields for compatibility (over-consumption: SAP consumed 180, vendor used 200 -> post 20 more, stock 200 -> 180)
    step4: { unrestricted: 200, blck: 0, qi: 0, exfer: 0, inTransit: 0, sapTotal: 200, vendorDeclared: 180, gap: 20, gapDescription: 'SAP shows 20 KG more than vendor physically holds (over-consumption to post)', transaction: 'MB52', uom: 'KG' },
    step5: { po: '4500891034', ordered: 180, consumed: 180, open: 0, vendorClaimed: 200, transaction: 'ME23N', uom: 'KG', description: 'Vendor consumed 200 KG vs 180 KG booked -> 20 KG over-consumption' },
    step6: { result: 'MATCH', details: 'Vendor-reported over-consumption of 20 KG confirmed against PO. Fast path.', fastPathEligible: true, reason: 'Qty confirmed' },
    step7: null, step8: null, step9: null, step10: null, step11: null,
    step12: { qty: 20, unitPrice: 34.00, totalValue: 680.00, currency: 'USD', threshold: 3000, thresholdExceeded: false, approver: null, autoApproved: true, region: 'APAC' },
    step13: { transaction: 'MIGO', movementType: '543', mvtDescription: 'Subsequent Adjustment — Over Consumption', plant: '6030', material: '4520891034', batch: '000891034A', qty: 20, uom: 'KG', reasonCode: '201', reasonDesc: 'Over-consumption correction', headerText: 'WI-1052 Over-consumption COSMAX 6030' },
    step14: { transaction: 'MIGO', po: '4500891034', underConsumption: false, description: 'Subsequent adjustment — consume extra 20 KG', postingDate: '2026-07-15', documentType: 'WA' },
    step15: { preMB52: { unrestricted: 200, blck: 0, qi: 0, exfer: 0, inTransit: 0, total: 200 }, postMB52: { unrestricted: 180, blck: 0, qi: 0, exfer: 0, inTransit: 0, total: 180 }, vendorPhysical: 180, verified: true, warningMessage: null, verificationNote: 'Verified — SAP now 180 KG, matches vendor physical' },
    step16: { recipients: ['soyeon.kim@cosmax.co.kr', 'chris.wang@elcompanies.com'], subject: 'Stock Adjusted - WI-1052', documentNumber: '4900098712', finalQty: 180, uom: 'KG', emailBody: 'Over-consumption of 20 KG posted (MvT 543). Doc# 4900098712. SAP = 180 KG, aligned with your physical.' }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1056: SCENARIO 2 - Vendor Unable to Consume (BLCK Stock)
  // COSMAX Korea, Plant 6030, Material 6234098712, 200 EA
  // Vendor reports cannot perform consumption → stock found in BLCK → notify vendor
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1056': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Qty Mismatch — BLCK Stock (Cannot Consume)',
    workItemId: 'WI-1056',
    type: 'Stock Discrepancy',
    tpm: 'COSMAX Korea',
    plant: '6030',
    material: '6234098712',
    materialDesc: 'CLINIQUE EVEN BETTER SERUM 30ML',
    qty: 200,
    uom: 'EA',

    steps: [
      {
        stepNumber: 1,
        title: 'Check MB52 — Stock Status at Plant',
        description: 'Vendor (COSMAX Korea) reports unable to perform consumption of 200 EA. SynOps queries MB52 to check stock status: Unrestricted, Blocked, In-Transit, QI.',
        checks: [
          {
            checkName: 'MB52 — Stock Overview (Plant 6030, Material 6234098712)',
            transaction: 'MB52',
            data: {
              material: '6234098712',
              materialDesc: 'CLINIQUE EVEN BETTER SERUM 30ML',
              plant: '6030 (Korea)',
              sloc: 'MRP Area',
              unrestricted: '0 EA',
              blocked: '200 EA',
              qi: '0 EA',
              inTransit: '0 EA',
              specialStock: 'O (Subcontracting)'
            },
            result: 'BLCK > 0',
            resultDetail: 'All 200 EA are in BLOCKED status. Unrestricted = 0. Vendor cannot consume because stock is not available in unrestricted.',
            passed: false
          }
        ],
        outcome: 'BLCK qty = 200 EA > 0. Stock is blocked — triggering movement history check.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Check Material Movement History — MB51',
        description: 'SynOps queries MB51 movement history for Material 6234098712, Plant 6030, Vendor 10089234, Batch 000712K09. Traces how stock moved INTO BLCK.',
        checks: [
          {
            checkName: 'MB51 — Movement History (Material 6234098712, Plant 6030, Batch 000712K09)',
            transaction: 'MB51',
            data: {
              material: '6234098712',
              plant: '6030',
              vendor: '10089234 (COSMAX Korea)',
              batch: '000712K09'
            },
            result: 'BLCK TRACED',
            resultDetail: 'MvT 343 (Unrestricted → Blocked) posted on Jan 10 by QA.TEAM.APAC. Reason: Failed QC inspection — viscosity out of spec. QN-400215. Originating PO: 4500712098.',
            passed: true
          }
        ],
        movementHistory: [
          { date: 'Jan 10', mvt: '343 (Unrest→BLCK)', qty: '-200 EA', ref: 'QN-400215', user: 'QA.TEAM.APAC', status: '✓ Posted' },
          { date: 'Jan 08', mvt: '101 (GR)', qty: '+200 EA', ref: 'PO 4500712098', user: 'SYSTEM', status: '✓ Posted' },
          { date: 'Jan 05', mvt: '101 (GR)', qty: '+150 EA', ref: 'PO 4500712050', user: 'SYSTEM', status: '✓ Posted' },
          { date: 'Dec 28', mvt: '543 (Consumption)', qty: '-150 EA', ref: 'FG PO 4500712050', user: 'C.WANG', status: '✓ Posted' }
        ],
        outcome: 'BLCK movement traced: MvT 343 on Jan 10 by QA team. Stock blocked due to QN-400215 (viscosity out of spec).',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 3,
        title: 'Verify PO Delivery Address vs Vendor Master',
        description: 'SynOps checks PO 4500712098 delivery address matches vendor master record for COSMAX Korea (10089234).',
        checks: [
          {
            checkName: 'PO Delivery Address Validation',
            transaction: 'ME23N / XK03',
            data: {
              po: '4500712098',
              poDeliveryAddress: 'COSMAX Korea, 123 Pangyo-ro, Seongnam-si, Gyeonggi-do 13487',
              vendorMasterAddress: 'COSMAX Korea, 123 Pangyo-ro, Seongnam-si, Gyeonggi-do 13487',
              vendorId: '10089234',
              match: 'YES — Addresses match'
            },
            result: 'MATCH',
            resultDetail: 'PO delivery address matches vendor master. Stock was correctly delivered to COSMAX Korea at Plant 6030.',
            passed: true
          }
        ],
        outcome: 'Delivery address confirmed. Stock is at the correct vendor location.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 4,
        title: 'Auto-Generate Email to TPM Vendor',
        description: 'SynOps auto-generates email informing COSMAX Korea that stock has been moved to BLCK by QA and cannot be adjusted/consumed until QA releases it.',
        emailData: {
          to: 'production.ops@cosmax.kr',
          cc: 'chris.wang@elcompanies.com; qa.apac@elcompanies.com',
          subject: 'Stock Blocked by QA — Material 6234098712 at Plant 6030 — Cannot be Consumed',
          body: `Dear COSMAX Korea Production Team,

Regarding your request to consume 200 EA of Material 6234098712 (CLINIQUE EVEN BETTER SERUM 30ML) at Plant 6030:

Investigation Result:
The stock (200 EA, Batch 000712K09) has been moved to BLOCKED status by our QA team on Jan 10, 2025, due to a quality inspection failure.

Details:
• Quality Notification: QN-400215
• Reason: Viscosity out of specification
• Movement: MvT 343 (Unrestricted → Blocked) on Jan 10
• PO Reference: 4500712098

This stock CANNOT be consumed or adjusted until QA completes their review and releases it (MvT 344: Blocked → Unrestricted).

Next Steps:
Our QA team has been notified and will provide an update on the disposition timeline within 3 business days.

We will notify you once the stock is released back to unrestricted status and available for consumption.

Best regards,
Chris Wang
TPM Inventory Analyst — APAC`
        },
        outcome: 'Email auto-sent to COSMAX Korea. Work item status → "Pending QA Release". QA team notified for disposition.',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1057: SCENARIO 3 - Pending Supply (No Adjustment Required)
  // Kolmar Korea, Plant 6030, Material 7823456109, 300 EA
  // Vendor reports discrepancy → MB52 gap → PO/STO arriving in 14 days → No adj needed
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1057': {
    scenario: 3,
    scenarioLabel: 'Scenario 3: Pending Supply — No Adjustment Required',
    workItemId: 'WI-1057',
    type: 'Stock Discrepancy',
    tpm: 'Kolmar Korea',
    plant: '6030',
    material: '7823456109',
    materialDesc: 'MAC STUDIO FIX FLUID SPF15 30ML',
    qty: 300,
    uom: 'EA',

    steps: [
      {
        stepNumber: 1,
        title: 'Check MB52 — Unrestricted Stock vs Vendor Reported Qty',
        description: 'Vendor (Kolmar Korea) reports inventory discrepancy: physical count = 500 EA but expects 800 EA per PO schedule. SynOps queries MB52 to validate.',
        checks: [
          {
            checkName: 'MB52 — Stock Overview (Plant 6030, Material 7823456109)',
            transaction: 'MB52',
            data: {
              material: '7823456109',
              materialDesc: 'MAC STUDIO FIX FLUID SPF15 30ML',
              plant: '6030 (Korea)',
              sloc: 'MRP Area',
              unrestricted: '500 EA',
              blocked: '0 EA',
              qi: '0 EA',
              inTransit: '0 EA',
              specialStock: 'O (Subcontracting)'
            },
            result: 'GAP CONFIRMED',
            resultDetail: 'SAP unrestricted = 500 EA. Vendor expected 800 EA. Gap = -300 EA. No BLCK/QI/EXFER stock found.',
            passed: false
          }
        ],
        outcome: 'Gap = 300 EA confirmed. All stock is unrestricted (no BLCK/QI issues). Checking pending supply.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Check Pending POs / STOs — Supply within 14 Days (MD04)',
        description: 'SynOps queries planned supply (open POs + STOs) with delivery dates within 14-day horizon for this material at Plant 6030.',
        checks: [
          {
            checkName: 'MD04 — Planned Supply within 14 Days',
            transaction: 'MD04',
            data: {
              material: '7823456109',
              plant: '6030',
              horizon: '14 days (Jan 16 – Jan 30, 2025)'
            },
            result: 'SUPPLY FOUND',
            resultDetail: 'Open PO 4500823456 for 300 EA arriving Jan 22, 2025. Fully explains the 300 EA gap.',
            passed: true
          }
        ],
        pendingSupply: [
          { type: 'PO', number: '4500823456', line: '10', qty: '300 EA', vendor: 'Kolmar Korea (10078901)', deliveryDate: 'Jan 22, 2025', status: 'Confirmed by Vendor', incoterm: 'DDP' }
        ],
        outcome: 'Pending PO 4500823456 (300 EA, ETA Jan 22) FULLY explains the gap. No stock adjustment required.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 3,
        title: 'Resolution — No Adjustment Required',
        description: 'Gap is explained by pending supply. Stock adjustment is NOT required. SynOps closes investigation and auto-generates notification to vendor.',
        checks: [
          {
            checkName: 'Gap Resolution Check',
            transaction: 'System',
            data: {
              reportedGap: '-300 EA',
              pendingSupply: '300 EA (PO 4500823456, ETA Jan 22)',
              remainingGap: '0 EA',
              adjustmentRequired: 'NO',
              resolution: 'Pending supply fully covers gap'
            },
            result: 'NO ADJUSTMENT',
            resultDetail: 'Pending supply (300 EA) = Reported gap (300 EA). No stock adjustment needed. Inform vendor.',
            passed: true
          }
        ],
        outcome: 'Investigation resolved — no adjustment required. Pending PO will deliver 300 EA on Jan 22.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 4,
        title: 'Auto-Generate Email to TPM Vendor — Stock Arriving',
        description: 'SynOps auto-generates email informing Kolmar Korea that the reported gap is covered by a pending PO arriving Jan 22. No action required from their side.',
        emailData: {
          to: 'warehouse.ops@kolmar.kr',
          cc: 'chris.wang@elcompanies.com; planning.apac@elcompanies.com',
          subject: 'Stock Discrepancy Resolved — Material 7823456109 at Plant 6030 — Supply Arriving Jan 22',
          body: `Dear Kolmar Korea Warehouse Team,

Regarding your reported inventory discrepancy for Material 7823456109 (MAC STUDIO FIX FLUID SPF15 30ML) at Plant 6030:

Investigation Summary:
• Your reported physical stock: 500 EA
• Expected quantity: 800 EA
• Gap identified: -300 EA

Resolution:
After investigation, we confirm this gap is covered by a pending Purchase Order that is scheduled for delivery to your plant:

• PO Number: 4500823456 (Line 10)
• Quantity: 300 EA
• Expected Delivery: January 22, 2025
• Delivery Status: Confirmed by Vendor
• Incoterm: DDP (Delivered Duty Paid)

Action Required: NONE
No stock adjustment is required. The 300 EA will be delivered to Plant 6030 on Jan 22. After goods receipt (GR), your SAP stock will reflect 800 EA, aligned with your expected quantity.

Please ensure receiving capacity is available on the delivery date.

Best regards,
Chris Wang
TPM Inventory Analyst — APAC`
        },
        outcome: 'Email sent to Kolmar Korea. Work item closed — no adjustment required. Status → "Resolved (No Adj)".',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1058: SCENARIO 4 - EXFER Stock (Transfer Staging — Cannot Adjust)
  // Intercos China, Plant 6010, Material 9012345678, 120 EA
  // Vendor reports discrepancy → EXFER > 0 → stock mid-transfer → notify planner
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1058': {
    scenario: 4,
    scenarioLabel: 'Scenario 4: EXFER — Stock in Transfer Staging (Cannot Adjust)',
    workItemId: 'WI-1058',
    type: 'Stock Discrepancy',
    tpm: 'Intercos China',
    plant: '6010',
    material: '9012345678',
    materialDesc: 'ESTEE LAUDER PERFECTIONIST PRO SERUM 30ML',
    qty: 120,
    uom: 'EA',

    // Incoming email that triggered this work item
    incomingEmail: {
      from: 'warehouse.ops@intercos-china.com',
      to: 'tpm.inventory@elcompanies.com',
      date: 'Jan 16, 2025 09:15 AM (CST)',
      subject: 'Stock Discrepancy Report — Material 9012345678 at Plant 6010',
      body: `Dear EL TPM Inventory Team,

We are reporting a stock discrepancy for the following material at our warehouse (Plant 6010):

Material: 9012345678 — ESTEE LAUDER PERFECTIONIST PRO SERUM 30ML
Batch: 000678E11
Storage: MRP Area (SpecStock O)

Our physical count: 380 EA
SAP expected (per last report): 500 EA
Difference: -120 EA short

We checked our warehouse and can confirm only 380 EA are physically present. We have not shipped or consumed any additional units beyond what was already reported.

Could you please investigate the 120 EA gap?

Regards,
Li Wei
Intercos China Warehouse Operations
Plant 6010 — Shenzhen Bonded Zone`
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Check MB52 — Stock Status including EXFER',
        description: 'Vendor reports 380 EA physical vs 500 EA expected. SynOps queries MB52 to check all stock categories including EXFER (External Transfer staging).',
        checks: [
          {
            checkName: 'MB52 — Stock Overview (Plant 6010, Material 9012345678)',
            transaction: 'MB52',
            data: {
              material: '9012345678',
              materialDesc: 'ESTEE LAUDER PERFECTIONIST PRO SERUM 30ML',
              plant: '6010 (China Bonded)',
              sloc: 'MRP Area (SpecStock O)',
              unrestricted: '380 EA',
              blocked: '0 EA',
              qi: '0 EA',
              exfer: '120 EA',
              inTransit: '0 EA',
              sapTotal: '500 EA'
            },
            result: 'EXFER > 0',
            resultDetail: 'EXFER = 120 EA detected. This stock is in transfer staging (MvT 542 posted, MvT 541 not yet completed). Cannot be adjusted — it is mid-transfer.',
            passed: false
          }
        ],
        outcome: 'EXFER = 120 EA > 0. Stock is stuck in external transfer staging. This fully explains the 120 EA gap reported by vendor.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'EXFER Analysis — Transfer is Incomplete (MB5T / MB51)',
        description: 'EXFER > 0 means MvT 542 (sending) was posted but MvT 541 (receiving) was never completed. SynOps queries MB5T (Stock in Transit report) to confirm the stuck transfer.',
        checks: [
          {
            checkName: 'MB5T — Stock in Transit Report + MB51 Transfer Trace',
            transaction: 'MB5T / MB51',
            data: {
              stoNumber: 'STO 4300678901',
              sendingPlant: '6010 (China Bonded)',
              receivingPlant: '6030 (Korea)',
              movementType542: 'Posted on Jan 05, 2025',
              movementType541: 'NOT POSTED',
              quantity: '120 EA',
              batch: '000678E11',
              mb5tStatus: 'Open — In Transit (no GR at destination)',
              status: 'Transfer Incomplete — stuck in EXFER staging',
              daysInExfer: '11 days'
            },
            result: 'INCOMPLETE TRANSFER',
            resultDetail: 'MB5T confirms STO 4300678901 is open (in transit). MvT 542 posted Jan 05 (sending) but MvT 541 (receiving at Plant 6030) never completed. Stock stuck in EXFER for 11 days.',
            passed: false
          }
        ],
        outcome: 'Stock CANNOT be adjusted — it is mid-transfer (confirmed via MB5T). Planner must resolve: complete 541 at receiving plant OR reverse 542 to return stock.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 3,
        title: 'Auto-Notify Planner — Transfer Issue Escalation',
        description: 'SynOps auto-escalates to Planner informing about the incomplete transfer. Stock cannot be adjusted until transfer is resolved.',
        emailData: {
          to: 'planning.apac@elcompanies.com; steven.zhang@elcompanies.com',
          cc: 'chris.wang@elcompanies.com; warehouse.ops@intercos-china.com',
          subject: 'ESCALATION: Incomplete Transfer — 120 EA Stuck in EXFER — Material 9012345678 — Plant 6010 → 6030',
          body: `Dear Planning Team,

An incomplete stock transfer has been identified that is causing an inventory discrepancy at Plant 6010:

Transfer Details:
• STO Number: 4300678901
• Material: 9012345678 — ESTEE LAUDER PERFECTIONIST PRO SERUM 30ML
• Quantity: 120 EA (Batch 000678E11)
• Sending Plant: 6010 (China Bonded) — MvT 542 posted Jan 05
• Receiving Plant: 6030 (Korea) — MvT 541 NOT POSTED
• Days in EXFER: 11 days
• Value: $3,960

Issue:
The sending movement (542) was posted on Jan 05 but the receiving movement (541) at Plant 6030 has not been completed. The stock is stuck in EXFER transfer staging and CANNOT be consumed or adjusted at either plant.

Impact:
• Vendor (Intercos China) reports -120 EA discrepancy at Plant 6010
• Stock is physically not at 6010 (already shipped) but SAP still shows it in EXFER
• Receiving plant 6030 has not posted goods receipt

Resolution Required:
Option A: Complete MvT 541 at Plant 6030 (confirm goods receipt at Korea)
Option B: Reverse MvT 542 to return stock to unrestricted at Plant 6010 (if shipment failed)

Please resolve within 48 hours. Vendor has been informed that stock is in transit.

Best regards,
Chris Wang
TPM Inventory Analyst — APAC
(Auto-generated by SynOps)`
        },
        outcome: 'Escalation sent to Planner (Steven Zhang) and Planning Team. Vendor informed. WI status → "Escalated to Planner".',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1059: SCENARIO 5 - Batch Transfer (Batch Mismatch)
  // Hanes Erie, Plant 4010, Material 5534098723, 75 EA
  // Vendor reports wrong batch used during GR → batch swap via MIGO A08
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1059': {
    scenario: 4,
    scenarioLabel: 'Scenario 4: Batch Transfer — Batch Mismatch Correction',
    workItemId: 'WI-1059',
    type: 'Batch Transfer',
    tpm: 'Hanes Erie',
    plant: '4010',
    material: '5534098723',
    materialDesc: 'LA MER CREME DE LA MER 60ML',
    qty: 75,
    uom: 'EA',

    incomingEmail: {
      from: 'sarah.miller@haneserie.com',
      to: 'tpm.inventory@elcompanies.com',
      date: 'Jan 17, 2025 08:45 AM (CET)',
      subject: 'Batch Correction Required — Material 5534098723 at Plant 4010',
      body: `Dear Anna,

We need to report a batch discrepancy for the following material at Plant 4010 (Oevel):

Material: 5534098723 — LA MER CREME DE LA MER 60ML
PO: 4503290178
Quantity: 75 EA

Issue:
During goods receipt on Jan 12, the wrong batch was entered in SAP. The stock was booked under Batch B2025011201, but the actual physical batch we received and have on shelf is B2025011502.

This happened because the GR was processed using the ASN batch number, but the physical shipment label shows a different production batch (B2025011502) which was a late batch substitution by our production line.

We need the batch corrected in SAP to match our physical stock. This is critical for traceability and shelf-life tracking.

Details:
• Wrong batch in SAP: B2025011201 (Exp: Jun 2026)
• Correct batch (physical): B2025011502 (Exp: Aug 2026)
• Quantity affected: 75 EA
• Storage Location: FG01
• Value: approx EUR 3,375

Please process the batch correction at your earliest convenience.

Best regards,
Sarah Miller
Warehouse Operations Manager
Hanes Erie — Plant 4010 (Oevel)`
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Analyse Discrepancy — Confirm Batch Mismatch',
        description: 'SynOps confirms mismatch between received batch (physical) and documented batch (SAP). Validates stock quantities in MB52.',
        checks: [
          {
            checkName: 'MB52 — Current Stock by Batch (Plant 4010, Material 5534098723)',
            transaction: 'MB52',
            data: {
              material: '5534098723',
              plant: '4010 (Oevel)',
              sloc: 'FG01',
              currentBatch: 'B2025011201',
              currentBatchQty: '75 EA (Unrestricted)',
              currentBatchExpiry: 'Jun 2026',
              correctBatch: 'B2025011502',
              correctBatchQty: '0 EA (not in SAP)',
              correctBatchExpiry: 'Aug 2026'
            },
            result: 'BATCH MISMATCH CONFIRMED',
            resultDetail: 'SAP shows 75 EA under Batch B2025011201. Physical stock is actually Batch B2025011502. Mismatch confirmed.',
            passed: false
          },
          {
            checkName: 'Discrepancy Value Calculation',
            transaction: 'System',
            data: {
              quantity: '75 EA',
              standardPrice: '€45.00 per EA',
              totalValue: '€3,375.00',
              currency: 'EUR'
            },
            result: 'VALUE CALCULATED',
            resultDetail: 'Discrepancy value = 75 EA × €45.00 = €3,375.00',
            passed: true
          }
        ],
        outcome: 'Batch mismatch confirmed. 75 EA booked under wrong batch. Value = €3,375.00.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Check Approval Requirement — Value Threshold',
        description: 'SynOps applies regional approval threshold matrix to determine if approval is required for batch correction.',
        checks: [
          {
            checkName: 'Approval Threshold Matrix (EMEA)',
            transaction: 'System',
            data: {
              value: '€3,375.00',
              thresholdBelow1000: 'No approval required',
              threshold1000to5000: 'Category Leader approval required',
              thresholdAbove5000: 'Executive Manager approval required',
              applicableThreshold: '€1,000 – €5,000 → Category Leader',
              approver: 'Marc Dubois (Category Leader EMEA)',
              approvalRequired: 'YES'
            },
            result: 'APPROVAL REQUIRED',
            resultDetail: 'Value €3,375 falls in €1,000–€5,000 range. Category Leader (Marc Dubois) approval required.',
            passed: true
          }
        ],
        outcome: 'Approval required from Marc Dubois (Category Leader EMEA). Approval request auto-generated.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 3,
        title: 'Obtain Approval — Category Leader',
        description: 'SynOps auto-sends approval request to Marc Dubois. Approval email saved for records.',
        emailData: {
          to: 'marc.dubois@elcompanies.com',
          cc: 'anna.polkowska@elcompanies.com; tpm.emea@elcompanies.com',
          subject: 'APPROVAL REQUIRED: Batch Correction — Material 5534098723 — €3,375 — Plant 4010',
          body: `Dear Marc,

Approval is required for a batch correction posting at Plant 4010:

Work Item: WI-1059
Type: Batch Transfer (Mismatch Correction)
Material: 5534098723 — LA MER CREME DE LA MER 60ML
Plant: 4010 (Oevel)
Quantity: 75 EA
Value: €3,375.00

Batch Details:
• Current (wrong) batch in SAP: B2025011201 (Exp: Jun 2026)
• Correct batch (physical): B2025011502 (Exp: Aug 2026)

Reason: GR was processed using ASN batch number, but physical shipment had a different production batch due to late substitution by vendor.

Requested Action: MIGO A08 Transfer Posting to swap batch from B2025011201 → B2025011502.

Approval Threshold: €1,000–€5,000 (Category Leader)

Please reply APPROVED or REJECTED with comments.

Best regards,
Anna Polkowska
TPM Inventory Analyst — EMEA
(Auto-generated by SynOps)`
        },
        outcome: 'Approval request sent to Marc Dubois. Status → "Pending Approval".',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 4,
        title: 'Execute Batch Transfer Posting — MIGO A08',
        description: 'After approval received, SynOps pre-populates MIGO with A08 (Transfer Posting) to swap batch. Analyst confirms and posts.',
        migoData: {
          transaction: 'MIGO',
          action: 'A08 — Transfer Posting',
          movementType: '309',
          mvtDescription: 'Transfer Posting — Batch to Batch (same material, same plant)',
          po: '4503290178',
          poLine: '10',
          material: '5534098723',
          materialDesc: 'LA MER CREME DE LA MER 60ML',
          plant: '4010',
          sloc: 'FG01',
          batch: 'B2025011201 → B2025011502',
          qty: '75 EA',
          underConsumption: false,
          postingDate: '2025-01-18',
          reasonCode: '301',
          reasonDesc: 'Batch correction — received batch differs from documented',
          headerText: 'WI-1059 Batch swap Hanes Erie 4010 per approval Marc Dubois',
          referenceDoc: 'WI-1059 / Approval: Marc Dubois Jan 17'
        },
        postResult: {
          documentNumber: '4900156789',
          postingStatus: 'Success',
          newMB52Unrestricted: '75 EA (Batch B2025011502)',
          verified: true
        },
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1048: FULL INVESTIGATION - Blocked Stock (Failed 344 Posting)
  // Intercos China, Plant 6010, Material 3891045672, 150 EA
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1048': {
    scenario: 2,
    scenarioLabel: 'Full Investigation',
    workItemId: 'WI-1048',
    type: 'Stock Discrepancy',
    tpm: 'Intercos China',
    plant: '6010',
    material: '3891045672',
    qty: 150,
    uom: 'EA',

    step4: {
      unrestricted: 120,
      blck: 150,
      qi: 0,
      exfer: 0,
      inTransit: 0,
      sapTotal: 270,
      vendorDeclared: 270,
      gap: 0,
      unrestrictedGap: 150,
      gapDescription: 'Total SAP (270) = Vendor declared (270) BUT unrestricted gap = 150 EA. Blocked stock investigation required.',
      transaction: 'MB52',
      uom: 'EA'
    },

    step5: {
      po: '4500672891',
      ordered: 300,
      consumed: 200,
      open: 100,
      vendorClaimed: 150,
      transaction: 'ME23N',
      uom: 'EA',
      description: 'PO open qty (100 EA) does not explain full 150 EA unrestricted gap'
    },

    step6: {
      result: 'MISMATCH',
      details: 'MB52 unrestricted (120 EA) ≠ vendor physical unrestricted (270 EA). Gap = 150 EA. Full investigation triggered.',
      fastPathEligible: false,
      reason: 'Unrestricted stock mismatch requires BLCK/QI/EXFER analysis'
    },

    step7: {
      blck: 150,
      qi: 0,
      blckAnalysis: {
        movementType: '343',
        postingDate: '2024-12-28',
        qualityNotification: 'QN-400098',
        sourceVendor: '10045891',
        vendorName: 'Intercos China',
        ownerTPM: 'Same TPM',
        rootCause: 'Quality release completed Dec 30 but MvT 344 (BLCK→Unrestricted) posting failed due to batch determination error',
        recommendation: 'Post 344 to release blocked stock to unrestricted'
      },
      exfer: 0,
      inTransit: 0,
      explanation: '150 EA traced to blocked stock via MvT 343 on Dec 28. QN-400098 resolved but 344 not posted.',
      gapExplained: true
    },

    step8: {
      plannedSupply: [
        { type: 'PO', number: '4500672900', qty: 100, uom: 'EA', dueDate: '2025-02-05', status: 'Open' }
      ],
      immediateImpact: false,
      description: '1 open PO (100 EA, due Feb 5). No immediate supply impact from current discrepancy.',
      transaction: 'MD04'
    },

    step9: {
      qi: 0,
      exfer: 0,
      qiAnalysis: null,
      exferAnalysis: null,
      description: 'No stock in QI or EXFER categories. Not applicable.'
    },

    step10: null, // Not needed - gap fully explained by BLCK in Step 7

    step11: {
      genuineVariance: 0,
      gapExplanation: 'Gap = 150 EA confirmed as failed MvT 344 posting (BLCK→Unrestricted). System issue, not true loss.',
      resolution: 'Post MvT 344 to move 150 EA from blocked to unrestricted',
      varianceType: 'System Process Failure',
      analystConfirmed: true,
      confidenceLevel: 100
    },

    step12: {
      qty: 150,
      unitPrice: 32.60,
      totalValue: 4890.00,
      currency: 'USD',
      threshold: 3000,
      thresholdExceeded: true,
      approver: 'Steven Zhang',
      autoApproved: false,
      region: 'APAC',
      approvalNote: 'Value $4,890 exceeds APAC $3K threshold. Routed to Steven Zhang for approval.'
    },

    step13: {
      transaction: 'MB11',
      movementType: '344',
      mvtDescription: 'Transfer Blocked to Unrestricted-Use (Release from Quality)',
      plant: '6010',
      material: '3891045672',
      batch: '000672B24',
      qty: 150,
      uom: 'EA',
      reasonCode: '205',
      reasonDesc: 'Quality release - failed posting correction',
      headerText: 'WI-1048 BLCK release Intercos 6010 QN-400098'
    },

    step14: {
      transaction: 'MIGO',
      po: '4500672891',
      underConsumption: false,
      description: 'Subsequent adjustment against PO 4500672891 to align GR records post-344 posting',
      postingDate: '2025-01-15',
      documentType: 'WE'
    },

    step15: {
      preMB52: { unrestricted: 120, blck: 150, qi: 0, exfer: 0, inTransit: 0, total: 270 },
      postMB52: { unrestricted: 270, blck: 0, qi: 0, exfer: 0, inTransit: 0, total: 270 },
      vendorPhysical: 270,
      verified: true,
      warningMessage: null,
      verificationNote: 'New MB52 = 270 EA unrestricted, 0 BLCK. Matches vendor physical count. ✓ Verified.'
    },

    step16: {
      recipients: ['intercos.china@intercos.com', 'chris.wang@company.com'],
      subject: 'Stock Adjustment Completed - WI-1048 - Material 3891045672 - Plant 6010',
      documentNumber: '4900123456',
      finalQty: 270,
      uom: 'EA',
      emailBody: 'Stock adjusted. Doc# 4900123456. SAP = 270 EA unrestricted. Blocked stock released via MvT 344. Aligned with vendor physical.'
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1045: FULL INVESTIGATION - PO Qty Mismatch / Under-Consumption
  // Intercos MIC, Plant 6050, Material 5612034789, 45 KG
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1045': {
    scenario: 2,
    scenarioLabel: 'Under-Consumption',
    workItemId: 'WI-1045',
    type: 'Consumption Correction',
    tpm: 'Intercos MIC',
    plant: '6050',
    material: '5612034789',
    qty: 45,
    uom: 'KG',

    // Primary (Sunand-model) investigation — UNDER-consumption: vendor used LESS than SAP booked -> MvT 544, stock UP
    investigationV2: {
      workItemId: 'WI-1045',
      title: 'Subsequent Quantity Adjustment (3.2.1.2) - Under-Consumption Correction',
      classification: 'Subsequent Quantity Adjustment - Under-Consumption (MvT 544)',
      request: {
        source: 'TPM Vendor Email (Intercos MIC via Mei Lin)',
        vendor: 'Intercos MIC (MRP area 10067234)',
        material: '5612034789',
        materialDesc: 'ESTEE LAUDER DW FOUNDATION BULK 25KG',
        plant: '6050 (China MIC)',
        specialStock: 'O + Intercos MIC',
        po: '4500034789',
        reportedQty: '45 KG under-consumed (actual 155 KG vs 200 KG booked)',
        uom: 'KG',
        reason: 'On PO 4500034789 SAP booked 200 KG of bulk as consumed, but the vendor actually used only 155 KG for the production run (better yield than planned). 45 KG still physically sits with the vendor and must be added back to SAP inventory.',
        note: 'No physical material to collect/destroy - the 45 KG is still at the vendor. This is a consumption correction (inventory adjustment), not a DAV. Under-consumption => stock must go UP by 45 KG.'
      },
      checks: [
        {
          id: '1',
          transaction: 'MB52',
          title: 'Stock Picture - All Statuses',
          purpose: 'Confirm the SAP on-hand position across all statuses before adjusting.',
          status: 'PASS',
          statusLabel: 'Verified',
          rows: [
            { label: 'Unrestricted', value: '110 KG', highlight: 'accent' },
            { label: 'Restricted (QI)', value: '30 KG' },
            { label: 'Blocked', value: '0 KG' },
            { label: 'EXFER - pending transfer', value: '0 KG' },
            { label: 'In-Transit', value: '0 KG' },
            { label: 'Physical vs SAP', value: '45 KG under-stated' }
          ],
          finding: 'SAP shows 110 KG unrestricted (+30 KG QI) at plant 6050 under Intercos MIC. Because 200 KG was booked as consumed but only 155 KG was really used, SAP is 45 KG short of what the vendor physically holds - a phantom shortfall to be added back.'
        },
        {
          id: '2',
          transaction: 'ME23N',
          title: 'PO Header & Component / BOM',
          purpose: 'Read the PO to correct (4500034789) and its component / BOM.',
          status: 'PASS',
          statusLabel: 'PO Verified',
          rows: [
            { label: 'PO to correct (consumption)', value: '4500034789', highlight: 'accent' },
            { label: 'Vendor', value: 'Intercos MIC' },
            { label: 'Component Material', value: '5612034789 - DW FOUNDATION BULK' },
            { label: 'Component qty booked consumed', value: '200 KG' },
            { label: 'Plant', value: '6050' },
            { label: 'Batch', value: '000789C25' }
          ],
          finding: 'PO 4500034789 booked 200 KG of component 5612034789 as consumed. Vendor reports only 155 KG used - a 45 KG under-consumption to be reversed on this PO.'
        },
        {
          id: '3',
          transaction: 'ME23N / MD04',
          title: 'PO Goods Receipt Completion',
          purpose: 'Confirm GR and the original consumption are complete - a subsequent adjustment corrects consumption AFTER GR is done.',
          status: 'PASS',
          statusLabel: 'GR Complete',
          rows: [
            { label: 'PO GR status', value: 'Complete (GR + Invoice posted)', highlight: 'good' },
            { label: 'Original consumption posted', value: 'Yes - 200 KG consumed on PO' },
            { label: 'STO / ASN', value: 'N/A - subcontracting PO (no STO)' },
            { label: 'Delivery date', value: '08/07/2026' }
          ],
          finding: 'GR, invoice and the 200 KG consumption are complete on PO 4500034789 -> subsequent adjustment (MIGO) path, not a GR reversal or DAV.'
        },
        {
          id: '4',
          transaction: 'MB51',
          title: 'Consumption History (543/544) - Quantify Correction',
          purpose: 'Read consumption postings against the PO to quantify the 45 KG under-consumption and confirm no prior 544.',
          status: 'PASS',
          statusLabel: 'Correction Open',
          movements: [
            { date: '08/07/2026', mvt: '543', mvtDesc: 'Original consumption on PO 4500034789', qty: '200- KG', doc: '5051200650', user: 'X_CWANG' }
          ],
          netConsumedLabel: 'Under-consumption to reverse (add back)',
          netConsumed: '45 KG (open)',
          finding: 'MB51 shows 200 KG consumed (543). The vendor used only 155 KG, so 45 KG must be reversed back into stock (544). No prior 544 correction exists for this PO.'
        }
      ],
      variance: {
        vendorActual: '155 KG actually consumed (vendor confirmed)',
        sapConsumed: '200 KG booked (sum of 543 on PO)',
        deltaVsComponent: 'Variance = -45 KG (vendor used LESS than SAP)',
        classification: 'UNDER-CONSUMPTION -> POST MIGO 544 (add the 45 KG back, stock UP)',
        classColor: 'good'
      },
      recommendation: {
        headline: 'Recommended: MIGO Subsequent Adjustment -> MvT 544 for 45 KG (under-consumption)',
        rationale: 'MB52 shows SAP is 45 KG short of the vendor physical, ME23N confirms PO 4500034789 booked 200 KG (GR/invoice complete), and MB51 shows 200 KG consumed vs 155 KG vendor actual. Per 3.2.1.2 the 45 KG is added back via MIGO subsequent adjustment with "Under Consumption" ticked (MvT 544). Value $1,250 is below the $3,000 APAC threshold -> no approval required.',
        note: 'SynOps recommends - it does not auto-post. Review the fields below, edit if needed, then click Post in SAP to complete the 45 KG under-consumption correction.',
        fields: [
          { key: 'transaction', label: 'Transaction', value: 'MIGO - Subsequent Adjustment (option 11)', editable: false },
          { key: 'underConsumption', label: 'Under Consumption', value: 'Yes (vendor used LESS than SAP)', editable: false },
          { key: 'movementType', label: 'Movement Type', value: '544', editable: true },
          { key: 'po', label: 'PO', value: '4500034789', editable: true },
          { key: 'material', label: 'Material', value: '5612034789', editable: true },
          { key: 'plant', label: 'Plant', value: '6050', editable: true },
          { key: 'specialStock', label: 'Special Stock / Vendor', value: 'O + Intercos MIC', editable: true },
          { key: 'batch', label: 'Batch', value: '000789C25', editable: true },
          { key: 'qty', label: 'Quantity', value: '45', editable: true },
          { key: 'uom', label: 'UoM', value: 'KG', editable: true },
          { key: 'headerText', label: 'Header Text', value: 'WI-1045 Under-consumption Intercos MIC PO 4500034789', editable: true }
        ]
      },
    },

    step4: {
      unrestricted: 110,
      blck: 0,
      qi: 30,
      exfer: 0,
      inTransit: 0,
      sapTotal: 140,
      vendorDeclared: 155,
      gap: -45,
      unrestrictedGap: -45,
      gapDescription: 'SAP unrestricted (110 KG) is 45 KG short of vendor physical (155 KG) because 200 KG was booked consumed but only 155 KG was used. 45 KG to be added back (544).',
      transaction: 'MB52',
      uom: 'KG'
    },

    step5: {
      po: '4500034789',
      ordered: 200,
      consumed: 200,
      open: 0,
      vendorClaimed: 155,
      transaction: 'ME23N',
      uom: 'KG',
      description: 'SAP booked 200 KG consumed; vendor actually used only 155 KG -> 45 KG under-consumption to reverse (544).'
    },

    step6: {
      result: 'MATCH',
      details: 'Vendor-reported under-consumption of 45 KG confirmed against PO (200 booked vs 155 used).',
      fastPathEligible: false,
      reason: 'Under-consumption confirmed — add 45 KG back via 544'
    },

    step7: {
      blck: 0,
      qi: 30,
      blckAnalysis: null,
      exfer: 0,
      inTransit: 0,
      explanation: 'BLCK = 0. Skipped. QI stock (30 KG) noted but analyzed in Step 9.',
      gapExplained: false
    },

    step8: {
      plannedSupply: [
        { type: 'STO', number: '4300045890', qty: 50, uom: 'KG', dueDate: '2025-01-20', status: 'In Process' }
      ],
      immediateImpact: false,
      description: '1 STO (50 KG, due Jan 20). Noted for planning visibility.',
      transaction: 'MD04'
    },

    step9: {
      qi: 30,
      exfer: 0,
      qiAnalysis: {
        qty: 30,
        uom: 'KG',
        status: 'Pending QA Release',
        autoFlag: '30 KG pending QA release - not missing, held for inspection',
        notification: 'Planner notified',
        inspectionLot: '0000045672',
        createdDate: '2025-01-08'
      },
      exferAnalysis: null,
      description: 'QI = 30 KG flagged as pending inspection. Not part of consumption gap. Planner notified.'
    },

    step10: {
      bomConsumptionCheck: true,
      movements543: [
        {
          movementType: '543',
          qty: 45,
          uom: 'KG',
          fgPO: '4500034800',
          postingDate: '2025-01-10',
          description: 'Consumed for FG production batch but MIGO not posted'
        }
      ],
      nlpAnalysis: {
        source: 'Email',
        extractedText: 'consumed 45 kg for production batch',
        confidence: 92,
        matchedTo: 'FG PO 4500034800'
      },
      underConsumptionConfirmed: true,
      description: 'BOM check: 543 movements show 45 KG consumed on FG PO 4500034800 (Jan 10) but MIGO not posted. NLP confirms via email (92% confidence).'
    },

    step11: {
      genuineVariance: 45,
      gapExplanation: 'Net genuine variance = 45 KG under-reported consumption. Production used material but posting was not completed in SAP.',
      resolution: 'Post MvT 543 under-consumption to align SAP with actual usage',
      varianceType: 'Under-Consumption (Production)',
      analystConfirmed: true,
      confidenceLevel: 92
    },

    step12: {
      qty: 45,
      unitPrice: 27.78,
      totalValue: 1250.10,
      currency: 'USD',
      threshold: 3000,
      thresholdExceeded: false,
      approver: null,
      autoApproved: true,
      region: 'APAC',
      approvalNote: 'Value $1,250 below $3K APAC threshold. Auto-approved.'
    },

    step13: {
      transaction: 'MIGO',
      movementType: '544',
      mvtDescription: 'Under-Consumption Reversal (add 45 KG back to stock)',
      plant: '6050',
      material: '5612034789',
      batch: '000789C25',
      qty: 45,
      uom: 'KG',
      reasonCode: '203',
      reasonDesc: 'Under-consumption - vendor used less than booked',
      headerText: 'WI-1045 Under-consumption Intercos MIC 6050',
      poLine: '4500034789/Line 10'
    },

    step14: {
      transaction: 'MIGO',
      po: '4500034789',
      underConsumption: true,
      description: 'Subsequent adjustment with under-consumption checkbox selected for PO 4500034789 (MvT 544)',
      postingDate: '2026-07-15',
      documentType: 'WA'
    },

    step15: {
      preMB52: { unrestricted: 110, blck: 0, qi: 30, exfer: 0, inTransit: 0, total: 140 },
      postMB52: { unrestricted: 155, blck: 0, qi: 30, exfer: 0, inTransit: 0, total: 185 },
      vendorPhysical: 155,
      verified: true,
      warningMessage: null,
      verificationNote: 'MB52 = 155 KG unrestricted (110 + 45). Matches vendor physical. ✓ Verified.'
    },

    step16: {
      recipients: ['mei.lin@intercos.com', 'chris.wang@elcompanies.com'],
      subject: 'Stock Adjustment Completed - WI-1045 - Material 5612034789 - Plant 6050',
      documentNumber: '4900134567',
      finalQty: 155,
      uom: 'KG',
      emailBody: 'Under-consumption of 45 KG reversed (MvT 544). Doc# 4900134567. SAP unrestricted = 155 KG, aligned with your physical.'
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1042: FULL INVESTIGATION - EXFER Stock Explains Gap
  // Kolmar Korea, Plant 6030, Material 2345678901, 80 EA
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1042': {
    scenario: 2,
    scenarioLabel: 'Full Investigation',
    workItemId: 'WI-1042',
    type: 'Stock Discrepancy',
    tpm: 'Kolmar Korea',
    plant: '6030',
    material: '2345678901',
    qty: 80,
    uom: 'EA',

    step4: {
      unrestricted: 400,
      blck: 0,
      qi: 0,
      exfer: 80,
      inTransit: 0,
      sapTotal: 480,
      vendorDeclared: 400,
      gap: -80,
      gapDescription: 'SAP total (480 EA) vs vendor declared (400 EA). Gap = -80 EA (TPM reports short). EXFER stock suspected.',
      transaction: 'MB52',
      uom: 'EA'
    },

    step5: {
      po: '4500678901',
      ordered: 500,
      consumed: 480,
      open: 20,
      vendorClaimed: 80,
      transaction: 'ME23N',
      uom: 'EA',
      description: 'PO GR = 480 EA matches SAP total. Open qty (20 EA) does not explain 80 EA gap.'
    },

    step6: {
      result: 'MISMATCH',
      details: 'MB52 unrestricted (400 EA) ≠ expected (480 EA). 80 EA unaccounted in unrestricted. Full investigation needed.',
      fastPathEligible: false,
      reason: 'Unrestricted stock 80 EA short vs SAP total - EXFER investigation required'
    },

    step7: {
      blck: 0,
      qi: 0,
      blckAnalysis: null,
      exfer: 80,
      inTransit: 0,
      explanation: 'BLCK = 0. Skipped. EXFER = 80 EA identified - analyzed in Step 9.',
      gapExplained: false
    },

    step8: {
      plannedSupply: [],
      immediateImpact: false,
      description: 'No planned supply within 14 days.',
      transaction: 'MD04'
    },

    step9: {
      qi: 0,
      exfer: 80,
      qiAnalysis: null,
      exferAnalysis: {
        qty: 80,
        uom: 'EA',
        status: 'Transfer Staging Incomplete',
        autoFlag: '80 EA stuck in EXFER - transfer staging incomplete. MvT 542 posted Dec 22 but MvT 541 never completed.',
        movementType542Date: '2024-12-22',
        movementType541Status: 'Not Posted',
        escalation: 'Auto-escalated to Planner to resolve',
        stoNumber: '4300067890'
      },
      description: 'EXFER = 80 EA! Stock stuck in transfer staging. 542 posted Dec 22 but 541 never completed. Escalated to Planner.'
    },

    step10: null, // N/A - gap fully explained by EXFER

    step11: {
      genuineVariance: 0,
      gapExplanation: 'Genuine variance = 0. Stock is in EXFER (not lost). 80 EA stuck due to incomplete transfer (542 without 541).',
      resolution: 'Complete MvT 541 to finalize transfer, OR reverse MvT 542 to return stock to unrestricted',
      varianceType: 'Transfer Process Incomplete (EXFER)',
      analystConfirmed: true,
      confidenceLevel: 100
    },

    step12: {
      qty: 80,
      unitPrice: 52.50,
      totalValue: 4200.00,
      currency: 'USD',
      threshold: 3000,
      thresholdExceeded: true,
      approver: 'Steven Zhang',
      autoApproved: false,
      region: 'APAC',
      approvalNote: 'Value $4,200 exceeds APAC $3K threshold. Routed to Steven Zhang for approval.'
    },

    step13: {
      transaction: 'MB11',
      movementType: '541/542',
      mvtDescription: 'Transfer Posting Resolution',
      plant: '6030',
      material: '2345678901',
      batch: '000901D24',
      qty: 80,
      uom: 'EA',
      reasonCode: '208',
      reasonDesc: 'EXFER resolution - incomplete transfer correction',
      headerText: 'WI-1042 EXFER resolution Kolmar 6030',
      options: [
        { option: 'A', action: 'Post MvT 541 to complete transfer to receiving plant', recommended: false },
        { option: 'B', action: 'Reverse MvT 542 to return 80 EA to unrestricted at Plant 6030', recommended: true }
      ]
    },

    step14: {
      transaction: 'MIGO',
      po: '4500678901',
      underConsumption: false,
      description: 'After EXFER resolution, MIGO adjustment if PO alignment needed',
      postingDate: null,
      documentType: 'WE',
      pendingResolution: true
    },

    step15: {
      preMB52: { unrestricted: 400, blck: 0, qi: 0, exfer: 80, inTransit: 0, total: 480 },
      postMB52: null, // Pending resolution choice
      vendorPhysical: 400,
      verified: false,
      warningMessage: 'Post-verification pending resolution choice (Option A: complete 541 or Option B: reverse 542)',
      verificationNote: 'Verification will confirm EXFER = 0 and unrestricted aligns with vendor physical after resolution.'
    },

    step16: {
      recipients: ['kolmar.korea@kolmar.com', 'chris.wang@company.com'],
      subject: 'Stock Adjustment Pending - WI-1042 - Material 2345678901 - Plant 6030',
      documentNumber: null,
      finalQty: null,
      uom: 'EA',
      emailBody: null,
      templateReady: true,
      pendingExecution: true,
      emailTemplate: 'Stock adjustment pending resolution. EXFER = 80 EA identified. Awaiting Planner decision on 541 completion vs 542 reversal.'
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-1055: FULL INVESTIGATION - In-Transit + Genuine GR Shortfall
  // Hanes Erie, Plant 4010, Material 8901234567, 240 EA
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-1055': {
    scenario: 2,
    scenarioLabel: 'Full Investigation',
    workItemId: 'WI-1055',
    type: 'Stock Discrepancy',
    tpm: 'Hanes Erie',
    plant: '4010',
    material: '8901234567',
    qty: 240,
    uom: 'EA',

    step4: {
      unrestricted: 360,
      blck: 0,
      qi: 0,
      exfer: 0,
      inTransit: 200,
      sapTotal: 560,
      vendorDeclared: 600,
      gap: 240,
      gapDescription: 'Vendor declares 600 EA physical. SAP unrestricted = 360 EA. Gap = +240 EA (TPM over vs SAP unrestricted). In-Transit = 200 EA partially explains.',
      transaction: 'MB52',
      uom: 'EA'
    },

    step5: {
      po: '4503280445',
      ordered: 600,
      consumed: 360,
      open: 240,
      vendorClaimed: 240,
      transaction: 'ME23N',
      uom: 'EA',
      description: 'PO ordered 600 EA, GR posted only 360 EA. Open qty = 240 EA matches vendor claim.'
    },

    step6: {
      result: 'MISMATCH',
      details: 'Vendor physical (600 EA) ≠ SAP unrestricted (360 EA). 240 EA gap requires investigation into transit stock and GR postings.',
      fastPathEligible: false,
      reason: 'Large gap between vendor declared and SAP unrestricted - multiple root causes suspected'
    },

    step7: {
      blck: 0,
      qi: 0,
      blckAnalysis: null,
      exfer: 0,
      inTransit: 200,
      explanation: 'BLCK = 0. Skip. In-Transit = 200 EA identified (partial explanation). Detailed analysis in Step 8.',
      gapExplained: false
    },

    step8: {
      plannedSupply: [
        { type: 'STO', number: '4302889012', qty: 200, uom: 'EA', dueDate: '2025-01-18', status: 'In Transit' }
      ],
      immediateImpact: true,
      description: 'In-transit 200 EA (STO 4302889012, ETA Jan 18). Partially explains gap. GR pending on arrival.',
      transaction: 'MD04'
    },

    step9: {
      qi: 0,
      exfer: 0,
      qiAnalysis: null,
      exferAnalysis: null,
      description: 'QI = 0, EXFER = 0. No stock in these categories.'
    },

    step10: {
      bomConsumptionCheck: false,
      movements543: [],
      nlpAnalysis: {
        source: 'Email',
        extractedText: 'received full 600 units on Jan 12',
        confidence: 88,
        matchedTo: 'PO 4503280445 - GR shortfall identified'
      },
      underConsumptionConfirmed: false,
      grShortfall: true,
      description: 'No 543 movements found. NLP from email confirms: "received full 600 units on Jan 12." GR only posted for 360 EA. Partial delivery GR missed.'
    },

    step11: {
      genuineVariance: 40,
      gapExplanation: 'Gap = 240 EA total. 200 EA explained by in-transit (STO pending GR at destination). Remaining 40 EA = genuine GR shortfall (physical received but GR not posted).',
      resolution: 'Post GR correction for 40 EA. 200 EA will auto-resolve when in-transit GR is posted on arrival.',
      varianceType: 'GR Shortfall (Partial Delivery Not Posted)',
      analystConfirmed: true,
      confidenceLevel: 88,
      breakdown: {
        inTransitExplained: 200,
        genuineLoss: 40,
        totalGap: 240
      }
    },

    step12: {
      qty: 40,
      unitPrice: 24.00,
      totalValue: 960.00,
      currency: 'EUR',
      threshold: 3000,
      thresholdExceeded: false,
      approver: null,
      autoApproved: true,
      region: 'EMEA',
      approvalNote: 'Value €960 below €3K EMEA threshold. Auto-approved. (200 EA in-transit will resolve on GR.)'
    },

    step13: {
      transaction: 'MB11',
      movementType: '701',
      mvtDescription: 'Physical Inventory Difference - Stock Increase',
      plant: '4010',
      material: '8901234567',
      batch: '000567E25',
      qty: 40,
      uom: 'EA',
      reasonCode: '201',
      reasonDesc: 'GR correction - partial delivery not posted',
      headerText: 'WI-1055 GR correction Hanes Erie 4010'
    },

    step14: {
      transaction: 'MIGO',
      po: '4503280445',
      underConsumption: false,
      description: 'MIGO goods receipt correction for 40 EA against PO 4503280445',
      postingDate: '2025-01-16',
      documentType: 'WE'
    },

    step15: {
      preMB52: { unrestricted: 360, blck: 0, qi: 0, exfer: 0, inTransit: 200, total: 560 },
      postMB52: { unrestricted: 400, blck: 0, qi: 0, exfer: 0, inTransit: 200, total: 600 },
      vendorPhysical: 600,
      verified: true,
      warningMessage: null,
      verificationNote: 'MB52 = 400 EA unrestricted + 200 EA in-transit = 600 EA total. After transit GR posts: 600 EA unrestricted. Matches vendor physical. ✓ Verified.'
    },

    step16: {
      recipients: ['hanes.erie@hanesbrands.com', 'anna.polkowska@company.com'],
      subject: 'Stock Adjustment Completed - WI-1055 - Material 8901234567 - Plant 4010',
      documentNumber: '4900145678',
      finalQty: 600,
      uom: 'EA',
      emailBody: 'Stock adjusted. Doc# 4900145678. SAP = 400 EA unrestricted + 200 EA in-transit (ETA Jan 18). Post-transit total = 600 EA. Aligned with vendor physical.'
    }
  },

  // -----------------------------------------------------------------------------
  // WI-1060: CASE A - OVER-CONSUMPTION (vendor used MORE than SAP) -> MIGO 543
  // Aptar Cosmetics, Plant 2020, Component J0HW010701, Order Qty 800 EA
  // -----------------------------------------------------------------------------
  'WI-1060': {
    scenario: 1,
    investigationV2: {
      workItemId: 'WI-1060',
      title: 'Subsequent Quantity Adjustment (3.2.1.2) - Over-Consumption (Case A)',
      classification: 'Subsequent Quantity Adjustment - Over-Consumption Correction',
      request: {
        source: 'TPM Vendor Email (Aptar Cosmetics via Maria Lopez)',
        vendor: 'Aptar Cosmetics (MRP area 10011530)',
        material: 'J0HW010701',
        materialDesc: 'BOTTLE, GLASS (2 oz jar)',
        plant: '2020 (US Subcontracting)',
        specialStock: 'O + Aptar Cosmetics',
        po: '4503260011',
        componentBatch: 'J0HW010701-A',
        reportedQty: '88 EA actual consumption (8 EA more than SAP)',
        uom: 'EA',
        reason: 'Vendor confirms they actually consumed 88 EA of the glass bottle for this production run. SAP has only booked 80 EA consumption on the PO. SAP is holding 8 EA of phantom stock on hand.',
        note: 'With PO path (not W008): a valid consumption document exists on PO 4503260011. Final PO / Invoice quantity is NOT changing - only component consumption is corrected.'
      },
      checks: [
        {
          id: '1',
          transaction: 'MB52',
          title: 'Stock Picture - All Statuses',
          purpose: 'Confirm the SAP on-hand position across all statuses before adjusting.',
          status: 'PASS',
          statusLabel: 'Verified',
          rows: [
            { label: 'Unrestricted', value: '8 EA', highlight: 'accent' },
            { label: 'Restricted (QI)', value: '0 EA' },
            { label: 'Blocked', value: '0 EA' },
            { label: 'EXFER - pending transfer', value: '0 EA' },
            { label: 'In-Transit', value: '0 EA' },
            { label: 'Demand-supply check', value: '8 (consistent)' }
          ],
          finding: 'SAP shows 8 EA unrestricted at plant 2020 under Aptar - stock SAP thinks is still available but the vendor already consumed it. Phantom on-hand from under-stated consumption.'
        },
        {
          id: '2',
          transaction: 'ME23N',
          title: 'PO Header & Component / BOM (display)',
          purpose: 'Read the PO to correct (4503260011) and its component / BOM. Display only - no change.',
          status: 'PASS',
          statusLabel: 'PO Verified',
          rows: [
            { label: 'PO to correct (consumption)', value: '4503260011', highlight: 'accent' },
            { label: 'Vendor', value: 'Aptar Cosmetics' },
            { label: 'Component Material', value: 'J0HW010701 - BOTTLE, GLASS' },
            { label: 'Component Batch', value: 'J0HW010701-A' },
            { label: 'Component Order Quantity', value: '800 EA' },
            { label: 'FG / BOM parent', value: 'J0ZR010701' },
            { label: 'Plant', value: '2020' }
          ],
          finding: 'PO 4503260011 carries the consumption of component J0HW010701 into FG J0ZR010701. This is the target of the over-consumption correction.'
        },
        {
          id: '3',
          transaction: 'ME23N',
          title: 'PO Goods Receipt Completion',
          purpose: 'Confirm GR + Invoice are complete (checkpoint 3b: final PO / Invoice qty is NOT changing).',
          status: 'PASS',
          statusLabel: 'GR Complete',
          rows: [
            { label: 'PO GR status (Order Qty vs GR Qty)', value: 'Complete - GR posted', highlight: 'good' },
            { label: 'Invoice posted', value: 'Yes' },
            { label: 'Consumption posted', value: 'Yes - consumed on PO' },
            { label: 'Checkpoint 3b - PO/Invoice qty changing?', value: 'No - consumption-only correction' },
            { label: 'STO GR (MB5T / MB51)', value: 'N/A - subcontracting PO (no STO)' }
          ],
          finding: 'GR, invoice and consumption are complete on PO 4503260011. Final PO / Invoice quantity stays as-is - only component consumption is corrected. Subsequent adjustment (MIGO) path.'
        },
        {
          id: '4',
          transaction: 'MB51',
          title: 'Consumption History (543) - Compute Variance',
          purpose: 'Read 543 consumption postings on the PO to get SAP Consumed, compute variance, confirm no prior correction.',
          status: 'PASS',
          statusLabel: 'Over-Consumption',
          movements: [
            { date: '02/03/2026', mvt: '543', mvtDesc: 'Consumption on PO 4503260011', qty: '80- EA', doc: '5051172060', user: 'X_MROBLE' }
          ],
          netConsumedLabel: 'SAP Consumed (sum of 543)',
          netConsumed: '80 EA',
          finding: 'MB51 shows SAP Consumed = 80 EA. Vendor Actual = 88 EA. Variance = 88 - 80 = +8 EA (positive). No prior 543/544 correction exists for this. OVER-CONSUMPTION -> post 543 for 8 EA.'
        }
      ],
      variance: {
        vendorActual: '88 EA (vendor confirmed actual consumption)',
        sapConsumed: '80 EA (sum of 543 on PO)',
        deltaVsComponent: 'Variance = +8 EA (vendor used MORE than SAP)',
        classification: 'OVER-CONSUMPTION -> POST MIGO 543 (consume the extra 8 EA, stock DOWN)',
        classColor: 'good'
      },
      recommendation: {
        headline: 'Recommended: MIGO Subsequent Adjustment -> MvT 543 for 8 EA (over-consumption)',
        rationale: 'MB52 confirms 8 EA phantom on hand, ME23N confirms PO 4503260011 and GR/Invoice complete (qty not changing), MB51 shows SAP Consumed 80 vs Vendor Actual 88. Per 3.2.1.2 the extra 8 EA is consumed via MIGO subsequent adjustment (MvT 543) - post with PO, not W008.',
        note: 'SynOps recommends - it does not auto-post. Review the fields below, edit if needed, then click Post in SAP to complete the 8 EA over-consumption correction.',
        fields: [
          { key: 'transaction', label: 'Transaction', value: 'MIGO - Subsequent Adjustment (option 11)', editable: false },
          { key: 'underConsumption', label: 'Under Consumption', value: 'No (vendor used MORE than SAP)', editable: false },
          { key: 'movementType', label: 'Movement Type', value: '543', editable: true },
          { key: 'po', label: 'PO', value: '4503260011', editable: true },
          { key: 'material', label: 'Material', value: 'J0HW010701', editable: true },
          { key: 'plant', label: 'Plant', value: '2020', editable: true },
          { key: 'specialStock', label: 'Special Stock / Vendor', value: 'O + Aptar Cosmetics', editable: true },
          { key: 'batch', label: 'Batch', value: 'J0HW010701-A', editable: true },
          { key: 'qty', label: 'Quantity', value: '8', editable: true },
          { key: 'uom', label: 'UoM', value: 'EA', editable: true },
          { key: 'headerText', label: 'Header Text', value: 'WI-1060 Over-consumption Aptar PO 4503260011', editable: true }
        ]
      },
    }
  },

  // -----------------------------------------------------------------------------
  // WI-1061: CASE B - UNDER-CONSUMPTION (vendor used LESS than SAP) -> MIGO 544
  // Aptar Cosmetics, Plant 2020, Component J0HW010701, Order Qty 800 EA
  // -----------------------------------------------------------------------------
  'WI-1061': {
    scenario: 1,
    investigationV2: {
      workItemId: 'WI-1061',
      title: 'Subsequent Quantity Adjustment (3.2.1.2) - Under-Consumption (Case B)',
      classification: 'Subsequent Quantity Adjustment - Under-Consumption Correction',
      request: {
        source: 'TPM Vendor Email (Aptar Cosmetics via Maria Lopez)',
        vendor: 'Aptar Cosmetics (MRP area 10011530)',
        material: 'J0HW010701',
        materialDesc: 'BOTTLE, GLASS (2 oz jar)',
        plant: '2020 (US Subcontracting)',
        specialStock: 'O + Aptar Cosmetics',
        po: '4503260022',
        componentBatch: 'J0HW010701-B',
        reportedQty: '70 EA actual consumption (10 EA less than SAP)',
        uom: 'EA',
        reason: 'Vendor confirms they actually consumed only 70 EA of the glass bottle for this production run. SAP has booked 80 EA consumption on the PO. 10 EA should be added back to the TPM inventory.',
        note: 'With PO path (not W008): a valid consumption document exists on PO 4503260022. Final PO / Invoice quantity is NOT changing - only component consumption is corrected.'
      },
      checks: [
        {
          id: '1',
          transaction: 'MB52',
          title: 'Stock Picture - All Statuses',
          purpose: 'Confirm the SAP on-hand position across all statuses before adjusting.',
          status: 'PASS',
          statusLabel: 'Verified',
          rows: [
            { label: 'Unrestricted', value: '0 EA', highlight: 'accent' },
            { label: 'Restricted (QI)', value: '0 EA' },
            { label: 'Blocked', value: '0 EA' },
            { label: 'EXFER - pending transfer', value: '0 EA' },
            { label: 'In-Transit', value: '0 EA' },
            { label: 'Demand-supply check', value: '0 (consistent)' }
          ],
          finding: 'SAP shows 0 EA on hand - SAP consumed more than the vendor actually used, so 10 EA that physically still sits at the vendor is missing from SAP (phantom shortfall).'
        },
        {
          id: '2',
          transaction: 'ME23N',
          title: 'PO Header & Component / BOM (display)',
          purpose: 'Read the PO to correct (4503260022) and its component / BOM. Display only - no change.',
          status: 'PASS',
          statusLabel: 'PO Verified',
          rows: [
            { label: 'PO to correct (consumption)', value: '4503260022', highlight: 'accent' },
            { label: 'Vendor', value: 'Aptar Cosmetics' },
            { label: 'Component Material', value: 'J0HW010701 - BOTTLE, GLASS' },
            { label: 'Component Batch', value: 'J0HW010701-B' },
            { label: 'Component Order Quantity', value: '800 EA' },
            { label: 'FG / BOM parent', value: 'J0ZR010701' },
            { label: 'Plant', value: '2020' }
          ],
          finding: 'PO 4503260022 carries the consumption of component J0HW010701 into FG J0ZR010701. This is the target of the under-consumption correction.'
        },
        {
          id: '3',
          transaction: 'ME23N',
          title: 'PO Goods Receipt Completion',
          purpose: 'Confirm GR + Invoice are complete (checkpoint 3b: final PO / Invoice qty is NOT changing).',
          status: 'PASS',
          statusLabel: 'GR Complete',
          rows: [
            { label: 'PO GR status (Order Qty vs GR Qty)', value: 'Complete - GR posted', highlight: 'good' },
            { label: 'Invoice posted', value: 'Yes' },
            { label: 'Consumption posted', value: 'Yes - consumed on PO' },
            { label: 'Checkpoint 3b - PO/Invoice qty changing?', value: 'No - consumption-only correction' },
            { label: 'STO GR (MB5T / MB51)', value: 'N/A - subcontracting PO (no STO)' }
          ],
          finding: 'GR, invoice and consumption are complete on PO 4503260022. Final PO / Invoice quantity stays as-is - only component consumption is corrected. Subsequent adjustment (MIGO) path.'
        },
        {
          id: '4',
          transaction: 'MB51',
          title: 'Consumption History (543) - Compute Variance',
          purpose: 'Read 543 consumption postings on the PO to get SAP Consumed, compute variance, confirm no prior correction.',
          status: 'PASS',
          statusLabel: 'Under-Consumption',
          movements: [
            { date: '02/03/2026', mvt: '543', mvtDesc: 'Consumption on PO 4503260022', qty: '80- EA', doc: '5051172061', user: 'X_MROBLE' }
          ],
          netConsumedLabel: 'SAP Consumed (sum of 543)',
          netConsumed: '80 EA',
          finding: 'MB51 shows SAP Consumed = 80 EA. Vendor Actual = 70 EA. Variance = 70 - 80 = -10 EA (negative). No prior 543/544 correction exists. UNDER-CONSUMPTION -> post 544 for 10 EA (add back to TPM inventory).'
        }
      ],
      variance: {
        vendorActual: '70 EA (vendor confirmed actual consumption)',
        sapConsumed: '80 EA (sum of 543 on PO)',
        deltaVsComponent: 'Variance = -10 EA (vendor used LESS than SAP)',
        classification: 'UNDER-CONSUMPTION -> POST MIGO 544 (reverse 10 EA, stock UP / added to TPM inventory)',
        classColor: 'good'
      },
      recommendation: {
        headline: 'Recommended: MIGO Subsequent Adjustment - tick Under Consumption -> MvT 544 for 10 EA',
        rationale: 'MB52 shows the phantom shortfall, ME23N confirms PO 4503260022 and GR/Invoice complete (qty not changing), MB51 shows SAP Consumed 80 vs Vendor Actual 70. Per 3.2.1.2 the 10 EA is reversed back to TPM inventory via MIGO subsequent adjustment (MvT 544) - post with PO, not W008.',
        note: 'SynOps recommends - it does not auto-post. Review the fields below, edit if needed, then click Post in SAP to add the 10 EA back to TPM inventory.',
        fields: [
          { key: 'transaction', label: 'Transaction', value: 'MIGO - Subsequent Adjustment (option 11)', editable: false },
          { key: 'underConsumption', label: 'Under Consumption', value: 'Yes (vendor used LESS than SAP)', editable: false },
          { key: 'movementType', label: 'Movement Type', value: '544', editable: true },
          { key: 'po', label: 'PO', value: '4503260022', editable: true },
          { key: 'material', label: 'Material', value: 'J0HW010701', editable: true },
          { key: 'plant', label: 'Plant', value: '2020', editable: true },
          { key: 'specialStock', label: 'Special Stock / Vendor', value: 'O + Aptar Cosmetics', editable: true },
          { key: 'batch', label: 'Batch', value: 'J0HW010701-B', editable: true },
          { key: 'qty', label: 'Quantity', value: '10', editable: true },
          { key: 'uom', label: 'UoM', value: 'EA', editable: true },
          { key: 'headerText', label: 'Header Text', value: 'WI-1061 Under-consumption Aptar PO 4503260022', editable: true }
        ]
      },
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2001: CONSUMPTION CORRECTION (SCRAP) - vendor scrapped stock, SAP phantom balance
  // Hanes Erie, Plant 2020, Material J0HW010701 (glass bottle), 600 EA scrap -> MvT 543
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2001': {
    scenario: 1,
    investigationV2: {
      workItemId: 'WI-2001',
      title: 'Subsequent Quantity Adjustment (3.2.1.2) - Consumption Correction (Scrap)',
      classification: 'Subsequent Quantity Adjustment - Consumption Correction / Scrap (MvT 543)',
      request: {
        source: 'TPM Vendor Email (Hanes Erie via Judene O\'Connor)',
        vendor: 'Hanes Erie (MRP area 10045732)',
        material: 'J0HW010701',
        materialDesc: 'CLINIQUE HAPPY EDP 50ML GLASS BOTTLE',
        plant: '2020 (US Subcontracting)',
        specialStock: 'O + Hanes Erie',
        po: '4503255627',
        reportedQty: '600 EA scrap (SAP shows 600 on hand, physical = 0)',
        uom: 'EA',
        reason: 'The 600 EA the vendor shows on hand are actually their production scrap - no sellable/usable material remains. Consumption on PO 4503255627 must be corrected for the 600 EA so SAP stops carrying a phantom balance. GR, invoice and consumption are complete on the PO.',
        note: 'Anamika rule: a DAV is only raised when physical material is present. Hanes Erie confirmed NO physical material (all scrap) -> consumption-correction (inventory adjustment) path, not a DAV. Scrap => consume the 600 EA, stock DOWN to 0.'
      },
      checks: [
        {
          id: '1',
          transaction: 'MB52',
          title: 'Stock Picture - All Statuses',
          purpose: 'Confirm the SAP on-hand position across all statuses before adjusting.',
          status: 'PASS',
          statusLabel: 'Verified',
          rows: [
            { label: 'Unrestricted', value: '600 EA', highlight: 'accent' },
            { label: 'Restricted (QI)', value: '0 EA' },
            { label: 'Blocked', value: '0 EA' },
            { label: 'EXFER - pending transfer', value: '0 EA' },
            { label: 'In-Transit', value: '0 EA' },
            { label: 'Physical on hand (vendor)', value: '0 EA (all scrap)' }
          ],
          finding: 'SAP shows 600 EA unrestricted at plant 2020 under Hanes Erie, nothing in BLCK/QI/EXFER/transit. Vendor confirmed the physical is 0 - the 600 EA is scrap, a phantom balance from under-stated consumption.'
        },
        {
          id: '2',
          transaction: 'ME23N',
          title: 'PO Header & Component / BOM',
          purpose: 'Read the PO to correct (4503255627) and its component / BOM.',
          status: 'PASS',
          statusLabel: 'PO Verified',
          rows: [
            { label: 'PO to correct (consumption)', value: '4503255627', highlight: 'accent' },
            { label: 'Vendor', value: 'Hanes Erie' },
            { label: 'Component Material', value: 'J0HW010701 - CLINIQUE HAPPY EDP 50ML GLASS BOTTLE' },
            { label: 'FG / BOM parent', value: 'J0ZR010701' },
            { label: 'Plant', value: '2020' },
            { label: 'Batch', value: 'B2026050101' }
          ],
          finding: 'PO 4503255627 carries the consumption of component J0HW010701 into FG J0ZR010701 - the target of the subsequent adjustment for the 600 EA scrap.'
        },
        {
          id: '3',
          transaction: 'ME23N / MD04',
          title: 'PO Goods Receipt Completion',
          purpose: 'Confirm GR and the original consumption are complete - a subsequent adjustment corrects consumption AFTER GR is done.',
          status: 'PASS',
          statusLabel: 'GR Complete',
          rows: [
            { label: 'PO GR status', value: 'Complete (GR + Invoice posted)', highlight: 'good' },
            { label: 'Consumption posted', value: 'Yes - partial consumed on PO' },
            { label: 'STO / ASN', value: 'N/A - subcontracting PO (no STO)' },
            { label: 'Delivery date', value: '09/05/2026' }
          ],
          finding: 'GR, invoice and consumption are complete on PO 4503255627 -> subsequent adjustment (MIGO) path, not a GR reversal or DAV.'
        },
        {
          id: '4',
          transaction: 'MB51',
          title: 'Consumption History (543) - Quantify Correction',
          purpose: 'Read consumption postings against the PO to quantify the 600 EA scrap correction and confirm no prior correction.',
          status: 'PASS',
          statusLabel: 'Correction Open',
          movements: [
            { date: '09/05/2026', mvt: '543', mvtDesc: 'Prior consumption on PO 4503255627', qty: '11,160- EA', doc: '5051172020', user: 'X_MROBLE' }
          ],
          netConsumedLabel: 'Scrap correction required (not yet posted)',
          netConsumed: '600 EA (open)',
          finding: 'MB51 shows prior consumption on PO 4503255627. The 600 EA of vendor scrap has NOT yet been consumed - no further 543 correction exists for it. Correction is required to clear the phantom 600 EA.'
        }
      ],
      variance: {
        vendorActual: '0 EA physical (600 EA scrapped)',
        sapConsumed: 'Consumption under-stated by 600 EA',
        deltaVsComponent: 'Variance = +600 EA phantom on hand (to consume)',
        classification: 'CONSUMPTION CORRECTION / SCRAP -> POST MIGO 543 (consume 600 EA, stock DOWN to 0)',
        classColor: 'good'
      },
      recommendation: {
        headline: 'Recommended: MIGO Subsequent Adjustment -> MvT 543 for 600 EA (scrap / consumption correction)',
        rationale: 'MB52 confirms 600 EA phantom on hand vs 0 physical, ME23N confirms PO 4503255627 (GR/invoice complete), and MB51 shows no correction for the scrap. Per 3.2.1.2, because no physical material remains (scrap, not a DAV) the 600 EA is consumed via MIGO subsequent adjustment (MvT 543). Value $1,800 is below the $3,000 NA threshold -> no approval required.',
        note: 'SynOps recommends - it does not auto-post. Review the fields below, edit if needed, then click Post in SAP to clear the 600 EA phantom balance.',
        fields: [
          { key: 'transaction', label: 'Transaction', value: 'MIGO - Subsequent Adjustment (option 11)', editable: false },
          { key: 'underConsumption', label: 'Under Consumption', value: 'No (consume the scrap - stock DOWN)', editable: false },
          { key: 'movementType', label: 'Movement Type', value: '543', editable: true },
          { key: 'po', label: 'PO', value: '4503255627', editable: true },
          { key: 'material', label: 'Material', value: 'J0HW010701', editable: true },
          { key: 'plant', label: 'Plant', value: '2020', editable: true },
          { key: 'specialStock', label: 'Special Stock / Vendor', value: 'O + Hanes Erie', editable: true },
          { key: 'batch', label: 'Batch', value: 'B2026050101', editable: true },
          { key: 'qty', label: 'Quantity', value: '600', editable: true },
          { key: 'uom', label: 'UoM', value: 'EA', editable: true },
          { key: 'headerText', label: 'Header Text', value: 'WI-2001 Scrap correction Hanes Erie PO 4503255627', editable: true }
        ]
      },
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2101: GR REVERSAL - GR posted in error, no invoice -> clean MIGO 102 cancel
  // COSMAX Korea, Plant 6030, Material 7788990011, 500 EA (never received)
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2101': {
    scenario: 1,
    investigationV2: {
      workItemId: 'WI-2101',
      title: 'GR Reversal (3.2.1.2) - Cancel Goods Receipt posted in error',
      classification: 'GR Reversal - Cancel GR (MIGO 102, no invoice)',
      request: {
        source: 'TPM Vendor Email (COSMAX Korea via Soyeon Kim)',
        vendor: 'COSMAX Korea (MRP area 10089234)',
        material: '7788990011',
        materialDesc: 'CLINIQUE MOISTURE SURGE INTENSE 50ML',
        plant: '6030 (Korea)',
        specialStock: 'O + COSMAX Korea',
        po: '4500990011',
        reportedQty: '500 EA GR posted in error (physical = 0, never received)',
        uom: 'EA',
        reason: 'GR material document 5000456789 (MvT 101, 500 EA) was posted on Jul 17 against the wrong PO line. The shipment was never physically received, so SAP carries 500 EA that do not exist. No invoice (MIRO) is posted. The GR must be reversed (MvT 102).',
        note: 'GR reversal path (not a consumption correction): since no invoice is posted and no consumption occurred, a clean MIGO cancellation of the GR document is sufficient. Stock returns to 0 EA.'
      },
      checks: [
        {
          id: '1',
          transaction: 'MB52',
          title: 'Stock Picture - All Statuses',
          purpose: 'Confirm the SAP on-hand position created by the erroneous GR.',
          status: 'PASS',
          statusLabel: 'Verified',
          rows: [
            { label: 'Unrestricted', value: '500 EA', highlight: 'accent' },
            { label: 'Restricted (QI)', value: '0 EA' },
            { label: 'Blocked', value: '0 EA' },
            { label: 'EXFER - pending transfer', value: '0 EA' },
            { label: 'In-Transit', value: '0 EA' },
            { label: 'Physical on hand (vendor)', value: '0 EA (never received)' }
          ],
          finding: 'SAP shows 500 EA unrestricted created solely by the erroneous GR. Vendor confirms 0 physical. The 500 EA must be removed by reversing the GR.'
        },
        {
          id: '2',
          transaction: 'ME23N / MIGO (display)',
          title: 'GR Document & Invoice Status',
          purpose: 'Locate the GR document to reverse and confirm no downstream invoice exists.',
          status: 'PASS',
          statusLabel: 'Clean Reversal',
          rows: [
            { label: 'GR Material Document', value: '5000456789 (MvT 101, 500 EA)', highlight: 'accent' },
            { label: 'GR posting date', value: '17/07/2026' },
            { label: 'PO', value: '4500990011' },
            { label: 'Invoice (MIRO) posted?', value: 'No - clean reversal possible', highlight: 'good' },
            { label: 'Consumption against GR?', value: 'No' }
          ],
          finding: 'GR 5000456789 is the only movement; no MIRO invoice and no consumption exist against it. A single MIGO cancellation (MvT 102) cleanly reverses it.'
        },
        {
          id: '3',
          transaction: 'MB51',
          title: 'Movement History - Confirm single 101',
          purpose: 'Confirm the GR is the only movement so the reversal nets stock to 0.',
          status: 'PASS',
          statusLabel: 'Confirmed',
          movements: [
            { date: '17/07/2026', mvt: '101', mvtDesc: 'GR posted in error on PO 4500990011', qty: '500 EA', doc: '5000456789', user: 'X_CWANG' }
          ],
          netConsumedLabel: 'Reversal required (MvT 102)',
          netConsumed: '500 EA (to reverse)',
          finding: 'MB51 shows only the single 101 GR for 500 EA. Posting a 102 cancellation nets stock back to 0 EA.'
        }
      ],
      variance: {
        vendorActual: '0 EA physical (never received)',
        sapConsumed: 'GR over-posted by 500 EA',
        deltaVsComponent: 'Variance = +500 EA phantom from erroneous GR',
        classification: 'GR REVERSAL -> POST MIGO 102 (cancel GR, stock DOWN to 0)',
        classColor: 'good'
      },
      recommendation: {
        headline: 'Recommended: MIGO Cancellation of GR 5000456789 -> MvT 102 for 500 EA',
        rationale: 'MB52 shows 500 EA from a GR never physically received, ME23N/MIGO confirm GR doc 5000456789 with no MIRO invoice, and MB51 shows a single 101 movement. The clean path is a MIGO cancellation (MvT 102) which reverses the GR and returns stock to 0. Vendor to re-post against the correct PO line afterwards.',
        note: 'SynOps recommends - it does not auto-post. Review the fields below, edit if needed, then click Post in SAP to reverse the GR.',
        fields: [
          { key: 'transaction', label: 'Transaction', value: 'MIGO - Cancellation / Reference to Material Document', editable: false },
          { key: 'movementType', label: 'Movement Type', value: '102 (GR reversal)', editable: true },
          { key: 'grDoc', label: 'GR Material Document', value: '5000456789', editable: true },
          { key: 'po', label: 'PO', value: '4500990011', editable: true },
          { key: 'material', label: 'Material', value: '7788990011', editable: true },
          { key: 'plant', label: 'Plant', value: '6030', editable: true },
          { key: 'batch', label: 'Batch', value: '000011K24', editable: true },
          { key: 'qty', label: 'Quantity', value: '500', editable: true },
          { key: 'uom', label: 'UoM', value: 'EA', editable: true },
          { key: 'headerText', label: 'Header Text', value: 'WI-2101 GR reversal COSMAX Korea PO 4500990011', editable: true }
        ]
      },
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2102: GR REVERSAL - GR over-posted (240 vs 200), invoice posted -> full chain
  // Hanes Erie, Plant 4010, Material P1BW030204, 240 EA posted / 200 EA physical
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2102': {
    scenario: 1,
    investigationV2: {
      workItemId: 'WI-2102',
      title: 'GR Reversal (3.2.1.2) - Over-posted GR with invoice, full reversal then re-GR',
      classification: 'GR Reversal - Over-posted qty, invoice posted (MR8M -> 102 -> re-GR)',
      request: {
        source: 'TPM Vendor Email (Hanes Erie via Sarah Miller)',
        vendor: 'Hanes Erie (MRP area 10045732)',
        material: 'P1BW030204',
        materialDesc: 'BOBBI BROWN SKIN FOUNDATION 30ML',
        plant: '4010 (Oevel)',
        specialStock: 'FG01',
        po: '4503261987',
        reportedQty: '240 EA GR posted, only 200 EA physically received (40 EA over)',
        uom: 'EA',
        reason: 'GR material document 5000461230 was posted for 240 EA on Jul 18, but only 200 EA were physically received (pallet count mis-keyed). SAP shows 40 EA more than physical. The MIRO invoice was already posted for 240 EA, so the invoice must be cancelled first, then the GR reversed, then re-posted for the correct 200 EA.',
        note: 'GR reversal with invoice posted => full chain: MR8M (cancel invoice) -> MIGO 102 (reverse GR) -> MIGO 101 (re-GR 200 EA) -> MIRO (re-invoice 200 EA). Value EUR 5,760 exceeds EMEA EUR 5,000 threshold -> Category Leader approval required before posting.'
      },
      checks: [
        {
          id: '1',
          transaction: 'MB52',
          title: 'Stock Picture - All Statuses',
          purpose: 'Confirm the over-stated on-hand position.',
          status: 'PASS',
          statusLabel: 'Verified',
          rows: [
            { label: 'Unrestricted', value: '240 EA', highlight: 'accent' },
            { label: 'Restricted (QI)', value: '0 EA' },
            { label: 'Blocked', value: '0 EA' },
            { label: 'EXFER - pending transfer', value: '0 EA' },
            { label: 'In-Transit', value: '0 EA' },
            { label: 'Physical on hand (vendor)', value: '200 EA (40 EA over in SAP)' }
          ],
          finding: 'SAP shows 240 EA but the vendor physically holds 200 EA - the GR was over-posted by 40 EA. The GR must be reversed and re-posted at the correct 200 EA.'
        },
        {
          id: '2',
          transaction: 'ME23N / MIRO (display)',
          title: 'GR Document & Invoice Status',
          purpose: 'Locate the GR document and confirm an invoice is posted (drives the reversal path).',
          status: 'WARN',
          statusLabel: 'Invoice Posted',
          rows: [
            { label: 'GR Material Document', value: '5000461230 (MvT 101, 240 EA)', highlight: 'accent' },
            { label: 'GR posting date', value: '18/07/2026' },
            { label: 'PO', value: '4503261987' },
            { label: 'Invoice (MIRO) posted?', value: 'Yes - 240 EA (must cancel first)' },
            { label: 'Correct qty to re-post', value: '200 EA' }
          ],
          finding: 'GR 5000461230 is for 240 EA and a MIRO invoice is already posted for 240 EA. Because the invoice exists, a plain GR cancel is blocked - the invoice must be cancelled (MR8M) before the GR can be reversed.'
        },
        {
          id: '3',
          transaction: 'MB51',
          title: 'Movement History - Confirm 101 to reverse',
          purpose: 'Confirm the GR movement and quantify the 40 EA over-posting.',
          status: 'PASS',
          statusLabel: 'Confirmed',
          movements: [
            { date: '18/07/2026', mvt: '101', mvtDesc: 'GR over-posted on PO 4503261987 (240 vs 200)', qty: '240 EA', doc: '5000461230', user: 'X_APOLK' }
          ],
          netConsumedLabel: 'Reverse 240 then re-GR 200 (net 40 EA down)',
          netConsumed: '40 EA net over',
          finding: 'MB51 shows the single 101 for 240 EA. After MR8M + 102 + re-GR 101 (200), SAP will show 200 EA, matching physical.'
        }
      ],
      variance: {
        vendorActual: '200 EA physically received',
        sapConsumed: 'GR over-posted by 40 EA',
        deltaVsComponent: 'Variance = +40 EA (240 posted vs 200 physical)',
        classification: 'GR REVERSAL (invoice posted) -> MR8M + MIGO 102 + re-GR 101 (net 40 EA down)',
        classColor: 'good'
      },
      recommendation: {
        headline: 'Recommended: Full GR reversal chain - MR8M (cancel invoice) -> MIGO 102 (reverse GR) -> MIGO 101 (re-GR 200 EA)',
        rationale: 'MB52 shows 240 EA vs 200 physical, ME23N/MIRO confirm GR doc 5000461230 with a posted invoice, and MB51 shows the single 101 for 240 EA. Because an invoice is posted, the clean path is MR8M -> 102 -> re-GR 101 for 200 -> MIRO 200. Value EUR 5,760 exceeds the EMEA EUR 5,000 threshold -> Category Leader approval required before posting.',
        note: 'SynOps recommends - it does not auto-post. Approval pending (value > EUR 5,000). Review the fields, then post after approval.',
        fields: [
          { key: 'transaction', label: 'Transaction', value: 'MR8M -> MIGO 102 -> MIGO 101 (re-GR)', editable: false },
          { key: 'movementType', label: 'Reversal Movement Type', value: '102 (then re-GR 101)', editable: true },
          { key: 'grDoc', label: 'GR Material Document', value: '5000461230', editable: true },
          { key: 'po', label: 'PO', value: '4503261987', editable: true },
          { key: 'material', label: 'Material', value: 'P1BW030204', editable: true },
          { key: 'plant', label: 'Plant', value: '4010', editable: true },
          { key: 'batch', label: 'Batch', value: 'B2026061201', editable: true },
          { key: 'postedQty', label: 'Posted Qty (to reverse)', value: '240', editable: true },
          { key: 'correctQty', label: 'Correct Qty (to re-GR)', value: '200', editable: true },
          { key: 'uom', label: 'UoM', value: 'EA', editable: true },
          { key: 'headerText', label: 'Header Text', value: 'WI-2102 GR reversal Hanes Erie PO 4503261987 (240 -> 200)', editable: true }
        ]
      },
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTED FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Retrieve scenario-specific investigation data for a given work item
 * @param {string} workItemId - The work item identifier (e.g., 'WI-1052')
 * @returns {object|null} Scenario data object or null if not found
 */
export function getScenarioData(workItemId) {
  return scenarioDatabase[workItemId] || null;
}

/**
 * Get all available work item IDs with scenario data
 * @returns {string[]} Array of work item IDs
 */
export function getAvailableWorkItems() {
  return Object.keys(scenarioDatabase);
}

/**
 * Get scenarios filtered by type (Fast Path vs Full Investigation)
 * @param {number} scenarioType - 1 for Fast Path, 2 for Full Investigation
 * @returns {object[]} Array of matching scenario objects
 */
export function getScenariosByType(scenarioType) {
  return Object.values(scenarioDatabase).filter(s => s.scenario === scenarioType);
}

/**
 * Get the investigation step data for a specific work item and step
 * @param {string} workItemId - The work item identifier
 * @param {number} stepNumber - Step number (4-16)
 * @returns {object|null} Step data or null
 */
export function getStepData(workItemId, stepNumber) {
  const scenario = scenarioDatabase[workItemId];
  if (!scenario) return null;
  const stepKey = `step${stepNumber}`;
  return scenario[stepKey] !== undefined ? scenario[stepKey] : null;
}

export default scenarioDatabase;
