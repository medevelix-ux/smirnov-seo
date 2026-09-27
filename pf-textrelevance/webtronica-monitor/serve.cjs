const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'..','webtronica-monitor.html');
http.createServer((req,res)=>{
  if(req.url==='/'||req.url==='/webtronica-monitor.html'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  }else{res.writeHead(404);res.end('Not found');}
}).listen(8787,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:8787'));
