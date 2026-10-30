const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
  const target=fs.existsSync(file)&&fs.statSync(file).isFile()?file:!path.extname(pathname)?path.join(root,'index.html'):null;
  if(!target){res.writeHead(404);return res.end('Not found');}
  const type={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'}[path.extname(target)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':type,'X-Robots-Tag':'noindex, nofollow'});fs.createReadStream(target).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('LFG: http://127.0.0.1:4173'));
