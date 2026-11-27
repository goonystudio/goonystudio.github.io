{
const {P,COLL,VIBE,V,ISS,LET,PEOPLE,OTHER_COLOR,API}=window;
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IL=Object.fromEntries(ISS),LI=Object.fromEntries(ISS.map(([k,l])=>[l,k]));
const R={},D={};let VB={};   // mes retours, mes dessins, « validé par »
let F={c:"all",v:"all",s:"all"},cur=null,curVer=0,pen=false;
let me="";try{me=localStorage.getItem("sifas:who")||""}catch(e){}
const colorOf=n=>(PEOPLE.find(p=>p[0].toLowerCase()===String(n).toLowerCase())||[0,OTHER_COLOR])[1];

/* ---------- session ---------- */
function paintWho(){
  $("#whoName").textContent=me?"Session : "+me:"Choisir qui je suis";
  $("#whoDot").style.background=me?colorOf(me):"transparent";$("#penDot").style.background=colorOf(me);
}
$("#people").innerHTML=PEOPLE.map(([n,c])=>`<button class="person" data-n="${esc(n)}"><span class="dot" style="background:${c}"></span>${esc(n)}</button>`).join("")+`<button class="person" data-n="">Autre…</button>`;
function askWho(){$("#otherForm").hidden=true;$("#nameBox").classList.add("open")}
function setWho(n){
  if(n===me){$("#nameBox").classList.remove("open");return}
  me=n;try{localStorage.setItem("sifas:who",n)}catch(e){}
  for(const k in R)delete R[k];for(const k in D)delete D[k];
  $("#nameBox").classList.remove("open");paintWho();renderGrid();renderView();load(true);
}
$("#people").onclick=e=>{const b=e.target.closest(".person");if(!b)return;if(b.dataset.n)setWho(b.dataset.n);else{$("#otherForm").hidden=false;$("#otherIn").focus()}};
$("#otherForm").onsubmit=e=>{e.preventDefault();const v=$("#otherIn").value.trim();if(v)setWho(v)};
$("#whoBtn").onclick=askWho;
function needWho(f){if(me)f();else askWho()}

/* ---------- synchro ---------- */
const sync=$("#sync");let pending=0,failed=new Map(),conn="connecting";
function paintSync(){
  sync.className="pill";let t;
  if(failed.size){sync.classList.add("err");t="Non enregistré · réessayer"}
  else if(pending){sync.classList.add("saving");t="Enregistrement…"}
  else if(conn==="ok"){sync.classList.add("ok");t="Tout est enregistré"}
  else if(conn==="off"){sync.classList.add("err");t="Hors ligne"}
  else t="Connexion…";
  sync.lastElementChild.textContent=t;
}
sync.onclick=()=>{for(const [k,d] of failed){failed.delete(k);save(k,d)}paintSync()};
const W={};
function save(key,body){
  try{localStorage.setItem("sifas:q:"+key,JSON.stringify(body))}catch(e){}
  const w=W[key]||(W[key]={next:null,busy:false});w.next=body;pump(key);
}
async function post(body){
  const r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body)});
  const j=await r.json();if(!j.ok)throw new Error(j.error||"refus");return j;
}
async function pump(key){
  const w=W[key];if(w.busy||!w.next)return;
  w.busy=true;const d=w.next;w.next=null;pending++;paintSync();
  let ok=false,res=null;
  for(let i=0;i<4&&!ok;i++){
    try{res=await post(d);ok=true}
    catch(e){if(String(e.message)==="too_big"){showErr("Ce dessin est trop chargé pour être enregistré : effacez quelques traits.");break}
      await new Promise(r=>setTimeout(r,800*(i+1)+Math.random()*800))}
  }
  pending--;w.busy=false;
  if(ok){failed.delete(key);conn="ok";$("#errBanner").classList.remove("show");try{localStorage.removeItem("sifas:q:"+key)}catch(e){}
    if(d.who===me){const rec=(d.type==="review"?R:D)[d.id];if(rec&&res&&res.at)rec.at=res.at;if(cur)paintSaved()}}
  else{failed.set(key,d);showErr("Un retour n'a pas pu être enregistré (connexion ?). Touchez le bouton rouge en haut pour réessayer, et ne fermez pas la page.")}
  paintSync();if(w.next)pump(key);
}
function showErr(m){const b=$("#errBanner");b.textContent=m;b.classList.add("show")}
addEventListener("beforeunload",e=>{if(pending||failed.size){e.preventDefault();e.returnValue=""}});

/* ---------- données ---------- */
const rv=id=>R[id]||{validated:false,issues:[],notes:""};
const mineTouched=v=>{const r=R[v];return !!(r&&(r.validated||r.issues.length||r.notes.trim()))||!!(D[v]?.strokes||[]).length};
const iValidated=x=>x.ver.some(v=>rv(v).validated);
function vbNames(vid){
  const l=(VB[vid]||[]).filter(n=>!me||n.toLowerCase()!==me.toLowerCase());
  if(rv(vid).validated)l.unshift("vous");return l;
}
function visVB(x){const s=new Set();x.ver.forEach(v=>vbNames(v).forEach(n=>s.add(n)));return [...s]}
const joinNames=l=>l.length<2?l.join(""):l.slice(0,-1).join(", ")+" et "+l[l.length-1];
function bestVer(x){let i=x.ver.findIndex(v=>rv(v).validated);if(i<0)i=x.ver.findIndex(v=>(VB[v]||[]).length);return i<0?0:i}

/* ---------- filtres et grille ---------- */
function chips(el,list,key){
  el.innerHTML=list.map(([k,l])=>`<button class="chip" data-k="${k}" aria-pressed="${F[key]===k}">${esc(l)}</button>`).join("");
  el.onclick=e=>{const b=e.target.closest(".chip");if(!b)return;F[key]=b.dataset.k;chips(el,list,key);renderGrid()};
}
chips($("#fColl"),[["all","Toutes"],...Object.entries(COLL)],"c");
chips($("#fVibe"),[["all","Toutes"],...Object.entries(VIBE)],"v");
chips($("#fStat"),[["all","Tous les visuels"],["todo","Pas encore validés par moi"],["mine","Validés par moi"]],"s");
function renderGrid(){
  let html="";
  for(const [ck,cl] of Object.entries(COLL)){
    if(F.c!=="all"&&F.c!==ck)continue;
    const xs=V.filter(x=>x.c===ck&&(F.v==="all"||x.v===F.v)&&(F.s==="all"||(F.s==="mine")===iValidated(x)));
    if(!xs.length)continue;
    html+=`<section class="coll"><h2>${esc(cl)}</h2><div class="grid">`+xs.map(x=>{
      const b=bestVer(x),n=x.ver.length,names=visVB(x);
      const bd=names.length?`<span class="badge ok">✓ Validé par ${esc(joinNames(names))}</span>`:"";
      return`<button class="card" data-id="${x.id}"><div class="thumb"><img loading="lazy" src="th/${x.ver[b]}.jpg" alt="">${bd}${n>1?`<span class="stack">${n} versions</span>`:""}</div><div><h3>${esc(x.t)}</h3><div class="meta"><span>${esc(VIBE[x.v])}</span>${x.ver.some(mineTouched)&&!iValidated(x)?'<span class="mine">· vous avez laissé un retour</span>':""}</div></div></button>`}).join("")+`</div></section>`;
  }
  $("#main").innerHTML=html||`<div class="empty">Aucun visuel ne correspond à ces filtres.</div>`;
  const okv=V.filter(iValidated).length;
  $("#mtxt").textContent=me?`Vous avez validé ${okv} / ${V.length} visuels`:`${V.length} visuels à regarder`;$("#mbar").style.width=(okv/V.length*100)+"%";
}
$("#main").onclick=e=>{const c=e.target.closest(".card");if(c)location.hash=c.dataset.id};

/* ---------- vue d'un visuel ---------- */
const iss=$("#issues");iss.innerHTML=ISS.map(([k,l])=>`<button class="iss" data-k="${k}" aria-pressed="false">${l}</button>`).join("");
function openView(id){
  cur=V.find(x=>x.id===id);if(!cur){closeView();return}
  curVer=bestVer(cur);dirtyNotes=false;$("#view").classList.add("open");document.body.style.overflow="hidden";
  $("#vTitle").innerHTML=`${esc(cur.t)}<span class="sub">${esc(COLL[cur.c])} · ${esc(VIBE[cur.v])}</span>`;
  $("#prods").innerHTML=cur.p.map(k=>`<button class="prod" data-k="${k}"><img src="ps/${k}.jpg" alt="${esc(P[k][0])}"><span><b>${esc(P[k][0])}</b><em>${esc(P[k][1])}</em></span></button>`).join("");
  renderView();$("#view").scrollTop=0;if(!me)askWho();
}
function closeView(){cur=null;pen=false;$("#penBtn").setAttribute("aria-pressed",false);$("#frame").classList.remove("drawing");$("#view").classList.remove("open");document.body.style.overflow="";renderGrid()}
const vid=()=>cur.ver[curVer];
function renderView(){
  if(!cur)return;const v=vid(),r=rv(v);
  const img=$("#vImg");if(!img.src.endsWith(`img/${v}.jpg`))img.src=`img/${v}.jpg`;
  $("#vers").innerHTML=cur.ver.length>1?cur.ver.map((x,i)=>`<button class="ver" data-i="${i}" aria-current="${i===curVer}"><img src="th/${x}.jpg" alt=""><span>Version ${LET[i]}${rv(x).validated?'<b class="okd">✓ validée</b>':""}</span></button>`).join(""):"";
  const vb=$("#validBtn");vb.classList.toggle("on",r.validated);vb.setAttribute("aria-pressed",r.validated);
  $("#vLbl").textContent=r.validated?"Version validée":"Valider cette version";
  $("#vSub").textContent=r.validated?"Bon pour le catalogue · toucher pour annuler":"Un clic, et c'est bon pour le catalogue";
  const others=(VB[v]||[]).filter(n=>!me||n.toLowerCase()!==me.toLowerCase());
  $("#vby").textContent=others.length?`✓ Déjà validée par ${joinNames(others)}`:"";
  for(const b of iss.children)b.setAttribute("aria-pressed",r.issues.includes(b.dataset.k));
  const ta=$("#notes");if(document.activeElement!==ta||!dirtyNotes)ta.value=r.notes;
  paintSaved();drawAll();
}
function paintSaved(){
  if(!cur)return;const r=R[vid()],d=D[vid()],el=$("#savedLine");const at=(r&&r.at)||(d&&d.at);
  el.textContent=at?`✓ Enregistré${at!=="à l'instant"?", le "+at.replace(" "," à "):""}`:"";
}
function meta(v){const i=cur.ver.indexOf(v);return{id:v,coll:COLL[cur.c],title:cur.t,version:cur.ver.length>1?"Version "+LET[i]:"Unique",who:me}}
function commit(patch){
  const v=vid(),r={...rv(v),...patch,at:"à l'instant"};R[v]=r;
  if(patch.validated!==undefined){const l=(VB[v]||[]).filter(n=>n.toLowerCase()!==me.toLowerCase());if(r.validated)l.push(me);VB[v]=l}
  save("r:"+v+":"+me,{type:"review",...meta(v),validated:!!r.validated,issues:r.issues.map(k=>IL[k]).join(", "),notes:r.notes});renderView();renderGrid();
}
$("#vers").onclick=e=>{const b=e.target.closest(".ver");if(!b)return;flushNotes();curVer=+b.dataset.i;renderView()};
$("#back").onclick=()=>{flushNotes();history.pushState("",document.title,location.pathname);closeView()};
function step(d){flushNotes();const xs=V.filter(x=>F.c==="all"||x.c===F.c);let i=xs.indexOf(cur);i=(i+d+xs.length)%xs.length;location.hash=xs[i].id}
$("#prev").onclick=()=>step(-1);$("#next").onclick=()=>step(1);
iss.onclick=e=>{const b=e.target.closest(".iss");if(!b)return;needWho(()=>{const s=new Set(rv(vid()).issues);s.has(b.dataset.k)?s.delete(b.dataset.k):s.add(b.dataset.k);commit({issues:[...s]})})};
let dirtyNotes=false,nt=0;
function flushNotes(){if(dirtyNotes&&cur&&me){clearTimeout(nt);commit({notes:$("#notes").value});dirtyNotes=false}}
$("#notes").onfocus=()=>{if(!me)askWho()};
$("#notes").oninput=()=>{if(!me)return;dirtyNotes=true;clearTimeout(nt);$("#savedLine").textContent="Écriture…";nt=setTimeout(flushNotes,900)};
$("#notes").onblur=flushNotes;
$("#validBtn").onclick=()=>needWho(()=>{
  const now=!rv(vid()).validated;commit({validated:now});
  const b=$("#validBtn");b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop");
  if(now){try{navigator.vibrate&&navigator.vibrate([12,40,18])}catch(e){}
    const cols=["#1f9a5a","#7fd3a3","#f6c343","#ffffff","#a8692d"];
    for(let i=0;i<18;i++){const s=document.createElement("span");s.className="spark";s.style.background=cols[i%cols.length];b.appendChild(s);
      const a=Math.random()*Math.PI*2,dd=60+Math.random()*90;
      s.animate([{transform:"translate(0,0) rotate(0) scale(1)",opacity:1},{transform:`translate(${Math.cos(a)*dd}px,${Math.sin(a)*dd-30}px) rotate(${Math.random()*540}deg) scale(.4)`,opacity:0}],{duration:700+Math.random()*400,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=()=>s.remove()}}
});
$("#prods").onclick=e=>{const b=e.target.closest(".prod");if(!b)return;$("#lImg").src=`ps/${b.dataset.k}.jpg`;$("#lCap").textContent=P[b.dataset.k].join(" · ");$("#light").classList.add("open")};
$("#light").onclick=()=>$("#light").classList.remove("open");

/* ---------- dessin (chacun ne voit que ses traits) ---------- */
const cv=$("#cv"),ctx=cv.getContext("2d"),frame=$("#frame");let live=null;
const strokes=()=>(D[vid()]?.strokes)||[];
function drawAll(){
  if(!cur)return;const w=frame.clientWidth,h=frame.clientHeight,dp=devicePixelRatio||1;
  if(cv.width!==Math.round(w*dp)||cv.height!==Math.round(h*dp)){cv.width=Math.round(w*dp);cv.height=Math.round(h*dp)}
  ctx.setTransform(dp,0,0,dp,0,0);ctx.clearRect(0,0,w,h);ctx.lineCap="round";ctx.lineJoin="round";
  for(const s of [...strokes(),...(live?[live]:[])]){
    const p=s.p;if(!Array.isArray(p)||p.length<2)continue;
    ctx.strokeStyle=colorOf(me);ctx.lineWidth=Math.max(3,w*0.0045);ctx.shadowColor="rgba(0,0,0,.35)";ctx.shadowBlur=3;
    ctx.beginPath();ctx.moveTo(p[0]*w,p[1]*h);for(let i=2;i<p.length;i+=2)ctx.lineTo(p[i]*w,p[i+1]*h);ctx.stroke();
  }
}
new ResizeObserver(drawAll).observe(frame);
$("#penBtn").onclick=()=>needWho(()=>{pen=!pen;$("#penBtn").setAttribute("aria-pressed",pen);frame.classList.toggle("drawing",pen)});
function pt(e){const r=cv.getBoundingClientRect();return[Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))]}
cv.onpointerdown=e=>{if(!pen||!me)return;cv.setPointerCapture(e.pointerId);const[x,y]=pt(e);live={p:[+x.toFixed(4),+y.toFixed(4)]};drawAll()};
cv.onpointermove=e=>{if(!live)return;const[x,y]=pt(e),p=live.p;if(Math.hypot(x-p[p.length-2],y-p[p.length-1])<0.003)return;p.push(+x.toFixed(4),+y.toFixed(4));drawAll()};
cv.onpointerup=cv.onpointercancel=()=>{if(!live)return;const s=live;live=null;if(s.p.length>=4)setStrokes([...strokes(),s]);else drawAll()};
function setStrokes(arr){const v=vid();D[v]={strokes:arr,at:"à l'instant"};save("d:"+v+":"+me,{type:"drawing",...meta(v),strokes:arr});drawAll();renderGrid();paintSaved()}
$("#undoBtn").onclick=()=>{const s=strokes();if(s.length)setStrokes(s.slice(0,-1))};
let clearArm=0;$("#clearBtn").onclick=()=>{const b=$("#clearBtn");if(!strokes().length)return;if(Date.now()-clearArm<3000){setStrokes([]);b.textContent="Tout effacer"}else{clearArm=Date.now();b.textContent="Confirmer : tout effacer ?";setTimeout(()=>b.textContent="Tout effacer",3000)}};

/* ---------- mes retours ---------- */
function mine(){const o=[];for(const x of V)x.ver.forEach((v,i)=>{if(mineTouched(v))o.push({x,i,r:rv(v),d:(D[v]?.strokes||[]).length})});return o}
$("#recapBtn").onclick=()=>{
  if(!me){askWho();return}const items=mine();
  $("#recapList").innerHTML=items.length?items.map(({x,i,r,d})=>`<div class="ritem"><b>${esc(COLL[x.c])} · ${esc(x.t)}${x.ver.length>1?" · version "+LET[i]:""}</b><div class="t">${r.validated?"✓ Validée":"Retour"}${r.issues.length?" · "+esc(r.issues.map(k=>IL[k]).join(", ")):""}${d?" · "+d+" détail"+(d>1?"s":"")+" entouré"+(d>1?"s":""):""}</div>${r.notes?`<p>${esc(r.notes)}</p>`:""}</div>`).join(""):`<p class="ritem">Vous n'avez encore laissé aucun retour.</p>`;
  $("#drawer").classList.add("open");
};
$("#closeRecap").onclick=()=>$("#drawer").classList.remove("open");
$("#copyRecap").onclick=async()=>{const t=mine().map(({x,i,r,d})=>`${COLL[x.c]} · ${x.t}${x.ver.length>1?" · version "+LET[i]:""}\n${r.validated?"VALIDÉE":"Retour"}${r.issues.length?" · "+r.issues.map(k=>IL[k]).join(", "):""}${d?" · "+d+" détail(s) entouré(s)":""}${r.notes?"\n"+r.notes:""}`).join("\n\n");
  try{await navigator.clipboard.writeText(t);$("#copyRecap").textContent="Copié ✓"}catch(e){$("#copyRecap").textContent="Copie refusée"}setTimeout(()=>$("#copyRecap").textContent="Copier",2000)};

/* ---------- routage ---------- */
function route(){const h=location.hash.slice(1);if(h&&V.some(x=>x.id===h))openView(h);else if(cur)closeView()}
addEventListener("hashchange",route);
addEventListener("keydown",e=>{if(e.key==="Escape"){if($("#light").classList.contains("open"))$("#light").classList.remove("open");else if($("#drawer").classList.contains("open"))$("#drawer").classList.remove("open");else if(cur)$("#back").click()}
  if(cur&&document.activeElement.tagName!=="TEXTAREA"&&document.activeElement.tagName!=="INPUT"){if(e.key==="ArrowRight")step(1);if(e.key==="ArrowLeft")step(-1)}});

/* ---------- chargement (toutes les 15 s) ---------- */
let loading=false;
async function load(force){
  if(loading||(document.hidden&&!force))return;loading=true;const asked=me;
  try{
    const r=await fetch(API+"?who="+encodeURIComponent(me)+"&t="+Date.now());const j=await r.json();if(!j.ok)throw 0;
    if(asked!==me){loading=false;return}
    VB={};for(const [id,l] of Object.entries(j.validatedBy||{}))if(Array.isArray(l))VB[id]=l.map(String);
    const busy=k=>W[k]?.busy||W[k]?.next||failed.has(k);
    for(const [id,x] of Object.entries(j.mine?.reviews||{})){
      if(busy("r:"+id+":"+me)||(cur&&vid()===id&&dirtyNotes))continue;
      R[id]={validated:!!x.validated,issues:String(x.issues||"").split(", ").map(l=>LI[l]).filter(Boolean),notes:String(x.notes||""),at:String(x.at||"")};
    }
    for(const [id,x] of Object.entries(j.mine?.drawings||{})){
      if(busy("d:"+id+":"+me)||(live&&cur&&vid()===id))continue;
      D[id]={strokes:Array.isArray(x.strokes)?x.strokes:[],at:String(x.at||"")};
    }
    // retours en attente sur cet appareil : ils restent prioritaires
    for(const [k,w] of Object.entries(W))if(w.next||w.busy){}
    conn="ok";renderGrid();if(cur)renderView();
  }catch(e){if(conn!=="ok"){conn="off";showErr("Impossible de joindre la base des retours. Vérifiez la connexion internet puis rechargez la page.")}}
  loading=false;paintSync();
}
try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("sifas:q:")){const body=JSON.parse(localStorage.getItem(k));if(body&&body.who)save(k.slice(8),body)}}}catch(e){}
paintWho();renderGrid();route();paintSync();load(true);setInterval(load,15000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)load()});
if(!me)askWho();
}
