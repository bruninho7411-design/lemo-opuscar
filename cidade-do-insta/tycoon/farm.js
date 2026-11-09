const {chromium}=require('playwright');
const mins=+process.argv[2]||5;
(async()=>{
const ctx=await chromium.launchPersistentContext('/home/user/tycoon/profile',{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],viewport:{width:540,height:960}});
const p=ctx.pages()[0]||await ctx.newPage();
await p.goto('https://quadroaquadroonline.com.br/cidade/jogo/',{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForTimeout(5000);
await p.getByText('JOGAR').first().click({timeout:5000}).catch(()=>{});
await p.waitForTimeout(3000);
const hold=async(k,ms)=>{const ks=k.split('+');for(const x of ks)await p.keyboard.down(x);await p.waitForTimeout(ms);for(const x of ks)await p.keyboard.up(x);};
for(const [k,ms] of [['d',2300],['w',1200],['d',600],['w',800],['d',500],['w',700],['a',450],['w+Space',500],['w+Space',500]]) await hold(k,ms);
const end=Date.now()+mins*60000;
while(Date.now()<end){
  await hold('s',350); await p.waitForTimeout(200); await hold('w+Space',500); await hold('w',300);
  const t=(await p.innerText('body')).match(/Você\s*\$[\d.,KkMm]+/); console.log(new Date().toISOString().slice(11,19), t&&t[0]);
  await p.waitForTimeout(12000);
}
await p.screenshot({path:'shots/farm_end.png'});
await ctx.close();
})().catch(e=>{console.error(e);process.exit(1)});
