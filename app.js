import { db, ref, set, onValue, remove, update } from "./firebase.js";
import { CATEGORIES, NOTE_CATS, MEMBERS, RECUR_LABELS, SEED_EVENTS } from "./data.js";

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const NC_MAP  = Object.fromEntries(NOTE_CATS.map(c  => [c.id, c]));
const DAYS    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toDS(d)       { return d.toISOString().split("T")[0]; }
function addDays(ds,n) { const d=new Date(ds+"T12:00:00"); d.setDate(d.getDate()+n); return toDS(d); }
function wkOf(ds)      { const d=new Date(ds+"T12:00:00"); d.setDate(d.getDate()-d.getDay()); return toDS(d); }
function dim(y,m)      { return new Date(y,m+1,0).getDate(); }
function fd(y,m)       { return new Date(y,m,1).getDay(); }
const TODAY = toDS(new Date());

function recurs(e, ds) {
  const ev=new Date(e.date+"T12:00:00"), ch=new Date(ds+"T12:00:00");
  if (ch<ev) return false;
  if (e.recurring==="yearly")    return ev.getMonth()===ch.getMonth()&&ev.getDate()===ch.getDate();
  if (e.recurring==="monthly")   return ev.getDate()===ch.getDate();
  if (e.recurring==="weekly")    return ev.getDay()===ch.getDay();
  if (e.recurring==="bimonthly") { if(ev.getDate()!==ch.getDate())return false; return((ch.getFullYear()-ev.getFullYear())*12+(ch.getMonth()-ev.getMonth()))%2===0; }
  if (e.recurring==="biweekly")  { if(ev.getDay()!==ch.getDay())return false; return Math.round((ch-ev)/86400000)%14===0; }
  return false;
}

let state = {
  events:[], notes:[], view:"month",
  yr:new Date().getFullYear(), mo:new Date().getMonth(), wk:wkOf(TODAY),
  sel:null, fCat:"all", fMem:"all", nFilt:"all",
  modal:null, editEv:null,
  form:{title:"",date:TODAY,category:"errand",member:"Both of Us",recurring:"none",notes:""},
  nText:"", nFor:"Both of Us", nCat:"general", synced:false,
};

function getEvs(ds) {
  return state.events.filter(e=>{
    if(state.fCat!=="all"&&e.category!==state.fCat)return false;
    if(state.fMem!=="all"&&e.member!==state.fMem)return false;
    if(e.date===ds)return true;
    if(e.recurring==="none")return false;
    return recurs(e,ds);
  });
}

function saveEvent(ev)   { set(ref(db,`events/${ev.id}`),ev); }
function deleteEvent(id) { remove(ref(db,`events/${id}`)); }
function saveNote(note)  { set(ref(db,`notes/${note.id}`),note); }
function deleteNote(id)  { remove(ref(db,`notes/${id}`)); }
function patchNote(id,ch){ update(ref(db,`notes/${id}`),ch); }

function initFirebase() {
  onValue(ref(db,"events"), snap => {
    const val=snap.val();
    if (!val) { const obj={}; SEED_EVENTS.forEach(e=>{obj[e.id]=e;}); set(ref(db,"events"),obj); }
    else { state.events=Object.values(val); }
    state.synced=true; render();
  });
  onValue(ref(db,"notes"), snap => {
    const val=snap.val();
    state.notes=val?Object.values(val).sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)):[];
    render();
  });
}

function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

function render() {
  const app=document.getElementById("app");
  if(!state.synced){app.innerHTML=`<div class="loading"><div class="loading-icon">🏡</div><div class="loading-text">Connecting to Firebase…</div></div>`;return;}
  const {yr,mo,wk,view,sel,fCat,fMem,nFilt}=state;
  const dIM=dim(yr,mo), fD=fd(yr,mo);
  const wkDays=Array.from({length:7},(_,i)=>addDays(wk,i));
  const activeNotes=state.notes.filter(n=>!n.done).length;
  const visNotes=state.notes.filter(n=>nFilt==="all"||(nFilt==="active"&&!n.done)||(nFilt==="done"&&n.done));
  const navLabel=view==="week"?(()=>{const s=new Date(wk+"T12:00:00"),e=new Date(addDays(wk,6)+"T12:00:00");return`${MONTHS[s.getMonth()].slice(0,3)} ${s.getDate()} – ${MONTHS[e.getMonth()].slice(0,3)} ${e.getDate()}, ${e.getFullYear()}`;})():`${MONTHS[mo]} ${yr}`;
  const listEvs=(()=>{const out=[];for(let d=1;d<=dIM;d++){const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;getEvs(ds).forEach(e=>out.push({...e,displayDate:ds}));}return out.sort((a,b)=>a.displayDate.localeCompare(b.displayDate));})();

  app.innerHTML=`
    <header class="header">
      <div class="header-left">
        <div class="header-sub">Home &amp; Household</div>
        <div class="header-title">Our Calendar 🏡</div>
        <div class="header-members">Me · Sky · Tyde 🐶 · Iko 🐶 · Noodles 🐶 · Peanut 🐱</div>
      </div>
      <div class="header-right">
        <span class="sync-badge">🔴 Live</span>
        <div class="view-tabs">
          ${["month","week","list"].map(v=>`<button class="tab-btn${view===v?" active":""}" data-view="${v}">${v==="month"?"📅 Month":v==="week"?"🗓 Week":"📋 List"}</button>`).join("")}
        </div>
        <button class="btn-add" id="btnAdd">+ Add Event</button>
      </div>
    </header>
    <div class="filter-bar">
      <span class="filter-label">FILTER</span>
      <select id="fCat" class="fsel"><option value="all">All categories</option>${CATEGORIES.map(c=>`<option value="${c.id}"${fCat===c.id?" selected":""}>${esc(c.label)}</option>`).join("")}</select>
      <select id="fMem" class="fsel"><option value="all">Everyone</option>${MEMBERS.map(m=>`<option value="${esc(m)}"${fMem===m?" selected":""}>${esc(m)}</option>`).join("")}</select>
    </div>
    <div class="cal-nav">
      <button class="nav-btn" id="btnPrev">‹</button>
      <div class="nav-center"><span class="nav-label">${navLabel}</span><button class="btn-today" id="btnToday">Today</button></div>
      <button class="nav-btn" id="btnNext">›</button>
    </div>
    ${view==="month"?`
    <div class="month-wrap">
      <div class="day-headers">${DAYS.map(d=>`<div class="day-hdr">${d}</div>`).join("")}</div>
      <div class="month-grid">
        ${Array.from({length:fD}).map(()=>`<div class="day-cell empty"></div>`).join("")}
        ${Array.from({length:dIM}).map((_,i)=>{
          const day=i+1,ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const evs=getEvs(ds),isT=ds===TODAY,isA=sel===ds;
          return`<div class="day-cell${isT?" today":""}${isA?" selected":""}" data-ds="${ds}"><div class="day-num">${day}</div>${evs.slice(0,3).map(ev=>`<div class="ev-pill" style="background:${CAT_MAP[ev.category]?.color||"#94a3b8"}" data-id="${ev.id}">${esc(ev.title)}</div>`).join("")}${evs.length>3?`<div class="ev-more">+${evs.length-3} more</div>`:""}</div>`;
        }).join("")}
      </div>
      ${sel?dayPanel(sel):""}
    </div>`:""}
    ${view==="week"?`
    <div class="week-wrap">
      <div class="week-grid">
        ${wkDays.map(ds=>{
          const evs=getEvs(ds),d=new Date(ds+"T12:00:00"),isT=ds===TODAY,isA=sel===ds;
          return`<div class="week-cell${isT?" today":""}${isA?" selected":""}" data-ds="${ds}"><div class="week-cell-hdr"><div class="week-day-name">${DAYS[d.getDay()]}</div><div class="week-day-num">${d.getDate()}</div><div class="week-month">${MONTHS[d.getMonth()].slice(0,3)}</div></div>${evs.length===0?`<div class="week-empty">—</div>`:""}${evs.slice(0,5).map(ev=>`<div class="ev-pill" style="background:${CAT_MAP[ev.category]?.color||"#94a3b8"}" data-id="${ev.id}">${esc(ev.title)}</div>`).join("")}${evs.length>5?`<div class="ev-more">+${evs.length-5}</div>`:""}<button class="week-add-btn" data-ds="${ds}">+ add</button></div>`;
        }).join("")}
      </div>
      ${sel?dayPanel(sel):""}
      <div class="week-summary">
        <div class="week-summary-title">Week at a glance</div>
        ${(()=>{const all=wkDays.flatMap(ds=>getEvs(ds).map(e=>({...e,ds}))),byM={};all.forEach(e=>{byM[e.member]=(byM[e.member]||0)+1;});const aC=CATEGORIES.filter(c=>all.some(e=>e.category===c.id));return`<div class="week-summary-stats"><div class="week-stat"><span class="week-stat-num">${all.length}</span>total</div>${Object.entries(byM).map(([m,n])=>`<div class="week-stat"><span class="week-stat-num">${n}</span>${esc(m)}</div>`).join("")}</div><div class="week-summary-cats">${aC.map(c=>{const cnt=all.filter(e=>e.category===c.id).length;return`<div class="legend-item" style="background:${c.bg}"><div class="legend-dot" style="background:${c.color}"></div><span style="color:${c.color}">${esc(c.label)} (${cnt})</span></div>`;}).join("")}</div>`;})()}
      </div>
    </div>`:""}
    ${view==="list"?`
    <div class="list-wrap">
      <div class="list-count">${listEvs.length} events in ${MONTHS[mo]}</div>
      ${listEvs.length===0?`<div class="list-empty">No events this month.</div>`:""}
      ${listEvs.map((ev,i)=>{const prev=i>0?listEvs[i-1].displayDate:null,showH=ev.displayDate!==prev,d=new Date(ev.displayDate+"T12:00:00");return`${showH?`<div class="list-date-hdr">${DAYS[d.getDay()]} · ${MONTHS[d.getMonth()]} ${d.getDate()}</div>`:""}${evCard(ev)}`;}).join("")}
    </div>`:""}
    <div class="notes-section">
      <div class="notes-header">
        <div class="notes-title-row"><span>📝</span><span class="notes-title">Notes &amp; Reminders</span>${activeNotes>0?`<span class="notes-badge">${activeNotes} active</span>`:""}</div>
        <div class="notes-filters">${[["all","All"],["active","Active"],["done","Done"]].map(([v,l])=>`<button class="notes-filter-btn${nFilt===v?" active":""}" data-nfilt="${v}">${l}</button>`).join("")}</div>
      </div>
      <div class="notes-add">
        <div class="notes-input-row">
          <input id="noteInput" class="note-input" placeholder='e.g. "Running low on dog food 🐶"' value="${esc(state.nText)}" />
          <button class="btn-add-note" id="btnAddNote">+ Add Note</button>
        </div>
        <div class="notes-meta-row">
          <select id="nFor" class="note-sel">${["Both of Us","Me","Sky"].map(m=>`<option value="${esc(m)}"${state.nFor===m?" selected":""}>${esc(m)}</option>`).join("")}</select>
          <select id="nCat" class="note-sel">${NOTE_CATS.map(c=>`<option value="${c.id}"${state.nCat===c.id?" selected":""}>${esc(c.label)}</option>`).join("")}</select>
        </div>
      </div>
      <div class="notes-list">
        ${visNotes.length===0?`<div class="notes-empty">${nFilt==="done"?"No completed notes yet.":"No notes yet — add one above! 👆"}</div>`:""}
        ${visNotes.map(note=>{const nc=NC_MAP[note.cat]||NC_MAP.general;return`<div class="note-card${note.done?" done":""}${note.pinned&&!note.done?" pinned":""}" style="border-left:4px solid ${note.done?"#e2e8f0":nc.color}"><button class="note-check${note.done?" checked":""}" data-nid="${note.id}">${note.done?"✓":""}</button><div class="note-body"><div class="note-text${note.done?" struck":""}">${esc(note.text)}</div><div class="note-meta"><span class="note-cat-badge" style="background:${nc.color}22;color:${nc.color}">${esc(nc.label)}</span><span class="note-for">For: ${esc(note.for)}</span><span class="note-ts">${esc(note.ts)}</span></div></div><div class="note-actions"><button class="note-pin-btn${note.pinned?" pinned":""}" data-nid="${note.id}">📌</button><button class="note-del-btn" data-nid="${note.id}">🗑</button></div></div>`;}).join("")}
      </div>
    </div>
    <div class="legend">${CATEGORIES.map(c=>`<div class="legend-item" style="background:${c.bg}"><div class="legend-dot" style="background:${c.color}"></div><span style="color:${c.color}">${esc(c.label)}</span></div>`).join("")}</div>
    ${state.modal?modal():""}
  `;
  bind();
}

function dayPanel(ds){
  const evs=getEvs(ds),d=new Date(ds+"T12:00:00");
  return`<div class="day-panel"><div class="day-panel-hdr"><span class="day-panel-title">${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}</span><button class="btn-add-sm" data-addds="${ds}">+ Add</button></div>${evs.length===0?`<div class="day-panel-empty">Nothing yet — click + Add.</div>`:evs.map(ev=>evCard(ev)).join("")}</div>`;
}

function evCard(ev){
  const c=CAT_MAP[ev.category]||CAT_MAP.other;
  return`<div class="ev-card" style="background:${c.bg};border-left:4px solid ${c.color}" data-id="${ev.id}"><div class="ev-card-body"><div class="ev-card-title">${esc(ev.title)}</div><div class="ev-card-meta">${esc(c.label)} · ${esc(ev.member)}${ev.recurring!=="none"?` · 🔁 ${esc(RECUR_LABELS[ev.recurring]||ev.recurring)}`:""}</div>${ev.notes?`<div class="ev-card-notes">${esc(ev.notes)}</div>`:""}</div><span class="ev-edit-badge" style="color:${c.color};background:${c.color}22">Edit</span></div>`;
}

function modal(){
  const {form,editEv}=state;
  return`<div class="modal-overlay" id="modalOverlay"><div class="modal"><div class="modal-title">${editEv?"Edit Event":"New Event"}</div><label class="modal-lbl">Title</label><input class="modal-inp" id="mTitle" value="${esc(form.title)}" placeholder="Event name…"/><label class="modal-lbl">Date</label><input class="modal-inp" id="mDate" type="date" value="${form.date}"/><label class="modal-lbl">Category</label><select class="modal-inp" id="mCat">${CATEGORIES.map(c=>`<option value="${c.id}"${form.category===c.id?" selected":""}>${esc(c.label)}</option>`).join("")}</select><label class="modal-lbl">Who</label><select class="modal-inp" id="mMem">${MEMBERS.map(m=>`<option value="${esc(m)}"${form.member===m?" selected":""}>${esc(m)}</option>`).join("")}</select><label class="modal-lbl">Recurring</label><select class="modal-inp" id="mRec">${Object.entries(RECUR_LABELS).map(([v,l])=>`<option value="${v}"${form.recurring===v?" selected":""}>${l}</option>`).join("")}</select><label class="modal-lbl">Notes</label><textarea class="modal-inp modal-ta" id="mNotes">${esc(form.notes)}</textarea><div class="modal-btns"><button class="modal-save" id="btnSave">${editEv?"Save Changes":"Add Event"}</button><button class="modal-cancel" id="btnCancel">Cancel</button>${editEv?`<button class="modal-delete" id="btnDelete">🗑</button>`:""}</div></div></div>`;
}

function bind(){
  const $=id=>document.getElementById(id);
  document.querySelectorAll(".tab-btn").forEach(b=>b.addEventListener("click",()=>{state.view=b.dataset.view;state.sel=null;render();}));
  $("fCat")?.addEventListener("change",e=>{state.fCat=e.target.value;render();});
  $("fMem")?.addEventListener("change",e=>{state.fMem=e.target.value;render();});
  $("btnPrev")?.addEventListener("click",()=>{if(state.view==="week")state.wk=addDays(state.wk,-7);else if(state.mo===0){state.mo=11;state.yr--;}else state.mo--;render();});
  $("btnNext")?.addEventListener("click",()=>{if(state.view==="week")state.wk=addDays(state.wk,7);else if(state.mo===11){state.mo=0;state.yr++;}else state.mo++;render();});
  $("btnToday")?.addEventListener("click",()=>{state.yr=new Date().getFullYear();state.mo=new Date().getMonth();state.wk=wkOf(TODAY);render();});
  $("btnAdd")?.addEventListener("click",()=>openAdd(TODAY));
  document.querySelectorAll(".day-cell:not(.empty)").forEach(c=>c.addEventListener("click",e=>{if(e.target.classList.contains("ev-pill"))return;const ds=c.dataset.ds;state.sel=state.sel===ds?null:ds;render();}));
  document.querySelectorAll(".week-cell").forEach(c=>c.addEventListener("click",e=>{if(e.target.classList.contains("ev-pill")||e.target.classList.contains("week-add-btn"))return;const ds=c.dataset.ds;state.sel=state.sel===ds?null:ds;render();}));
  document.querySelectorAll(".week-add-btn").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();openAdd(b.dataset.ds);}));
  document.querySelectorAll("[data-addds]").forEach(b=>b.addEventListener("click",()=>openAdd(b.dataset.addds)));
  document.querySelectorAll(".ev-pill,.ev-card").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();const ev=state.events.find(x=>x.id===el.dataset.id);if(ev){state.editEv=ev;state.form={...ev};state.modal="edit";render();}}));
  $("btnSave")?.addEventListener("click",()=>{const title=$("mTitle").value.trim(),date=$("mDate").value;if(!title||!date)return;const ev={...state.form,title,date,category:$("mCat").value,member:$("mMem").value,recurring:$("mRec").value,notes:$("mNotes").value,id:state.editEv?state.editEv.id:"e_"+Date.now()};saveEvent(ev);state.modal=null;state.editEv=null;render();});
  $("btnCancel")?.addEventListener("click",()=>{state.modal=null;render();});
  $("btnDelete")?.addEventListener("click",()=>{if(state.editEv){deleteEvent(state.editEv.id);state.modal=null;state.editEv=null;render();}});
  $("modalOverlay")?.addEventListener("click",e=>{if(e.target.id==="modalOverlay"){state.modal=null;render();}});
  const ni=$("noteInput");
  if(ni){ni.addEventListener("input",e=>state.nText=e.target.value);ni.addEventListener("keydown",e=>{if(e.key==="Enter")addNote();});}
  $("nFor")?.addEventListener("change",e=>state.nFor=e.target.value);
  $("nCat")?.addEventListener("change",e=>state.nCat=e.target.value);
  $("btnAddNote")?.addEventListener("click",addNote);
  document.querySelectorAll(".notes-filter-btn").forEach(b=>b.addEventListener("click",()=>{state.nFilt=b.dataset.nfilt;render();}));
  document.querySelectorAll(".note-check").forEach(b=>b.addEventListener("click",()=>{const n=state.notes.find(x=>x.id===b.dataset.nid);if(n)patchNote(n.id,{done:!n.done});}));
  document.querySelectorAll(".note-pin-btn").forEach(b=>b.addEventListener("click",()=>{const n=state.notes.find(x=>x.id===b.dataset.nid);if(n)patchNote(n.id,{pinned:!n.pinned});}));
  document.querySelectorAll(".note-del-btn").forEach(b=>b.addEventListener("click",()=>deleteNote(b.dataset.nid)));
}

function openAdd(ds){state.editEv=null;state.form={title:"",date:ds||TODAY,category:"errand",member:"Both of Us",recurring:"none",notes:""};state.modal="add";render();}

function addNote(){
  const ni=document.getElementById("noteInput");
  const text=(ni?.value||state.nText).trim();
  if(!text)return;
  const note={id:"n_"+Date.now(),text,for:state.nFor,cat:state.nCat,done:false,pinned:false,ts:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})};
  saveNote(note);
  state.nText="";
  if(ni)ni.value="";
}

initFirebase();
