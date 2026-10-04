/**
 * Mail Sample Scenarios — Real email-based work items extracted from Mail Samples folder
 * These are INCOMING requests (initial TPM vendor request before resolution)
 * Classified into Inventory Adjustment and Transfer process areas
 */

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY ADJUSTMENT SCENARIOS (from Mail Samples)
// ═══════════════════════════════════════════════════════════════════════════════

export const mailAdjustmentScenarios = {

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2001: Scenario 1 (Consumption Correction) — J0HW010701 Scrap Adjustment
  // Hanes Erie → Planner (Christine Choong) → Inventory Analyst
  // 600 pcs scrap, PO 4503255627, need IADJ
  // Source: Mail Samples/IA Scenario1/Subsequent adjustment.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2001': {
    scenario: 1,
    scenarioLabel: 'Scenario 1: Consumption Correction — Scrap Adjustment (600 pcs)',
    workItemId: 'WI-2001',
    type: 'Consumption Correction',
    tpm: 'Hanes Erie',
    plant: '2020',
    material: 'J0HW010701',
    materialDesc: 'CLINIQUE HAPPY EDP 50ML GLASS BOTTLE',
    qty: 600,
    uom: 'EA',
    region: 'NA',

    incomingEmail: {
      from: 'Judene@haneserie.com',
      to: 'chchoong@estee.com',
      cc: 'tpsuppliers@estee.com',
      date: 'Jul 06, 2026 10:10 AM (EST)',
      subject: 'RE: 4503286049',
      body: `Christine,

We do not as the 600 pieces was our scrap.

Thank you,
Judene O'Connor
Hanes Erie, Inc.
Customer Service Representative
814-474-1999 Ext 234`
    },

    emailThread: [
      { sender: "O'Connor, Judene <Judene@haneserie.com>", date: 'Jul 06, 2026 10:10 AM', body: "Christine,\n\nWe do not as the 600 pieces was our scrap.\n\nThank you,\nJudene O'Connor\nHanes Erie, Inc.\nCustomer Service Representative\n814-474-1999 Ext 234" },
      { sender: 'Choong, Christine <chchoong@estee.com>', date: 'Jul 06, 2026 10:01 AM', body: "Judene,\n\nStock in our system show theres 600 pcs on hand.\nIf theres no physical inventory from previous PO, we will need to perform IADJ with Jacks team. Please advise.\n\nSincerely,\nChristine Choong" },
      { sender: "O'Connor, Judene <Judene@haneserie.com>", date: 'Jul 06, 2026 09:53 AM', body: "Hi Christine,\n\nThe purchase order shows a requested quantity of 5,000 pieces.\n\nThank you,\nJudene O'Connor\nHanes Erie, Inc.\nCustomer Service Representative\n814-474-1999 Ext 234" },
      { sender: 'Choong, Christine <chchoong@estee.com>', date: 'Jul 06, 2026 11:46 AM', body: "Jack/Rangelys,\n\nSupplier confirm 600pcs in the system is scrap and request IADJ.\nPlease advise process and what needs to be done to adjust it to reflect the latest.\n\nSincerely,\nChristine Choong" }
    ],

    nlpExtraction: {
      material: 'J0HW010701',
      qty: '600 EA',
      po: '4503255627',
      vendor: 'Hanes Erie',
      plant: '2020',
      classification: 'Scenario 1: Consumption Correction (Scrap)',
      confidence: '92%',
      fieldsValidated: true,
      keywords: ['scrap', 'no physical inventory', 'IADJ']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Validate PO Qty (ME23N) & Stock in MB52',
        description: 'SynOps queries PO 4503255627 component qty and checks MB52 unrestricted stock at Plant 2020. Vendor confirms 600 pcs is scrap — no physical material exists.',
        checks: [
          {
            checkName: 'ME23N — PO Component Quantity (PO 4503255627)',
            transaction: 'ME23N',
            data: {
              po: '4503255627',
              line: '10',
              material: 'J0HW010701',
              componentQty: '5,000 EA',
              grQty: '5,000 EA',
              openQty: '0 EA',
              consumedQty: '4,400 EA',
              scrapReported: '600 EA'
            },
            result: 'SCRAP IDENTIFIED',
            resultDetail: 'PO fully received (5,000 EA). Only 4,400 consumed. 600 EA is scrap per vendor confirmation.',
            passed: true
          },
          {
            checkName: 'MB52 — Stock at Plant 2020 (Hanes Erie)',
            transaction: 'MB52',
            data: {
              material: 'J0HW010701',
              plant: '2020',
              unrestricted: '600 EA',
              blocked: '0 EA',
              qi: '0 EA',
              specialStock: 'O (Subcontracting)',
              physicalAtVendor: '0 EA (vendor confirms scrap)'
            },
            result: 'MATCH — SAP shows 600, Physical = 0',
            resultDetail: 'SAP unrestricted = 600 EA. Vendor confirms NO physical stock — all 600 EA was scrapped during production.',
            passed: true
          }
        ],
        outcome: 'SAP = 600 EA, Vendor Physical = 0 EA. Confirmed scrap. Fast-path eligible — proceed to adjustment.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Execute MIGO — Subsequent Adjustment (Scrap Write-Off)',
        description: 'Since no physical stock exists (confirmed scrap), SynOps pre-populates MIGO for consumption adjustment to clear the 600 EA.',
        migoData: {
          transaction: 'MIGO',
          movementType: '543',
          mvtDescription: 'Subsequent Adjustment — Scrap Write-Off',
          po: '4503255627',
          poLine: '10',
          material: 'J0HW010701',
          materialDesc: 'CLINIQUE HAPPY EDP 50ML GLASS BOTTLE',
          plant: '2020',
          sloc: 'MRP Area',
          batch: 'B2026050101',
          qty: '600 EA',
          underConsumption: false,
          postingDate: '2026-07-07',
          reasonCode: '202',
          reasonDesc: 'Scrap — confirmed by TPM vendor',
          headerText: 'WI-2001 Scrap 600EA J0HW010701 Hanes Erie',
          referenceDoc: 'WI-2001'
        },
        postResult: {
          documentNumber: '4900567123',
          postingStatus: 'Success',
          newMB52Unrestricted: '0 EA',
          verified: true
        },
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2002: Scenario 1 (Consumption Correction) — Oil Consumption Error
  // Arcade Beauty (Leidy Holguin) → Planner (Susan Fairhurst) → Inventory Analyst
  // PO 4503285906, Material J1BS010000, Incorrect oil consumption qty
  // Source: Mail Samples/IA Scenario1/Subsequent adjustment 2.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2002': {
    scenario: 1,
    scenarioLabel: 'Scenario 1: Consumption Correction — Oil Qty Error',
    workItemId: 'WI-2002',
    type: 'Consumption Correction',
    tpm: 'Arcade Beauty',
    plant: '2020',
    material: 'J1BS010000',
    materialDesc: 'LE LABO FRAGRANCE OIL CONCENTRATE',
    qty: 'TBD (per attachment)',
    uom: 'KG',
    region: 'NA',

    incomingEmail: {
      from: 'leidy.holguin@ArcadeBeauty.com',
      to: 'sfairhur@estee.com',
      cc: 'juan.castrillon@arcadebeauty.com',
      date: 'Jul 06, 2026 10:25 AM (EST)',
      subject: 'Re: J1BS010000 PO 4503285906 LO 41890F Reconciliation Issue - HOT',
      body: `Good morning Susan

After reviewing the order, I can see that you are absolutely right. I made an error in the quantity when I processed the consumption.

Please accept my sincere apologies for this mistake.

Please let me know if you have any questions or if further corrections are needed.

Leidy Holguin
Arcade Beauty`
    },

    emailThread: [
      { sender: 'Holguin, Leidy <leidy.holguin@ArcadeBeauty.com>', date: 'Jul 06, 2026 10:25 AM', body: "Good morning Susan\n\nAfter reviewing the order, I can see that you are absolutely right. I made an error in the quantity when I processed the consumption.\n\nPlease accept my sincere apologies for this mistake.\n\nPlease let me know if you have any questions or if further corrections are needed." },
      { sender: 'Fairhurst, Susan <sfairhur@estee.com>', date: 'Jul 06, 2026 08:35 AM', body: "@Holguin, Leidy / Juan,\n\nPlease review PO 4503285906 LO 41890F — the consumption quantity entered does not match the expected. Reconciliation shows oil consumption is incorrect.\n\nThis is HOT priority." },
      { sender: 'Fairhurst, Susan <sfairhur@estee.com>', date: 'Jul 07, 2026 11:08 AM', body: "The ASN reversal which was attached is to correct Oil consumption and will not affect the final invoice quantity.\n\nThe below screen shot was provided as an attachment and provides quantities for correction.\n\nPO # 4503285906\nPO line #\nMaterial #\nQuantity\nIncorrect Oil Consumption" }
    ],

    nlpExtraction: {
      material: 'J1BS010000',
      po: '4503285906',
      vendor: 'Arcade Beauty',
      plant: '2020',
      classification: 'Scenario 1: Consumption Correction (Vendor Error)',
      confidence: '94%',
      keywords: ['error in quantity', 'consumption', 'correction', 'reconciliation']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Validate PO Qty (ME23N) & Confirm Consumption Error',
        description: 'Vendor (Arcade Beauty) confirms consumption error on PO 4503285906. SynOps validates PO data and confirms mismatch.',
        checks: [
          {
            checkName: 'ME23N — PO 4503285906 (Oil Consumption)',
            transaction: 'ME23N',
            data: {
              po: '4503285906',
              material: 'J1BS010000',
              materialDesc: 'LE LABO FRAGRANCE OIL CONCENTRATE',
              componentQty: '50 KG',
              grQty: '50 KG',
              consumedQty: '55 KG (over-consumed)',
              expectedConsumption: '50 KG',
              variance: '+5 KG (excess consumption posted by vendor)'
            },
            result: 'OVER-CONSUMPTION CONFIRMED',
            resultDetail: 'Vendor consumed 55 KG vs expected 50 KG. Vendor acknowledges error. Correction needed.',
            passed: true
          }
        ],
        outcome: 'Vendor confirms consumption error. Subsequent adjustment needed to correct oil quantity.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Execute MIGO — Subsequent Adjustment (Reverse Over-Consumption)',
        description: 'SynOps pre-populates MIGO to reverse the excess 5 KG consumption. Attachment data used for exact correction.',
        migoData: {
          transaction: 'MIGO',
          movementType: '543',
          mvtDescription: 'Subsequent Adjustment — Reverse Excess Consumption',
          po: '4503285906',
          poLine: '10',
          material: 'J1BS010000',
          materialDesc: 'LE LABO FRAGRANCE OIL CONCENTRATE',
          plant: '2020',
          sloc: 'MRP Area',
          batch: 'B2026060801',
          qty: '5 KG',
          underConsumption: false,
          postingDate: '2026-07-07',
          reasonCode: '203',
          reasonDesc: 'Vendor consumption error correction',
          headerText: 'WI-2002 Oil correction Arcade 4503285906',
          referenceDoc: 'WI-2002'
        },
        postResult: {
          documentNumber: '4900567456',
          postingStatus: 'Success',
          newMB52Unrestricted: '5 KG (returned to stock)',
          verified: true
        },
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2003: Scenario 2 (BLCK Stock) — Item 9999621777 BLCK Qty Check
  // Nippon Shikizai Japan → APAC Inventory (Chris Wang / Nayana Venna)
  // Material used as QC inspection sample — BLCK qty = 60g → adjust down
  // Source: Mail Samples/IA Scenario 2/Re BLCK Quantity Check Request - Item 9999621777.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2003': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: BLCK Stock — QC Sample Used (Adjust Down)',
    workItemId: 'WI-2003',
    type: 'Stock Discrepancy',
    tpm: 'Nippon Shikizai',
    plant: '6020',
    material: '9999621777',
    materialDesc: 'MYRISTYL ALCOHOL NACOL 14-98',
    qty: 60,
    uom: 'G',
    region: 'APAC',

    incomingEmail: {
      from: 'k-matsuda@shikizai.com',
      to: 'aishak@estee.com; ypawar@estee.com; t-mimura@shikizai.com; no-suzuki@shikizai.com',
      cc: 'chrwang@cn.estee.com; sphadte@estee.com; nvenna@estee.com',
      date: 'Jul 22, 2026 10:49 AM (JST)',
      subject: 'RE: BLCK Quantity Check Request - Item 9999621777',
      body: `Dear Asa-san

The inventory for the following items will be "0".
60g was used as an inspection sample.

9999621777
MYRISTYL ALCOHOL NACOL 14-98
H000513892      BLCK qty - 60 g

Thank you and best regards,

Nippon Shikizai, inc.
Production Control Department
Kei Matsuda
Mail: k-matsuda@shikizai.com`
    },

    emailThread: [
      { sender: 'Matsuda, Kei <k-matsuda@shikizai.com>', date: 'Jul 22, 2026 10:49 AM', body: "Dear Asa-san\n\nThe inventory for the following items will be \"0\".\n60g was used as an inspection sample.\n\n9999621777\nMYRISTYL ALCOHOL NACOL 14-98\nH000513892      BLCK qty - 60 g\n\nThank you and best regards,\nKei Matsuda\nNippon Shikizai, inc." },
      { sender: 'Ishak, Asa <aishak@estee.com>', date: 'Jul 21, 2026 05:17 PM', body: "Dear Mimura-san, Matsuda-san,\n\nCould you please help check and update on this 60 G stock?\n\nThank you!\n\nRegards,\nNur Aqilah (Asa)\nAPAC Inventory Analyst" },
      { sender: 'Pawar, Yuvraj <ypawar@estee.com>', date: 'Jun 30, 2026 11:56 AM', body: "Hi @t-mimura / @no-suzuki\n\nCan you check whether the following BLCK quantity physically exists or not?\n\n9999621777\nMYRISTYL ALCOHOL NACOL 14-98\nBatch: H000513892\nPlant: 6020\nBLCK qty: 60 g" },
      { sender: 'Wang, Chris <chrwang@cn.estee.com>', date: 'Jul 22, 2026 08:43 AM', body: "Hi @Venna, Nayana, pls do adjustment down via movement type 708.\n\nBest Regards\nChris Wang\nGlobal Supply Chain Planning\nThe Estee Lauder Companies" }
    ],

    nlpExtraction: {
      material: '9999621777',
      qty: '60 G',
      batch: 'H000513892',
      vendor: 'Nippon Shikizai',
      plant: '6020',
      stockType: 'BLCK',
      classification: 'Scenario 2: BLCK Stock — Used as Inspection Sample',
      confidence: '96%',
      keywords: ['BLCK qty', 'inspection sample', 'inventory will be 0', 'adjustment down']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Confirm BLCK Stock Status — MB52',
        description: 'SynOps checks MB52 for Material 9999621777, Plant 6020. Vendor confirms BLCK qty of 60g was used as QC inspection sample — physical stock = 0.',
        checks: [
          {
            checkName: 'MB52 — Stock Overview (Plant 6020, Material 9999621777)',
            transaction: 'MB52',
            data: {
              material: '9999621777',
              materialDesc: 'MYRISTYL ALCOHOL NACOL 14-98',
              plant: '6020 (Japan)',
              batch: 'H000513892',
              unrestricted: '0 G',
              blocked: '60 G',
              qi: '0 G',
              vendorConfirms: 'Used as inspection sample — physical = 0'
            },
            result: 'BLCK = 60 G (No Physical Stock)',
            resultDetail: 'BLCK qty = 60 G. Vendor confirms material was consumed as inspection sample. Physical inventory = 0.',
            passed: true
          }
        ],
        outcome: 'BLCK = 60 G confirmed. Vendor states inventory will be "0" — used as QC sample. Proceed with adjustment down.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Execute Adjustment Down — MvT 708',
        description: 'Per Chris Wang instruction, post MvT 708 (adjustment down) to remove 60g BLCK stock that no longer physically exists.',
        migoData: {
          transaction: 'MB11',
          movementType: '708',
          mvtDescription: 'Adjustment Down — Remove BLCK Stock (QC Sample Used)',
          po: 'N/A',
          poLine: 'N/A',
          material: '9999621777',
          materialDesc: 'MYRISTYL ALCOHOL NACOL 14-98',
          plant: '6020',
          sloc: 'MRP Area',
          batch: 'H000513892',
          qty: '60 G',
          underConsumption: false,
          postingDate: '2026-07-22',
          reasonCode: '204',
          reasonDesc: 'QC inspection sample consumed — no physical stock',
          headerText: 'WI-2003 Adj down 60G 9999621777 Nippon Shikizai QC sample',
          referenceDoc: 'WI-2003'
        },
        postResult: {
          documentNumber: '4900578901',
          postingStatus: 'Success',
          newMB52Unrestricted: '0 G (BLCK cleared)',
          verified: true
        },
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2004: Scenario 2 (Unable to Consume) — Item S5SA020111 Stock Insufficient
  // Intercos Poland (Monika Mucha) → EMEA Inventory (Nayana Venna / Anna Polkowska)
  // Cannot do AC on 5000 pcs — stock shows only 2102, physical = 7672 before assembly
  // Source: Mail Samples/IA Scenario 2 Stock discrepancy/Re item S5SA020111.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2004': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Unable to Consume — Stock Insufficient in SAP',
    workItemId: 'WI-2004',
    type: 'Stock Discrepancy',
    tpm: 'Intercos Poland',
    plant: '3550',
    material: 'S5SA020111',
    materialDesc: 'CLINIQUE MOISTURIZER COMPONENT',
    qty: 5000,
    uom: 'EA',
    region: 'EMEA',

    incomingEmail: {
      from: 'monika.mucha@intercos.com',
      to: 'mihendrickx@be.estee.com; fmedve@estee.com; InventoryAnalystEMEA@elcompanies.net; SupplierSupport@estee.com',
      cc: 'nnaruniec@estee.com; apolkowska@ch.esteelauder.com; aujj@estee.com',
      date: 'Jul 17, 2026 03:05 PM (CET)',
      subject: 'ODP: PO4503273764',
      body: `Miet,

I can't do AC under line 10 as I have to upload 3000 pcs, so it is high than tolerance. So, would be possible to increase the qty-s till 3000 pcs.

Additionally, there is enough qty on S5SA020111 to upload both line. On the stock there is only 2102 pcs, but on our stock there was 7672 pcs before the assembly of this order.

Thank in advance for support,
KR,
Monika Mucha
Intercos Poland`
    },

    emailThread: [
      { sender: 'Mucha, Monika <monika.mucha@intercos.com>', date: 'Jul 17, 2026 03:05 PM', body: "Miet,\n\nI can't do AC under line 10 as I have to upload 3000 pcs, so it is high than tolerance. So, would be possible to increase the qty-s till 3000 pcs.\n\nAdditionally, there is enough qty on S5SA020111 to upload both line. On the stock there is only 2102 pcs, but on our stock there was 7672 pcs before the assembly of this order.\n\nThank in advance for support,\nKR,\nMonika Mucha" },
      { sender: 'Mucha, Monika <monika.mucha@intercos.com>', date: 'Jul 17, 2026 06:44 PM', body: "HI, Can you check the inventory on the item S5SA020111 as the stock is not enough to do AC on 5000 pcs.\n\nThank you for support.\nKR, MM" },
      { sender: 'Hendrickx, Miet <mihendrickx@be.estee.com>', date: 'Jul 17, 2026 02:39 PM', body: "Hi Monika\n\nI removed the batches, let me know if you need help with quantities since I cannot just delete them from the lines but you should be able to overwrite now that I deleted the batches, otherwise @Supplier Support - MMS can help\n\nThanks\nBest regards\nMiet" }
    ],

    nlpExtraction: {
      material: 'S5SA020111',
      qty: '5000 EA (attempting AC)',
      po: '4503273764',
      vendor: 'Intercos Poland',
      plant: '3550',
      classification: 'Scenario 2: Unable to Consume (Stock < Consumption Required)',
      confidence: '91%',
      keywords: ['cant do AC', 'stock not enough', 'tolerance', 'increase qty']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Check MB52 — Stock vs Required Consumption',
        description: 'Vendor cannot perform Assembly Confirmation (AC) for 5000 pcs. SAP shows only 2102 pcs available. Physical stock was 7672 pcs before assembly.',
        checks: [
          {
            checkName: 'MB52 — Stock at Plant 3550 (Material S5SA020111)',
            transaction: 'MB52',
            data: {
              material: 'S5SA020111',
              plant: '3550 (Intercos Poland)',
              unrestricted: '2,102 EA',
              blocked: '0 EA',
              qi: '0 EA',
              requiredForAC: '5,000 EA',
              vendorPhysical: '7,672 EA (before assembly)',
              gap: '-2,898 EA (SAP insufficient for AC)'
            },
            result: 'STOCK INSUFFICIENT',
            resultDetail: 'SAP = 2,102 EA. Vendor needs 5,000 EA for AC. Gap = -2,898 EA. Vendor claims physical was 7,672 before assembly.',
            passed: false
          }
        ],
        outcome: 'SAP stock (2,102) is insufficient for consumption upload (5,000). Discrepancy of ~5,570 EA between vendor physical and SAP needs investigation.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Check MB51 — Movement History & Prior Consumption',
        description: 'SynOps traces movement history to find where the missing qty went. Checks if prior consumptions or transfers reduced the SAP stock.',
        checks: [
          {
            checkName: 'MB51 — Movement History (S5SA020111, Plant 3550)',
            transaction: 'MB51',
            data: {
              material: 'S5SA020111',
              plant: '3550',
              recentMovements: '543 consumption posted for prior PO lines',
              totalConsumedRecent: '5,570 EA (across multiple PO lines)',
              remainingSAP: '2,102 EA',
              issue: 'Prior consumptions depleted stock — adjustment up needed'
            },
            result: 'PRIOR CONSUMPTION DEPLETED STOCK',
            resultDetail: 'Multiple 543 movements consumed stock across PO lines. SAP balance does not reflect vendor physical due to timing of GR postings.',
            passed: false
          }
        ],
        outcome: 'Stock depleted by prior consumptions. Inventory adjustment up (MvT 701) required to align SAP with vendor physical stock.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 3,
        title: 'Resolution — Inventory Adjustment Up Required',
        description: 'Analyst determines adjustment up is needed. Planner (Miet) has removed batch restrictions. Supplier Support may need to assist with tolerance override.',
        checks: [
          {
            checkName: 'Adjustment Requirement Assessment',
            transaction: 'System',
            data: {
              currentSAP: '2,102 EA',
              vendorPhysical: '7,672 EA (pre-assembly)',
              adjustmentNeeded: '+5,570 EA (MvT 701)',
              approvalRequired: 'YES (value > €5,000)',
              approver: 'Category Leader EMEA',
              toleranceOverride: 'Required — line 10 exceeds consumption tolerance'
            },
            result: 'ADJUSTMENT UP REQUIRED',
            resultDetail: 'Adjustment up of 5,570 EA needed. Value exceeds threshold — requires Category Leader approval.',
            passed: true
          }
        ],
        outcome: 'Inventory adjustment up required. Approval workflow initiated.',
        outcomeStatus: 'warning'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2005: Scenario 2 (Qty Mismatch / Receiving Short) — STO Qty Mismatch
  // Arcade Beauty (Darwin Masabanda) → NA Inventory (Sunand Tiwari)
  // Arcade received short qty on STO 4302761504 delivery 2180663037
  // Source: Mail Samples/IA Scenario 2/Re Can you please adjust in sap.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2005': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Receiving Short — STO Qty Mismatch (NA)',
    workItemId: 'WI-2005',
    type: 'Stock Discrepancy',
    tpm: 'Arcade Beauty',
    plant: '2020',
    material: 'N/A (per attachment)',
    materialDesc: 'FRAGRANCE COMPONENT — STO TRANSFER',
    qty: 'Short qty (per packing list)',
    uom: 'KG',
    region: 'NA',

    incomingEmail: {
      from: 'darwin.masabanda@ArcadeBeauty.com',
      to: 'Jaime.Camacho@ArcadeBeauty.com; sutiwari@estee.com; jmay@Estee.com; nicole.herron@arcadebeauty.com; Fanny.Espin@ArcadeBeauty.com',
      cc: 'kpriyada@estee.com',
      date: 'Jul 23, 2026 02:33 PM (EST)',
      subject: 'RE: Can you please adjust in sap',
      body: `Good afternoon. I am attaching the shipping documents.

Thank you
Darwin Masabanda
Arcade Beauty`
    },

    emailThread: [
      { sender: 'Masabanda, Darwin <darwin.masabanda@ArcadeBeauty.com>', date: 'Jul 23, 2026 02:33 PM', body: "Good afternoon. I am attaching the shipping documents.\n\nThank you\nDarwin Masabanda\nArcade Beauty" },
      { sender: 'Tiwari, Sunand <sutiwari@estee.com>', date: 'Jul 23, 2026 03:49 PM', body: "Hi Melville Team,\n\nPls refer the trail mail, arcade has stayed on receiving short quantity for STO 4302761504, delivery number 2180663037.\n\nPls confirm the dispatch quantity.\n\nRegards,\nSunand Tiwari" },
      { sender: 'Lopez, Ricky <rilopez@estee.com>', date: 'Jul 23, 2026 05:19 PM', body: "Good evening. See attachment for Packing list. This looks like it was shipped from the ASR.\n\nRegards,\nRick" },
      { sender: 'Golson, Tireq <tgolson@estee.com>', date: 'Jul 24, 2026 10:33 AM', body: "Hi Sunand,\n\nThe ASR warehouse dispatched 140kg, as indicated on the SU and packing list. Our team shipped the quantity provided to us. Please proceed with the adjustment based on the confirmed receiving variance.\n\n+++ @Wesly, Shahab from compounding management for awareness of the discrepancy.\n\nThank you,\nTireq Golson\nArea Manager | Warehouse Operations ASR 2nd Shift\nThe Estée Lauder Companies\n71 Maxess Road | Melville, NY 11747" }
    ],

    nlpExtraction: {
      sto: '4302761504',
      delivery: '2180663037',
      vendor: 'Arcade Beauty',
      sendingPlant: 'ASR Melville (1090)',
      receivingPlant: '2020 (Arcade)',
      classification: 'Scenario 2: STO Receiving Short — Qty Mismatch',
      confidence: '88%',
      keywords: ['receiving short', 'STO', 'dispatch quantity', 'packing list', 'adjustment']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Validate STO Delivery — Shipped vs Received',
        description: 'Arcade Beauty reports receiving short on STO 4302761504. Melville ASR confirms dispatched 140 KG as per packing list. Need to determine actual shortfall.',
        checks: [
          {
            checkName: 'STO 4302761504 — Delivery 2180663037 Qty Check',
            transaction: 'VL03N / MB51',
            data: {
              sto: '4302761504',
              delivery: '2180663037',
              sendingPlant: '1090 (ASR Melville)',
              receivingPlant: '2020 (Arcade Beauty)',
              dispatchedQty: '140 KG (confirmed by ASR)',
              receivedQty: 'Short (per Arcade)',
              packingListAttached: 'YES'
            },
            result: 'RECEIVING SHORT CONFIRMED',
            resultDetail: 'ASR Melville confirms 140 KG dispatched. Arcade reports receiving less. Variance to be determined from shipping docs.',
            passed: false
          }
        ],
        outcome: 'STO receiving variance confirmed. ASR shipped 140 KG, Arcade received less. Adjustment required once exact qty confirmed from shipping documents.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Review Shipping Documents & Confirm Variance',
        description: 'SynOps flags for analyst review of attached packing list. Once exact receiving qty confirmed, adjustment will be calculated.',
        checks: [
          {
            checkName: 'Attachment Review — Packing List',
            transaction: 'Document Review',
            data: {
              attachmentType: 'Packing List (PDF)',
              dispatchConfirmed: '140 KG by Tireq Golson (ASR Area Manager)',
              recommendation: 'Confirm exact received qty at Arcade, then adjust delta',
              adjustmentType: 'MvT 701 (Increase at receiving) or MvT 702 (Decrease at sending)',
              compoundingTeam: 'Shahab Wesly notified for awareness'
            },
            result: 'AWAITING FINAL QTY CONFIRMATION',
            resultDetail: 'Packing list confirms 140 KG shipped. Analyst to confirm Arcade received qty, then post adjustment for the variance.',
            passed: true
          }
        ],
        outcome: 'Shipping docs reviewed. 140 KG dispatched confirmed. Awaiting Arcade final received qty to calculate adjustment.',
        outcomeStatus: 'warning'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2006: Scenario 2 (Multi-Material Bulk) — Korea TPM Monthly Inventory Report
  // COSMAX BTI Korea (Kiwon Kim) → APAC Inventory (Chris Wang / Nayana Venna)
  // Monthly inventory reconciliation, Plant 6030 & 6060, multiple discrepancies
  // Source: Mail Samples/IA Scenario 2 Multi-material/Re Korea TPM June 2026 Inventory report.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2006': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Multi-Material Bulk — Monthly Inventory Reconciliation (Korea)',
    workItemId: 'WI-2006',
    type: 'Stock Discrepancy',
    tpm: 'COSMAX BTI Korea',
    plant: '6030',
    material: 'Multiple (per inventory file)',
    materialDesc: 'Monthly Inventory Report — June 2026',
    qty: 'Multiple',
    uom: 'Various',
    region: 'APAC',
    multiMaterial: true,

    incomingEmail: {
      from: 'kiwon.kim@cosmaxbti.com',
      to: 'chrwang@cn.estee.com; nvenna@estee.com',
      cc: 'hjiang@estee.com; azhu@estee.com; ftan@estee.com; eniu@estee.com; sshen@estee.com; akim@estee.com',
      date: 'Jul 2026 (Monthly Report)',
      subject: 'Korea TPM (plant code 6030) & Dr. Jart (plant code 6060) June 2026 Inventory report',
      body: `Dear Team,

Please find attached the monthly inventory report for Plant 6030 (COSMAX Korea) and Plant 6060 (Dr. Jart) for June 2026.

Several discrepancies have been identified and require adjustment.

Inventory Accuracy:
• Plant 6030: 97.5% (Target: 98.0%)
• Plant 6060: TBD
• Total SKUs/Batches: 406
• SKUs not hitting 98% accuracy: 160

Please review and adjust as necessary.

Best regards,
Kiwon Kim
COSMAX BTI`
    },

    emailThread: [
      { sender: 'Kim, Kiwon <kiwon.kim@cosmaxbti.com>', date: 'Jul 2026', body: "Please find attached the monthly inventory report for Plant 6030 (COSMAX Korea) and Plant 6060 (Dr. Jart) for June 2026.\n\nSeveral discrepancies have been identified and require adjustment.\n\nInventory Accuracy:\n• Plant 6030: 97.5% (Target: 98.0%)\n• Total SKUs/Batches: 406\n• SKUs not hitting 98%: 160" },
      { sender: 'Venna, Nayana <nvenna@estee.com>', date: 'Post-review', body: "Hi Kiwon,\n\nAfter reviewing the inventory file for the month of June-26, a few discrepancies were identified, and the necessary adjustments have been made to align the inventory records.\n\nPlease find below the inventory accuracy for your reference.\n\n6030 Cosmax Inventory accuracy % per SKU/Batch:\nJun-26: 97.5%\nFY26 Target: 98.0%" }
    ],

    materials: [
      { material: 'Various', desc: 'Plant 6030 — 406 SKUs/Batches audited', qty: 'Multiple', uom: 'Various', accuracy: '97.5%', target: '98.0%' },
      { material: 'Various', desc: 'Plant 6060 — Dr. Jart SKUs audited', qty: 'Multiple', uom: 'Various', accuracy: 'TBD', target: '98.0%' }
    ],

    nlpExtraction: {
      plants: ['6030', '6060'],
      vendor: 'COSMAX BTI Korea',
      classification: 'Scenario 2: Multi-Material Bulk Adjustment (Monthly Recon)',
      confidence: '90%',
      keywords: ['monthly inventory report', 'discrepancies', 'adjustment', 'accuracy']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Parse Monthly Inventory File — Identify Discrepancies',
        description: 'SynOps ingests the monthly inventory report attachment. Compares vendor physical counts against SAP MB52 for all 406 SKU/Batch combinations.',
        checks: [
          {
            checkName: 'Inventory File Analysis — Plant 6030',
            transaction: 'System / Data Lake',
            data: {
              totalSKUBatches: '406',
              matching98: '246 (97.5% accuracy)',
              discrepancies: '160 SKU/Batches below 98% threshold',
              adjustmentsNeeded: 'Multiple (per attachment)',
              plantAccuracy: '97.5% vs 98.0% target'
            },
            result: '160 DISCREPANCIES IDENTIFIED',
            resultDetail: '160 out of 406 SKU/Batches do not meet 98% accuracy threshold. Bulk adjustments required.',
            passed: false
          }
        ],
        outcome: '160 discrepancies identified from monthly report. Bulk adjustment process initiated for Plant 6030.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Bulk Adjustment Execution',
        description: 'Inventory analyst processes bulk adjustments for discrepancies identified in the monthly report. Multiple MvT 701/702 postings.',
        checks: [
          {
            checkName: 'Bulk Adjustment Summary',
            transaction: 'MB11 (Bulk)',
            data: {
              totalAdjustments: '160 line items',
              adjustUp: 'MvT 701 (where SAP < Physical)',
              adjustDown: 'MvT 702 (where SAP > Physical)',
              postMonth: 'June 2026',
              approvalStatus: 'Batch approved per monthly recon process'
            },
            result: 'BULK ADJUSTMENTS PROCESSED',
            resultDetail: 'All 160 discrepancy lines processed. Inventory aligned to vendor physical counts.',
            passed: true
          }
        ],
        outcome: 'Monthly bulk adjustments complete. Plant 6030 inventory aligned.',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2007: Scenario 2 (Unable to Consume) — Stock Adjustment N1K0410121
  // Stephid France (Sandrine Deleglise) → EMEA Inventory (Nayana Venna / Agnes Ujj)
  // Vendor stuck — can't close PO, only 624 pcs available matches SAP
  // Source: Mail Samples/IA Scenario 2 Unable to consume/Re stock adjustment N1K0410121.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2007': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Stock Mismatch — Vendor Cannot Close PO',
    workItemId: 'WI-2007',
    type: 'Stock Discrepancy',
    tpm: 'Stephid France',
    plant: '3550',
    material: 'N1K0410121',
    materialDesc: 'FRAGRANCE RAW MATERIAL COMPONENT',
    qty: 624,
    uom: 'EA',
    region: 'EMEA',

    incomingEmail: {
      from: 'sandrine.deleglise@stephid.fr',
      to: 'tgecse@estee.com; nazouggagh@estee.com; mdhotre@estee.com; nvenna@estee.com; SupplierSupport@estee.com',
      cc: 'stephidconso@stephid.fr; aamishra@estee.com; aujj@estee.com',
      date: 'Jul 10, 2026 08:01 AM (CET)',
      subject: 'RE: stock adjustment N1K0410121',
      body: `Hello everyone,

Im still stuck — whats the latest so that I can close the PO?

I look forward to hearing from you.
Thank you in advance.

Cordialement.
Sandrine Delglise.
Stephid France`
    },

    emailThread: [
      { sender: 'Deleglise, Sandrine <sandrine.deleglise@stephid.fr>', date: 'Jul 10, 2026 08:01 AM', body: "Hello everyone,\n\nIm still stuck — whats the latest so that I can close the PO?\n\nI look forward to hearing from you.\nThank you in advance.\n\nCordialement.\nSandrine Delglise." },
      { sender: 'Lemanska, Agnieszka <alemanska@uk.estee.com>', date: 'Jul 10, 2026 09:28 AM', body: "Hello @Azouggagh, Nacer @Gecse, Tamas @Ujj, Agnes\n\nPlease adjust the stock qty N1K0410121, there are only 624pcs available for consumption, this qty matches SAP.\n\nThank you\n\nKind regards,\nAgnieszka Lemanska\nManager EMEA Direct Procurement Operations\nEstée Lauder AG Lachen\nFeldmoosstrasse 2, 8853 Lachen / Switzerland" },
      { sender: 'Ujj, Agnes <aujj@estee.com>', date: 'Jul 10, 2026 01:33 PM', body: "Adding @Venna, Nayana and @Dhotre, Manasi for inventory adjustment" },
      { sender: 'Gecse, Tamas <tgecse@estee.com>', date: 'Jul 08, 2026 09:03 AM', body: "Hi Sandrine,\n\nNow inventory of N1K0410121 has been adjusted as per your request, could you please send us a screenshot of this issue?" }
    ],

    nlpExtraction: {
      material: 'N1K0410121',
      qty: '624 EA',
      vendor: 'Stephid France',
      plant: '3550',
      classification: 'Scenario 2: Stock Adjustment — Vendor Stuck (Cannot Close PO)',
      confidence: '93%',
      keywords: ['stuck', 'close the PO', 'stock adjustment', '624pcs matches SAP']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Check MB52 — Stock Qty Validation',
        description: 'Vendor (Stephid France) cannot close PO. Procurement confirms only 624 pcs available for consumption, which matches SAP.',
        checks: [
          {
            checkName: 'MB52 — Stock at Plant 3550 (Material N1K0410121)',
            transaction: 'MB52',
            data: {
              material: 'N1K0410121',
              plant: '3550',
              unrestricted: '624 EA',
              blocked: '0 EA',
              qi: '0 EA',
              vendorClaim: '624 EA available',
              sapMatch: 'YES — SAP = Vendor count'
            },
            result: 'SAP MATCHES VENDOR',
            resultDetail: 'SAP shows 624 EA unrestricted. Procurement confirms this matches available stock. Issue is PO closure, not stock discrepancy.',
            passed: true
          }
        ],
        outcome: 'Stock qty confirmed at 624 EA (SAP = Physical). Issue is vendor unable to close PO due to prior adjustment. Adjustment already done.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Confirm Adjustment Complete — Vendor Can Proceed',
        description: 'Inventory team confirms adjustment was already done by Tamas Gecse. Vendor should now be able to close PO.',
        emailData: {
          to: 'sandrine.deleglise@stephid.fr',
          cc: 'aujj@estee.com; tgecse@estee.com; nvenna@estee.com',
          subject: 'RE: stock adjustment N1K0410121 — Completed',
          body: `Hi Sandrine,

The inventory has been adjusted for the below item:

Material: N1K0410121
Plant: 3550
Qty: 624 EA (matches SAP)
Status: Adjustment complete

You should now be able to close the PO. Please try again and let us know if you face any further issues.

Regards,
Nayana Venna
Inventory Planner EMEA TPMs
Estée Lauder Companies`
        },
        outcome: 'Adjustment confirmed complete. Vendor notified. PO closure should proceed.',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2008: Scenario 2 (Help Out Form / Approval Required) — B1WX011000 Bottles
  // Voyant Beauty (Mary Ann Picinich) → Planner (Bhagirath Tanna) → Inventory Analyst
  // Inventory discrepancy at Ridgefield, received 87,520 against PO, approval > $1K
  // Source: Mail Samples/IA Scenario 2 Planner forwards/Fw Item# B1WX011000 PO# 4503215610.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2008': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Planner-Forwarded — Approval Required (>$1K)',
    workItemId: 'WI-2008',
    type: 'Stock Discrepancy',
    tpm: 'Voyant Beauty',
    plant: '2020',
    material: 'B1WX011000',
    materialDesc: 'CLINIQUE BOTTLE COMPONENT — 2 OZ',
    qty: 87520,
    uom: 'EA',
    region: 'NA',

    incomingEmail: {
      from: 'MaryAnn.Picinich@voyantbeauty.com',
      to: 'btanna@estee.com; Katherine.Illera@VoyantBeauty.com; SupplierSupport@estee.com; mcumming@estee.com',
      cc: 'Orlando.Helena@voyantbeauty.com; Lizandro.Parrales@voyantbeauty.com',
      date: 'Jul 21, 2026 02:04 PM (EST)',
      subject: 'RE: Item# B1WX011000 PO# 4503215610 Line 0010',
      body: `HI

We received a total of 87,520 against your PO#4503294456.

Looks like we also had some leftover stock from the line trial which came in under your PO# P100323334.

Thanks
Mary Ann Picinich
Account Manager
1135 W. Pleasant View Terrace, Ridgefield, NJ 07657
Office: 201.941.9800 ext 110245
Direct: 201.409.0045
maryann.picinich@voyantbeauty.com`
    },

    emailThread: [
      { sender: 'Picinich, Mary Ann <MaryAnn.Picinich@voyantbeauty.com>', date: 'Jul 21, 2026 02:04 PM', body: "HI\n\nWe received a total of 87,520 against your PO#4503294456.\n\nLooks like we also had some leftover stock from the line trial which came in under your PO# P100323334.\n\nThanks\nMary Ann Picinich\nAccount Manager\n1135 W. Pleasant View Terrace, Ridgefield, NJ 07657" },
      { sender: 'Tanna, Bhagirath <btanna@estee.com>', date: 'Jul 21, 2026 04:20 PM', body: "Hi @Tiwari, Sunand / @Mishra, Anamika — We have inventory discrepancy for B1WX01001F bottles at Ridgefield.\n\nCan you please help to resolve?" },
      { sender: 'Tiwari, Sunand <sutiwari@estee.com>', date: 'Jul 21, 2026 04:37 PM', body: "Hi Bhagirath,\n\nI can see sufficient stock in SAP, PFB reference.\n\nIf still adjustment is required, could you please share the details in inventory transaction form.\n\nRegards,\nSunand Tiwari" },
      { sender: 'Tiwari, Sunand <sutiwari@estee.com>', date: 'Jul 22, 2026 10:08 AM', body: "Hi Bhagirath,\n\nTotal Cost is not mentioned in the Inventory transaction form.\n\nPls note as the adjustment value is above $1k, we would require E-mail approval of Eric for making this adjustment.\n\nRegards,\nSunand Tiwari" },
      { sender: 'Tanna, Bhagirath <btanna@estee.com>', date: 'Jul 22, 2026', body: "Hi eric - Can you please help to approve inventory adjustment up for B1WX01001F bottles at Ridgefield.\n\nThey claim to have more units OH than what shows in SAP, which is preventing consumption.\n\nBhagirath" }
    ],

    nlpExtraction: {
      material: 'B1WX011000',
      qty: '87,520 EA received',
      po: '4503294456 / P100323334 (line trial)',
      vendor: 'Voyant Beauty (Ridgefield, NJ)',
      plant: '2020',
      classification: 'Scenario 2: Inventory Discrepancy — Approval Required (>$1K)',
      confidence: '90%',
      keywords: ['inventory discrepancy', 'received 87520', 'leftover stock', 'line trial', 'approval']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Check MB52 — Vendor Claims More Than SAP Shows',
        description: 'Voyant Beauty received 87,520 pcs. Planner forwards discrepancy. Analyst checks MB52 — SAP shows sufficient stock but vendor reports preventing consumption.',
        checks: [
          {
            checkName: 'MB52 — Stock at Ridgefield (B1WX011000)',
            transaction: 'MB52',
            data: {
              material: 'B1WX011000',
              plant: '2020 (Ridgefield)',
              unrestricted: 'Sufficient (per analyst check)',
              poReceived: '87,520 EA (PO 4503294456)',
              lineTrialLeftover: 'Additional from PO P100323334',
              vendorClaim: 'More OH than SAP shows',
              issue: 'TPM has extra stock preventing consumption'
            },
            result: 'DISCREPANCY — VENDOR HAS MORE THAN SAP',
            resultDetail: 'Vendor claims OH > SAP qty due to leftover line trial stock. Adjustment up required.',
            passed: false
          }
        ],
        outcome: 'Vendor has excess OH stock from line trial. Inventory transaction form required. Approval needed (value > $1K).',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Approval Workflow — Value > $1K Threshold',
        description: 'Adjustment value exceeds $1,000 threshold. Email approval from Eric (Manager) required before posting.',
        checks: [
          {
            checkName: 'Approval Threshold Check (NA)',
            transaction: 'System',
            data: {
              adjustmentValue: '> $1,000',
              threshold: '$1,000 (NA region)',
              approverRequired: 'Eric (Manager)',
              approvalMethod: 'Email approval',
              inventoryTransactionForm: 'Required — Total Cost not yet provided'
            },
            result: 'APPROVAL REQUIRED',
            resultDetail: 'Value > $1K threshold. Manager (Eric) email approval needed. Inventory transaction form must include Total Cost.',
            passed: true
          }
        ],
        outcome: 'Awaiting approval from Eric + completed inventory transaction form with Total Cost. Once approved, adjustment up will be posted.',
        outcomeStatus: 'warning'
      }
    ]
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFER SCENARIOS (from Mail Samples)
// ═══════════════════════════════════════════════════════════════════════════════

export const mailTransferScenarios = {

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-T2001: Samples/Cost Center — A44 EDP Testing (Multi-Material)
  // Susan Fairhurst (NA Planner) → Inventory Analyst
  // Arcade Dayton (10002829), Plant 2020, 4 materials for Megan Garcia (Le Labo)
  // Source: Mail Samples/T SampleCost Center/Re Aerin Supply Req from 2020.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-T2001': {
    scenario: 1,
    scenarioLabel: 'Scenario 1: Samples/Cost Center — Multi-Material (A44 EDP Testing)',
    workItemId: 'WI-T2001',
    type: 'Samples',
    tpm: 'Arcade Beauty Dayton',
    plant: '2020',
    material: 'J0P2100012 (+3 more)',
    materialDesc: 'LE LABO A44 EDP — Package Testing Components',
    qty: 'Multiple',
    uom: 'EA',
    region: 'NA',
    multiMaterial: true,

    materials: [
      { material: 'J0P2100012', desc: '15ml Glass', qty: 'TBD', uom: 'EA', costCenter: '5517007001', destination: 'Aptar Beauty Cary, IL' },
      { material: 'J0L6300071', desc: 'LL Cap', qty: 'TBD', uom: 'EA', costCenter: '5517007001', destination: 'Aptar Beauty Cary, IL' },
      { material: 'J43J010012', desc: '1.5ML Deco Vial', qty: 'TBD', uom: 'EA', costCenter: '5517007001', destination: 'EL Research Park, Melville NY' },
      { material: 'J0A0010162', desc: 'Base Label', qty: 'TBD', uom: 'EA', costCenter: '5517007001', destination: 'EL Research Park, Melville NY' }
    ],

    incomingEmail: {
      from: 'sfairhur@estee.com',
      to: 'jmay@Estee.com; rlasso@estee.com',
      cc: 'psonawan@estee.com',
      date: 'Jul 06, 2026 08:37 AM (EST)',
      subject: 'FW: Supply Request- A44 EDP testing',
      body: `Jack / Rangelys,

Please adjust for the Supply Reqs.

Code | Description | Qty | EM thread | Requestor | Co. Code | Cost Center | Address
J0P2100012 | 15ml Glass | Supply Request- A44 EDP testing | Megan Garcia | 1676 | 5517007001 | Aptar Beauty Cary Attn: Leah Christiansen 1160 North Silver Lake Road, Cary, Illinois 60013
J0L6300071 | LL Cap | Supply Request- A44 EDP testing | Megan Garcia | 1676 | 5517007001 | Aptar Beauty Cary Attn: Leah Christiansen 1160 North Silver Lake Road, Cary, Illinois 60013
J43J010012 | 1.5ML Deco Vial | Supply Request- A44 EDP testing | Megan Garcia | 1676 | 5517007001 | Estee Lauder - Research Park Kristina Vlasak 65 Maxess Road Melville, NY 11747
J0A0010162 | Base Label | Supply Request- A44 EDP testing | Megan Garcia | 1676 | 5517007001 | (address per prior email)

Vendor: Arcade Dayton 10002829 in MRP area 2020.

Appreciate it,
Susan Fairhurst
NA TPM Planner | The Estée Lauder Companies, Inc.
250 Rittenhouse Circle Bristol PA 19007
Telephone: 215-874-1484`
    },

    emailThread: [
      { sender: 'Fairhurst, Susan <sfairhur@estee.com>', date: 'Jul 06, 2026 08:37 AM', body: "Jack / Rangelys,\n\nPlease adjust for the Supply Reqs.\n\nJ0P2100012 | 15ml Glass | A44 EDP testing | Megan Garcia | 1676 | 5517007001 | Aptar Beauty Cary\nJ0L6300071 | LL Cap | A44 EDP testing | Megan Garcia | 1676 | 5517007001 | Aptar Beauty Cary\nJ43J010012 | 1.5ML Deco Vial | A44 EDP testing | Megan Garcia | 1676 | 5517007001 | EL Research Park Melville\nJ0A0010162 | Base Label | A44 EDP testing | Megan Garcia | 1676 | 5517007001\n\nVendor: Arcade Dayton 10002829 in MRP area 2020.\n\nAppreciate it,\nSusan Fairhurst\nNA TPM Planner" },
      { sender: 'Tiwari, Sunand <sutiwari@estee.com>', date: 'Jul 06, 2026', body: "Hi Susan,\n\nPls share the valid Cost center code, 5517007001 this not valid for 2020.\n\nAlso we don't have the inventory for following material code, pls suggest.\n\nJ43J010012\n1.5ML DECO VIAL\n\nRegards,\nSunand Tiwari" }
    ],

    nlpExtraction: {
      multiLine: true,
      lineItems: [
        { material: 'J0P2100012', desc: '15ml Glass', costCenter: '5517007001', shipTo: 'Aptar Beauty Cary, IL' },
        { material: 'J0L6300071', desc: 'LL Cap', costCenter: '5517007001', shipTo: 'Aptar Beauty Cary, IL' },
        { material: 'J43J010012', desc: '1.5ML Deco Vial', costCenter: '5517007001', shipTo: 'EL Research Park, Melville NY' },
        { material: 'J0A0010162', desc: 'Base Label', costCenter: '5517007001', shipTo: 'TBD' }
      ],
      vendor: 'Arcade Dayton (10002829)',
      plant: '2020',
      costCenter: '5517007001',
      brand: 'Le Labo Fragrances (Megan Garcia)',
      transferType: 'Samples (Cost Center)',
      confidence: '88%',
      issues: ['Cost center 5517007001 not valid for plant 2020', 'No inventory for J43J010012']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'NLP Parse — Extract Multi-Material Supply Request',
        description: 'SynOps parses Susan Fairhurst forwarded supply request. Identifies 4 materials, cost center, and two ship-to addresses. Classified as Scenario 1 (Samples/Cost Center).',
        checks: [
          {
            checkName: 'NLP Multi-Line Extraction',
            transaction: 'NLP Engine',
            data: {
              totalLineItems: '4 materials extracted',
              line1: 'J0P2100012 | 15ml Glass → Aptar Cary',
              line2: 'J0L6300071 | LL Cap → Aptar Cary',
              line3: 'J43J010012 | 1.5ML Deco Vial → EL Melville',
              line4: 'J0A0010162 | Base Label → TBD',
              costCenter: '5517007001',
              vendor: 'Arcade Dayton (10002829)',
              brand: 'Le Labo (Megan Garcia)'
            },
            result: '4 LINES EXTRACTED — ISSUES DETECTED',
            resultDetail: 'All 4 materials extracted. 2 issues flagged: (1) CC 5517007001 invalid for plant 2020, (2) No inventory for J43J010012.',
            passed: false
          }
        ],
        outcome: 'Classified: Samples/CC transfer. 4 materials. 2 issues require clarification before posting.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Validation Issues — Cost Center & Stock Availability',
        description: 'SynOps flags: (1) Cost Center 5517007001 not valid for Plant 2020, (2) Material J43J010012 has no inventory. Analyst requests clarification from planner.',
        checks: [
          {
            checkName: 'Cost Center Validation (KS03)',
            transaction: 'KS03',
            data: {
              costCenter: '5517007001',
              plant: '2020',
              validation: 'INVALID — not assigned to plant 2020',
              action: 'Request correct CC from planner'
            },
            result: 'CC INVALID',
            resultDetail: 'Cost center 5517007001 is not valid for plant 2020. Planner must provide correct CC.',
            passed: false
          },
          {
            checkName: 'MB52 — Stock Check J43J010012',
            transaction: 'MB52',
            data: {
              material: 'J43J010012',
              plant: '2020',
              unrestricted: '0 EA',
              status: 'NO INVENTORY'
            },
            result: 'NO STOCK AVAILABLE',
            resultDetail: 'Material J43J010012 (1.5ML Deco Vial) has no inventory at Plant 2020. Cannot process this line.',
            passed: false
          }
        ],
        outcome: 'Blocked: Invalid CC + missing inventory. Email sent to Susan Fairhurst for clarification.',
        outcomeStatus: 'warning'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-T2002: Cross-Plant STO — Inventory Transfer C-Care to Plant 1090
  // C-Care (Chris Shek) → Planner (Bhagirath Tanna) → Inventory Analyst
  // STO 4302776084, multi-material (shippers + pump), Plant 2020 → 1090
  // Source: Mail Samples/T cross plant STO transfer -- Standard/STO Delivery.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-T2002': {
    scenario: 2,
    scenarioLabel: 'Scenario 2: Cross-Plant STO — C-Care to Plant 1090 (Multi-Material)',
    workItemId: 'WI-T2002',
    type: 'Cross-Plant STO',
    tpm: 'C-Care LLC',
    plant: '2020',
    material: '9060020909 (+2 more)',
    materialDesc: 'SHIPPERS & PUMP COMPONENTS — STO Transfer',
    qty: 'Multiple',
    uom: 'EA',
    region: 'NA',
    multiMaterial: true,

    materials: [
      { material: '9060020909', desc: 'SHIPPER, DW', qty: 915, uom: 'EA', destination: 'Plant 1090' },
      { material: '9060010909', desc: 'SHIPPER', qty: 840, uom: 'EA', destination: 'Plant 1090' },
      { material: '68LE01006J', desc: 'ALBEA PUMP 2ND 125ML', qty: 2260, uom: 'EA', destination: 'Plant 1090' }
    ],

    incomingEmail: {
      from: 'btanna@estee.com',
      to: 'jmay@Estee.com; rlasso@estee.com',
      cc: 'CShek@ccarellc.com',
      date: 'Jul 09, 2026 01:28 PM (EST)',
      subject: 'Inventory Transfer',
      body: `Hi @May, Jack / @Lasso, Rangelys — STO 4302776084 is issued to move inventory from C-care to 1090. Can you please help to create del.

Chris - You can ship the stock once del is created.

Regards
Bhagirath Tanna
Planner TPM
Supply Chain Manufacturing-Supply Planning - Third Party
Work: +16318477551
Mobile: +17175710444`
    },

    emailThread: [
      { sender: 'Tanna, Bhagirath <btanna@estee.com>', date: 'Jul 09, 2026 01:28 PM', body: "Hi @May, Jack / @Lasso, Rangelys — STO 4302776084 is issued to move inventory from C-care to 1090. Can you please help to create del.\n\nChris - You can ship the stock once del is created.\n\nRegards\nBhagirath Tanna\nPlanner TPM" },
      { sender: 'Tanna, Bhagirath <btanna@estee.com>', date: 'Jul 09, 2026 02:51 PM', body: "Hi Chris - I pulled the quantity based on the file you shared. Can you confirm if this is accurate?\n\n9060020909  SHIPPER, DW           915\n9060010909  SHIPPER               840\n68LE01006J  ALBEA PUMP 2ND 125ML  2,260" },
      { sender: 'Shek, Chris <CShek@ccarellc.com>', date: 'Jul 10, 2026 12:38 AM', body: "Bhagirath,\n\nI will get these pallets together in the morning and will confirm after.\n\nKind Regards,\nChristopher M Shek\nDemand Planner / Warehousing\n979 Corporate Blvd\nLinthicum Heights, MD\nCshek@ccarellc.com" },
      { sender: 'Mishra, Anamika <anamishr@estee.com>', date: 'Jul 10, 2026', body: "Dear team\n\nPls find the delivery no 2180619246,\nPGI done\n\nRegards,\nAnamika Mishra" }
    ],

    nlpExtraction: {
      sto: '4302776084',
      delivery: '2180619246',
      sendingPlant: 'C-Care (Linthicum Heights, MD)',
      receivingPlant: '1090',
      vendor: 'C-Care LLC (10045891)',
      multiLine: true,
      lineItems: [
        { material: '9060020909', desc: 'SHIPPER, DW', qty: '915 EA' },
        { material: '9060010909', desc: 'SHIPPER', qty: '840 EA' },
        { material: '68LE01006J', desc: 'ALBEA PUMP 2ND 125ML', qty: '2,260 EA' }
      ],
      transferType: 'Cross-Plant STO',
      confidence: '96%'
    },

    steps: [
      {
        stepNumber: 1,
        title: 'NLP Parse — STO Transfer Request (Multi-Material)',
        description: 'Planner (Bhagirath) requests delivery creation for STO 4302776084. 3 materials from C-Care → Plant 1090.',
        checks: [
          {
            checkName: 'NLP Extraction — STO Transfer Details',
            transaction: 'NLP Engine',
            data: {
              sto: '4302776084',
              fromPlant: 'C-Care (Linthicum Heights, MD)',
              toPlant: '1090',
              materials: '3 line items',
              line1: '9060020909 SHIPPER DW — 915 EA',
              line2: '9060010909 SHIPPER — 840 EA',
              line3: '68LE01006J ALBEA PUMP 125ML — 2,260 EA',
              classification: 'Scenario 2: Cross-Plant STO (NA)'
            },
            result: 'CLASSIFIED — CROSS-PLANT STO',
            resultDetail: 'STO 4302776084 identified. 3 materials to transfer. Delivery creation needed before vendor can ship.',
            passed: true
          }
        ],
        outcome: 'Classified: Cross-Plant STO. STO 4302776084. Delivery to be created for 3 materials.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Create Delivery & Post PGI — VL10G',
        description: 'Analyst creates delivery via VL10G. PGI posted. Delivery# 2180619246 generated. C-Care can now ship.',
        migoData: {
          transaction: 'VL10G / VL02N',
          movementType: '641',
          mvtDescription: 'PGI — Cross-Plant STO (3 materials)',
          po: 'STO 4302776084',
          poLine: 'Multiple (3 lines)',
          material: '9060020909 + 9060010909 + 68LE01006J',
          materialDesc: 'Shippers (×2) + Pump',
          plant: 'C-Care → 1090',
          sloc: 'MRP Area',
          batch: 'Multiple',
          qty: '915 + 840 + 2,260 = 4,015 EA total',
          underConsumption: false,
          postingDate: '2026-07-10',
          reasonCode: 'N/A',
          reasonDesc: 'Cross-plant STO transfer per planner request',
          headerText: 'WI-T2002 PGI STO 4302776084 C-Care→1090',
          referenceDoc: 'STO 4302776084'
        },
        postResult: {
          documentNumber: '2180619246',
          postingStatus: 'Success — PGI Done',
          newMB52Unrestricted: 'Stock in transit → 1090',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 3,
        title: 'Confirmation — Vendor Can Ship',
        description: 'PGI posted. Delivery 2180619246 created. C-Care (Chris Shek) notified to ship pallets.',
        emailData: {
          to: 'CShek@ccarellc.com; btanna@estee.com',
          cc: 'anamishr@estee.com; sutiwari@estee.com',
          subject: 'PGI Done — STO 4302776084 — Delivery 2180619246 — Ready to Ship',
          body: `Dear team,

PGI done. Delivery no 2180619246.

Materials transferred:
• 9060020909 (SHIPPER, DW) — 915 EA
• 9060010909 (SHIPPER) — 840 EA
• 68LE01006J (ALBEA PUMP 2ND 125ML) — 2,260 EA

Chris — you can now ship the stock to Plant 1090.

Regards,
Anamika Mishra`
        },
        outcome: 'PGI confirmed. Vendor authorized to ship. Delivery 2180619246.',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-T2003: Same-Plant Transfer — Material 9999356301 Move to Vendor 10122428
  // Contract Candles (Alina Grudzinska) → EMEA Inventory (Nayana Venna)
  // BLCK stock released by QC, then move to vendor 10122428 at same plant
  // Source: Mail Samples/T-- Same Plant Help Out Form/Re 9999356301.msg
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-T2003': {
    scenario: '3A',
    scenarioLabel: 'Scenario 3A: Same-Plant Transfer — BLCK Release + Move to Vendor',
    workItemId: 'WI-T2003',
    type: 'Same-Plant 542/541',
    tpm: 'Contract Candles & Diffusers',
    plant: '3550',
    material: '9999356301',
    materialDesc: 'CANDLE WAX COMPONENT',
    qty: 'Per QC release',
    uom: 'EA',
    region: 'EMEA',

    incomingEmail: {
      from: 'alina.grudzinska@contractcandles.com',
      to: 'nvenna@estee.com; qc_emea_tpm@be.estee.com',
      cc: 'kamit@estee.com; apolkowska@ch.esteelauder.com; mdhotre@estee.com; aujj@estee.com',
      date: 'Jul 15, 2026 08:26 AM (GMT)',
      subject: 'RE: 9999356301',
      body: `Good morning QC,

Please unblock the stock again as per attached.

@Venna, Nayana once QA action, could you please move this into 10122428 as soon as possible, otherwise the stock will disappear again.

Alina Grudzinska
Factory Planner
Contract Candles & Diffusers Ltd
QUARRY LANE, CHICHESTER, WEST SUSSEX, PO19 8PE
T: 01428 645433 | M: 07399 074904`
    },

    emailThread: [
      { sender: 'Grudzinska, Alina <alina.grudzinska@contractcandles.com>', date: 'Jul 15, 2026 08:26 AM', body: "Good morning QC,\n\nPlease unblock the stock again as per attached.\n\n@Venna, Nayana once QA action, could you please move this into 10122428 as soon as possible, otherwise the stock will disappear again.\n\nAlina Grudzinska\nFactory Planner\nContract Candles & Diffusers Ltd\nQUARRY LANE, CHICHESTER, WEST SUSSEX, PO19 8PE" },
      { sender: 'Venna, Nayana <nvenna@estee.com>', date: 'Jul 14, 2026 03:55 PM', body: "Hi Alina,\n\nIt appears that the stock is still showing as blocked. Could you please check once and let me know?\n\nRegards,\nNayana Venna\nInventory Planner EMEA TPMs" },
      { sender: 'Grudzinska, Alina <alina.grudzinska@contractcandles.com>', date: 'Jul 14, 2026 02:46 PM', body: "Thank you,\n\n@Venna, Nayana & @Dhotre, Manasi could you please move this into 10122428?" },
      { sender: 'Grudzinska, Alina <alina.grudzinska@contractcandles.com>', date: 'Jul 15, 2026 02:37 PM', body: "@Venna, Nayana Could you move this into 10122428 please?" },
      { sender: 'QC EMEA TPM <qc_emea_tpm@be.estee.com>', date: 'Jul 15, 2026 09:34 AM', body: "@Alina Grudzinska\n\nYour request is completed on QCs end.\nPlease make sure that AC is completed ASAP.\n\nThank you\nRegards,\nAn Vranckx\nQC TPM Lab Analyst Level 3\nEstée Lauder Companies" },
      { sender: 'Venna, Nayana <nvenna@estee.com>', date: 'Jul 15, 2026', body: "Hi Team,\n\nStock has been transferred to 10122428.\n\nThank you.\nRegards,\nNayana Venna\nInventory Planner EMEA TPMs" }
    ],

    nlpExtraction: {
      material: '9999356301',
      receivingVendor: '10122428',
      vendor: 'Contract Candles & Diffusers',
      plant: '3550',
      transferType: 'Same-Plant (BLCK Release + Move to Vendor)',
      confidence: '94%',
      keywords: ['unblock stock', 'move into 10122428', 'QA action', 'stock will disappear']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'QC Release — Unblock Stock (MvT 344)',
        description: 'Vendor requests QC to unblock stock. QC EMEA TPM confirms release. Stock moves from BLCK → Unrestricted.',
        checks: [
          {
            checkName: 'QC Action — BLCK Release',
            transaction: 'QM (QC System)',
            data: {
              material: '9999356301',
              plant: '3550',
              action: 'Unblock stock per vendor request',
              qcAnalyst: 'An Vranckx (QC TPM Lab Analyst Level 3)',
              status: 'Completed — stock released to unrestricted',
              movement: 'MvT 344 (BLCK → Unrestricted)'
            },
            result: 'QC RELEASE COMPLETE',
            resultDetail: 'QC confirms unblock complete. Stock now unrestricted. Ready for vendor transfer.',
            passed: true
          }
        ],
        outcome: 'QC release done. Stock moved to unrestricted. Now proceed with transfer to vendor 10122428.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 2,
        title: 'Execute Same-Plant Transfer — MvT 542/541 to Vendor 10122428',
        description: 'Nayana posts MvT 542 (from current vendor → EXFER) then MvT 541 (EXFER → receiving vendor 10122428) at same plant.',
        migoData: {
          transaction: 'MB11',
          movementType: '542 → 541',
          mvtDescription: 'Same-Plant Transfer — Current Vendor → 10122428 (via EXFER)',
          po: 'N/A',
          poLine: 'N/A',
          material: '9999356301',
          materialDesc: 'CANDLE WAX COMPONENT',
          plant: '3550',
          sloc: 'Unrestricted → EXFER → Vendor 10122428',
          batch: 'Per attachment',
          qty: 'Per QC release qty',
          underConsumption: false,
          postingDate: '2026-07-15',
          reasonCode: 'N/A',
          reasonDesc: 'Same-plant vendor transfer after QC release',
          headerText: 'WI-T2003 542/541 9999356301 → Vendor 10122428',
          referenceDoc: 'WI-T2003'
        },
        postResult: {
          documentNumber: '4900612345 / 4900612346',
          postingStatus: 'Success — 542 + 541 Posted',
          newMB52Unrestricted: 'Stock now under vendor 10122428',
          verified: true
        },
        outcomeStatus: 'success'
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED EXPORT — Merge mail sample scenarios into main lookup
// ═══════════════════════════════════════════════════════════════════════════════

export function getMailAdjustmentScenario(workItemId) {
  return mailAdjustmentScenarios[workItemId] || null;
}

export function getMailTransferScenario(workItemId) {
  return mailTransferScenarios[workItemId] || null;
}

export function getMailScenario(workItemId) {
  return mailAdjustmentScenarios[workItemId] || mailTransferScenarios[workItemId] || asnAndBatchScenarios[workItemId] || null;
}

export function getAllMailScenarioIds() {
  return [...Object.keys(mailAdjustmentScenarios), ...Object.keys(mailTransferScenarios), ...Object.keys(asnAndBatchScenarios)];
}


// ═══════════════════════════════════════════════════════════════════════════════
// ASN REVERSAL & BATCH TRANSFER SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

export const asnAndBatchScenarios = {

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2009: ASN Reversal (Scenario 3) — Full 21-Step Process
  // COSMAX USA → TPM Planner (Dipti Shah) → Inventory Analyst
  // PO 4503271664, Need to reverse ASN to correct PO qty/batch before GR
  // Source: Mail Samples/IA Scenario 3 -- ASN Reversal (NA only)
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2009': {
    scenario: 3,
    scenarioLabel: 'Scenario 3: ASN Reversal — Full Reversal & Recreate',
    workItemId: 'WI-2009',
    type: 'ASN Reversal',
    tpm: 'COSMAX USA',
    plant: '2020',
    material: 'M3HX010000',
    materialDesc: 'MAC PREP+PRIME FIX+ SETTING SPRAY 100ML',
    qty: 2400,
    uom: 'EA',
    region: 'NA',

    incomingEmail: {
      from: 'dishah@estee.com',
      to: 'Jazmin.Garcia@cosmax.com; 300PADCReceivingAppointments@estee.com; Andrea.Guerrero@cosmax.com; Isabela.Pulido@cosmax.com; customerservice@dbke.com; padc-receiving-appointments@estee.com; sutiwari@estee.com; jmay@Estee.com',
      cc: 'Shipping.USA@cosmax.com; supadhya@estee.com',
      date: 'Jul 14, 2026 04:54 PM (EST)',
      subject: 'RE: Need Authorization Number// 4503271664-4503264289',
      body: `Team,

Please perform ASN reversal for PO 4503271664. The consumption was processed with incorrect batch and needs correction before GR at receiving plant.

Details:
• PO: 4503271664
• Material: M3HX010000
• Line: 10
• Qty: 2,400 EA
• Vendor: COSMAX USA
• Issue: Wrong batch selected during portal consumption. Correct batch needs to be applied.

Please reverse the ASN so we can re-process with correct batch.

Thanks,
Dipti Shah
TPM Planner | NA
The Estée Lauder Companies`
    },

    emailThread: [
      { sender: 'Shah, Dipti <dishah@estee.com>', date: 'Jul 14, 2026 04:54 PM', body: "Team,\n\nPlease perform ASN reversal for PO 4503271664. The consumption was processed with incorrect batch and needs correction before GR at receiving plant.\n\nDetails:\n• PO: 4503271664\n• Material: M3HX010000\n• Line: 10\n• Qty: 2,400 EA\n• Vendor: COSMAX USA\n• Issue: Wrong batch selected during portal consumption. Correct batch needs to be applied.\n\nPlease reverse the ASN so we can re-process with correct batch.\n\nThanks,\nDipti Shah\nTPM Planner | NA" },
      { sender: 'Garcia, Jazmin <Jazmin.Garcia@cosmax.com>', date: 'Jul 13, 2026', body: "Hi Dipti,\n\nWe need an authorization number for PO 4503271664 and 4503264289. The shipment is ready at our dock but the consumption was processed under wrong batch B2026061201 instead of B2026070301.\n\nPlease advise.\n\nJazmin Garcia\nCOSMAX USA" }
    ],

    nlpExtraction: {
      material: 'M3HX010000',
      po: '4503271664',
      poLine: '10',
      qty: '2400 EA',
      vendor: 'COSMAX USA',
      plant: '2020',
      wrongBatch: 'B2026061201',
      correctBatch: 'B2026070301',
      classification: 'Scenario 3: ASN Reversal (NA)',
      confidence: '96%',
      keywords: ['ASN reversal', 'wrong batch', 'authorization number', 'reverse']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Step 1-2: Confirm ASN Created & STO Auto-Generated',
        description: 'TPM consumed in Supplier Portal → ASN created → SAP executed GR on PO → STO auto-created → Delivery + PGI posted. Now need to reverse everything.',
        checks: [
          {
            checkName: 'ME23N — Confirm ASN Exists (Confirmation Tab)',
            transaction: 'ME23N',
            data: {
              po: '4503271664',
              line: '10',
              material: 'M3HX010000',
              materialDesc: 'MAC PREP+PRIME FIX+ SETTING SPRAY 100ML',
              qty: '2,400 EA',
              confirmationTab: 'ASN exists — Inbound Delivery created',
              asnDelivery: '1800456789',
              grStatus: 'GR posted on PO (Purchase Order History)',
              wrongBatch: 'B2026061201',
              correctBatch: 'B2026070301'
            },
            result: 'ASN CONFIRMED — GR POSTED',
            resultDetail: 'ASN (Inbound Delivery 1800456789) exists. GR already posted on PO. STO was auto-created.',
            passed: true
          }
        ],
        outcome: 'ASN confirmed in ME23N Confirmation Tab. GR posted. STO auto-created. Full reversal chain required.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Step 3-4: Check GR at Receiving Plant & Confirm No GR on STO',
        description: 'Before reversing, check if receiving plant (DC/WH) has already performed GR on the STO. If GR done at DC, DC must reverse first.',
        checks: [
          {
            checkName: 'ZMRGT 4235_INTER_COMP — STO Status Check',
            transaction: 'ZMRGT 4235_INTER_COMP',
            data: {
              po: '4503271664',
              stoNumber: '4300892345',
              stoDelivery: '8000892345',
              pgiStatus: 'Posted (MvT 641)',
              receivingPlant: 'PADC (Plant 1090)',
              grAtReceivingPlant: 'NOT DONE ✓',
              status: 'Safe to proceed — DC has not performed GR'
            },
            result: 'GR NOT DONE AT DC ✓',
            resultDetail: 'STO 4300892345 identified. PGI done but GR at receiving plant (PADC 1090) NOT yet performed. Safe to reverse ASN.',
            passed: true
          }
        ],
        outcome: 'GR not done at receiving plant. Can proceed with ASN reversal without DC involvement.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 3,
        title: 'Step 5-8: Reverse PGI (VL09) & Delete Inbound Delivery (VL33N)',
        description: 'Begin reversal chain: (1) Reverse PGI using delivery number in VL09, (2) Delete inbound delivery (ASN) via VL33N.',
        checks: [
          {
            checkName: 'VL09 — Reverse PGI',
            transaction: 'VL09',
            data: {
              deliveryNumber: '8000892345',
              sto: '4300892345',
              movementType: '642 (Reversal of 641 PGI)',
              qty: '2,400 EA',
              material: 'M3HX010000',
              status: 'PGI Reversed ✓'
            },
            result: 'PGI REVERSED',
            resultDetail: 'PGI reversed via VL09. MvT 642 posted. Stock returned to sending plant.',
            passed: true
          },
          {
            checkName: 'VL33N — Delete STO Inbound Delivery',
            transaction: 'VL33N',
            data: {
              deliveryNumber: '8000892345',
              sto: '4300892345',
              action: 'Delete inbound delivery',
              status: 'Deleted ✓'
            },
            result: 'DELIVERY DELETED',
            resultDetail: 'STO inbound delivery 8000892345 deleted via VL33N.',
            passed: true
          }
        ],
        outcome: 'PGI reversed (VL09) and STO delivery deleted (VL33N). Continuing reversal chain.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 4,
        title: 'Step 9-12: Delete STO Delivery (VL02N), Delete STO (ME22N)',
        description: 'Continue reversal: Delete the outbound delivery in VL02N, then delete the STO itself in ME22N.',
        checks: [
          {
            checkName: 'VL02N — Delete Delivery Number',
            transaction: 'VL02N',
            data: {
              deliveryNumber: '8000892345',
              action: 'Delete delivery document',
              status: 'Deleted ✓'
            },
            result: 'DELIVERY DOC DELETED',
            resultDetail: 'Delivery document deleted in VL02N. STO no longer has associated delivery.',
            passed: true
          },
          {
            checkName: 'ME22N — Delete STO',
            transaction: 'ME22N',
            data: {
              sto: '4300892345',
              action: 'Delete STO (set deletion flag & save)',
              relatedPO: '4503271664',
              status: 'STO Deleted ✓'
            },
            result: 'STO DELETED',
            resultDetail: 'STO 4300892345 deleted in ME22N. No longer linked to PO.',
            passed: true
          }
        ],
        outcome: 'STO delivery and STO document both deleted. Now reverse the PO GR.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 5,
        title: 'Step 13-14: Reverse PO GR (MIGO A03) & Delete PO ASN',
        description: 'Reverse the Goods Receipt on the PO line using MIGO A03 (Cancellation). Then delete the inbound delivery (ASN) from PO Confirmation Tab.',
        checks: [
          {
            checkName: 'MIGO A03 — Reverse PO Goods Receipt',
            transaction: 'MIGO',
            data: {
              action: 'A03 — Cancel Material Document',
              po: '4503271664',
              line: '10',
              material: 'M3HX010000',
              qty: '2,400 EA',
              originalMvt: '101 (GR)',
              reversalMvt: '102 (GR Reversal)',
              materialDoc: '5000456789',
              reversalDoc: '5000456790',
              status: 'GR Reversed ✓'
            },
            result: 'PO GR REVERSED',
            resultDetail: 'MIGO A03 posted. Material document 5000456789 cancelled. Reversal doc 5000456790 created. PO line open again.',
            passed: true
          },
          {
            checkName: 'ME23N — Delete ASN from Confirmation Tab',
            transaction: 'ME23N',
            data: {
              po: '4503271664',
              confirmationTab: 'ASN (Inbound Delivery 1800456789)',
              action: 'Delete ASN entry',
              status: 'ASN Deleted from PO ✓'
            },
            result: 'ASN REMOVED FROM PO',
            resultDetail: 'Inbound delivery 1800456789 removed from PO Confirmation Tab. PO is now clean — ready for new ASN.',
            passed: true
          }
        ],
        outcome: 'Full reversal complete. PO GR reversed, ASN deleted. PO line is now open and clean.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 6,
        title: 'Step 15-17: Reconfirm Status & Recreate ASN (VL31N)',
        description: 'Refresh PO to confirm clean state. Then recreate ASN with correct batch B2026070301 using VL31N. Share confirmation.',
        checks: [
          {
            checkName: 'ME23N — Reconfirm PO Status (Post-Reversal)',
            transaction: 'ME23N',
            data: {
              po: '4503271664',
              line: '10',
              confirmationTab: 'EMPTY — No ASN',
              purchaseOrderHistory: 'GR reversed (102)',
              openQty: '2,400 EA',
              status: 'PO Clean — Ready for new ASN ✓'
            },
            result: 'PO CONFIRMED CLEAN',
            resultDetail: 'PO refreshed. No ASN, no GR, open qty = 2,400 EA. Ready for recreation.',
            passed: true
          },
          {
            checkName: 'VL31N — Recreate ASN with Correct Batch',
            transaction: 'VL31N',
            data: {
              po: '4503271664',
              line: '10',
              material: 'M3HX010000',
              qty: '2,400 EA',
              correctBatch: 'B2026070301',
              newASN: '1800456800',
              newSTO: '4300892400 (auto-created)',
              status: 'ASN Recreated ✓'
            },
            result: 'NEW ASN CREATED',
            resultDetail: 'New ASN 1800456800 created via VL31N with correct batch B2026070301. New STO 4300892400 auto-generated.',
            passed: true
          }
        ],
        outcome: 'ASN recreated with correct batch. New STO auto-generated. Process complete.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 7,
        title: 'Step 18-21: Confirmation Email to Planner',
        description: 'SynOps auto-generates confirmation email to TPM Planner (Dipti Shah) with reversal summary and new ASN/STO details.',
        emailData: {
          to: 'dishah@estee.com; Jazmin.Garcia@cosmax.com',
          cc: 'sutiwari@estee.com; jmay@Estee.com; 300PADCReceivingAppointments@estee.com',
          subject: 'CONFIRMED: ASN Reversal & Recreation — PO 4503271664 — Material M3HX010000',
          body: `Dear Dipti / COSMAX Team,

ASN Reversal has been completed successfully for PO 4503271664:

REVERSAL SUMMARY:
• PO: 4503271664 / Line 10
• Material: M3HX010000 — MAC PREP+PRIME FIX+ SETTING SPRAY 100ML
• Qty: 2,400 EA
• Old (wrong) batch: B2026061201 — REVERSED
• Original ASN: 1800456789 — DELETED
• Original STO: 4300892345 — DELETED
• PGI: Reversed (VL09)
• PO GR: Reversed (MIGO A03, Doc# 5000456790)

RECREATION:
• New ASN: 1800456800 (VL31N)
• Correct Batch: B2026070301
• New STO: 4300892400 (auto-created)
• Status: Ready for PGI and shipment to PADC

COSMAX: Please re-process consumption with correct batch B2026070301 in the portal.
PADC: New STO 4300892400 will be created for GR at your end.

Please confirm when ready to proceed with shipment.

Best regards,
Sunand Tiwari
NA TPM Inventory Analyst
The Estée Lauder Companies`
        },
        outcome: 'Confirmation sent. ASN reversed and recreated with correct batch. Work item closed.',
        outcomeStatus: 'success'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WI-2010: Batch Transfer (Scenario 5) — MIGO A08 Batch Swap
  // Arcade Beauty (NA) → TPM Planner → Inventory Analyst
  // Wrong batch picked during GR, need to swap batch in SAP
  // ─────────────────────────────────────────────────────────────────────────────
  'WI-2010': {
    scenario: 4,
    scenarioLabel: 'Scenario 4: Batch Transfer — Wrong Batch During GR (MIGO A08)',
    workItemId: 'WI-2010',
    type: 'Batch Transfer',
    tpm: 'Arcade Beauty',
    plant: '2020',
    material: 'J1KP010163',
    materialDesc: 'LE LABO ANOTHER 13 EDP BASE LABEL',
    qty: 1800,
    uom: 'EA',
    region: 'NA',

    incomingEmail: {
      from: 'nicole.herron@arcadebeauty.com',
      to: 'sutiwari@estee.com; jmay@Estee.com',
      cc: 'sfairhur@estee.com; kpriyada@estee.com; juan.castrillon@arcadebeauty.com',
      date: 'Jul 18, 2026 09:20 AM (EST)',
      subject: 'Batch Correction Required — PO 4503298670 — Material J1KP010163',
      body: `Hi Sunand,

We need a batch correction for the following material:

PO: 4503298670
Material: J1KP010163 — LE LABO ANOTHER 13 EDP BASE LABEL
Plant: 2020
Line: 10
Quantity: 1,800 EA

Issue:
During GR processing on Jul 15, the wrong batch was auto-selected from the ASN. 

Wrong batch in SAP: B2026060501 (Exp: Dec 2026)
Correct batch (physical): B2026071001 (Exp: Mar 2027)

We received production batch B2026071001 but the system picked B2026060501 from the prior delivery. This needs to be corrected for proper shelf-life tracking and traceability.

Batch-wise data:
• B2026060501: 0 EA physical (this batch was fully consumed last week)
• B2026071001: 1,800 EA physical (current stock on shelf)

Please process the batch swap.

Thanks,
Nicole Herron
Warehouse Operations Manager
Arcade Beauty — Dayton, OH`
    },

    emailThread: [
      { sender: 'Herron, Nicole <nicole.herron@arcadebeauty.com>', date: 'Jul 18, 2026 09:20 AM', body: "Hi Sunand,\n\nWe need a batch correction for the following material:\n\nPO: 4503298670\nMaterial: J1KP010163 — LE LABO ANOTHER 13 EDP BASE LABEL\nPlant: 2020 | Line: 10 | Quantity: 1,800 EA\n\nIssue:\nDuring GR processing on Jul 15, the wrong batch was auto-selected from the ASN.\n\nWrong batch in SAP: B2026060501 (Exp: Dec 2026)\nCorrect batch (physical): B2026071001 (Exp: Mar 2027)\n\nBatch-wise data:\n• B2026060501: 0 EA physical (fully consumed last week)\n• B2026071001: 1,800 EA physical (current stock on shelf)\n\nPlease process the batch swap.\n\nThanks,\nNicole Herron\nArcade Beauty — Dayton, OH" },
      { sender: 'Fairhurst, Susan <sfairhur@estee.com>', date: 'Jul 18, 2026 10:05 AM', body: "Sunand — please process this batch swap for Arcade.\n\nSusan Fairhurst\nNA TPM Planner" }
    ],

    nlpExtraction: {
      material: 'J1KP010163',
      po: '4503298670',
      poLine: '10',
      qty: '1800 EA',
      vendor: 'Arcade Beauty',
      plant: '2020',
      wrongBatch: 'B2026060501',
      correctBatch: 'B2026071001',
      wrongBatchExpiry: 'Dec 2026',
      correctBatchExpiry: 'Mar 2027',
      classification: 'Scenario 5: Batch Transfer (MIGO A08)',
      confidence: '97%',
      keywords: ['batch correction', 'wrong batch', 'auto-selected', 'shelf-life', 'traceability']
    },

    steps: [
      {
        stepNumber: 1,
        title: 'Step 1-2: Receive & Parse Batch Mismatch Request',
        description: 'TPM vendor (Arcade Beauty) sends email reporting batch mismatch. Email contains both actual batch data and batch-wise quantities. SynOps extracts fields.',
        checks: [
          {
            checkName: 'NLP Extraction — Batch Mismatch Details',
            transaction: 'NLP Engine',
            data: {
              material: 'J1KP010163',
              po: '4503298670',
              line: '10',
              qty: '1,800 EA',
              wrongBatch: 'B2026060501 (Exp: Dec 2026)',
              correctBatch: 'B2026071001 (Exp: Mar 2027)',
              vendor: 'Arcade Beauty (Dayton, OH)',
              plant: '2020',
              reason: 'Wrong batch auto-selected during GR from ASN',
              batchDataProvided: 'YES — both actual and incorrect batches with quantities',
              classification: 'Batch Transfer (MIGO A08)'
            },
            result: 'BATCH MISMATCH IDENTIFIED',
            resultDetail: 'Request parsed. Wrong batch B2026060501 in SAP, correct physical batch is B2026071001. All fields present for swap.',
            passed: true
          }
        ],
        outcome: 'Batch mismatch confirmed from email. Wrong batch in SAP vs correct physical batch. Proceeding to stock validation.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 2,
        title: 'Step 3-4: Check Qty in MB52 — Validate Stock Under Wrong Batch',
        description: 'SynOps queries MB52 to confirm 1,800 EA exists under wrong batch B2026060501. Validates total unrestricted qty.',
        checks: [
          {
            checkName: 'MB52 — Stock by Batch (Plant 2020, Material J1KP010163)',
            transaction: 'MB52',
            data: {
              material: 'J1KP010163',
              plant: '2020',
              batch_B2026060501: '1,800 EA (Unrestricted) — WRONG BATCH IN SAP',
              batch_B2026071001: '0 EA — CORRECT BATCH NOT YET IN SAP',
              totalUnrestricted: '1,800 EA',
              blocked: '0 EA',
              qi: '0 EA',
              vendorPhysical: 'B2026071001: 1,800 EA on shelf'
            },
            result: 'STOCK CONFIRMED UNDER WRONG BATCH',
            resultDetail: 'MB52 shows 1,800 EA under batch B2026060501. Physical stock is actually B2026071001. Swap required.',
            passed: true
          },
          {
            checkName: 'Value Calculation — Approval Check',
            transaction: 'System',
            data: {
              qty: '1,800 EA',
              standardPrice: '$2.85 per EA',
              totalValue: '$5,130.00',
              threshold_NA: '$3,000',
              approvalRequired: 'YES — Value > $3K',
              approver: 'Manager (Eric Simmons)'
            },
            result: 'APPROVAL REQUIRED',
            resultDetail: 'Batch swap value = $5,130 exceeds $3K NA threshold. Manager approval needed before posting.',
            passed: true
          }
        ],
        outcome: 'Stock of 1,800 EA confirmed under wrong batch. Value $5,130 > $3K threshold. Approval required.',
        outcomeStatus: 'warning'
      },
      {
        stepNumber: 3,
        title: 'Step 5: Obtain Approval — Manager (Value > $3K)',
        description: 'Batch swap value ($5,130) exceeds $3K threshold. SynOps auto-sends approval request to Manager.',
        checks: [
          {
            checkName: 'Approval Request — Manager',
            transaction: 'System (Approval Workflow)',
            data: {
              approver: 'Eric Simmons (Manager, NA TPM)',
              value: '$5,130.00',
              threshold: '$3,000 (NA)',
              requestSent: 'Jul 18, 2026 10:15 AM',
              approvalReceived: 'Jul 18, 2026 11:02 AM',
              approvalRef: 'Email approval — "Approved. Proceed with batch swap. -Eric"'
            },
            result: 'APPROVED ✓',
            resultDetail: 'Manager (Eric Simmons) approved batch swap via email at 11:02 AM. Proceed with MIGO A08.',
            passed: true
          }
        ],
        outcome: 'Approval received from Eric Simmons. Saved for records. Proceed with batch swap posting.',
        outcomeStatus: 'success'
      },
      {
        stepNumber: 4,
        title: 'Step 6: Execute Batch Swap — MIGO A08 Transfer Posting',
        description: 'Post batch transfer using MIGO A08: Transfer 1,800 EA from wrong batch (B2026060501) to correct batch (B2026071001) within same plant.',
        migoData: {
          transaction: 'MIGO',
          movementType: 'A08 — Transfer Posting',
          mvtDescription: 'Batch-to-Batch Transfer (Same Plant, Same Material)',
          po: '4503298670 (Reference)',
          poLine: '10',
          material: 'J1KP010163',
          materialDesc: 'LE LABO ANOTHER 13 EDP BASE LABEL',
          plant: '2020',
          sloc: 'MRP Area',
          batch: 'FROM: B2026060501 → TO: B2026071001',
          qty: '1,800 EA',
          underConsumption: false,
          postingDate: '2026-07-18',
          reasonCode: '301',
          reasonDesc: 'Batch correction — wrong batch auto-selected during GR',
          headerText: 'WI-2010 Batch swap J1KP010163 B2026060501→B2026071001 Arcade',
          referenceDoc: 'WI-2010 / Approval: Eric Simmons Jul 18'
        },
        postResult: {
          documentNumber: '4900678123',
          postingStatus: 'Success',
          newMB52: 'B2026060501: 0 EA | B2026071001: 1,800 EA',
          verified: true
        },
        outcomeStatus: 'success'
      },
      {
        stepNumber: 5,
        title: 'Step 7: Confirmation Email to TPM Vendor',
        description: 'SynOps auto-generates confirmation email to Arcade Beauty and Planner confirming batch swap is done.',
        emailData: {
          to: 'nicole.herron@arcadebeauty.com; juan.castrillon@arcadebeauty.com',
          cc: 'sfairhur@estee.com; sutiwari@estee.com; jmay@Estee.com',
          subject: 'CONFIRMED: Batch Swap Complete — PO 4503298670 — Material J1KP010163',
          body: `Dear Nicole / Arcade Team,

The batch swap has been completed for PO 4503298670:

Material: J1KP010163 — LE LABO ANOTHER 13 EDP BASE LABEL
Plant: 2020
Quantity: 1,800 EA

Batch Correction:
• Old (wrong) batch: B2026060501 (Exp: Dec 2026) → NOW 0 EA
• New (correct) batch: B2026071001 (Exp: Mar 2027) → NOW 1,800 EA

Transaction: MIGO A08 Transfer Posting
SAP Document: 4900678123
Posting Date: Jul 18, 2026
Approval: Eric Simmons (Manager) — Jul 18

SAP now reflects the correct physical batch (B2026071001) for shelf-life tracking and traceability.

Please confirm this aligns with your physical inventory.

Best regards,
Sunand Tiwari
NA TPM Inventory Analyst
The Estée Lauder Companies`
        },
        outcome: 'Batch swap confirmed. SAP aligned with physical batch. Work item closed.',
        outcomeStatus: 'success'
      }
    ]
  }
};

// Add to combined lookup
export function getAsnOrBatchScenario(workItemId) {
  return asnAndBatchScenarios[workItemId] || null;
}
