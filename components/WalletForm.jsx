import React from 'react';
export default function WalletForm({address,setAddress,onAnalyze,loading}) {
  return (
    <div className="card">
      <div className="flex gap-2">
        <input className="flex-1 p-2 rounded bg-[#021023] border border-gray-700" placeholder="0x..." value={address} onChange={e=>setAddress(e.target.value)} />
        <button className="btn bg-gradient-to-r from-purple-500 to-blue-400 text-black" onClick={onAnalyze} disabled={loading}>
          {loading? 'Menganalisis...' : 'Analyze'}
        </button>
      </div>
    </div>
  );
}
