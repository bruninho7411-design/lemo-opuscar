const {chromium}=require('playwright');
const steps=JSON.parse(process.argv[2]||'[]'); const tag=process.argv[3]||'x'; const rec=process.argv[4]==='rec';
(async()=>{
const ctx=await chromium.launchPersistentContext('/home/user/tycoon/profile',{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],viewport:{width:540,height:960},...(rec?{recordVideo:{dir:'/home/user/tycoon/vid',size:{width:540,height:960}}}:{})});
const p=ctx.pages()[0]||await ctx.newPage();
await p.goto('https://quadroaquadroonline.com.br/cidade/jogo/',{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForTimeout(5000);
await p.getByText('JOGAR').first().click({timeout:5000}).catch(()=>console.log('nojogar'));
await p.waitForTimeout(3000);
const hud=async()=>{try{const t=await p.innerText('body');const m=t.match(/DINHEIRO[\s\S]{0,80}/);return (m?m[0]:t.slice(0,120)).replace(/\s+/g,' ');}catch(e){return '?'}};
let i=0;
for(const st of steps){
  if(st[0]==='wait'){await p.waitForTimeout(st[1]);}
  else if(st[0]==='click'){await p.getByText(st[1]).first().click({timeout:2000}).catch(()=>console.log('noclick',st[1]));await p.waitForTimeout(800);}
  else if(st[0]==='esc'){await p.keyboard.press('Escape');}
  else {const ks=st[0].split('+');for(const k of ks)await p.keyboard.down(k);await p.waitForTimeout(st[1]);for(const k of ks)await p.keyboard.up(k);}
  if(st[2]){await p.waitForTimeout(300);await p.screenshot({path:`shots/${tag}_${i}.png`});console.log(i,st.join(' '),await hud());i++;}
}
await ctx.close();
})().catch(e=>{console.error(e);process.exit(1)});
