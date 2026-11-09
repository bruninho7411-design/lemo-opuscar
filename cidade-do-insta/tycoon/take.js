const {chromium}=require('playwright');
const plan=process.argv[2]; const rec=process.argv[3]==='rec';
(async()=>{
const ctx=await chromium.launchPersistentContext('/home/user/tycoon/profile',{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],viewport:{width:540,height:960},...(rec?{recordVideo:{dir:'/home/user/tycoon/vid',size:{width:540,height:960}}}:{})});
const p=ctx.pages()[0]||await ctx.newPage();
const T0=Date.now(); const log=(...a)=>console.log(((Date.now()-T0)/1000).toFixed(1),...a);
await p.goto('https://quadroaquadroonline.com.br/cidade/jogo/',{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForTimeout(4500); log('title');
await p.getByText('JOGAR').first().click({timeout:5000}).catch(()=>{}); log('jogar');
await p.waitForTimeout(2500);
const hold=async(k,ms)=>{const ks=k.split('+');for(const x of ks)await p.keyboard.down(x);await p.waitForTimeout(ms);for(const x of ks)await p.keyboard.up(x);};
const money=async()=>{const m=(await p.innerText('body')).match(/Você\s*\$([\d.,]+)/);return m?parseFloat(m[1].replace(/\./g,'').replace(',','.')):-1;};
const route=async(r)=>{for(const [k,ms] of r) await hold(k,ms);};
const collect=async()=>{
  await route([['d',2300],['w',1200],['d',600],['w',800],['d',500],['w',700],['a',450],['w+Space',500],['w+Space',500]]);
  const m0=await money(); log('at pad money',m0);
  const nudges=[['a',150],['d',300],['w+Space',400],['a',300],['s',200],['w+Space',500],['d',150],['w+Space',400]];
  for(const n of nudges){await p.waitForTimeout(600); const m=await money(); if(m>m0){log('collected',m);return m;} await hold(...n);}
  await p.waitForTimeout(800); const m=await money(); log('end money',m); return m;
};
if(plan==='collect'){ await collect(); await p.waitForTimeout(2500); }
if(plan==='pedra'){ await route([['w',1300],['a',1250],['w',900],['a',850],['w',2000],['s',350],['d',500]]); const m0=await money(); log('near pedra',m0);
  for(const n of [['d',250],['d',250],['w',200],['a',150],['d',300],['s',200],['w',300]]){await p.waitForTimeout(700); const m=await money(); if(m<m0){log('bought',m);break;} await hold(...n);}
  await p.waitForTimeout(3500); log('money',await money()); }
if(plan==='cristal'){ await route([['w',1300],['a',1250],['w',900],['a',850],['w',2000],['s',350],['d',500]]); const m0=await money(); log('near cristal',m0);
  for(const n of [['d',350],['w+Space',450],['w+Space',400],['a',150],['w+Space',400],['d',250],['w+Space',400]]){await p.waitForTimeout(700); const m=await money(); if(m<m0){log('bought',m);break;} await hold(...n);}
  await p.waitForTimeout(3500); log('money',await money());
  await p.mouse.click(33,717); await p.waitForTimeout(3500); await p.screenshot({path:'shots/rebirth.png'}); log(((await p.innerText('body')).match(/[Rr]ebirth[\s\S]{0,400}/)||[''])[0].replace(/\s+/g,' '));
  await p.keyboard.press('Escape'); await p.waitForTimeout(1500); }
if(plan==='menus'){
  for(const t of ['Missões','Visual']){await p.getByText(t).first().click({timeout:3000}).catch(()=>log('no',t)); await p.waitForTimeout(3500); await p.screenshot({path:'shots/m_'+t+'.png'}); 
    if(t==='Visual'){for(const b of ['Boné','Fones de ouvido']){await p.getByText(b).first().click({timeout:2000}).catch(()=>log('no',b)); await p.waitForTimeout(1800);} }
    await p.keyboard.press('Escape'); await p.waitForTimeout(800); await p.mouse.click(500,95).catch(()=>{}); }
  await p.waitForTimeout(1500); await p.screenshot({path:'shots/m_end.png'});
}
await ctx.close(); log('done');
})().catch(e=>{console.error(e);process.exit(1)});
