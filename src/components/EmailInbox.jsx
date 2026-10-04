import { useState } from 'react';
import { emails } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import RequestMoreInfo from './RequestMoreInfo';

export default function EmailInbox() {
  const { showToast } = useToast();
  const [selectedEmail, setSelectedEmail] = useState(emails[0]);
  const [showRequestInfo, setShowRequestInfo] = useState(false);

  const getStatusClass = (status) => {
    if (status === 'New') return 'status-new';
    if (status === 'Parsed') return 'status-progress';
    return 'status-completed';
  };

  return (
    <div className="email-layout">
      <div className="email-list">
        {emails.map(email => (
          <div
            key={email.id}
            className={`email-item ${selectedEmail?.id === email.id ? 'active' : ''}`}
            onClick={() => setSelectedEmail(email)}
          >
            <div className="sender">{email.sender}</div>
            <div className="subject">{email.subject}</div>
            <div className="meta">
              <span className={`status-badge ${getStatusClass(email.status)}`}>{email.status}</span>
              <span>{email.date}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="email-detail">
        {selectedEmail ? (
          <>
            <h3>{selectedEmail.subject}</h3>
            <p style={{ fontSize: '12px', color: '#666' }}>
              From: {selectedEmail.sender} | {selectedEmail.date}
            </p>
            <div className="email-body">{selectedEmail.body}</div>
            <div className="nlp-panel">
              <h4>🤖 NLP Extraction Results</h4>
              <table className="nlp-table">
                <tbody>
                  <tr><td>Material #</td><td>{selectedEmail.nlp.material}</td></tr>
                  <tr><td>Quantity</td><td>{selectedEmail.nlp.qty}</td></tr>
                  <tr><td>Vendor</td><td>{selectedEmail.nlp.vendor}</td></tr>
                  <tr><td>PO / Reference</td><td>{selectedEmail.nlp.po}</td></tr>
                  <tr><td>Classification</td><td><strong>{selectedEmail.nlp.classification}</strong></td></tr>
                  <tr><td>Confidence</td><td>
                    <span className={`confidence ${parseInt(selectedEmail.nlp.confidence) >= 90 ? 'conf-high' : 'conf-med'}`}>
                      {selectedEmail.nlp.confidence}
                    </span>
                  </td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-success" onClick={() => showToast('Classification accepted — Work item created')}>Accept Classification</button>
              <button className="btn btn-secondary" onClick={() => showToast('Override mode enabled')}>Override Classification</button>
              <button className="btn btn-info" onClick={() => setShowRequestInfo(true)}>Request More Info</button>
              <button className="btn btn-primary" onClick={() => showToast('Email assigned to Work Queue')}>Assign to Queue</button>
            </div>
          </>
        ) : (
          <p style={{ color: '#999', textAlign: 'center', marginTop: '100px' }}>Select an email to view details</p>
        )}
      </div>
      {showRequestInfo && selectedEmail && <RequestMoreInfo email={selectedEmail} onClose={() => setShowRequestInfo(false)} />}
    </div>
  );
}
