const D=window.RL; D.items=D.items.split('\n').map(l=>{const [n,c,li,ps]=l.split('\t');return {n,c:+c,l:D.labels[+li],p:ps.split('|').map(x=>{const [z,v]=x.split(':');return [z.replace(/ml$/,' ml').replace(/L$/,' L keg'),v]})}});
const $=s=>document.getElementById(s);
const norm=s=>s.toLowerCase().replace(/['’`]/g,'').replace(/[^a-z0-9%.]+/g,' ').trim();
const fmt=v=>v.split('/').map(x=>'₹'+Number(x.trim()).toLocaleString('en-IN')).join(' / ');
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('q').placeholder=D.ph;

let cat=-1,size=null;
const list=$('list'),rows=[],secs=[];
function build(){
  const frag=document.createDocumentFragment();let lastC=null,sec=null;
  D.items.forEach((it,i)=>{
    if(D.grouped&&it.c!==lastC){
      lastC=it.c;sec=document.createElement('div');sec.className='sec';
      const n=D.items.filter(x=>x.c===it.c).length;
      sec.innerHTML=esc(D.chips[it.c])+' <span></span>';sec._cnt=sec.lastChild;sec._c=it.c;sec._rows=[];
      frag.appendChild(sec);secs.push(sec);
    }
    const el=document.createElement('div');el.className='row';
    el.innerHTML='<div class="name">'+esc(it.n)+'</div><div class="lab">'+esc(it.l)+'</div><div class="prices">'+
      it.p.map(([z,v])=>'<div class="p" data-z="'+esc(z)+'"><div class="z">'+esc(z)+'</div><div class="v">'+fmt(v)+'</div></div>').join('')+'</div>';
    el._n=norm(it.n);el._k=el._n.replace(/ /g,'');el._it=it;el._name=el.firstChild;el._tiles=[...el.querySelectorAll('.p')];
    if(sec)sec._rows.push(el);
    rows.push(el);frag.appendChild(el);
  });
  list.appendChild(frag);
}
function chips(){
  const c=$('cats');
  const mk=(label,val,box,on)=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=label;
    b.setAttribute('aria-pressed',on?'true':'false');b.onclick=()=>{on(val,b)};box.appendChild(b);return b};
  const pick=(box,b)=>box.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
  const all=mk('All',-1,c,(v,b)=>{cat=v;pick(c,b);run()});all.setAttribute('aria-pressed','true');
  D.chips.forEach((name,i)=>{ if(D.items.some(x=>x.c===i)) mk(name,i,c,(v,b)=>{cat=v;pick(c,b);run()}).setAttribute('aria-pressed','false')});
  const s=$('sizes');
  const any=mk('All sizes',null,s,(v,b)=>{size=v;pick(s,b);run()});any.setAttribute('aria-pressed','true');
  D.sizes.forEach(([z,label])=>mk(label,z,s,(v,b)=>{size=v;pick(s,b);run()}).setAttribute('aria-pressed','false'));
}
function hl(name,toks){
  let h=esc(name);
  if(!toks.length)return h;
  toks.sort((a,b)=>b.length-a.length).forEach(t=>{
    const re=new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
    h=h.replace(/(<[^>]*>)|([^<]+)/g,(m,tag,txt)=>tag?tag:txt.replace(re,'<mark>$1</mark>'));
  });
  return h;
}
function run(){
  const raw=$('q').value, q=norm(raw), toks=q?q.split(' '):[], k=q.replace(/ /g,'');
  $('clr').hidden=!raw;
  let n=0;
  rows.forEach(el=>{
    const it=el._it;
    let ok=(cat<0||it.c===cat)&&(!size||it.p.some(p=>p[0]===size));
    if(ok&&toks.length) ok=toks.every(t=>el._n.includes(t))||el._k.includes(k);
    el.hidden=!ok;
    if(ok){n++;
      el._name.innerHTML=hl(it.n,toks.slice());
      el._tiles.forEach(t=>{const hit=size&&t.dataset.z===size;t.classList.toggle('hit',!!hit);t.classList.toggle('dim',!!size&&!hit)});
    }
  });
  secs.forEach(s=>{const v=s._rows.filter(r=>!r.hidden).length;s.hidden=!v;s._cnt.textContent='('+v+')'});
  const total=D.items.length;
  $('count').textContent=(n===total)?`${total.toLocaleString('en-IN')} brands. Type a name to search.`
    :`${n.toLocaleString('en-IN')} of ${total.toLocaleString('en-IN')} brands shown`;
  const e=$('empty');e.hidden=n>0;
  if(!n)e.innerHTML=raw?`No brand matches <b>“${esc(raw)}”</b>. Check the spelling, or type just the first word of the brand.`
    :'No brand in this type has that size. Choose <b>All sizes</b>.';
}
let tmr;$('q').addEventListener('input',()=>{clearTimeout(tmr);tmr=setTimeout(run,90)});
$('q').addEventListener('keydown',e=>{if(e.key==='Enter')e.target.blur()});
$('clr').onclick=()=>{$('q').value='';run();$('q').focus()};
const setH=()=>document.documentElement.style.setProperty('--ctrl-h',$('controls').offsetHeight+'px');
window.addEventListener('resize',setH);
window.addEventListener('scroll',()=>$('top').classList.toggle('show',scrollY>900),{passive:true});
$('top').onclick=()=>scrollTo(0,0);
build();chips();run();setH();
