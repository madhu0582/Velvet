import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { getScenarioData } from '../data/investigationScenarios';
import { getTransferScenario } from '../data/transferScenarios';
import { getMailScenario } from '../data/mailSampleScenarios';

export default function InvestigationPanel({ item }) {
  const scenario = getScenarioData(item.id) || getTransferScenario(item.id) || getMailScenario(item.id);

  if (!scenario) {
    return <DefaultInvestigation item={item} />;
  }

  // Full Sunand-model evidence-gathering investigation (WI-1052)
  if (scenario.investigationV2) {
    return <SunandInvestigation data={scenario.investigationV2} />;
  }

  // Simple step-based scenario (e.g., WI-1052 Scenario 1)
  if (scenario.steps) {
    return <SimpleStepScenario scenario={scenario} />;
  }

  // Full investigation scenario (Steps 4-16)
  return <FullInvestigationScenario scenario={scenario} />;
}

function SimpleStepScenario({ scenario }) {
  return (
    <div style={{ padding: '16px', background: '#f9f5fc', borderRadius: '8px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span className="type-badge type-adjustment">{scenario.type}</span>
        <span style={{ fontSize: '12px', color: '#64748B' }}>
          {scenario.materialDesc} | {scenario.tpm} | Plant {scenario.plant}
        </span>
      </div>

      {scenario.steps.map((step) => (
        <div key={step.stepNumber} className="investigation-section" style={{ marginBottom: '24px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: 'var(--primary-gradient)', color: 'white', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
              {step.stepNumber}
            </span>
            {step.title}
          </h4>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '8px 0 14px 36px' }}>{step.description}</p>

          {/* Validation Checks (Step 1) */}
          {step.checks && step.checks.map((check, i) => (
            <div key={i} style={{ marginLeft: '36px', marginBottom: '14px', background: 'white', borderRadius: '8px', padding: '14px 16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{check.checkName}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: check.passed ? '#047857' : '#DC2626', background: check.passed ? '#D1FAE5' : '#FEE2E2', padding: '3px 10px', borderRadius: '12px' }}>
                  {check.passed ? '✓ ' : '✗ '}{check.result}
                </span>
              </div>
              <table className="inv-table" style={{ marginBottom: '8px' }}>
                <tbody>
                  {Object.entries(check.data).map(([key, val]) => (
                    <tr key={key}>
                      <td style={{ fontWeight: 600, width: '180px', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                      <td style={{ fontWeight: key === 'openQty' || key === 'vendorClaimed' || key === 'unrestricted' ? 700 : 400, color: key === 'openQty' || key === 'vendorClaimed' ? '#7C3AED' : key === 'unrestricted' ? '#10B981' : key === 'blocked' && val !== '0 EA' ? '#DC2626' : 'inherit' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: '12px', color: check.passed ? '#047857' : '#DC2626', fontWeight: 600 }}>{check.resultDetail}</div>
            </div>
          ))}

          {/* Movement History Table (for MB51 steps) */}
          {step.movementHistory && (
            <div style={{ marginLeft: '36px', marginBottom: '14px', background: 'white', borderRadius: '8px', padding: '14px 16px', border: '1px solid var(--border)' }}>
              <table className="inv-table">
                <thead><tr><th>Date</th><th>Movement</th><th>Qty</th><th>Reference</th><th>User</th><th>Status</th></tr></thead>
                <tbody>
                  {step.movementHistory.map((m, i) => (
                    <tr key={i} style={{ background: m.mvt.includes('BLCK') ? '#FEE2E2' : 'transparent' }}>
                      <td>{m.date}</td>
                      <td style={{ fontWeight: 600 }}>{m.mvt}</td>
                      <td style={{ fontWeight: 700, color: m.qty.startsWith('-') ? '#DC2626' : '#10B981' }}>{m.qty}</td>
                      <td>{m.ref}</td>
                      <td>{m.user}</td>
                      <td style={{ color: '#10B981', fontWeight: 600 }}>{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pending Supply Table (for MD04 steps) */}
          {step.pendingSupply && (
            <div style={{ marginLeft: '36px', marginBottom: '14px', background: 'white', borderRadius: '8px', padding: '14px 16px', border: '1px solid #D1FAE5' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#047857', marginBottom: '10px' }}>📦 Pending Supply — Arriving within 14 days</div>
              <table className="inv-table">
                <thead><tr><th>Type</th><th>PO/STO#</th><th>Line</th><th>Qty</th><th>Vendor</th><th>Delivery Date</th><th>Status</th></tr></thead>
                <tbody>
                  {step.pendingSupply.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{s.type}</td>
                      <td style={{ fontWeight: 700 }}>{s.number}</td>
                      <td>{s.line}</td>
                      <td style={{ fontWeight: 700, color: '#047857' }}>{s.qty}</td>
                      <td>{s.vendor}</td>
                      <td style={{ fontWeight: 700, color: '#2563EB' }}>{s.deliveryDate}</td>
                      <td style={{ color: '#047857' }}>{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Email Generation (Step 6 type) */}
          {step.emailData && (
            <div style={{ marginLeft: '36px', marginBottom: '14px' }}>
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                  📧 Auto-Generated Email
                </div>
                <table className="inv-table" style={{ marginBottom: '12px' }}>
                  <tbody>
                    <tr><td style={{ fontWeight: 600, width: '60px' }}>To</td><td>{step.emailData.to}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>CC</td><td>{step.emailData.cc}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Subject</td><td style={{ fontWeight: 700 }}>{step.emailData.subject}</td></tr>
                  </tbody>
                </table>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '14px', fontSize: '12px', lineHeight: '1.7', color: '#475569', whiteSpace: 'pre-wrap', maxHeight: '250px', overflowY: 'auto' }}>
                  {step.emailData.body}
                </div>
              </div>
            </div>
          )}

          {/* Outcome for Step 1 */}
          {step.outcome && !step.migoData && (
            <div className={`validation-box ${step.outcomeStatus === 'success' ? '' : 'warning'}`} style={{ marginLeft: '36px' }}>
              <strong>{step.outcomeStatus === 'success' ? '✓' : '⚠'} Outcome:</strong> {step.outcome}
            </div>
          )}

          {/* MIGO Execution (Step 2) */}
          {step.migoData && (
            <div style={{ marginLeft: '36px' }}>
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--border)', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                  📋 MIGO Pre-Populated Fields
                </div>
                <table className="inv-table">
                  <tbody>
                    <tr><td style={{ fontWeight: 600, width: '180px' }}>Transaction</td><td style={{ fontWeight: 700 }}>{step.migoData.transaction}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Movement Type</td><td style={{ fontWeight: 700 }}>{step.migoData.movementType} — {step.migoData.mvtDescription}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>PO / Line</td><td>{step.migoData.po} / Line {step.migoData.poLine}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Material</td><td>{step.migoData.material} — {step.migoData.materialDesc}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Plant / SLoc</td><td>{step.migoData.plant} / {step.migoData.sloc}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Batch</td><td>{step.migoData.batch}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Quantity</td><td style={{ fontWeight: 700, color: '#DC2626' }}>{step.migoData.qty}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Under-Consumption</td><td>{step.migoData.underConsumption ? '☑ Yes' : '☐ No'}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Posting Date</td><td>{step.migoData.postingDate}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Reason Code</td><td>{step.migoData.reasonCode} — {step.migoData.reasonDesc}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Header Text</td><td>{step.migoData.headerText}</td></tr>
                  </tbody>
                </table>
              </div>

              {step.postResult && (
                <div className="validation-box">
                  <strong>✓ Posted Successfully:</strong> Material Document <strong>{step.postResult.documentNumber}</strong> created. MB52 unrestricted now = <strong>{step.postResult.newMB52Unrestricted}</strong>. SAP aligned with PO records.
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FullInvestigationScenario({ scenario }) {
  return (
    <div style={{ padding: '16px', background: '#f9f5fc', borderRadius: '8px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span className="type-badge type-destruction">
          {scenario.type}
        </span>
        <span style={{ fontSize: '12px', color: '#64748B' }}>
          {scenario.type} | {scenario.tpm} | Plant {scenario.plant}
        </span>
      </div>

      {/* Step 4: Data Lake Query */}
      <StepSection step={4} title="Data Lake Query — MB52 All Stock Statuses">
        <table className="inv-table">
          <thead>
            <tr><th>Unrestricted</th><th>Blocked</th><th>QI</th><th>EXFER</th><th>In-Transit</th><th>SAP Total</th><th>Vendor Declared</th><th>Gap</th></tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 700 }}>{scenario.step4.unrestricted} {scenario.step4.uom}</td>
              <td style={{ color: scenario.step4.blck > 0 ? '#DC2626' : '#64748B', fontWeight: scenario.step4.blck > 0 ? 700 : 400 }}>{scenario.step4.blck} {scenario.step4.uom}</td>
              <td style={{ color: scenario.step4.qi > 0 ? '#D97706' : '#64748B', fontWeight: scenario.step4.qi > 0 ? 700 : 400 }}>{scenario.step4.qi} {scenario.step4.uom}</td>
              <td style={{ color: scenario.step4.exfer > 0 ? '#D97706' : '#64748B', fontWeight: scenario.step4.exfer > 0 ? 700 : 400 }}>{scenario.step4.exfer} {scenario.step4.uom}</td>
              <td style={{ color: scenario.step4.inTransit > 0 ? '#2563EB' : '#64748B', fontWeight: scenario.step4.inTransit > 0 ? 700 : 400 }}>{scenario.step4.inTransit} {scenario.step4.uom}</td>
              <td style={{ fontWeight: 700 }}>{scenario.step4.sapTotal} {scenario.step4.uom}</td>
              <td style={{ fontWeight: 700, color: '#2563EB' }}>{scenario.step4.vendorDeclared} {scenario.step4.uom}</td>
              <td style={{ fontWeight: 700, color: scenario.step4.gap === 0 ? '#10B981' : '#DC2626' }}>{scenario.step4.gap === 0 ? '0 (Match)' : `${scenario.step4.gap > 0 ? '+' : ''}${scenario.step4.gap} ${scenario.step4.uom}`}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>{scenario.step4.gapDescription}</div>
      </StepSection>

      {/* Step 5: PO Data Query */}
      <StepSection step={5} title="PO Data Query — ME23N">
        <table className="inv-table">
          <thead><tr><th>PO Number</th><th>Ordered</th><th>GR/Consumed</th><th>Open Qty</th><th>Vendor Claimed</th></tr></thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>{scenario.step5.po}</td>
              <td>{scenario.step5.ordered} {scenario.step5.uom}</td>
              <td>{scenario.step5.consumed} {scenario.step5.uom}</td>
              <td style={{ fontWeight: 700, color: '#E65100' }}>{scenario.step5.open} {scenario.step5.uom}</td>
              <td style={{ fontWeight: 700, color: '#7C3AED' }}>{scenario.step5.vendorClaimed} {scenario.step5.uom}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>{scenario.step5.description}</div>
      </StepSection>

      {/* Step 6: Compare & Route */}
      <StepSection step={6} title="Compare & Route Decision">
        <div className={`validation-box ${scenario.step6.result === 'MATCH' ? '' : 'warning'}`}>
          <strong>{scenario.step6.result === 'MATCH' ? '✓ MATCH' : '⚠ MISMATCH'}:</strong> {scenario.step6.details}
        </div>
        {scenario.step6.fastPathEligible && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#047857', fontWeight: 600 }}>
            → Scenario 1: Fast-path eligible. Skipping Steps 7-11, proceeding to Step 12.
          </div>
        )}
      </StepSection>

      {/* Steps 7-11: Full Investigation (only for Scenario 2) */}
      {scenario.scenario === 2 && (
        <>
          {scenario.step7 && (
            <StepSection step={7} title="BLCK / In-Transit Trace">
              {scenario.step7.blck > 0 && scenario.step7.blckAnalysis && (
                <table className="inv-table">
                  <tbody>
                    <tr><td style={{ fontWeight: 600, width: '200px' }}>Blocked Qty</td><td style={{ color: '#DC2626', fontWeight: 700 }}>{scenario.step7.blck} {scenario.step4.uom}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Movement Into BLCK</td><td>MvT {scenario.step7.blckAnalysis.movementType} on {scenario.step7.blckAnalysis.postingDate}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Quality Notification</td><td>{scenario.step7.blckAnalysis.qualityNotification}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Source Vendor</td><td>{scenario.step7.blckAnalysis.vendorName} ({scenario.step7.blckAnalysis.sourceVendor})</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Owner TPM</td><td>{scenario.step7.blckAnalysis.ownerTPM}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Root Cause</td><td style={{ color: '#DC2626' }}>{scenario.step7.blckAnalysis.rootCause}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Recommendation</td><td style={{ color: '#047857', fontWeight: 600 }}>{scenario.step7.blckAnalysis.recommendation}</td></tr>
                  </tbody>
                </table>
              )}
              {scenario.step7.exfer > 0 && <div style={{ marginTop: '8px', fontSize: '12px', color: '#D97706' }}>EXFER = {scenario.step7.exfer} {scenario.step4.uom} — analyzed in Step 9</div>}
              {scenario.step7.blck === 0 && scenario.step7.exfer === 0 && <div style={{ fontSize: '12px', color: '#64748B' }}>{scenario.step7.explanation}</div>}
            </StepSection>
          )}

          {scenario.step8 && (
            <StepSection step={8} title="Planned Supply Check — MD04">
              {scenario.step8.plannedSupply.length > 0 ? (
                <table className="inv-table">
                  <thead><tr><th>Type</th><th>Number</th><th>Qty</th><th>Due Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {scenario.step8.plannedSupply.map((s, i) => (
                      <tr key={i}><td>{s.type}</td><td>{s.number}</td><td>{s.qty} {s.uom}</td><td>{s.dueDate}</td><td>{s.status}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <div style={{ fontSize: '12px', color: '#64748B' }}>No planned supply within 14-day horizon.</div>}
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>{scenario.step8.description}</div>
            </StepSection>
          )}

          {scenario.step9 && (
            <StepSection step={9} title="QI / EXFER Analysis">
              {scenario.step9.qiAnalysis && (
                <div className="validation-box warning" style={{ marginBottom: '8px' }}>
                  <strong>🔬 QI Stock:</strong> {scenario.step9.qiAnalysis.autoFlag}
                </div>
              )}
              {scenario.step9.exferAnalysis && (
                <div className="validation-box warning" style={{ marginBottom: '8px' }}>
                  <strong>🔀 EXFER Stock:</strong> {scenario.step9.exferAnalysis.autoFlag}
                </div>
              )}
              {!scenario.step9.qiAnalysis && !scenario.step9.exferAnalysis && (
                <div style={{ fontSize: '12px', color: '#64748B' }}>{scenario.step9.description}</div>
              )}
            </StepSection>
          )}

          {scenario.step10 && (
            <StepSection step={10} title="Consumption Analysis (BOM / 543 Movements)">
              {scenario.step10.movements543?.map((m, i) => (
                <table key={i} className="inv-table" style={{ marginBottom: '8px' }}>
                  <tbody>
                    <tr><td style={{ fontWeight: 600, width: '180px' }}>Movement Type</td><td>{m.movementType}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Quantity</td><td>{m.qty} {scenario.step4.uom}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>FG PO</td><td>{m.fgPO}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Date</td><td>{m.postingDate}</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Finding</td><td style={{ color: '#DC2626' }}>{m.description}</td></tr>
                  </tbody>
                </table>
              ))}
              {scenario.step10.nlpAnalysis && (
                <div style={{ background: '#EDE9FE', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginTop: '8px' }}>
                  <strong>🤖 NLP Analysis:</strong> "{scenario.step10.nlpAnalysis.extractedText}" — Confidence: <span style={{ fontWeight: 700, color: scenario.step10.nlpAnalysis.confidence >= 90 ? '#047857' : '#D97706' }}>{scenario.step10.nlpAnalysis.confidence}%</span>
                </div>
              )}
            </StepSection>
          )}

          {scenario.step11 && (
            <StepSection step={11} title="Variance Confirmation">
              <table className="inv-table">
                <tbody>
                  <tr><td style={{ fontWeight: 600, width: '200px' }}>Genuine Variance</td><td style={{ fontWeight: 700, color: scenario.step11.genuineVariance === 0 ? '#10B981' : '#DC2626' }}>{scenario.step11.genuineVariance} {scenario.step4.uom}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Variance Type</td><td>{scenario.step11.varianceType}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Explanation</td><td>{scenario.step11.gapExplanation}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Resolution</td><td style={{ color: '#047857', fontWeight: 600 }}>{scenario.step11.resolution}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Analyst Confirmed</td><td>{scenario.step11.analystConfirmed ? '✓ Yes' : '⏳ Pending'}</td></tr>
                </tbody>
              </table>
            </StepSection>
          )}
        </>
      )}

      {/* Step 12: Threshold & Approval */}
      <StepSection step={12} title="Value Calculation & Approval Routing">
        <table className="inv-table">
          <tbody>
            <tr><td style={{ fontWeight: 600, width: '200px' }}>Adjustment Qty</td><td>{scenario.step12.qty} {scenario.uom}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Unit Price</td><td>{scenario.step12.currency === 'EUR' ? '€' : '$'}{scenario.step12.unitPrice.toFixed(2)}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Total Value</td><td style={{ fontWeight: 700, fontSize: '14px' }}>{scenario.step12.currency === 'EUR' ? '€' : '$'}{scenario.step12.totalValue.toLocaleString()}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Threshold ({scenario.step12.region})</td><td>{scenario.step12.currency === 'EUR' ? '€' : '$'}{scenario.step12.threshold.toLocaleString()}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Approval</td><td style={{ fontWeight: 700, color: scenario.step12.thresholdExceeded ? '#DC2626' : '#10B981' }}>{scenario.step12.thresholdExceeded ? `⚠ Exceeds threshold → ${scenario.step12.approver}` : '✓ Auto-approved (below threshold)'}</td></tr>
          </tbody>
        </table>
      </StepSection>

      {/* Step 13: MB11 Posting */}
      <StepSection step={13} title={`SAP Posting — ${scenario.step13.transaction} (MvT ${scenario.step13.movementType})`}>
        <table className="inv-table">
          <tbody>
            <tr><td style={{ fontWeight: 600, width: '180px' }}>Transaction</td><td>{scenario.step13.transaction}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Movement Type</td><td style={{ fontWeight: 700 }}>{scenario.step13.movementType} — {scenario.step13.mvtDescription}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Plant</td><td>{scenario.step13.plant}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Material</td><td>{scenario.step13.material}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Batch</td><td>{scenario.step13.batch}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Quantity</td><td style={{ fontWeight: 700, color: '#DC2626' }}>{scenario.step13.qty} {scenario.uom}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Reason Code</td><td>{scenario.step13.reasonCode} — {scenario.step13.reasonDesc}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Header Text</td><td>{scenario.step13.headerText}</td></tr>
          </tbody>
        </table>
        {scenario.step13.options && (
          <div style={{ marginTop: '10px' }}>
            {scenario.step13.options.map((opt, i) => (
              <div key={i} style={{ padding: '8px 12px', background: opt.recommended ? '#D1FAE5' : '#F1F5F9', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                <strong>Option {opt.option}:</strong> {opt.action} {opt.recommended && <span style={{ color: '#047857', fontWeight: 700 }}>(Recommended)</span>}
              </div>
            ))}
          </div>
        )}
      </StepSection>

      {/* Step 14: MIGO */}
      <StepSection step={14} title="MIGO Subsequent Adjustment">
        <table className="inv-table">
          <tbody>
            <tr><td style={{ fontWeight: 600, width: '180px' }}>Transaction</td><td>{scenario.step14.transaction}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>PO Reference</td><td>{scenario.step14.po}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Under-Consumption</td><td>{scenario.step14.underConsumption ? '☑ Yes' : '☐ No'}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Description</td><td>{scenario.step14.description}</td></tr>
          </tbody>
        </table>
      </StepSection>

      {/* Step 15: Post-Verification */}
      <StepSection step={15} title="Post-Verification — MB52 Re-query">
        {scenario.step15.preMB52 && scenario.step15.postMB52 && (
          <table className="inv-table">
            <thead><tr><th></th><th>Unrestricted</th><th>Blocked</th><th>QI</th><th>EXFER</th><th>In-Transit</th><th>Total</th></tr></thead>
            <tbody>
              <tr style={{ color: '#64748B' }}><td style={{ fontWeight: 600 }}>Before</td><td>{scenario.step15.preMB52.unrestricted}</td><td>{scenario.step15.preMB52.blck}</td><td>{scenario.step15.preMB52.qi}</td><td>{scenario.step15.preMB52.exfer}</td><td>{scenario.step15.preMB52.inTransit}</td><td>{scenario.step15.preMB52.total}</td></tr>
              <tr style={{ fontWeight: 700 }}><td style={{ fontWeight: 600 }}>After</td><td style={{ color: '#10B981' }}>{scenario.step15.postMB52.unrestricted}</td><td>{scenario.step15.postMB52.blck}</td><td>{scenario.step15.postMB52.qi}</td><td>{scenario.step15.postMB52.exfer}</td><td>{scenario.step15.postMB52.inTransit}</td><td>{scenario.step15.postMB52.total}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Vendor Physical</td><td colSpan="6" style={{ fontWeight: 700, color: '#2563EB' }}>{scenario.step15.vendorPhysical} {scenario.uom}</td></tr>
            </tbody>
          </table>
        )}
        <div className={`validation-box ${scenario.step15.verified ? '' : 'warning'}`} style={{ marginTop: '10px' }}>
          <strong>{scenario.step15.verified ? '✓ Verified' : '⚠ Pending'}:</strong> {scenario.step15.verificationNote || scenario.step15.warningMessage}
        </div>
      </StepSection>

      {/* Step 16: Auto Email */}
      <StepSection step={16} title="Auto-Confirmation Email">
        <table className="inv-table">
          <tbody>
            <tr><td style={{ fontWeight: 600, width: '140px' }}>Recipients</td><td>{scenario.step16.recipients.join(', ')}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Subject</td><td>{scenario.step16.subject}</td></tr>
            {scenario.step16.documentNumber && <tr><td style={{ fontWeight: 600 }}>Doc Number</td><td style={{ fontWeight: 700 }}>{scenario.step16.documentNumber}</td></tr>}
            {scenario.step16.finalQty && <tr><td style={{ fontWeight: 600 }}>Final SAP Qty</td><td style={{ fontWeight: 700, color: '#10B981' }}>{scenario.step16.finalQty} {scenario.uom}</td></tr>}
          </tbody>
        </table>
        {scenario.step16.emailBody && (
          <div style={{ marginTop: '10px', padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic', color: '#475569' }}>
            "{scenario.step16.emailBody}"
          </div>
        )}
      </StepSection>
    </div>
  );
}

function StepSection({ step, title, children }) {
  return (
    <div className="investigation-section">
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ background: 'var(--primary-gradient)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{step}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}


function SunandInvestigation({ data }) {
  const { showToast } = useToast();
  const rec = data.recommendation;
  const [fields, setFields] = useState(() => (rec ? Object.fromEntries(rec.fields.map(f => [f.key, f.value])) : {}));
  const [posted, setPosted] = useState(false);
  const [docNo, setDocNo] = useState('');
  const handlePost = () => {
    const gen = '49' + Math.floor(10000000 + Math.random() * 89999999);
    setDocNo(gen);
    setPosted(true);
    showToast('WI-1052: MIGO 544 posted in SAP - Material Document ' + gen + ' (' + fields.qty + ' ' + fields.uom + ')');
  };
  const hl = (h) => h === 'good' ? '#047857' : h === 'accent' ? '#7C3AED' : 'inherit';
  const statusChip = (status) => {
    const ok = status === 'PASS';
    return { color: ok ? '#047857' : '#DC2626', background: ok ? '#D1FAE5' : '#FEE2E2', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 };
  };
  return (
    <div style={{ padding: '16px', background: '#f9f5fc', borderRadius: '8px', marginBottom: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span className="type-badge type-adjustment">{data.classification}</span>
        <span style={{ fontSize: '12px', color: '#64748B' }}>{data.request.materialDesc} | {data.request.vendor} | Plant {data.request.plant}</span>
      </div>

      {/* Request summary */}
      <div className="investigation-section">
        <h4>Request (from vendor email)</h4>
        <table className="inv-table"><tbody>
          <tr><td style={{ fontWeight: 600, width: '200px' }}>Material</td><td>{data.request.material} - {data.request.materialDesc}</td></tr>
          <tr><td style={{ fontWeight: 600 }}>PO / Line</td><td>{data.request.po} / {data.request.poLine}</td></tr>
          <tr><td style={{ fontWeight: 600 }}>Batch / Plant</td><td>{data.request.batch} / {data.request.plant}</td></tr>
          <tr><td style={{ fontWeight: 600 }}>Reported Consumption</td><td style={{ fontWeight: 700, color: '#7C3AED' }}>{data.request.reportedQty}</td></tr>
        </tbody></table>
      </div>

      {/* Evidence cards */}
      {data.checks.map((c) => (
        <div key={c.id} className="investigation-section" style={{ marginBottom: '18px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: 'var(--primary-gradient)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{c.id}</span>
            {c.title}
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>({c.transaction})</span>
            <span style={{ marginLeft: 'auto', ...statusChip(c.status) }}>{c.status === 'PASS' ? '\u2713 ' : '\u2717 '}{c.statusLabel}</span>
          </h4>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 12px 34px' }}>{c.purpose}</p>
          <div style={{ marginLeft: '34px', background: 'white', borderRadius: '8px', padding: '14px 16px', border: '1px solid var(--border)' }}>
            {c.rows && (
              <table className="inv-table" style={{ marginBottom: c.finding ? '8px' : 0 }}><tbody>
                {c.rows.map((r, i) => (
                  <tr key={i}><td style={{ fontWeight: 600, width: '220px' }}>{r.label}</td><td style={{ fontWeight: r.highlight ? 700 : 400, color: hl(r.highlight) }}>{r.value}</td></tr>
                ))}
              </tbody></table>
            )}
            {c.movements && (
              <>
                <table className="inv-table" style={{ marginBottom: '8px' }}>
                  <thead><tr><th>Date</th><th>MvT</th><th>Description</th><th>Qty</th><th>Doc#</th><th>User</th></tr></thead>
                  <tbody>
                    {c.movements.map((m, i) => (
                      <tr key={i}>
                        <td>{m.date}</td>
                        <td style={{ fontWeight: 700 }}>{m.mvt}</td>
                        <td>{m.mvtDesc}</td>
                        <td style={{ fontWeight: 700, color: m.qty.includes('-') ? '#DC2626' : '#10B981' }}>{m.qty}</td>
                        <td>{m.doc}</td>
                        <td>{m.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>{c.netConsumedLabel}: <span style={{ color: '#7C3AED' }}>{c.netConsumed}</span></div>
              </>
            )}
            {c.finding && <div style={{ fontSize: '12px', color: c.status === 'PASS' ? '#047857' : '#DC2626', fontWeight: 600 }}>{c.finding}</div>}
          </div>
        </div>
      ))}

      {/* Variance */}
      <div className="investigation-section">
        <h4>Variance</h4>
        <div style={{ marginLeft: '0', background: 'white', borderRadius: '8px', padding: '14px 16px', border: '1px solid var(--border)' }}>
          <table className="inv-table" style={{ marginBottom: '8px' }}><tbody>
            <tr><td style={{ fontWeight: 600, width: '260px' }}>Vendor Actual</td><td>{data.variance.vendorActual}</td></tr>
            {data.variance.poComponentReq && (<tr><td style={{ fontWeight: 600 }}>PO Component Requirement</td><td>{data.variance.poComponentReq}</td></tr>)}
            {data.variance.sapConsumed && (<tr><td style={{ fontWeight: 600 }}>SAP / Reported Consumption</td><td>{data.variance.sapConsumed}</td></tr>)}
            <tr><td style={{ fontWeight: 600 }}>Result</td><td style={{ fontWeight: 700 }}>{data.variance.deltaVsComponent}</td></tr>
          </tbody></table>
          <span style={{ ...statusChip(data.variance.classColor === 'good' ? 'PASS' : 'FAIL') }}>{data.variance.classification}</span>
        </div>
      </div>

      {/* Recommended Adjustment - editable, planner posts */}
      {rec && (
        <div className="investigation-section">
          <h4>Recommended Adjustment (review, edit, then post)</h4>
          <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#6D28D9', marginBottom: '6px' }}>{rec.headline}</div>
            <div style={{ fontSize: '12px', color: '#4C1D95', marginBottom: '12px' }}>{rec.rationale}</div>

            <div style={{ background: 'white', borderRadius: '6px', padding: '14px 16px', border: '1px solid var(--border)', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>MIGO posting fields</div>
              <table className="inv-table"><tbody>
                {rec.fields.map((fld) => (
                  <tr key={fld.key}>
                    <td style={{ fontWeight: 600, width: '220px' }}>{fld.label}</td>
                    <td>
                      {fld.editable && !posted ? (
                        <input
                          value={fields[fld.key]}
                          onChange={(e) => setFields({ ...fields, [fld.key]: e.target.value })}
                          style={{ width: '100%', maxWidth: '420px', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: 700 }}>{fields[fld.key]}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#7C3AED', marginBottom: '14px' }}>{rec.note}</div>

            {!posted ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-success" onClick={handlePost}>Post in SAP</button>
                <button className="btn btn-secondary" onClick={() => showToast(`${data.workItemId}: Recommendation cancelled`)}>Cancel</button>
              </div>
            ) : (
              <div className="validation-box">
                <strong>Posted in SAP:</strong> MIGO Subsequent Adjustment (MvT {fields.movementType}) posted for {fields.qty} {fields.uom} on PO {fields.po}. Material Document <strong>{docNo}</strong> created. Adjustment complete.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function DefaultInvestigation({ item }) {
  return (
    <div style={{ padding: '16px', background: '#f9f5fc', borderRadius: '6px', marginBottom: '12px' }}>
      <div className="investigation-section">
        <h4>MB52 — Stock Overview</h4>
        <table className="inv-table">
          <thead><tr><th>Material</th><th>Plant</th><th>SLoc</th><th>Unrestricted</th><th>Blocked</th><th>In Transit</th></tr></thead>
          <tbody><tr><td>{item.material}</td><td>{item.plant || item.from}</td><td>{item.sloc || 'MRP'}</td><td style={{ color: '#43a047', fontWeight: 600 }}>180 KG</td><td>0</td><td>0</td></tr></tbody>
        </table>
      </div>
      <div className="investigation-section">
        <h4>MB51 — Movement History</h4>
        <table className="inv-table">
          <thead><tr><th>Date</th><th>MvT</th><th>Qty</th><th>PO/Ref</th><th>User</th></tr></thead>
          <tbody>
            <tr><td>Jan 12</td><td>101 (GR)</td><td>+120</td><td>{item.po || '—'}</td><td>SYSTEM</td></tr>
            <tr><td>Jan 10</td><td>601 (Transfer)</td><td>-50</td><td>STO 430288</td><td>C.WANG</td></tr>
          </tbody>
        </table>
      </div>
      <div className="validation-box">
        <strong>✓ Validation:</strong> Standard checks complete. Ready for processing.
      </div>
    </div>
  );
}
