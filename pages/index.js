import React, {useState, useRef} from 'react';
import WalletForm from '../components/WalletForm';
import SybilScoreCard from '../components/SybilScoreCard';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';

export default function Home(){
  const [address, setAddress] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const canvasRef = useRef(null);

  async function analyze(){
    if(!address) return alert('Masukkan address');
    setLoading(true); setReport(null);
    try{
      const res = await fetch('/api/analyze', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({address})});
      if(!res.ok) throw new Error('API analyze error');
      const j = await res.json();
      setReport(j);
    }catch(err){ alert(err.message || 'Error'); }
    finally{ setLoading(false); }
  }

  const onLogo = (e)=>{ const f = e.target.files?.[0]; if(f) setLogoFile(f); }

  const drawCard = ()=>{
    if(!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const c = canvasRef.current; const ctx = c.getContext('2d');
    c.width = 1200; c.height = 700;
    ctx.fillStyle = '#07102a'; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#e6f0ff'; ctx.font = 'bold 48px sans-serif'; ctx.fillText('Sybil Risk Score', 60, 120);
    ctx.font = '20px sans-serif'; ctx.fillStyle = '#9aa9c7'; ctx.fillText(address||'no address',60,160);
    const score = report?.score || 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 72px sans-serif'; ctx.fillText(String(score), c.width-300, 240);
    if(logoFile){ const img = new Image(); img.onload = ()=>{ ctx.drawImage(img, c.width-420, c.height-220, 140,140); }; img.src = URL.createObjectURL(logoFile); }
    ctx.fillStyle = '#8b98b4'; ctx.font='14px sans-serif'; ctx.fillText('Generated: '+dayjs().format('YYYY-MM-DD HH:mm'), 60, c.height-80);
    return c;
  }

  const onPreview = ()=>{ const c = drawCard(); const url = c.toDataURL('image/png'); const w = window.open('about:blank'); if(w) w.document.write('<img src="'+url+'" style="max-width:100%"/>'); }

  const onUpload = async ()=>{
    const c = drawCard(); const dataUrl = c.toDataURL('image/png');
    const res = await fetch('/api/upload', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({image: dataUrl})});
    if(!res.ok) return alert('Upload failed');
    const j = await res.json();
    alert('Uploaded to IPFS: ' + j.gateway);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold">Monad Wallet Analyzer</h1>
        <p className="text-sm text-gray-300">Testnet insights • Sybil heuristics • Card generator</p>
      </header>

      <WalletForm address={address} setAddress={setAddress} onAnalyze={analyze} loading={loading} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="md:col-span-2 space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-2">Card generator</h3>
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*" onChange={onLogo} />
              <button className="btn bg-indigo-600" onClick={onPreview}>Preview</button>
              <button className="btn bg-green-600" onClick={onUpload}>Upload to IPFS</button>
            </div>
            <div className="mt-3">
              <pre className="bg-black p-3 rounded">{JSON.stringify(report, null, 2)}</pre>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <SybilScoreCard report={report} />
        </aside>
      </div>
    </div>
  );
}
