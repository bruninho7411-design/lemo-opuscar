const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({viewport:{width:540,height:960},recordVideo:{dir:process.argv[2]+'/vid2',size:{width:540,height:960}}});
const p=await ctx.newPage();await p.goto('https://quadroaquadroonline.com.br/cidade/jogo/',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(8000);
console.log(((await p.innerText('body'))||'').slice(0,2500));
const shot=async n=>p.screenshot({path:process.argv[2]+'/g_'+n+'.png'});
await shot('a');
// pan around
await p.mouse.move(270,600);await p.mouse.down();await p.mouse.move(420,520,{steps:40});await p.mouse.up();await p.waitForTimeout(1500);
await p.mouse.wheel(0,-400);await p.waitForTimeout(1500);await shot('b');
// click buttons with text
for (const txt of ['Loja VIP','Delegacia','Guindaste','Outdoor','Vila']){
  const el=p.getByText(txt).first();
  try{await el.click({timeout:3000});await p.waitForTimeout(3000);await shot(txt.replace(/\W/g,''));const x=p.getByText(/Fechar|×|✕/).first();try{await x.click({timeout:1000})}catch(e){} await p.keyboard.press('Escape');await p.waitForTimeout(800);}catch(e){console.log('nobtn',txt)}
}
const inp=await p.$('input');if(inp){await inp.click();await inp.fill('');await p.keyboard.type('nicollas__033',{delay:110});await p.keyboard.press('Enter');}
await p.waitForTimeout(6000);await shot('search');
await ctx.close();await b.close();})().catch(e=>{console.error(e);process.exit(1)});
