import React from 'react';
export default function SybilScoreCard({report}) {
  if(!report) return <div className="card">No report</div>;
  return (
    <div className="card">
      <h3 className="text-lg font-bold">Sybil Risk</h3>
      <div className="mt-2">
        <div className="text-3xl font-bold">{report.score}</div>
        <div className="text-sm">{report.riskLevel}</div>
        <div className="text-xs text-gray-300 mt-2">Funding: {report.findings?.fundingSource || '-'}</div>
      </div>
    </div>
  );
}
