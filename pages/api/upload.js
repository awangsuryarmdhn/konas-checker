import { Web3Storage } from 'web3.storage';
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  try{
    const { image } = req.body;
    if(!image) return res.status(400).json({error:'image required'});
    const token = process.env.WEB3STORAGE_TOKEN;
    if(!token) return res.status(500).json({error:'WEB3STORAGE_TOKEN not set'});
    const match = image.match(/^data:(.+);base64,(.+)$/);
    if(!match) return res.status(400).json({error:'invalid image data'});
    const mime = match[1]; const b64 = match[2];
    const buf = Buffer.from(b64, 'base64');
    const fileName = `sybil-card-${Date.now()}.png`;
    // Web3.Storage expects File objects; create a blob-like object
    const file = new Blob([buf]);
    // The web3.storage client accepts File from 'web-streams' implementation; easiest is to use client.put with a File-like array if available
    const client = new Web3Storage({ token });
    // create files in-memory using the web3.storage 'getFilesFromPath' is not needed; use new File constructor in Node 18+ or fallback
    // We'll use the Web3.Storage 'put' with a File-like object if supported
    const files = [new File([buf], fileName, { type: mime })];
    const cid = await client.put(files, { name: fileName });
    const gateway = `https://dweb.link/ipfs/${cid}/${fileName}`;
    return res.status(200).json({ cid, gateway });
  }catch(err){ console.error(err); return res.status(500).json({error: err.message}); }
}
