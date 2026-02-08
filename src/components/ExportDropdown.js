import React, { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { exportToCSV, exportToExcel, parseCSV, parseExcel } from '../utils/exportUtils';

function ExportDropdown({ domains, onImport, showModal, isOpen: externalIsOpen, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);

  const actualIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(domains, showModal);
    handleToggle();
  };

  const handleExportExcel = () => {
    exportToExcel(domains, showModal);
    handleToggle();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      let domains = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        domains = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        domains = await parseExcel(file);
      } else {
        showModal('Invalid File', 'Please upload a CSV or Excel file', 'error');
        return;
      }

      if (domains.length === 0) {
        showModal('Import Failed', 'No valid domains found in file', 'error');
        return;
      }

      onImport(domains);
      handleToggle();
    } catch (err) {
      console.error('Import error:', err);
      showModal('Import Error', 'Failed to import file: ' + err.message, 'error');
    }

    event.target.value = '';
  };

  const triggerFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = handleImport;
    input.click();
  };

  return (
    <div className="export-dropdown-container">
      <button
        className="export-btn"
        onClick={handleToggle}
        aria-label="Export/Import domains"
      >
        <Download size={20} />
      </button>

      {actualIsOpen && (
        <>
          <div className="notification-overlay" onClick={handleToggle}></div>
          <div className="dropdown-menu export-menu">
            <div className="dropdown-header">Import</div>
            <div className="dropdown-item" onClick={triggerFileInput}>
              <Plus size={16} />
              <span>Import from File</span>
            </div>

            {domains && domains.length > 0 && (
              <>
                <div className="dropdown-header" style={{ marginTop: '0.5rem' }}>Export</div>
                <div className="dropdown-item" onClick={handleExportCSV}>
                  <Download size={16} />
                  <span>Export as CSV</span>
                </div>
                <div className="dropdown-item" onClick={handleExportExcel}>
                  <Download size={16} />
                  <span>Export as Excel</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ExportDropdown;
