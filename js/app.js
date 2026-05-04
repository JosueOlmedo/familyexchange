// ==================== STATE ====================
const SESSION_KEY = 'intercambioSession';
let state = { config: {}, families: [], wishlists: {}, sorteoResult: null, sorteoDate: null };
let session = loadSession();

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}
function saveSession(data) { session = data; localStorage.setItem(SESSION_KEY, JSON.stringify(data)); }

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initLang();
  createSnowflakes();
  // Load state from Firebase
  const data = await CloudStorage.load();
  if (data) state = { config: data.config || {}, families: data.families || [], wishlists: data.wishlists || {}, sorteoResult: data.sorteoResult || null, sorteoDate: data.sorteoDate || null };
  if (session) {
    state.config.adminPin ? showPinScreen() : showApp();
  } else {
    showRegistration();
  }
});

function showApp() {
  document.getElementById('registerOverlay').classList.add('hidden');
  document.getElementById('pinOverlay').classList.add('hidden');
  document.getElementById('mainHeader').classList.remove('hidden');
  document.getElementById('mainContent').classList.remove('hidden');
  document.getElementById('userName').textContent = session.name;
  const av = document.getElementById('userAvatar');
  av.textContent = session.avatar; av.style.display = 'flex';
  initNavigation(); loadConfigUI(); renderFamilies(); populateWishlistSelect(); renderMemberUrls(); checkSorteoReady(); bindEvents();
  // Auto-refresh from Firebase every 30s
  setInterval(async () => {
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return;
    const data = await CloudStorage.load();
    if (!data) return;
    state.families = data.families || []; state.wishlists = data.wishlists || {};
    state.sorteoResult = data.sorteoResult || null; state.sorteoDate = data.sorteoDate || null;
    renderFamilies(); populateWishlistSelect(); checkSorteoReady();
  }, 30000);
}

function bindEvents() {
  document.getElementById('saveConfig').addEventListener('click', saveConfig);
  document.getElementById('addFamily').addEventListener('click', addFamily);
  document.getElementById('wishlistPerson').addEventListener('change', onPersonSelect);
  document.getElementById('addWishItem').addEventListener('click', addWishItem);
  document.getElementById('saveWishlist').addEventListener('click', saveWishlist);
  document.getElementById('startSorteo').addEventListener('click', startSorteo);
  document.getElementById('modalSendEmail').addEventListener('click', sendEmails);
  document.getElementById('modalClose').addEventListener('click', () => toggleModal(false));
  document.getElementById('syncToCloud').addEventListener('click', syncToCloud);
  document.getElementById('syncFromCloud').addEventListener('click', syncFromCloud);
  document.getElementById('exportParticipants').addEventListener('click', () => exportExcel('participants'));
  document.getElementById('exportWishlists').addEventListener('click', () => exportExcel('wishlists'));
  document.getElementById('exportSorteo').addEventListener('click', () => exportExcel('sorteo'));
  document.getElementById('exportAll').addEventListener('click', () => exportExcel('all'));
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('langToggle').addEventListener('click', toggleLang);
}

// ==================== PIN ====================
function showPinScreen() {
  document.getElementById('registerOverlay').classList.add('hidden');
  document.getElementById('pinOverlay').classList.remove('hidden');
  document.getElementById('pinTitle').textContent = i18n.t('admin_pin_title');
  document.getElementById('pinSubtitle').textContent = i18n.t('admin_pin_subtitle');
  document.getElementById('pinInput').placeholder = i18n.t('admin_pin_placeholder');
  document.getElementById('pinEnter').textContent = 'OK';
  document.getElementById('pinEnter').addEventListener('click', checkPin);
  document.getElementById('pinInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkPin(); });
  document.getElementById('pinInput').focus();
}
function checkPin() {
  if (document.getElementById('pinInput').value === state.config.adminPin) { document.getElementById('pinOverlay').classList.add('hidden'); showApp(); }
  else { toast(i18n.t('admin_pin_wrong'), 'error'); document.getElementById('pinInput').value = ''; document.getElementById('pinInput').focus(); }
}

// ==================== REGISTRATION ====================
const AVATARS = ['🎅','🤶','🧑🎄','⛄','🦌','🎄','🐧','🎁','⭐','🔔','❄️','🍪'];
let selectedAvatar = null;

function showRegistration() {
  document.getElementById('pinOverlay').classList.add('hidden');
  document.getElementById('registerOverlay').classList.remove('hidden');
  updateRegistrationText(); buildAvatarPicker();
  document.getElementById('regEnter').addEventListener('click', handleRegister);
  document.getElementById('regLangToggle').addEventListener('click', () => { toggleLang(); updateRegistrationText(); });
  document.getElementById('regName').addEventListener('keydown', e => { if (e.key === 'Enter') handleRegister(); });
}
function updateRegistrationText() {
  document.getElementById('regTitle').textContent = i18n.t('reg_title');
  document.getElementById('regEventName').textContent = state.config.eventName || 'Intercambio Navidad 2026';
  document.getElementById('regSubtitle').textContent = i18n.t('reg_subtitle');
  document.getElementById('regName').placeholder = i18n.t('reg_name_placeholder');
  document.getElementById('regAvatarLabel').textContent = i18n.t('reg_pick_avatar');
  document.getElementById('regEnter').textContent = i18n.t('reg_enter');
}
function buildAvatarPicker() {
  const c = document.getElementById('avatarPicker'); c.innerHTML = '';
  AVATARS.forEach(emoji => {
    const d = document.createElement('div'); d.className = 'avatar-option';
    d.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:2rem;'; d.textContent = emoji;
    d.addEventListener('click', () => { c.querySelectorAll('.avatar-option').forEach(e => e.classList.remove('selected')); d.classList.add('selected'); selectedAvatar = emoji; });
    c.appendChild(d);
  });
  c.children[0]?.click();
}
function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  if (!name) { toast(i18n.t('reg_name_required'), 'error'); return; }
  saveSession({ name, avatar: selectedAvatar || '🎅' }); showApp();
}

// ==================== THEME ====================
function initTheme() { const t = localStorage.getItem('intercambio_theme') || 'dark'; document.documentElement.setAttribute('data-theme', t); updateThemeIcon(t); }
function toggleTheme() { const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', n); localStorage.setItem('intercambio_theme', n); updateThemeIcon(n); }
function updateThemeIcon(t) { const b = document.getElementById('themeToggle'); if (b) b.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; }

// ==================== LANGUAGE ====================
function initLang() { i18n.setLang(localStorage.getItem('intercambio_lang') || 'es'); updateLangButton(); }
function toggleLang() { i18n.setLang(i18n.current === 'es' ? 'en' : 'es'); updateLangButton(); applyTranslations(); }
function updateLangButton() { const b = document.getElementById('langToggle'); if (b) b.textContent = i18n.current.toUpperCase(); const r = document.getElementById('regLangToggle'); if (r) r.textContent = i18n.current === 'es' ? 'ES / EN' : 'EN / ES'; }
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = i18n.t(e.getAttribute('data-i18n')));
  document.querySelectorAll('[data-i18n-html]').forEach(e => e.innerHTML = i18n.t(e.getAttribute('data-i18n-html')));
  document.querySelectorAll('[data-i18n-placeholder]').forEach(e => e.placeholder = i18n.t(e.getAttribute('data-i18n-placeholder')));
}

// ==================== NAVIGATION ====================
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active'); document.getElementById(btn.dataset.section).classList.add('active');
    if (btn.dataset.section === 'wishlists') { populateWishlistSelect(); renderAllWishlists(); renderMemberUrls(); }
    if (btn.dataset.section === 'sorteo') checkSorteoReady();
  }));
  applyTranslations();
}

// ==================== SNOWFLAKES ====================
function createSnowflakes() {
  const c = document.getElementById('snowflakes'), f = ['❄','❅','❆','✦'];
  for (let i = 0; i < 30; i++) { const e = document.createElement('div'); e.className = 'snowflake'; e.textContent = f[Math.floor(Math.random()*4)]; e.style.left = Math.random()*100+'%'; e.style.fontSize = (Math.random()*1.2+0.5)+'rem'; e.style.animationDuration = (Math.random()*5+5)+'s'; e.style.animationDelay = (Math.random()*8)+'s'; e.style.opacity = Math.random()*0.6+0.2; c.appendChild(e); }
}

// ==================== CONFIG ====================
function loadConfigUI() {
  const c = state.config;
  document.getElementById('maxGifts').value = c.maxGifts || 5;
  document.getElementById('eventName').value = c.eventName || '';
  document.getElementById('budget').value = c.budget || '';
  document.getElementById('adminPin').value = c.adminPin || '';
  document.getElementById('senderEmail').value = c.senderEmail || '';
  document.getElementById('emailjsPublicKey').value = c.emailjsPublicKey || '';
  document.getElementById('emailjsServiceId').value = c.emailjsServiceId || '';
  document.getElementById('emailjsTemplateId').value = c.emailjsTemplateId || '';
}
async function saveConfig() {
  state.config = { maxGifts: parseInt(document.getElementById('maxGifts').value) || 5, eventName: document.getElementById('eventName').value || 'Intercambio Navidad 2026', budget: document.getElementById('budget').value, adminPin: document.getElementById('adminPin').value.trim(), senderEmail: document.getElementById('senderEmail').value, emailjsPublicKey: document.getElementById('emailjsPublicKey').value, emailjsServiceId: document.getElementById('emailjsServiceId').value, emailjsTemplateId: document.getElementById('emailjsTemplateId').value };
  await CloudStorage.saveConfig(state.config);
  toast(i18n.t('config_saved'), 'success');
}

// ==================== UTILS ====================
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function toast(msg, type = 'info') { const e = document.getElementById('toast'); e.textContent = msg; e.className = `toast ${type}`; setTimeout(() => e.classList.add('hidden'), 3500); }
function toggleModal(show) { document.getElementById('modalOverlay').classList.toggle('hidden', !show); }
function getAllMembers() { return state.families.flatMap(f => f.members.filter(m => m.name?.trim()).map(m => ({ ...m, familyId: f.id, familyName: f.name }))); }

// ==================== FAMILIES ====================
async function addFamily() {
  const input = document.getElementById('familyName'), name = input.value.trim();
  if (!name) return toast(i18n.t('families_empty'), 'error');
  state.families.push({ id: uid(), name, members: [] });
  await CloudStorage.saveFamilies(state.families);
  input.value = ''; renderFamilies(); toast('\u2705 ' + name, 'success');
}
function renderFamilies() {
  const c = document.getElementById('familiesList');
  if (!state.families.length) { c.innerHTML = `<div class="card" style="text-align:center;color:var(--text-secondary);"><i class="fas fa-users" style="font-size:2rem;"></i><p>${i18n.t('families_empty')}</p></div>`; return; }
  c.innerHTML = state.families.map(f => `<div class="family-card"><h3><span><i class="fas fa-home"></i> ${esc(f.name)}</span><button class="btn btn-danger" onclick="removeFamily('${f.id}')"><i class="fas fa-trash"></i></button></h3><div id="members-${f.id}">${(f.members||[]).map(m => `<div class="member-row"><input type="text" value="${esc(m.name)}" placeholder="${i18n.t('name')}" onchange="updateMember('${f.id}','${m.id}','name',this.value)"><input type="email" value="${esc(m.email||'')}" placeholder="${i18n.t('email')}" onchange="updateMember('${f.id}','${m.id}','email',this.value)"><button class="btn btn-sm btn-gold" onclick="resetPassword('${f.id}','${m.id}')" title="Reset password"><i class="fas fa-key"></i></button><button class="btn btn-danger" onclick="removeMember('${f.id}','${m.id}')"><i class="fas fa-times"></i></button></div>`).join('')}</div><button class="btn btn-secondary" onclick="addMember('${f.id}')" style="margin-top:0.5rem;"><i class="fas fa-user-plus"></i> ${i18n.t('families_add_member')}</button></div>`).join('');
}
async function addMember(fid) {
  const f = state.families.find(x => x.id === fid); if (!f) return;
  if (!f.members) f.members = [];
  f.members.push({ id: uid(), name: '', email: '' });
  await CloudStorage.saveFamilies(state.families); renderFamilies();
  setTimeout(() => { const i = document.querySelectorAll(`#members-${fid} .member-row:last-child input`); if (i[0]) i[0].focus(); }, 50);
}
async function updateMember(fid, mid, field, value) {
  const f = state.families.find(x => x.id === fid), m = f?.members?.find(x => x.id === mid); if (!m) return;
  if (field === 'name' && value.trim() && f.members.find(x => x.id !== mid && x.name?.trim().toLowerCase() === value.trim().toLowerCase())) { toast(i18n.t('member_duplicate_name').replace('{name}', value), 'error'); renderFamilies(); return; }
  m[field] = value; await CloudStorage.saveFamilies(state.families); toast('\u2705', 'success');
}
async function removeMember(fid, mid) {
  const f = state.families.find(x => x.id === fid); if (!f) return;
  f.members = (f.members||[]).filter(m => m.id !== mid); delete state.wishlists[mid];
  await CloudStorage.saveFamilies(state.families); renderFamilies();
}
async function removeFamily(fid) {
  const f = state.families.find(x => x.id === fid); if (!f || !confirm(i18n.t('families_confirm_delete').replace('{name}', f.name))) return;
  (f.members||[]).forEach(m => delete state.wishlists[m.id]);
  state.families = state.families.filter(x => x.id !== fid);
  await CloudStorage.saveFamilies(state.families); renderFamilies();
}
async function resetPassword(fid, mid) {
  const f = state.families.find(x => x.id === fid), m = f?.members?.find(x => x.id === mid);
  if (!m || !confirm(`Reset password for ${m.name}?`)) return;
  delete m.password; await CloudStorage.saveFamilies(state.families); toast('\ud83d\udd11 ' + m.name, 'success');
}

// ==================== WISHLISTS ====================
function populateWishlistSelect() {
  const s = document.getElementById('wishlistPerson');
  s.innerHTML = `<option value="">${i18n.t('wishlists_select')}</option>` + state.families.map(f => { const o = (f.members||[]).filter(m => m.name?.trim()).map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join(''); return o ? `<optgroup label="${esc(f.name)}">${o}</optgroup>` : ''; }).join('');
  document.getElementById('wishlistForm').classList.add('hidden');
}
function onPersonSelect() {
  const id = document.getElementById('wishlistPerson').value;
  if (!id) { document.getElementById('wishlistForm').classList.add('hidden'); return; }
  document.getElementById('wishlistForm').classList.remove('hidden'); renderWishlistItems(id);
}
function renderWishlistItems(mid) {
  const items = state.wishlists[mid] || [], c = document.getElementById('wishlistItems'), max = state.config.maxGifts || 5;
  document.getElementById('addWishItem').classList.toggle('hidden', items.length >= max);
  if (!items.length) { c.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:1rem;">${i18n.t('wishlists_empty')}</p>`; return; }
  c.innerHTML = items.map((item, i) => `<div class="wish-item"><h4><span>${i18n.t('wishlists_gift_n').replace('{n}',i+1)}</span><button class="btn btn-danger" onclick="removeWishItem('${mid}',${i})"><i class="fas fa-trash"></i></button></h4><div class="form-group"><label>${i18n.t('wishlists_gift_title')}</label><input type="text" value="${esc(item.title)}" onchange="updateWishItem('${mid}',${i},'title',this.value)"></div><div class="form-group"><label>${i18n.t('wishlists_gift_link')}</label><input type="url" value="${esc(item.link)}" onchange="updateWishItem('${mid}',${i},'link',this.value)" placeholder="https://...">${item.link?`<a href="${esc(item.link)}" target="_blank" style="color:var(--green);font-size:0.85rem;margin-top:4px;display:inline-block;"><i class="fas fa-external-link-alt"></i> Open</a>`:''}</div><div class="form-group"><label>${i18n.t('wishlists_gift_image')}</label><input type="url" value="${esc(item.imageUrl)}" onchange="updateWishItem('${mid}',${i},'imageUrl',this.value);this.nextElementSibling.src=this.value;" placeholder="https://..."><img class="preview-img" src="${esc(item.imageUrl)}" onerror="this.style.display='none'" onload="this.style.display='block'" style="${item.imageUrl?'':'display:none'}"></div><div class="form-group"><label>${i18n.t('wishlists_gift_desc')}</label><textarea onchange="updateWishItem('${mid}',${i},'description',this.value)">${esc(item.description)}</textarea></div><div class="form-group"><label>${i18n.t('wishlists_gift_notes')}</label><textarea onchange="updateWishItem('${mid}',${i},'notes',this.value)">${esc(item.notes)}</textarea></div></div>`).join('');
}
function addWishItem() {
  const id = document.getElementById('wishlistPerson').value; if (!id) return;
  if (!state.wishlists[id]) state.wishlists[id] = [];
  if (state.wishlists[id].length >= (state.config.maxGifts||5)) return toast(i18n.t('wishlists_max').replace('{n}',state.config.maxGifts), 'error');
  state.wishlists[id].push({ title:'', link:'', imageUrl:'', description:'', notes:'' }); renderWishlistItems(id);
}
function updateWishItem(mid, i, field, val) { if (state.wishlists[mid]?.[i]) state.wishlists[mid][i][field] = val; }
function removeWishItem(mid, i) { state.wishlists[mid]?.splice(i, 1); renderWishlistItems(mid); }
async function saveWishlist() {
  const id = document.getElementById('wishlistPerson').value;
  if (id && state.wishlists[id]) await CloudStorage.saveWishlist(id, state.wishlists[id]);
  toast(i18n.t('wishlists_saved'), 'success');
}

// ==================== ALL WISHLISTS OVERVIEW ====================
function renderAllWishlists() {
  const c = document.getElementById('allWishlistsView'), members = getAllMembers();
  if (!members.length) { c.innerHTML = '<p style="color:var(--text-secondary);">No members yet.</p>'; return; }
  c.innerHTML = members.map(m => {
    const items = state.wishlists[m.id] || [];
    const badge = items.length ? `<span style="color:var(--green);">(${items.length})</span>` : '<span style="color:var(--gold);">(0)</span>';
    const list = items.filter(w => w.title?.trim()).map(w =>
      `<div style="padding:4px 0;border-bottom:1px solid var(--border-color);font-size:0.9rem;">` +
      `<strong>${esc(w.title)}</strong>` +
      (w.description ? ` <span style="color:var(--text-secondary);">- ${esc(w.description)}</span>` : '') +
      (w.link ? ` <a href="${esc(w.link)}" target="_blank" style="color:var(--green);"><i class="fas fa-external-link-alt"></i></a>` : '') +
      (w.notes ? ` <em style="color:var(--text-secondary);font-size:0.8rem;">(${esc(w.notes)})</em>` : '') +
      `</div>`
    ).join('') || '<p style="color:var(--text-secondary);font-size:0.85rem;">No gifts yet</p>';
    return `<div style="margin-bottom:1rem;padding:0.8rem;background:var(--bg-card-alt);border-radius:10px;border-left:4px solid ${items.length ? 'var(--green)' : 'var(--gold)'};">` +
      `<h4 style="margin-bottom:0.5rem;">${esc(m.name)} ${badge} <span style="color:var(--text-secondary);font-size:0.8rem;">- ${esc(m.familyName)}</span></h4>` +
      list + `</div>`;
  }).join('');
}

// ==================== MEMBER URLs ====================
function renderMemberUrls() {
  const c = document.getElementById('memberUrls'), members = getAllMembers();
  if (!members.length) { c.innerHTML = `<p style="color:var(--text-secondary);">${i18n.t('families_empty')}</p>`; return; }
  const base = window.location.href.replace(/\/[^/]*$/, '');
  c.innerHTML = members.map(m => { const url = `${base}/my-list.html?id=${m.id}`; return `<div class="url-row"><span class="name">${esc(m.name)}</span><input type="text" value="${url}" readonly onclick="this.select()"><button class="btn btn-sm btn-gold" onclick="copyUrl(this,'${url}')"><i class="fas fa-copy"></i> ${i18n.t('copy')}</button></div>`; }).join('');
}
function copyUrl(btn, url) { navigator.clipboard.writeText(url).then(() => { const o = btn.innerHTML; btn.innerHTML = `<i class="fas fa-check"></i> ${i18n.t('copied')}`; setTimeout(() => btn.innerHTML = o, 1500); }).catch(() => toast('Error','error')); }

// ==================== SORTEO STATUS ====================
function checkSorteoReady() {
  const members = getAllMembers(), families = state.families.filter(f => (f.members||[]).some(m => m.name?.trim()));
  const el = document.getElementById('sorteoStatus'), btn = document.getElementById('startSorteo'), issues = [];
  if (members.length < 2) issues.push(i18n.t('sorteo_need_members'));
  if (families.length < 2) issues.push(i18n.t('sorteo_need_families'));
  const noEmail = members.filter(m => !m.email?.trim()), noList = members.filter(m => !(state.wishlists[m.id]?.length));
  if (issues.length) { el.innerHTML = issues.map(i => `<p class="warning"><i class="fas fa-exclamation-triangle"></i> ${i}</p>`).join(''); btn.disabled = true; }
  else { el.innerHTML = `<p class="ready"><i class="fas fa-check-circle"></i> ${i18n.t('sorteo_ready').replace('{n}',members.length).replace('{f}',families.length)}</p>`; btn.disabled = false; }
  if (noEmail.length) el.innerHTML += `<p style="color:var(--gold);"><i class="fas fa-envelope"></i> ${noEmail.length} sin correo: ${noEmail.map(m=>m.name).join(', ')}</p>`;
  if (noList.length) el.innerHTML += `<p style="color:var(--gold);"><i class="fas fa-list"></i> ${noList.length} sin lista: ${noList.map(m=>m.name).join(', ')}</p>`;
  if (state.sorteoResult) showResults(state.sorteoResult);
}

// ==================== SORTEO ====================
function shuffleArray(a) { for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; } }
function performSorteo(members) {
  const fm={}; state.families.forEach(f=>(f.members||[]).forEach(m=>{fm[m.id]=f.id;}));
  for (let t=0;t<1000;t++) { const r=[...members];shuffleArray(r);let ok=true;const res=[];
    for (let i=0;i<members.length;i++) { if(members[i].id===r[i].id||fm[members[i].id]===fm[r[i].id]){ok=false;break;} res.push({giverId:members[i].id,receiverId:r[i].id}); }
    if(ok)return res; } return null;
}
async function startSorteo() {
  const members=getAllMembers(),result=performSorteo(members);
  if(!result){toast(i18n.t('sorteo_impossible'),'error');return;}
  const btn=document.getElementById('startSorteo');btn.disabled=true;
  document.getElementById('rouletteContainer').classList.add('active');buildRouletteWheel(members);
  const wheel=document.getElementById('rouletteWheel'),rot=1800+Math.random()*1440;
  wheel.style.transition='none';wheel.style.transform='rotate(0deg)';void wheel.offsetHeight;
  wheel.style.transition='transform 4s cubic-bezier(0.17,0.67,0.12,0.99)';wheel.style.transform=`rotate(${rot}deg)`;
  await sleep(4200);
  state.sorteoResult=result;state.sorteoDate=new Date().toISOString();
  await CloudStorage.saveSorteo(result,state.sorteoDate);
  showResults(result);btn.disabled=false;
  document.getElementById('modalTitle').textContent=i18n.t('sorteo_complete_title');
  document.getElementById('modalMessage').textContent=i18n.t('sorteo_complete_msg').replace('{n}',result.length);
  toggleModal(true);
}
function buildRouletteWheel(members) {
  const w=document.getElementById('rouletteWheel');w.querySelectorAll('.roulette-segment').forEach(e=>e.remove());
  const colors=['#c0392b','#27ae60','#2980b9','#f39c12','#8e44ad','#e67e22','#1abc9c','#e74c3c'],angle=360/members.length;
  members.forEach((m,i)=>{const s=document.createElement('div');s.className='roulette-segment';s.style.background=colors[i%8];s.style.setProperty('--half-angle',(angle/2)+'deg');s.style.transform=`rotate(${angle*i}deg)`;s.style.clipPath=`polygon(0% 100%,100% 100%,${50+50*Math.cos((angle-90)*Math.PI/180)}% ${50+50*Math.sin((angle-90)*Math.PI/180)}%)`;s.style.cssText+='width:100%;height:100%;top:0;left:0;transform-origin:50% 50%;';const sp=document.createElement('span');sp.textContent=m.name.length>10?m.name.substring(0,10)+'\u2026':m.name;s.appendChild(sp);w.appendChild(s);});
}
function showResults(result) {
  const members=getAllMembers(),map=Object.fromEntries(members.map(m=>[m.id,m])),c=document.getElementById('sorteoResults');c.classList.remove('hidden');
  c.innerHTML=`<h3 style="margin-bottom:1rem;color:var(--green);"><i class="fas fa-check-circle"></i> ${i18n.t('sorteo_results')}</h3>`+result.map(r=>{const g=map[r.giverId],rv=map[r.receiverId];return(!g||!rv)?'':`<div class="result-pair"><span class="person">${esc(g.name)}</span><span class="arrow"><i class="fas fa-arrow-right"></i></span><span class="person">${esc(rv.name)}</span><span style="color:var(--text-secondary);font-size:0.8rem;margin-left:auto;">(${esc(rv.familyName)})</span></div>`;}).join('')+`<button class="btn btn-secondary" onclick="clearSorteo()" style="margin-top:1rem;"><i class="fas fa-redo"></i> ${i18n.t('sorteo_new')}</button>`;
}
async function clearSorteo() {
  if(!confirm(i18n.t('sorteo_confirm_clear')))return;
  state.sorteoResult=null;state.sorteoDate=null;await CloudStorage.clearSorteo();
  document.getElementById('sorteoResults').classList.add('hidden');document.getElementById('sorteoResults').innerHTML='';
  document.getElementById('rouletteContainer').classList.remove('active');
  const w=document.getElementById('rouletteWheel');w.style.transition='none';w.style.transform='rotate(0deg)';checkSorteoReady();
}

// ==================== EMAIL ====================
function buildEmailHtml(gn,rn,wt,en,b){return`<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden"><div style="background:linear-gradient(135deg,#c0392b,#922b21);padding:30px 20px;text-align:center"><div style="font-size:48px">\ud83c\udf84\ud83c\udf81\ud83c\udf84</div><h1 style="color:#fff;font-size:24px;margin:10px 0 5px">${esc(en)}</h1></div><div style="padding:30px 25px;background:#fff"><p style="font-size:16px;color:#2c3e50">${i18n.t('email_greeting')} <strong>${esc(gn)}</strong></p><p style="font-size:15px;color:#555;line-height:1.6">${i18n.t('email_intro')}</p><div style="background:linear-gradient(135deg,#27ae60,#1e8449);border-radius:12px;padding:20px;text-align:center;margin:20px 0"><div style="font-size:36px">\ud83c\udf81</div><p style="color:rgba(255,255,255,0.8);font-size:13px;margin:5px 0">${i18n.t('email_you_got')}</p><h2 style="color:#fff;font-size:26px;margin:5px 0">${esc(rn)}</h2></div><div style="background:#fef9e7;border:2px solid #f39c12;border-radius:10px;padding:12px 16px;margin:15px 0;text-align:center"><span style="font-size:14px;color:#f39c12;font-weight:700">${i18n.t('email_budget_label')}: ${esc(b)}</span></div><div style="margin-top:20px"><h3 style="color:#c0392b;font-size:16px;border-bottom:2px solid #ecf0f1;padding-bottom:8px">${i18n.t('email_wishlist_title')}</h3><pre style="font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;color:#555;line-height:1.8;white-space:pre-wrap;background:#f8f9fa;border-radius:8px;padding:15px;margin-top:10px">${esc(wt)}</pre></div><p style="font-size:13px;color:#999;margin-top:25px;text-align:center">${i18n.t('email_secret')}</p></div><div style="background:#1a1a2e;padding:20px;text-align:center"><p style="color:#666;font-size:12px;margin:0">${i18n.t('email_footer')} ${esc(en)}</p></div></div>`;}
async function sendEmails() {
  const{emailjsPublicKey,emailjsServiceId,emailjsTemplateId,eventName,budget}=state.config;
  if(!emailjsPublicKey||!emailjsServiceId||!emailjsTemplateId){toast(i18n.t('sorteo_configure_email'),'error');toggleModal(false);return;}
  if(!state.sorteoResult){toggleModal(false);return;}
  try{emailjs.init(emailjsPublicKey);}catch(e){toast('EmailJS error','error');toggleModal(false);return;}
  const members=getAllMembers(),map=Object.fromEntries(members.map(m=>[m.id,m])),btn=document.getElementById('modalSendEmail');
  btn.disabled=true;btn.innerHTML=`<i class="fas fa-spinner fa-spin"></i> ${i18n.t('sorteo_sending')}`;
  let sent=0,errors=0;
  for(const pair of state.sorteoResult){const g=map[pair.giverId],rv=map[pair.receiverId];if(!g?.email||!rv){errors++;continue;}
    const wt=(state.wishlists[rv.id]||[]).filter(w=>w.title?.trim()).map((w,i)=>{let l=`${i+1}. ${w.title}`;if(w.description)l+=` - ${w.description}`;if(w.link)l+=` | ${w.link}`;if(w.notes)l+=` | ${w.notes}`;return l;}).join('\n')||i18n.t('email_no_wishlist');
    try{await emailjs.send(emailjsServiceId,emailjsTemplateId,{to_email:g.email,email_subject:i18n.t('email_subject').replace('{event}',eventName),email_body:buildEmailHtml(g.name,rv.name,wt,eventName,budget||'N/A')});sent++;}catch(e){console.error(e);errors++;}}
  btn.disabled=false;btn.innerHTML=`<i class="fas fa-envelope"></i> ${i18n.t('sorteo_send_email')}`;toggleModal(false);
  toast(!errors?i18n.t('sorteo_sent_ok').replace('{n}',sent):i18n.t('sorteo_sent_errors').replace('{sent}',sent).replace('{errors}',errors),!errors?'success':'error');
}

// ==================== CLOUD SYNC ====================
async function syncToCloud(){toast('\u23f3','info');const ok=await CloudStorage.save(state);toast(ok?'\u2705 Uploaded':'\u274c Failed',ok?'success':'error');}
async function syncFromCloud(){toast('\u23f3','info');const data=await CloudStorage.load();if(!data){toast('\u274c Failed','error');return;}state={config:data.config||{},families:data.families||[],wishlists:data.wishlists||{},sorteoResult:data.sorteoResult||null,sorteoDate:data.sorteoDate||null};loadConfigUI();renderFamilies();populateWishlistSelect();toast('\u2705 Downloaded','success');}

// ==================== EXPORT ====================
function exportExcel(type){
  if(typeof XLSX==='undefined'){toast('XLSX not loaded','error');return;}
  const wb=XLSX.utils.book_new(),members=getAllMembers(),map=Object.fromEntries(members.map(m=>[m.id,m]));
  if(type==='participants'||type==='all')XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(members.map(m=>({Family:m.familyName,Name:m.name,Email:m.email}))),'Participants');
  if(type==='wishlists'||type==='all'){const d=[];members.forEach(m=>(state.wishlists[m.id]||[]).forEach((w,i)=>d.push({Name:m.name,Family:m.familyName,'#':i+1,Gift:w.title,Link:w.link,Description:w.description,Notes:w.notes})));if(!d.length)d.push({Name:'No wishlists'});XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(d),'Wishlists');}
  if(type==='sorteo'||type==='all'){const d=(state.sorteoResult||[]).map(r=>{const g=map[r.giverId],rv=map[r.receiverId];return{Giver:g?.name||'?',GiverFamily:g?.familyName||'?',GiverEmail:g?.email||'?',Receiver:rv?.name||'?',ReceiverFamily:rv?.familyName||'?'};});if(!d.length)d.push({Giver:'No draw'});XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(d),'Draw');}
  const fn=`${(state.config.eventName||'exchange').replace(/[^a-zA-Z0-9]/g,'_')}_${type}.xlsx`;XLSX.writeFile(wb,fn);toast('\u2705 '+fn,'success');
}
