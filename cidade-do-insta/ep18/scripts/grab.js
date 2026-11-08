const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:430,height:930}});
await p.goto('https://quadroaquadroonline.com.br/cidade/#/',{waitUntil:'networkidle',timeout:60000});
await p.waitForTimeout(2500);
console.log((await p.innerText('body')).slice(0,12000));
await p.screenshot({path:process.argv[2]+'/home.png',fullPage:true});
await b.close();})().catch(e=>{console.error(e);process.exit(1)});
