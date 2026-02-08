import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { apiGet, apiPost } from '../../services/api';

export default function AddDomainModal({ isOpen, onClose, onAddDomain }) {
  const [inputs, setInputs] = useState(['']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  const handleBulkAdd = async () => {
    const domains = inputs
      .map((d) => d.trim())
      .filter((d) => d.length > 0 && d.includes('.'));

    if (domains.length === 0) {
      alert('Please enter at least one valid domain.');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    setProgress(0);

    let completed = 0;

    for (const domainName of domains) {
      setLogs((prev) => [...prev, { name: domainName, status: 'Testing...', type: 'loading' }]);

      try {
        const whoisRes = await apiGet(`/api/whois/${domainName}`);
        const data = whoisRes.data;

        if (data.status !== 1 || data.domain_registered === 'no') {
          throw new Error(
            data.domain_registered === 'no' ? 'Available (Not Registered)' : 'Invalid/Fetch Error'
          );
        }

        const newDomain = {
          name: domainName,
          created_date: data.create_date || 'N/A',
          expiry_date: data.expiry_date || 'N/A',
          status: data.domain_status && data.domain_status.length > 0 ? 'Active' : 'Unknown',
          registrar: data.registrar && data.registrar.name ? data.registrar.name : 'Unknown',
          fullDetails: data,
        };

        const saveRes = await apiPost('/api/domains', newDomain);

        if (!saveRes.ok) throw new Error('Database Save Failed');

        onAddDomain({
          ...newDomain,
          id: saveRes.data.id,
          created: newDomain.created_date,
          expires: newDomain.expiry_date,
        });

        setLogs((prev) =>
          prev.map((l) =>
            l.name === domainName
              ? { name: domainName, status: 'Added successfully', type: 'success' }
              : l
          )
        );
      } catch (err) {
        setLogs((prev) =>
          prev.map((l) =>
            l.name === domainName
              ? { name: domainName, status: err.message, type: 'error' }
              : l
          )
        );
      }

      completed++;
      setProgress((completed / domains.length) * 100);
    }

    setIsProcessing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Domains</h3>
          <button className="close-btn" onClick={onClose}>
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!isProcessing && logs.length === 0 ? (
            <>
              <div className="input-list">
                {inputs.map((val, idx) => (
                  <div key={idx} className="input-row">
                    <input
                      className="modal-input"
                      placeholder="example.com"
                      value={val}
                      autoFocus={idx === inputs.length - 1}
                      onChange={(e) => updateInput(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && idx === inputs.length - 1) addInput();
                      }}
                    />
                    {inputs.length > 1 && (
                      <button className="icon-btn" onClick={() => removeInput(idx)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {inputs.length < 5 && (
                <button className="add-input-btn" onClick={addInput}>
                  <Plus size={16} /> Add Another Domain
                </button>
              )}
              <p
                className="input-hint"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                  textAlign: 'center',
                }}
              >
                Max 5 domains at a time
              </p>
            </>
          ) : (
            <div className="progress-section">
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="status-list">
                {logs.map((log, idx) => (
                  <div key={idx} className="status-item">
                    <span style={{ fontWeight: 500 }}>{log.name}</span>
                    <span
                      className={
                        log.type === 'success'
                          ? 'status-success'
                          : log.type === 'error'
                          ? 'status-error'
                          : 'status-loading'
                      }
                    >
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="modal-footer"
          style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}
        >
          <button className="secondary-button" onClick={onClose} disabled={isProcessing}>
            Close
          </button>
          {!isProcessing && logs.length === 0 && (
            <button
              className="primary-btn"
              onClick={handleBulkAdd}
              style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            >
              Add Domains
            </button>
          )}
          {!isProcessing && logs.length > 0 && (
            <button
              className="primary-btn"
              onClick={() => {
                setLogs([]);
                setInputs(['']);
              }}
              style={{ width: 'auto' }}
            >
              Add More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
