/**
 * Transfer Scenarios — 3.2.1.5 Transfer to Other TPMs or EL Plant
 * Classified: Samples (Scenario 1), Cross-Plant STO (Scenario 2), Same-Plant 542/541 (Scenario 3A)
 */

const transferScenarioDatabase = {
  // ─────────────────────────────────────────────────────────────────────────────
  // WI-T1001: SCENARIO 1 — SAMPLES (Cost Center Transfer)
  // Brand/TPM request to move samples to a location, adjust via MB11 MvT 201
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-T1001': {
    scenario: 1,
    scenarioLabel: 'Scenario 1: Samples — Cost Center Transfer',
    workItemId: 'WI-T1001',
    type: 'Samples',
    tpm: 'COSMAX Korea',
    plant: '6030',
    material: '4520891034',
    materialDesc: 'ORIGINS MEGA-MUSHROOM CREAM 50ML',
    qty: 5,
    uom: 'KG',
    region: 'APAC',

    incomingEmail: {
      from: 'brand.origins@elcompanies.com',
      to: 'tpm.inventory@elcompanies.com',
      cc: 'production.ops@cosmax.kr',
      date: 'Jan 18, 2025 10:30 AM (KST)',
      subject: 'Sample Transfer Request — Material 4520891034 — 5 KG to Innovation Lab',
      body: `Dear TPM Inventory Team,

We have shipped 5 KG of Material 4520891034 (ORIGINS MEGA-MUSHROOM CREAM 50ML) from COSMAX Korea (Plant 6030) to the Innovation Lab for formulation testing.

Please adjust the inventory accordingly.

Details:
• Material: 4520891034
• Quantity: 5 KG
• Batch: 000891034A
• From: COSMAX Korea (Plant 6030, Vendor 10089234)
• To: Innovation Lab (Cost Center 4410-APAC-RD)
• Purpose: Formulation stability testing for Q2 2025 launch
• Brand: Origins
• Shipment Date: Jan 17, 2025

Please confirm once the adjustment is posted.

Best regards,
Jennifer Park
Brand Manager — Origins APAC`
    },

    nlpExtraction: {
      material: '4520891034',
      qty: '5 KG',
      batch: '000891034A',
      sendingTPM: 'COSMAX Korea (10089234)',
      sendingPlant: '6030',
      receivingLocation: 'Innovation Lab',
      costCenter: '4410-APAC-RD',
      transferType: 'Samples (Cost Center)',
      confidence: '94%',
      fieldsValidated: true,
      missingFields: []
    },

    steps: [
      {
        stepNumber: 1,
        title: 'NLP Parse & Classify Transfer Request',
        description: 'SynOps parses incoming email and extracts transfer details. Classifies as Scenario 1 (Samples/Cost Center).',
        checks: [
          {
            checkName: 'NLP Extraction — Email Fields',
            transaction: 'NLP Engine',
            data: {
              material: '4520891034',
              qty: '5 KG',
              batch: '000891034A',
              sendingTPM: 'COSMAX Korea (10089234)',
              costCenter: '4410-APAC-RD',
              classification: 'Scenario 1: Samples (Cost Center Transfer)',
              requiredFields: 'All present ✓'
            },
            result: 'CLASSIFIED',
            resultDetail: 'Request classified as Samples transfer. All required fields extracted: Material, Qty, Batch, Vendor, Cost Center.',
            passed: true
          }
        ],
        outcome: 'Classified: Scenario 1 (Samples). Cost Center 4410-APAC-RD. Proceeding to stock validation.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Validate Stock in MB52 — Unrestricted Status',
        description: 'SynOps checks MB52 to confirm stock is available in unrestricted status. Only unrestricted stock can be transferred.',
        checks: [
          {
            checkName: 'MB52 — Stock Availability (Plant 6030, Material 4520891034)',
            transaction: 'MB52',
            data: {
              material: '4520891034',
              plant: '6030 (Korea)',
              vendor: '10089234 (COSMAX Korea)',
              unrestricted: '180 KG',
              blocked: '0 KG',
              qi: '0 KG',
              exfer: '0 KG',
              requestedQty: '5 KG',
              available: 'YES — 180 KG unrestricted > 5 KG requested'
            },
            result: 'STOCK AVAILABLE',
            resultDetail: 'Unrestricted stock = 180 KG. Requested = 5 KG. Sufficient stock available for transfer.',
            passed: true
          }
        ],
        outcome: 'Stock validated. 180 KG unrestricted available. 5 KG can proceed.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 3,
        title: 'Verify Cost Center & Vendor Code',
        description: 'SynOps validates Cost Center 4410-APAC-RD exists and confirms vendor code for the sending plant.',
        checks: [
          {
            checkName: 'Cost Center & Vendor Validation',
            transaction: 'KS03 / XK03',
            data: {
              costCenter: '4410-APAC-RD',
              costCenterDesc: 'APAC R&D Innovation Lab',
              status: 'Active',
              vendorCode: '10089234',
              vendorConfirmed: 'COSMAX Korea — confirmed'
            },
            result: 'VALIDATED',
            resultDetail: 'Cost Center 4410-APAC-RD is active. Vendor 10089234 confirmed.',
            passed: true
          }
        ],
        outcome: 'Cost Center and Vendor confirmed. Ready for posting.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 4,
        title: 'Execute Transfer — MB11 MvT 542 + MvT 201',
        description: 'Analyst posts: (1) MB11 MvT 542 to move SLoc to XFER, then (2) MB11 MvT 201 to issue to Cost Center.',
        migoData: {
          transaction: 'MB11',
          movementType: '542 → 201',
          mvtDescription: 'Step 1: MvT 542 (Transfer to XFER SLoc) | Step 2: MvT 201 (Goods Issue to Cost Center)',
          po: 'N/A',
          poLine: 'N/A',
          material: '4520891034',
          materialDesc: 'ORIGINS MEGA-MUSHROOM CREAM 50ML',
          plant: '6030',
          sloc: 'MRP Area → XFER → Cost Center 4410-APAC-RD',
          batch: '000891034A',
          qty: '5 KG',
          underConsumption: false,
          postingDate: '2025-01-18',
          reasonCode: '301',
          reasonDesc: 'Sample transfer to R&D Cost Center',
          headerText: 'WI-T1001 Sample 5KG Origins to Innovation Lab CC4410',
          referenceDoc: 'WI-T1001'
        },
        postResult: {
          documentNumber: '4900201234',
          postingStatus: 'Success',
          newMB52Unrestricted: '175 KG',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 5,
        title: 'Confirmation to TPM Vendor & Brand',
        description: 'SynOps auto-generates confirmation email to COSMAX Korea and Brand (Origins).',
        emailData: {
          to: 'production.ops@cosmax.kr; brand.origins@elcompanies.com',
          cc: 'chris.wang@elcompanies.com',
          subject: 'Confirmed: Sample Transfer Posted — Material 4520891034 — 5 KG to CC 4410-APAC-RD',
          body: `Dear Team,

The sample transfer has been posted successfully:

• Material: 4520891034 — ORIGINS MEGA-MUSHROOM CREAM 50ML
• Quantity: 5 KG (Batch 000891034A)
• From: COSMAX Korea (Plant 6030)
• To: Cost Center 4410-APAC-RD (Innovation Lab)
• SAP Document: 4900201234
• Posting Date: Jan 18, 2025

SAP stock at Plant 6030 is now 175 KG (unrestricted).

Best regards,
Chris Wang
TPM Inventory Analyst — APAC`
        },
        outcome: 'Confirmation sent. Work item closed.',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-T1002: SCENARIO 2 — CROSS-PLANT STO
  // Transfer from Plant 6010 to Plant 6030 via STO
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-T1002': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Cross-Plant STO Transfer',
    workItemId: 'WI-T1002',
    type: 'Cross-Plant STO',
    tpm: 'Intercos China',
    plant: '6010',
    material: '3891045672',
    materialDesc: 'LA MER MOISTURIZING CREAM JAR 60ML',
    qty: 400,
    uom: 'EA',
    region: 'APAC',

    incomingEmail: {
      from: 'planning.apac@elcompanies.com',
      to: 'tpm.inventory@elcompanies.com',
      cc: 'warehouse.ops@intercos-china.com; production.ops@cosmax.kr',
      date: 'Jan 19, 2025 09:00 AM (CST)',
      subject: 'Cross-Plant Transfer Request — Material 3891045672 — 400 EA from Plant 6010 → 6030',
      body: `Dear TPM Inventory Team,

Please initiate a cross-plant stock transfer for the following:

Material: 3891045672 — LA MER MOISTURIZING CREAM JAR 60ML
Quantity: 400 EA
Batch: 000672B24
From: Plant 6010 (China Bonded) — Intercos China (10045891)
To: Plant 6030 (Korea) — COSMAX Korea (10089234)
STO#: 4300891567

Reason: COSMAX Korea needs additional stock for Q1 production ramp-up. Current stock at 6030 is insufficient.

Please confirm PGI and provide expected delivery date to COSMAX Korea.

Best regards,
APAC Planning Team`
    },

    nlpExtraction: {
      material: '3891045672',
      qty: '400 EA',
      batch: '000672B24',
      sendingTPM: 'Intercos China (10045891)',
      sendingPlant: '6010',
      receivingTPM: 'COSMAX Korea (10089234)',
      receivingPlant: '6030',
      stoNumber: '4300891567',
      transferType: 'Cross-Plant STO',
      confidence: '97%',
      fieldsValidated: true,
      missingFields: []
    },

    steps: [
      {
        stepNumber: 1,
        title: 'NLP Parse & Classify — Cross-Plant STO',
        description: 'SynOps parses email. Identifies sending/receiving plants differ → classified as Scenario 2 (Cross-Plant STO).',
        checks: [
          {
            checkName: 'NLP Extraction — Transfer Details',
            transaction: 'NLP Engine',
            data: {
              material: '3891045672',
              qty: '400 EA',
              fromPlant: '6010 (China Bonded)',
              toPlant: '6030 (Korea)',
              sto: '4300891567',
              classification: 'Scenario 2: Cross-Plant STO',
              requiredFields: 'All present ✓'
            },
            result: 'CLASSIFIED',
            resultDetail: 'Sending plant ≠ Receiving plant → Cross-Plant STO. STO# 4300891567 provided.',
            passed: true
          }
        ],
        outcome: 'Classified: Scenario 2 (Cross-Plant STO). STO 4300891567. Proceeding to stock validation at sending plant.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Validate Stock at Sending Plant — MB52 (Plant 6010)',
        description: 'SynOps checks MB52 at sending plant 6010. Only unrestricted stock can be transferred.',
        checks: [
          {
            checkName: 'MB52 — Sending Plant Stock (6010, Material 3891045672)',
            transaction: 'MB52',
            data: {
              material: '3891045672',
              plant: '6010 (China Bonded)',
              unrestricted: '520 EA',
              blocked: '0 EA',
              qi: '0 EA',
              exfer: '0 EA',
              requestedQty: '400 EA',
              available: 'YES — 520 EA unrestricted > 400 EA requested'
            },
            result: 'STOCK AVAILABLE',
            resultDetail: 'Unrestricted = 520 EA at Plant 6010. Requested 400 EA. Sufficient for STO.',
            passed: true
          }
        ],
        outcome: 'Stock validated at sending plant. 520 EA available, 400 EA requested. Proceed with PGI.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 3,
        title: 'Execute PGI — Post Goods Issue (MvT 641)',
        description: 'Analyst posts PGI against STO 4300891567. Stock moves from unrestricted to in-transit.',
        migoData: {
          transaction: 'VL02N / MIGO',
          movementType: '641',
          mvtDescription: 'Goods Issue for STO (Post Goods Issue)',
          po: 'STO 4300891567',
          poLine: '10',
          material: '3891045672',
          materialDesc: 'LA MER MOISTURIZING CREAM JAR 60ML',
          plant: '6010',
          sloc: 'MRP Area (SpecStock O)',
          batch: '000672B24',
          qty: '400 EA',
          underConsumption: false,
          postingDate: '2025-01-19',
          reasonCode: 'N/A',
          reasonDesc: 'Cross-plant transfer per STO',
          headerText: 'WI-T1002 PGI STO 4300891567 6010→6030',
          referenceDoc: 'STO 4300891567'
        },
        postResult: {
          documentNumber: '8000567890',
          postingStatus: 'Success — PGI Done',
          newMB52Unrestricted: '120 EA (Plant 6010) + 400 EA In-Transit',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 4,
        title: 'Confirmation & Monitor GR at Destination',
        description: 'SynOps confirms PGI and creates monitoring task for GR at Plant 6030. ETA: Jan 24.',
        emailData: {
          to: 'warehouse.ops@intercos-china.com; production.ops@cosmax.kr',
          cc: 'chris.wang@elcompanies.com; planning.apac@elcompanies.com',
          subject: 'PGI Confirmed — STO 4300891567 — 400 EA In Transit 6010 → 6030 — ETA Jan 24',
          body: `Dear Teams,

PGI has been posted for cross-plant transfer:

• STO: 4300891567
• Material: 3891045672 — LA MER MOISTURIZING CREAM JAR 60ML
• Quantity: 400 EA (Batch 000672B24)
• From: Plant 6010 (Intercos China) — PGI posted Jan 19
• To: Plant 6030 (COSMAX Korea) — ETA Jan 24
• Delivery#: 8000567890
• Status: In Transit

COSMAX Korea: Please post Goods Receipt (GR) upon arrival.
We will monitor and follow up if GR not posted by Jan 26.

Best regards,
Chris Wang
TPM Inventory Analyst — APAC`
        },
        outcome: 'PGI confirmed. In-transit monitoring active. GR expected Jan 24 at Plant 6030.',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-T1003: SCENARIO 3A — SAME-PLANT 542/541
  // Transfer between vendors at same plant (COSMAX → Kolmar at Plant 6030)
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-T1003': {
    scenario: '3A',
    scenarioLabel: 'Scenario 3A: Same-Plant Transfer (542/541)',
    workItemId: 'WI-T1003',
    type: 'Same-Plant 542/541',
    tpm: 'COSMAX Korea',
    plant: '6030',
    material: '5612034789',
    materialDesc: 'ESTEE LAUDER DW FOUNDATION BULK 25KG',
    qty: 100,
    uom: 'KG',
    region: 'APAC',

    incomingEmail: {
      from: 'production.ops@cosmax.kr',
      to: 'tpm.inventory@elcompanies.com',
      cc: 'logistics@kolmar.kr',
      date: 'Jan 20, 2025 02:15 PM (KST)',
      subject: 'Transfer Request — 100 KG Material 5612034789 from COSMAX to Kolmar (Plant 6030)',
      body: `Dear TPM Inventory Team,

We need to transfer 100 KG of Material 5612034789 (ESTEE LAUDER DW FOUNDATION BULK 25KG) from our stock to Kolmar Korea at the same plant (6030).

Reason: Kolmar has been assigned as the secondary filler for DW Foundation and needs raw material from our current stock to begin their production run.

Details:
• Material: 5612034789
• Quantity: 100 KG
• Batch: 000789C25
• From: COSMAX Korea (Vendor 10089234) at Plant 6030
• To: Kolmar Korea (Vendor 10078901) at Plant 6030
• Transfer Type: Same-plant vendor-to-vendor (542/541 via EXFER)

The physical material has already been moved to Kolmar's production area. Please post the SAP movements.

Best regards,
Kim Soo-jin
Production Operations
COSMAX Korea`
    },

    nlpExtraction: {
      material: '5612034789',
      qty: '100 KG',
      batch: '000789C25',
      sendingTPM: 'COSMAX Korea (10089234)',
      receivingTPM: 'Kolmar Korea (10078901)',
      sendingPlant: '6030',
      receivingPlant: '6030',
      transferType: 'Same-Plant 542/541',
      confidence: '95%',
      fieldsValidated: true,
      missingFields: []
    },

    steps: [
      {
        stepNumber: 1,
        title: 'NLP Parse & Classify — Same-Plant Transfer',
        description: 'SynOps parses email. Sending plant = Receiving plant (both 6030) → classified as Scenario 3A (Same-Plant 542/541).',
        checks: [
          {
            checkName: 'NLP Extraction — Same-Plant Transfer',
            transaction: 'NLP Engine',
            data: {
              material: '5612034789',
              qty: '100 KG',
              fromVendor: 'COSMAX Korea (10089234)',
              toVendor: 'Kolmar Korea (10078901)',
              plant: '6030 (same plant)',
              classification: 'Scenario 3A: Same-Plant 542/541',
              requiredFields: 'All present ✓'
            },
            result: 'CLASSIFIED',
            resultDetail: 'Sending plant = Receiving plant = 6030, different vendors → Same-Plant 542/541.',
            passed: true
          }
        ],
        outcome: 'Classified: Scenario 3A (Same-Plant). COSMAX → Kolmar at Plant 6030.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Validate Stock at Sending Vendor — MB52',
        description: 'Check MB52 for unrestricted stock under COSMAX Korea (10089234) at Plant 6030.',
        checks: [
          {
            checkName: 'MB52 — Stock at Sending Vendor (COSMAX Korea, Plant 6030)',
            transaction: 'MB52',
            data: {
              material: '5612034789',
              plant: '6030',
              vendor: '10089234 (COSMAX Korea)',
              unrestricted: '155 KG',
              blocked: '0 KG',
              qi: '0 KG',
              exfer: '0 KG',
              requestedQty: '100 KG',
              available: 'YES — 155 KG > 100 KG'
            },
            result: 'STOCK AVAILABLE',
            resultDetail: 'COSMAX Korea has 155 KG unrestricted. 100 KG requested. Sufficient.',
            passed: true
          }
        ],
        outcome: 'Stock validated. 155 KG available under COSMAX Korea. Proceeding with 542/541 posting.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 3,
        title: 'Execute MvT 542 — Transfer Out (Sending Vendor → EXFER)',
        description: 'Post MB11 MvT 542: removes 100 KG from COSMAX Korea unrestricted and places in EXFER staging.',
        migoData: {
          transaction: 'MB11',
          movementType: '542',
          mvtDescription: 'Transfer Posting — Vendor to Vendor (Sending: COSMAX Korea → EXFER)',
          po: 'N/A',
          poLine: 'N/A',
          material: '5612034789',
          materialDesc: 'ESTEE LAUDER DW FOUNDATION BULK 25KG',
          plant: '6030',
          sloc: 'MRP Area (SpecStock O → EXFER)',
          batch: '000789C25',
          qty: '100 KG',
          underConsumption: false,
          postingDate: '2025-01-20',
          reasonCode: 'N/A',
          reasonDesc: 'Same-plant transfer COSMAX → Kolmar',
          headerText: 'WI-T1003 542 COSMAX→EXFER 6030',
          referenceDoc: 'WI-T1003'
        },
        postResult: {
          documentNumber: '4900301234',
          postingStatus: 'Success — MvT 542 Posted',
          newMB52Unrestricted: '55 KG (COSMAX) + 100 KG EXFER',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 4,
        title: 'Execute MvT 541 — Transfer In (EXFER → Receiving Vendor)',
        description: 'Post MB11 MvT 541: moves 100 KG from EXFER to Kolmar Korea (10078901) unrestricted.',
        migoData: {
          transaction: 'MB11',
          movementType: '541',
          mvtDescription: 'Transfer Posting — Vendor to Vendor (EXFER → Receiving: Kolmar Korea)',
          po: 'N/A',
          poLine: 'N/A',
          material: '5612034789',
          materialDesc: 'ESTEE LAUDER DW FOUNDATION BULK 25KG',
          plant: '6030',
          sloc: 'EXFER → MRP Area (SpecStock O)',
          batch: '000789C25',
          qty: '100 KG',
          underConsumption: false,
          postingDate: '2025-01-20',
          reasonCode: 'N/A',
          reasonDesc: 'Same-plant receiving at Kolmar Korea',
          headerText: 'WI-T1003 541 EXFER→Kolmar 6030',
          referenceDoc: 'WI-T1003'
        },
        postResult: {
          documentNumber: '4900301235',
          postingStatus: 'Success — MvT 541 Posted',
          newMB52Unrestricted: '55 KG (COSMAX) + 100 KG (Kolmar)',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 5,
        title: 'Confirmation to Both TPM Vendors',
        description: 'SynOps auto-sends confirmation to COSMAX Korea (sending) and Kolmar Korea (receiving).',
        emailData: {
          to: 'production.ops@cosmax.kr; logistics@kolmar.kr',
          cc: 'chris.wang@elcompanies.com',
          subject: 'Confirmed: Same-Plant Transfer — 100 KG Material 5612034789 — COSMAX → Kolmar (Plant 6030)',
          body: `Dear Teams,

Same-plant transfer completed successfully:

• Material: 5612034789 — ESTEE LAUDER DW FOUNDATION BULK 25KG
• Quantity: 100 KG (Batch 000789C25)
• From: COSMAX Korea (10089234) — now 55 KG remaining
• To: Kolmar Korea (10078901) — now 100 KG
• MvT 542 Doc: 4900301234
• MvT 541 Doc: 4900301235
• Plant: 6030

Both postings complete. SAP stock aligned.

Best regards,
Chris Wang
TPM Inventory Analyst — APAC`
        },
        outcome: 'Transfer complete. Both vendors notified. Work item closed.',
        outcomeStatus: 'success'
      }
    ]
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // WI-T1004: SCENARIO 2 — CROSS-PLANT STO (NA Region — Full Detailed Flow)
  // Hanes Erie Plant 7001 → Arcade Beauty Plant 7002, using VL10G (NA tcode)
  // Reason: Shortage at destination plant for Q1 production
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-T1004': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Cross-Plant STO Transfer (NA) — Multi-Material',
    workItemId: 'WI-T1004',
    type: 'Cross-Plant STO',
    tpm: 'Hanes Erie',
    plant: '7001',
    material: 'J0PJ100011 (+ 2 more)',
    materialDesc: 'LE LABO C29 EDP — Multi-Line Transfer',
    qty: 'Multiple',
    uom: 'EA',
    region: 'NA',
    multiMaterial: true,

    materials: [
      { material: 'J0PJ100011', desc: '50ml Glass Bottle', qty: 90, uom: 'EA', batch: 'B2025011501', destination: 'Arcade Beauty (Plant 7002)' },
      { material: 'J1KP010163', desc: 'Base Label', qty: 18, uom: 'EA', batch: 'B2025011502', destination: 'EL Research Park (Melville, NY)' },
      { material: 'J0L6300071', desc: 'Cap', qty: 18, uom: 'EA', batch: 'B2025011503', destination: 'EL Research Park (Melville, NY)' }
    ],

    incomingEmail: {
      from: 'sfairhur@estee.com',
      to: 'juan.castrillon@arcadebeauty.com',
      cc: 'megarcia@lelabofragrances.com; matthew.pajow@arcadebeauty.com; tpm.inventory.na@elcompanies.com',
      date: 'Jan 20, 2025 04:59 PM (EST)',
      subject: 'FW: Supply Request — C29 EDP Package Testing',
      body: `Juan,

Please request that attached are processed.

Line 1: J0PJ100011 | 50ml Glass | 90 EA | Supply Request - C29 EDP Package Testing | CC: 16765517007001 | Ship to: Aptar Beauty Cary, 1160 North Silver Lake Road, Cary, Illinois 60013

Line 2: J1KP010163 | Base Lbl | 18 EA | Supply Request - C29 EDP Package Testing | CC: 16765517007001 | Ship to: Estee Lauder Research Park, Kristina Vlasak, 65 Maxess Road, Melville, NY 11747

Line 3: J0L6300071 | Cap | 18 EA | Supply Request - C29 EDP Package Testing | CC: 16765517007001 | Ship to: Estee Lauder Research Park, Kristina Vlasak, 65 Maxess Road, Melville, NY 11747

Appreciate it,
Susan Fairhurst
NA TPM Planner | The Estée Lauder Companies, Inc.
250 Rittenhouse Circle, Bristol PA 19007
Telephone: 215-874-1484

--- Original from Megan Garcia (Le Labo Fragrances) ---
Hi Susan, Can you please issue the attached supply requests to Aptar and Melville for package testing?
Thank you, Megan Garcia | Global Packaging | LE LABO FRAGRANCES | 71 North 7th Street, Brooklyn NY 11249`
    },

    nlpExtraction: {
      multiLine: true,
      lineItems: [
        { material: 'J0PJ100011', desc: '50ml Glass Bottle', qty: '90 EA', costCenter: '16765517007001', shipTo: 'Aptar Beauty Cary, IL', confidence: '96%' },
        { material: 'J1KP010163', desc: 'Base Label', qty: '18 EA', costCenter: '16765517007001', shipTo: 'EL Research Park, Melville NY', confidence: '94%' },
        { material: 'J0L6300071', desc: 'Cap', qty: '18 EA', costCenter: '16765517007001', shipTo: 'EL Research Park, Melville NY', confidence: '94%' }
      ],
      sendingTPM: 'Arcade Beauty (10056789)',
      sendingPlant: '7001',
      costCenter: '16765517007001',
      transferType: 'Cross-Plant STO / Samples',
      reason: 'Package Testing (C29 EDP)',
      region: 'NA',
      brand: 'Le Labo Fragrances',
      requestor: 'Megan Garcia (Global Packaging)',
      confidence: '95%',
      fieldsValidated: true,
      missingFields: []
    },

    steps: [
      {
        stepNumber: 1,
        title: 'NLP Parse — Extract Multiple Materials from Email',
        description: 'SynOps parses Susan Fairhurst email. Identifies 3 line items with different materials, quantities, and ship-to destinations. Classified as Cross-Plant STO / Samples (NA).',
        checks: [
          {
            checkName: 'NLP Multi-Line Extraction',
            transaction: 'NLP Engine',
            data: {
              totalLineItems: '3 materials extracted',
              line1: 'J0PJ100011 | 50ml Glass | 90 EA → Aptar Beauty Cary, IL',
              line2: 'J1KP010163 | Base Label | 18 EA → EL Research Park, Melville NY',
              line3: 'J0L6300071 | Cap | 18 EA → EL Research Park, Melville NY',
              costCenter: '16765517007001',
              brand: 'Le Labo Fragrances (Megan Garcia)',
              classification: 'Cross-Plant STO / Samples — Package Testing'
            },
            result: '3 LINES EXTRACTED',
            resultDetail: 'All 3 material lines parsed with qty, destination, and cost center. Brand: Le Labo. Purpose: C29 EDP Package Testing.',
            passed: true
          }
        ],
        outcome: 'Classified: Multi-material transfer (3 lines). Cost Center 16765517007001. Proceeding to validate each material.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Validate Stock — MB52 for Each Material',
        description: 'SynOps checks MB52 unrestricted stock for all 3 materials at Plant 7001.',
        checks: [
          {
            checkName: 'MB52 — Line 1: J0PJ100011 (50ml Glass)',
            transaction: 'MB52',
            data: {
              material: 'J0PJ100011',
              plant: '7001',
              unrestricted: '450 EA',
              requested: '90 EA',
              available: 'YES ✓'
            },
            result: 'AVAILABLE',
            resultDetail: '450 EA unrestricted. 90 EA requested. Sufficient.',
            passed: true
          },
          {
            checkName: 'MB52 — Line 2: J1KP010163 (Base Label)',
            transaction: 'MB52',
            data: {
              material: 'J1KP010163',
              plant: '7001',
              unrestricted: '200 EA',
              requested: '18 EA',
              available: 'YES ✓'
            },
            result: 'AVAILABLE',
            resultDetail: '200 EA unrestricted. 18 EA requested. Sufficient.',
            passed: true
          },
          {
            checkName: 'MB52 — Line 3: J0L6300071 (Cap)',
            transaction: 'MB52',
            data: {
              material: 'J0L6300071',
              plant: '7001',
              unrestricted: '175 EA',
              requested: '18 EA',
              available: 'YES ✓'
            },
            result: 'AVAILABLE',
            resultDetail: '175 EA unrestricted. 18 EA requested. Sufficient.',
            passed: true
          }
        ],
        outcome: 'All 3 materials validated. Unrestricted stock sufficient for all line items.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 3,
        title: 'Execute Transfer — MB11 MvT 542 (per material line)',
        description: 'SynOps posts MB11 MvT 542 for each material line. Stock moves to EXFER staging.',
        migoData: {
          transaction: 'MB11 (× 3 postings)',
          movementType: '542',
          mvtDescription: 'Transfer to EXFER — one posting per material line',
          po: 'N/A',
          poLine: 'N/A',
          material: 'J0PJ100011 + J1KP010163 + J0L6300071',
          materialDesc: '3 materials for C29 EDP Package Testing',
          plant: '7001',
          sloc: 'EXFER',
          batch: 'Multiple',
          qty: '90 + 18 + 18 = 126 EA total',
          underConsumption: false,
          postingDate: '2025-01-21',
          reasonCode: 'N/A',
          reasonDesc: 'Package testing supply — Le Labo C29 EDP',
          headerText: 'WI-T1004 542 Multi-mat C29 EDP 7001→EXFER',
          referenceDoc: 'WI-T1004'
        },
        postResult: {
          documentNumber: '4900401234 / 4900401235 / 4900401236',
          postingStatus: 'Success — All 3 lines posted to EXFER',
          newMB52Unrestricted: 'J0PJ100011: 360 EA | J1KP010163: 182 EA | J0L6300071: 157 EA',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 4,
        title: 'Create Delivery Orders — VL10G (NA) per Destination',
        description: 'SynOps creates delivery orders via VL10G. Two deliveries: (1) Aptar Cary for J0PJ100011, (2) EL Research Park for J1KP010163 + J0L6300071.',
        migoData: {
          transaction: 'VL10G (× 2 deliveries)',
          movementType: 'Delivery Creation',
          mvtDescription: 'Delivery 1: J0PJ100011 → Aptar Cary | Delivery 2: J1KP010163 + J0L6300071 → EL Melville',
          po: 'WI-T1004',
          poLine: 'Multiple',
          material: '3 materials across 2 deliveries',
          materialDesc: 'Grouped by ship-to destination',
          plant: '7001',
          sloc: 'EXFER',
          batch: 'Multiple',
          qty: 'Del 1: 90 EA | Del 2: 36 EA',
          underConsumption: false,
          postingDate: '2025-01-21',
          reasonCode: 'N/A',
          reasonDesc: 'Deliveries grouped by destination address',
          headerText: 'Shipping Point: 7011 | 2 Deliveries',
          referenceDoc: 'WI-T1004',
          sapFields: {
            shippingPoint: '7011 (Plant 7001 → last digit = 1)',
            regionTcode: 'VL10G (NA)',
            delivery1: '8000789456 → Aptar Beauty Cary, IL (J0PJ100011: 90 EA)',
            delivery2: '8000789457 → EL Research Park, Melville NY (J1KP010163: 18 + J0L6300071: 18)'
          }
        },
        postResult: {
          documentNumber: '8000789456 + 8000789457',
          postingStatus: 'Success — 2 Delivery Orders Created',
          newMB52Unrestricted: 'Deliveries grouped by ship-to',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 5,
        title: 'Post Goods Issue — VL02N (both deliveries)',
        description: 'PGI posted for both deliveries. All 3 materials move to In-Transit.',
        migoData: {
          transaction: 'VL02N (× 2)',
          movementType: '601 (PGI)',
          mvtDescription: 'Post Goods Issue for both deliveries',
          po: 'Delivery# 8000789456 + 8000789457',
          poLine: 'N/A',
          material: 'All 3 materials',
          materialDesc: 'PGI for both ship-to destinations',
          plant: '7001',
          sloc: 'EXFER',
          batch: 'Multiple',
          qty: '126 EA total (90 + 18 + 18)',
          underConsumption: false,
          postingDate: '2025-01-21',
          reasonCode: 'N/A',
          reasonDesc: 'PGI — all stock now in transit',
          headerText: 'PGI Del 8000789456 + 8000789457',
          referenceDoc: 'WI-T1004',
          sapFields: {
            stockStatus: 'In-Transit to 2 destinations'
          }
        },
        postResult: {
          documentNumber: '4900401237 + 4900401238',
          postingStatus: 'Success — PGI posted. All In-Transit.',
          newMB52Unrestricted: 'J0PJ100011: 360 | J1KP010163: 182 | J0L6300071: 157 (EXFER cleared)',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 6,
        title: 'Confirmation Email — Delivery Numbers to Planner',
        description: 'SynOps auto-sends confirmation with both Delivery numbers back to Susan Fairhurst and Megan Garcia.',
        emailData: {
          to: 'sfairhur@estee.com; megarcia@lelabofragrances.com',
          cc: 'juan.castrillon@arcadebeauty.com; matthew.pajow@arcadebeauty.com',
          subject: 'RE: Supply Request — C29 EDP Package Testing — SHIPPED (2 Deliveries)',
          body: `Hi Susan & Megan,

All 3 material lines for C29 EDP Package Testing have been processed and shipped:

Delivery 1 → Aptar Beauty Cary, IL:
• J0PJ100011 (50ml Glass) — 90 EA — Delivery# 8000789456

Delivery 2 → EL Research Park, Melville NY:
• J1KP010163 (Base Label) — 18 EA
• J0L6300071 (Cap) — 18 EA
• Delivery# 8000789457

All PGI posted Jan 21, 2025. Stock in transit.
Cost Center: 16765517007001

Expected arrival: Jan 24-25, 2025.

Best regards,
NA TPM Inventory Team
(Auto-generated by SynOps)`
        },
        outcome: 'All 3 materials shipped. 2 delivery numbers shared. Work item closed.',
        outcomeStatus: 'success'
      }
    ]
  }
};

export function getTransferScenario(workItemId) {
  return transferScenarioDatabase[workItemId] || null;
}

export function getAllTransferScenarios() {
  return Object.values(transferScenarioDatabase);
}

export default transferScenarioDatabase;
