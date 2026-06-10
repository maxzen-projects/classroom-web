import React, { useState } from 'react';
import BillingFeeStructureManager from '../components/BillingFeeStructureManager';
import BillingExtraFeeManager from '../components/BillingExtraFeeManager';
import BillingAnalyticsDashboard from '../components/BillingAnalyticsDashboard';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="bg-bg p-6 text-text theme-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-4">Fee Management</h1>
        
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-border">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('fee-structures')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'fee-structures'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Fee Structures
          </button>
          <button
            onClick={() => setActiveTab('extra-fees')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'extra-fees'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Extra Fees
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'analytics' && <BillingAnalyticsDashboard />}
        {activeTab === 'fee-structures' && <BillingFeeStructureManager />}
        {activeTab === 'extra-fees' && <BillingExtraFeeManager />}
      </div>
    </div>
  );
};

export default FeeManagement;
