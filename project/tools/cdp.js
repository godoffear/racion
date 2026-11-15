// node tools/cdp.js "<js-выражение>"  — выполняет JS внутри WebView запущенного на эмуляторе APK (через adb forward)
const {execSync}=require('child_process'),WebSocket=require('ws'),http=require('http');
const adb=process.env.HOME+'/Library/Android/sdk/platform-tools/adb';
const pid=execSync(adb+' shell pidof com.godoffear.racion').toString().trim();
execSync(`${adb} forward tcp:9222 localabstract:webview_devtools_remote_${pid}`);
http.get('http://localhost:9222/json',r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{
  const t=JSON.parse(b).find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);
  ws.on('open',()=>ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:process.argv[2],awaitPromise:true,returnByValue:true,userGesture:true}})));
  ws.on('message',m=>{const j=JSON.parse(m);if(j.id===1){console.log(JSON.stringify(j.result&&j.result.result&&('value' in j.result.result?j.result.result.value:j.result.result.description)||j.result,null,1));if(j.result&&j.result.exceptionDetails)console.log('EXC',JSON.stringify(j.result.exceptionDetails.exception&&j.result.exceptionDetails.exception.description));ws.close();process.exit(0)}})})});
setTimeout(()=>{console.log('timeout');process.exit(1)},20000);
