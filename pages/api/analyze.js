import fetch from 'node-fetch';
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  try{
    const { address } = req.body;
    if(!address) return res.status(400).json({error:'address required'});
    const EXPLORER_API_BASE = process.env.EXPLORER_API_BASE;
    const EXPLORER_API_KEY = process.env.EXPLORER_API_KEY || '';
    if(!EXPLORER_API_BASE) return res.status(500).json({error:'EXPLORER_API_BASE not configured'});
    const params = new URLSearchParams({ module:'account', action:'txlist', address, startblock:'0', endblock:'99999999', page:'1', offset:'200', sort:'desc', apikey: EXPLORER_API_KEY });
    const apiUrl = `${EXPLORER_API_BASE}?${params.toString()}`;
    const r = await fetch(apiUrl);
    if(!r.ok) return res.status(502).json({error:'Explorer fetch failed'});
    const json = await r.json();
    const txs = Array.isArray(json.result)? json.result : (json.txs || json.transactions || []);
    // Basic heuristics (simplified)
    const timestamps = txs.map(t => Number(t.timeStamp || t.timestamp || 0)).filter(Boolean);
    const newest = timestamps.length? Math.max(...timestamps): 0;
    const oldest = timestamps.length? Math.min(...timestamps): 0;
    const ageDays = newest && oldest ? Math.round((newest-oldest)/(24*3600)) : 0;
    const inbound = txs.slice().reverse().find(t => (t.to||'').toLowerCase() === address.toLowerCase());
    let fundingSource = 'unknown';
    if(inbound){
      const from = (inbound.from||'').toLowerCase();
      if(from.includes('wormhole')) fundingSource = 'wormhole/bridge';
      else if(from.includes('faucet')) fundingSource = 'faucet';
      else fundingSource = from;
    }
    const fromCounts = {};
    txs.forEach(t=>{ const f=(t.from||'').toLowerCase(); if(!f) return; fromCounts[f]=(fromCounts[f]||0)+1; });
    const top = Object.entries(fromCounts).sort((a,b)=>b[1]-a[1]);
    const sharedFunder = top.length>0 && top[0][1] >=5;
    const sharedFunderCount = sharedFunder? top[0][1] : 0;
    const kinds = new Set();
    txs.forEach(t=>{ const input=(t.input||'').toLowerCase(); if(input && (input.startsWith('0x38ed1739')|| input.includes('swap'))) kinds.add('swap'); if(input && input.startsWith('0x095ea7b3')) kinds.add('approve'); if(t.to) kinds.add('transfer'); if(input && input.length>10) kinds.add('contract-interact'); });
    const activityDiversity = kinds.size>=3? 'high' : kinds.size===2? 'medium' : kinds.size===1? 'low' : 'none';
    const sorted = timestamps.sort((a,b)=>a-b); let burst=0; for(let i=0;i<sorted.length;i++){ let j=i, count=0; while(j<sorted.length && sorted[j]-sorted[i] <= 3600){ count++; j++; } burst=Math.max(burst,count); }
    const timingPattern = burst>=5? 'clustered' : burst>=3? 'some-cluster' : 'distributed';
    const findings = { fundingSource, sharedFunder, sharedFunderCount, activityDiversity, timingPattern, walletAgeDays: ageDays };
    // compute score
    let score = 0;
    if(['wormhole/bridge','faucet'].includes(fundingSource)) score += 0; else if(fundingSource==='unknown') score += 1; else score += 2;
    if(sharedFunder) score += sharedFunderCount>=10?2:1;
    if(activityDiversity==='high') score += 0; else if(activityDiversity==='medium') score += 1; else score += 2;
    if(timingPattern==='distributed') score += 0; else if(timingPattern==='some-cluster') score += 1; else score += 2;
    if(findings.walletAgeDays >= 14) score += 0; else if(findings.walletAgeDays >= 3) score += 1; else score += 2;
    const riskLevel = score <= 3 ? 'Low' : score <= 6 ? 'Medium' : 'High';
    const recommendations = [];
    if(findings.fundingSource && !['wormhole/bridge','faucet'].includes(findings.fundingSource)) recommendations.push('Pertimbangkan menggunakan bridge resmi (Wormhole) atau faucet resmi.');
    if(findings.sharedFunder) recommendations.push('Hindari satu dompet sebagai sumber funding untuk banyak wallet.');
    if(findings.activityDiversity !== 'high') recommendations.push('Tambahkan variasi on-chain activity.');
    if(findings.timingPattern !== 'distributed') recommendations.push('Sebarkan waktu transaksi antar wallet.');
    if(findings.walletAgeDays < 14) recommendations.push('Perkuat umur akun dengan aktivitas beberapa hari sebelumnya.');
    if(recommendations.length === 0) recommendations.push('Tidak ditemukan masalah besar.');
    return res.status(200).json({ score, riskLevel, findings, recommendations, sampleTxs: txs.slice(0,50) });
  }catch(err){ console.error(err); return res.status(500).json({ error: err.message }); }
}
