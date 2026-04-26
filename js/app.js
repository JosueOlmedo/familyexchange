// ==================== STATE ====================
const STATE_KEY = 'intercambioNavidad';
const SESSION_KEY = 'intercambioSession';

let state = loadState();
let session = loadSession();

function defaultState() {
  return {
    config: {
      maxGifts: 5,
      eventName: 'Intercambio Navidad 2025',
      budget: '',
      npointBinId: '',
      adminPin: '',
      senderEmail: '',
      emailjsPublicKey: '',
      emailjsServiceId: '',
      emailjsTemplateId: ''
    },
    families: [],
    wishlists: {},
    sorteoResult: null,
    sorteoDate: null
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    return saved ? { ...defaultState(), ...JSON.parse(saved) } : defaultState();
  } catch { return defaultState(); }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  autoSync();
}

let syncTimeout = null;
function autoSync() {
  const binId = state.config.npointBinId;
  if (!binId) return;
  clearTimeout(syncTimeout);
  // Wait 5s after last change before syncing
  syncTimeout = setTimeout(async () => {
    // Don't sync if user is actively editing
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    CloudStorage.init(binId);
    // Read-merge-write: preserve participant data (wishlists, passwords)
    const cloud = await CloudStorage.load();
    const merged = { ...state };
    if (cloud) {
      // Keep participant wishlists that admin doesn't have locally
      merged.wishlists = { ...cloud.wishlists, ...state.wishlists };
      // Keep participant passwords/avatars
      merged.families = state.families.map(f => ({
        ...f,
        members: f.members.map(m => {
          const cloudFamily = cloud.families?.find(cf => cf.id === f.id);
          const cloudMember = cloudFamily?.members?.find(cm => cm.id === m.id);
          if (cloudMember) {
            return { ...m, password: m.password || cloudMember.password, avatar: m.avatar || cloudMember.avatar };
          }
          return m;
        })
      }));
      // Keep participants that registered via my-list.html (not in admin's local state)
      cloud.families?.forEach(cf => {
        const localFamily = merged.families.find(f => f.id === cf.id);
        if (localFamily) {
          cf.members.forEach(cm => {
            if (!localFamily.members.find(m => m.id === cm.id)) {
              localFamily.members.push(cm);
            }
          });
        }
      });
    }
    const ok = await CloudStorage.safeSave((cloud) => { const m={...cloud,...merged}; m.wishlists={...(cloud.wishlists||{}),...merged.wishlists}; return m; });
    if (ok) console.log('Auto-synced to cloud (merged)');
  }, 2000);
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch { return null; }
}

function saveSession(data) {
  session = data;
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLang();
  createSnowflakes();

  if (session) {
    if (state.config.adminPin) {
      showPinScreen();
    } else {
      showApp();
    }
  } else {
    showRegistration();
  }
});

function showApp() {
  document.getElementById('registerOverlay').classList.add('hidden');
  document.getElementById('mainHeader').classList.remove('hidden');
  document.getElementById('mainContent').classList.remove('hidden');

  // Display user badge
  document.getElementById('userName').textContent = session.name;
  const avatarEl = document.getElementById('userAvatar');
  avatarEl.textContent = session.avatar;
  avatarEl.style.display = 'flex';

  initNavigation();
  loadConfigUI();
  renderFamilies();
  populateWishlistSelect();
  renderMemberUrls();
  checkSorteoReady();
  bindEvents();

  // Auto-refresh from cloud every 30s (only if user is not editing)
  setInterval(async () => {
    // Skip if user is typing in any input/textarea
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;

    const binId = state.config.npointBinId;
    if (!binId) return;
    CloudStorage.init(binId);
    const data = await CloudStorage.load();
    if (!data) return;
    const localConfig = { ...state.config };
    // Merge: cloud brings new registrations, local preserves pending edits
    state.wishlists = { ...data.wishlists, ...state.wishlists };
    state.sorteoResult = data.sorteoResult ?? state.sorteoResult;
    state.sorteoDate = data.sorteoDate ?? state.sorteoDate;
    state.families = state.families.map(f => { const cf = data.families?.find(x => x.id === f.id); if (!cf) return f; cf.members.forEach(cm => { if (!f.members.find(m => m.id === cm.id)) f.members.push(cm); }); f.members = f.members.map(m => { const cm = cf.members.find(x => x.id === m.id); return cm ? { ...m, password: cm.password || m.password, avatar: cm.avatar || m.avatar } : m; }); return f; });
    state.config.npointBinId = localConfig.npointBinId;
    state.config.adminPin = localConfig.adminPin;
    state.config.emailjsPublicKey = localConfig.emailjsPublicKey;
    state.config.emailjsServiceId = localConfig.emailjsServiceId;
    state.config.emailjsTemplateId = localConfig.emailjsTemplateId;
    state.config.senderEmail = localConfig.senderEmail;
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    renderFamilies();
    populateWishlistSelect();
    console.log('Auto-refreshed from cloud');
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

// ==================== PIN SCREEN ====================
function showPinScreen() {
  document.getElementById('registerOverlay').classList.add('hidden');
  document.getElementById('pinOverlay').classList.remove('hidden');
  document.getElementById('pinTitle').textContent = i18n.t('admin_pin_title');
  document.getElementById('pinSubtitle').textContent = i18n.t('admin_pin_subtitle');
  document.getElementById('pinInput').placeholder = i18n.t('admin_pin_placeholder');
  document.getElementById('pinEnter').textContent = 'OK';
  document.getElementById('pinEnter').addEventListener('click', checkPin);
  document.getElementById('pinInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPin();
  });
  document.getElementById('pinInput').focus();
}

function checkPin() {
  const input = document.getElementById('pinInput').value;
  if (input === state.config.adminPin) {
    document.getElementById('pinOverlay').classList.add('hidden');
    showApp();
  } else {
    toast(i18n.t('admin_pin_wrong'), 'error');
    document.getElementById('pinInput').value = '';
    document.getElementById('pinInput').focus();
  }
}

// ==================== REGISTRATION ====================
// Emoji avatars: zero dependencies, works offline
const AVATARS = [
  '🎅', '🤶', '🧑‍🎄', '⛄', '🦌', '🎄',
  '🐧', '🎁', '⭐', '🔔', '❄️', '🍪'
];
let selectedAvatar = null;

function showRegistration() {
  document.getElementById('pinOverlay').classList.add('hidden');
  const overlay = document.getElementById('registerOverlay');
  overlay.classList.remove('hidden');

  // Populate text
  updateRegistrationText();
  buildAvatarPicker();

  document.getElementById('regEnter').addEventListener('click', handleRegister);
  document.getElementById('regLangToggle').addEventListener('click', () => {
    toggleLang();
    updateRegistrationText();
  });

  // Enter key
  document.getElementById('regName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleRegister();
  });
}

function updateRegistrationText() {
  document.getElementById('regTitle').textContent = i18n.t('reg_title');
  document.getElementById('regEventName').textContent = state.config.eventName;
  document.getElementById('regSubtitle').textContent = i18n.t('reg_subtitle');
  document.getElementById('regName').placeholder = i18n.t('reg_name_placeholder');
  document.getElementById('regAvatarLabel').textContent = i18n.t('reg_pick_avatar');
  document.getElementById('regEnter').textContent = i18n.t('reg_enter');
}

function buildAvatarPicker() {
  const container = document.getElementById('avatarPicker');
  container.innerHTML = '';

  AVATARS.forEach(emoji => {
    const div = document.createElement('div');
    div.className = 'avatar-option';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.fontSize = '2rem';
    div.textContent = emoji;
    div.addEventListener('click', () => {
      container.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedAvatar = emoji;
    });
    container.appendChild(div);
  });

  container.children[0]?.click();
}

function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  if (!name) {
    toast(i18n.t('reg_name_required'), 'error');
    document.getElementById('regName').focus();
    return;
  }

  saveSession({ name, avatar: selectedAvatar || '🎅' });
  showApp();
}

// ==================== THEME (DARK/LIGHT) ====================
function initTheme() {
  const saved = localStorage.getItem('intercambio_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('intercambio_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// ==================== LANGUAGE (i18n) ====================
function initLang() {
  const saved = localStorage.getItem('intercambio_lang') || 'es';
  i18n.setLang(saved);
  updateLangButton();
}

function toggleLang() {
  const next = i18n.current === 'es' ? 'en' : 'es';
  i18n.setLang(next);
  updateLangButton();
  applyTranslations();
}

function updateLangButton() {
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = i18n.current.toUpperCase();
  const regBtn = document.getElementById('regLangToggle');
  if (regBtn) regBtn.textContent = i18n.current === 'es' ? 'ES / EN' : 'EN / ES';
}

function applyTranslations() {
  // data-i18n → textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = i18n.t(key);
  });
  // data-i18n-html → innerHTML
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = i18n.t(key);
  });
  // data-i18n-placeholder → placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = i18n.t(key);
  });
}

// ==================== NAVIGATION ====================
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.section).classList.add('active');
      if (btn.dataset.section === 'wishlists') { populateWishlistSelect(); renderMemberUrls(); }
      if (btn.dataset.section === 'sorteo') checkSorteoReady();
    });
  });
  applyTranslations();
}

// ==================== SNOWFLAKES ====================
function createSnowflakes() {
  const container = document.getElementById('snowflakes');
  const flakes = ['❄', '❅', '❆', '✦'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'snowflake';
    el.textContent = flakes[Math.floor(Math.random() * flakes.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = (Math.random() * 1.2 + 0.5) + 'rem';
    el.style.animationDuration = (Math.random() * 5 + 5) + 's';
    el.style.animationDelay = (Math.random() * 8) + 's';
    el.style.opacity = Math.random() * 0.6 + 0.2;
    container.appendChild(el);
  }
}

// ==================== CONFIG ====================
function loadConfigUI() {
  const c = state.config;
  document.getElementById('maxGifts').value = c.maxGifts;
  document.getElementById('eventName').value = c.eventName;
  document.getElementById('budget').value = c.budget;
  document.getElementById('npointBinId').value = c.npointBinId || '';
  document.getElementById('adminPin').value = c.adminPin || '';
  document.getElementById('senderEmail').value = c.senderEmail;
  document.getElementById('emailjsPublicKey').value = c.emailjsPublicKey;
  document.getElementById('emailjsServiceId').value = c.emailjsServiceId;
  document.getElementById('emailjsTemplateId').value = c.emailjsTemplateId;
}

function saveConfig() {
  state.config = {
    maxGifts: parseInt(document.getElementById('maxGifts').value) || 5,
    eventName: document.getElementById('eventName').value || 'Intercambio Navidad 2025',
    budget: document.getElementById('budget').value,
    npointBinId: document.getElementById('npointBinId').value.trim().replace(/^https?:\/\/api\.npoint\.io\//i, ''),
    adminPin: document.getElementById('adminPin').value.trim(),
    senderEmail: document.getElementById('senderEmail').value,
    emailjsPublicKey: document.getElementById('emailjsPublicKey').value,
    emailjsServiceId: document.getElementById('emailjsServiceId').value,
    emailjsTemplateId: document.getElementById('emailjsTemplateId').value,
  };
  saveState();
  toast(i18n.t('config_saved'), 'success');
}

// ==================== UTILS ====================
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
function esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  setTimeout(() => el.classList.add('hidden'), 3500);
}

function toggleModal(show) {
  document.getElementById('modalOverlay').classList.toggle('hidden', !show);
}

function getAllMembers() {
  return state.families.flatMap(f =>
    f.members.filter(m => m.name.trim()).map(m => ({ ...m, familyId: f.id, familyName: f.name }))
  );
}

// ==================== FAMILIES ====================
function addFamily() {
  const input = document.getElementById('familyName');
  const name = input.value.trim();
  if (!name) return toast(i18n.t('families_empty'), 'error');
  state.families.push({ id: uid(), name, members: [] });
  saveState();
  input.value = '';
  renderFamilies();
  toast(`✅ ${name}`, 'success');
}

function renderFamilies() {
  const container = document.getElementById('familiesList');
  if (!state.families.length) {
    container.innerHTML = `<div class="card" style="text-align:center;color:var(--text-secondary);">
      <i class="fas fa-users" style="font-size:2rem;"></i>
      <p>${i18n.t('families_empty')}</p></div>`;
    return;
  }
  container.innerHTML = state.families.map(f => `
    <div class="family-card">
      <h3>
        <span><i class="fas fa-home"></i> ${esc(f.name)}</span>
        <button class="btn btn-danger" onclick="removeFamily('${f.id}')"><i class="fas fa-trash"></i></button>
      </h3>
      <div id="members-${f.id}">
        ${f.members.map(m => `
          <div class="member-row">
            <input type="text" value="${esc(m.name)}" placeholder="${i18n.t('name')}" onchange="updateMember('${f.id}','${m.id}','name',this.value)">
            <input type="email" value="${esc(m.email)}" placeholder="${i18n.t('email')}" onchange="updateMember('${f.id}','${m.id}','email',this.value)">
            <button class="btn btn-sm btn-gold" onclick="resetPassword('${f.id}','${m.id}')" title="Reset password"><i class="fas fa-key"></i></button>
            <button class="btn btn-danger" onclick="removeMember('${f.id}','${m.id}')"><i class="fas fa-times"></i></button>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary" onclick="addMember('${f.id}')" style="margin-top:0.5rem;">
        <i class="fas fa-user-plus"></i> ${i18n.t('families_add_member')}
      </button>
    </div>
  `).join('');
}

function addMember(familyId) {
  const family = state.families.find(f => f.id === familyId);
  if (!family) return;
  family.members.push({ id: uid(), name: '', email: '' });
  saveState();
  renderFamilies();
  setTimeout(() => {
    const inputs = document.querySelectorAll(`#members-${familyId} .member-row:last-child input`);
    if (inputs[0]) inputs[0].focus();
  }, 50);
}

function updateMember(familyId, memberId, field, value) {
  const family = state.families.find(f => f.id === familyId);
  const member = family?.members.find(m => m.id === memberId);
  if (!member) return;

  if (field === 'name' && value.trim()) {
    const dup = family.members.find(m => m.id !== memberId && m.name.trim().toLowerCase() === value.trim().toLowerCase());
    if (dup) { toast(i18n.t('member_duplicate_name').replace('{name}', value), 'error'); renderFamilies(); return; }
  }

  member[field] = value;
  saveState();
  toast('✅', 'success');
}

function removeMember(familyId, memberId) {
  const family = state.families.find(f => f.id === familyId);
  if (!family) return;
  family.members = family.members.filter(m => m.id !== memberId);
  delete state.wishlists[memberId];
  saveState();
  renderFamilies();
}

function removeFamily(familyId) {
  const family = state.families.find(f => f.id === familyId);
  if (!family) return;
  const msg = i18n.t('families_confirm_delete').replace('{name}', family.name);
  if (!confirm(msg)) return;
  family.members.forEach(m => delete state.wishlists[m.id]);
  state.families = state.families.filter(f => f.id !== familyId);
  saveState();
  renderFamilies();
}

// ==================== WISHLISTS ====================
function populateWishlistSelect() {
  const select = document.getElementById('wishlistPerson');
  select.innerHTML = `<option value="">${i18n.t('wishlists_select')}</option>` +
    state.families.map(f => {
      const opts = f.members.filter(m => m.name.trim()).map(m =>
        `<option value="${m.id}">${esc(m.name)}</option>`
      ).join('');
      return opts ? `<optgroup label="${esc(f.name)}">${opts}</optgroup>` : '';
    }).join('');
  document.getElementById('wishlistForm').classList.add('hidden');
}

function onPersonSelect() {
  const memberId = document.getElementById('wishlistPerson').value;
  if (!memberId) { document.getElementById('wishlistForm').classList.add('hidden'); return; }
  document.getElementById('wishlistForm').classList.remove('hidden');
  renderWishlistItems(memberId);
}

function renderWishlistItems(memberId) {
  const items = state.wishlists[memberId] || [];
  const container = document.getElementById('wishlistItems');
  const max = state.config.maxGifts;

  document.getElementById('addWishItem').classList.toggle('hidden', items.length >= max);

  if (!items.length) {
    container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:1rem;">${i18n.t('wishlists_empty')}</p>`;
    return;
  }

  container.innerHTML = items.map((item, idx) => `
    <div class="wish-item">
      <h4>
        <span>${i18n.t('wishlists_gift_n').replace('{n}', idx + 1)}</span>
        <button class="btn btn-danger" onclick="removeWishItem('${memberId}', ${idx})"><i class="fas fa-trash"></i></button>
      </h4>
      <div class="form-group">
        <label>${i18n.t('wishlists_gift_title')}</label>
        <input type="text" value="${esc(item.title)}" onchange="updateWishItem('${memberId}',${idx},'title',this.value)">
      </div>
      <div class="form-group">
        <label>${i18n.t('wishlists_gift_link')}</label>
        <input type="url" value="${esc(item.link)}" onchange="updateWishItem('${memberId}',${idx},'link',this.value)" placeholder="https://...">
      </div>
      <div class="form-group">
        <label>${i18n.t('wishlists_gift_image')}</label>
        <input type="url" value="${esc(item.imageUrl)}" onchange="updateWishItem('${memberId}',${idx},'imageUrl',this.value); this.nextElementSibling.src=this.value;" placeholder="https://...">
        <img class="preview-img" src="${esc(item.imageUrl)}" onerror="this.style.display='none'" onload="this.style.display='block'" style="${item.imageUrl ? '' : 'display:none'}">
      </div>
      <div class="form-group">
        <label>${i18n.t('wishlists_gift_desc')}</label>
        <textarea onchange="updateWishItem('${memberId}',${idx},'description',this.value)">${esc(item.description)}</textarea>
      </div>
      <div class="form-group">
        <label>${i18n.t('wishlists_gift_notes')}</label>
        <textarea onchange="updateWishItem('${memberId}',${idx},'notes',this.value)">${esc(item.notes)}</textarea>
      </div>
    </div>
  `).join('');
}

function addWishItem() {
  const memberId = document.getElementById('wishlistPerson').value;
  if (!memberId) return;
  if (!state.wishlists[memberId]) state.wishlists[memberId] = [];
  if (state.wishlists[memberId].length >= state.config.maxGifts) {
    return toast(i18n.t('wishlists_max').replace('{n}', state.config.maxGifts), 'error');
  }
  state.wishlists[memberId].push({ title: '', link: '', imageUrl: '', description: '', notes: '' });
  saveState();
  renderWishlistItems(memberId);
}

function updateWishItem(memberId, index, field, value) {
  if (state.wishlists[memberId]?.[index]) {
    state.wishlists[memberId][index][field] = value;
    saveState();
  }
}

function removeWishItem(memberId, index) {
  state.wishlists[memberId]?.splice(index, 1);
  saveState();
  renderWishlistItems(memberId);
}

function saveWishlist() {
  saveState();
  toast(i18n.t('wishlists_saved'), 'success');
}

// ==================== MEMBER URLs ====================
function renderMemberUrls() {
  const container = document.getElementById('memberUrls');
  const binId = state.config.npointBinId;
  const members = getAllMembers();

  if (!binId) {
    container.innerHTML = `<p style="color:var(--text-secondary);font-style:italic;">⚠️ ${i18n.t('wishlists_urls_requires')}</p>`;
    return;
  }
  if (!members.length) {
    container.innerHTML = `<p style="color:var(--text-secondary);">${i18n.t('families_empty')}</p>`;
    return;
  }

  const baseUrl = window.location.href.replace(/\/[^/]*$/, '');
  container.innerHTML = members.map(m => {
    const url = `${baseUrl}/my-list.html?id=${m.id}&bin=${binId}`;
    return `
      <div class="url-row">
        <span class="name">${esc(m.name)}</span>
        <input type="text" value="${url}" readonly onclick="this.select()">
        <button class="btn btn-sm btn-gold" onclick="copyUrl(this, '${url}')"><i class="fas fa-copy"></i> ${i18n.t('copy')}</button>
      </div>`;
  }).join('');
}

function copyUrl(btn, url) {
  navigator.clipboard.writeText(url).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-check"></i> ${i18n.t('copied')}`;
    setTimeout(() => { btn.innerHTML = original; }, 1500);
  }).catch(() => toast('Error copying', 'error'));
}

// ==================== SORTEO STATUS ====================
function checkSorteoReady() {
  const members = getAllMembers();
  const families = state.families.filter(f => f.members.some(m => m.name.trim()));
  const statusEl = document.getElementById('sorteoStatus');
  const btn = document.getElementById('startSorteo');

  const issues = [];
  if (members.length < 2) issues.push(i18n.t('sorteo_need_members'));
  if (families.length < 2) issues.push(i18n.t('sorteo_need_families'));

  const noEmail = members.filter(m => !m.email.trim());
  const noWishlist = members.filter(m => !(state.wishlists[m.id]?.length));

  if (issues.length) {
    statusEl.innerHTML = issues.map(i => `<p class="warning"><i class="fas fa-exclamation-triangle"></i> ${i}</p>`).join('');
    btn.disabled = true;
  } else {
    statusEl.innerHTML = `<p class="ready"><i class="fas fa-check-circle"></i> ${i18n.t('sorteo_ready').replace('{n}', members.length).replace('{f}', families.length)}</p>`;
    btn.disabled = false;
  }

  if (noEmail.length) {
    statusEl.innerHTML += `<p style="color:var(--gold);"><i class="fas fa-envelope"></i> ${noEmail.length} sin correo: ${noEmail.map(m => m.name).join(', ')}</p>`;
  }
  if (noWishlist.length) {
    statusEl.innerHTML += `<p style="color:var(--gold);"><i class="fas fa-list"></i> ${noWishlist.length} sin lista: ${noWishlist.map(m => m.name).join(', ')}</p>`;
  }

  if (state.sorteoResult) showResults(state.sorteoResult);
}

// ==================== SORTEO ====================
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function performSorteo(members) {
  const familyMap = {};
  state.families.forEach(f => f.members.forEach(m => { familyMap[m.id] = f.id; }));

  for (let attempt = 0; attempt < 1000; attempt++) {
    const receivers = [...members];
    shuffleArray(receivers);
    let valid = true;
    const result = [];

    for (let i = 0; i < members.length; i++) {
      if (members[i].id === receivers[i].id || familyMap[members[i].id] === familyMap[receivers[i].id]) {
        valid = false;
        break;
      }
      result.push({ giverId: members[i].id, receiverId: receivers[i].id });
    }
    if (valid) return result;
  }
  return null;
}

async function startSorteo() {
  const members = getAllMembers();
  const result = performSorteo(members);

  if (!result) {
    toast(i18n.t('sorteo_impossible'), 'error');
    return;
  }

  const btn = document.getElementById('startSorteo');
  btn.disabled = true;

  // Roulette animation
  const container = document.getElementById('rouletteContainer');
  container.classList.add('active');
  buildRouletteWheel(members);

  const wheel = document.getElementById('rouletteWheel');
  const rotation = 1800 + Math.random() * 1440;
  wheel.style.transition = 'none';
  wheel.style.transform = 'rotate(0deg)';
  void wheel.offsetHeight;
  wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
  wheel.style.transform = `rotate(${rotation}deg)`;

  await sleep(4200);

  state.sorteoResult = result;
  state.sorteoDate = new Date().toISOString();
  saveState();
  showResults(result);
  btn.disabled = false;

  // Show modal
  document.getElementById('modalTitle').textContent = i18n.t('sorteo_complete_title');
  document.getElementById('modalMessage').textContent = i18n.t('sorteo_complete_msg').replace('{n}', result.length);
  toggleModal(true);
}

function buildRouletteWheel(members) {
  const wheel = document.getElementById('rouletteWheel');
  wheel.querySelectorAll('.roulette-segment').forEach(el => el.remove());

  const colors = ['#c0392b', '#27ae60', '#2980b9', '#f39c12', '#8e44ad', '#e67e22', '#1abc9c', '#e74c3c'];
  const angle = 360 / members.length;

  members.forEach((m, i) => {
    const seg = document.createElement('div');
    seg.className = 'roulette-segment';
    seg.style.background = colors[i % colors.length];
    seg.style.setProperty('--half-angle', (angle / 2) + 'deg');
    seg.style.transform = `rotate(${angle * i}deg)`;
    seg.style.clipPath = `polygon(0% 100%, 100% 100%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%)`;
    seg.style.width = '100%';
    seg.style.height = '100%';
    seg.style.top = '0';
    seg.style.left = '0';
    seg.style.transformOrigin = '50% 50%';

    const span = document.createElement('span');
    span.textContent = m.name.length > 10 ? m.name.substring(0, 10) + '…' : m.name;
    seg.appendChild(span);
    wheel.appendChild(seg);
  });
}

function showResults(result) {
  const members = getAllMembers();
  const map = Object.fromEntries(members.map(m => [m.id, m]));
  const container = document.getElementById('sorteoResults');
  container.classList.remove('hidden');

  container.innerHTML = `<h3 style="margin-bottom:1rem;color:var(--green);"><i class="fas fa-check-circle"></i> ${i18n.t('sorteo_results')}</h3>` +
    result.map(r => {
      const g = map[r.giverId], rv = map[r.receiverId];
      if (!g || !rv) return '';
      return `<div class="result-pair">
        <span class="person">${esc(g.name)}</span>
        <span class="arrow"><i class="fas fa-arrow-right"></i></span>
        <span class="person">${esc(rv.name)}</span>
        <span style="color:var(--text-secondary);font-size:0.8rem;margin-left:auto;">(${esc(rv.familyName)})</span>
      </div>`;
    }).join('') +
    `<button class="btn btn-secondary" onclick="clearSorteo()" style="margin-top:1rem;"><i class="fas fa-redo"></i> ${i18n.t('sorteo_new')}</button>`;
}

function clearSorteo() {
  if (!confirm(i18n.t('sorteo_confirm_clear'))) return;
  state.sorteoResult = null;
  state.sorteoDate = null;
  saveState();
  document.getElementById('sorteoResults').classList.add('hidden');
  document.getElementById('sorteoResults').innerHTML = '';
  document.getElementById('rouletteContainer').classList.remove('active');
  const wheel = document.getElementById('rouletteWheel');
  wheel.style.transition = 'none';
  wheel.style.transform = 'rotate(0deg)';
  checkSorteoReady();
}

// ==================== EMAIL ====================
function buildEmailHtml(giverName, receiverName, wishlistText, eventName, budget) {
  return `<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#c0392b,#922b21);padding:30px 20px;text-align:center">
    <div style="font-size:48px">🎄🎁🎄</div>
    <h1 style="color:#fff;font-size:24px;margin:10px 0 5px">${esc(eventName)}</h1>
  </div>
  <div style="padding:30px 25px;background:#ffffff">
    <p style="font-size:16px;color:#2c3e50">${i18n.t('email_greeting')} <strong>${esc(giverName)}</strong> 👋</p>
    <p style="font-size:15px;color:#555;line-height:1.6">${i18n.t('email_intro')}</p>
    <div style="background:linear-gradient(135deg,#27ae60,#1e8449);border-radius:12px;padding:20px;text-align:center;margin:20px 0">
      <div style="font-size:36px">🎁</div>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:5px 0">${i18n.t('email_you_got')}</p>
      <h2 style="color:#fff;font-size:26px;margin:5px 0">${esc(receiverName)}</h2>
    </div>
    <div style="background:#fef9e7;border:2px solid #f39c12;border-radius:10px;padding:12px 16px;margin:15px 0;text-align:center">
      <span style="font-size:14px;color:#f39c12;font-weight:700">💰 ${i18n.t('email_budget_label')}: ${esc(budget)}</span>
    </div>
    <div style="margin-top:20px">
      <h3 style="color:#c0392b;font-size:16px;border-bottom:2px solid #ecf0f1;padding-bottom:8px">🎁 ${i18n.t('email_wishlist_title')}</h3>
      <pre style="font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;color:#555;line-height:1.8;white-space:pre-wrap;background:#f8f9fa;border-radius:8px;padding:15px;margin-top:10px">${esc(wishlistText)}</pre>
    </div>
    <p style="font-size:13px;color:#999;margin-top:25px;text-align:center">${i18n.t('email_secret')}</p>
  </div>
  <div style="background:#1a1a2e;padding:20px;text-align:center">
    <p style="color:#666;font-size:12px;margin:0">❄️ ${i18n.t('email_footer')} ${esc(eventName)} ❄️</p>
  </div>
</div>`;
}

async function sendEmails() {
  const { emailjsPublicKey, emailjsServiceId, emailjsTemplateId, eventName, budget } = state.config;

  if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
    toast(i18n.t('sorteo_configure_email'), 'error');
    toggleModal(false);
    return;
  }
  if (!state.sorteoResult) { toggleModal(false); return; }

  try { emailjs.init(emailjsPublicKey); } catch (e) {
    toast('EmailJS init error: ' + e.message, 'error');
    toggleModal(false);
    return;
  }

  const members = getAllMembers();
  const map = Object.fromEntries(members.map(m => [m.id, m]));
  const btn = document.getElementById('modalSendEmail');
  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${i18n.t('sorteo_sending')}`;

  let sent = 0, errors = 0;

  for (const pair of state.sorteoResult) {
    const giver = map[pair.giverId], receiver = map[pair.receiverId];
    if (!giver?.email || !receiver) { errors++; continue; }

    const wishlistText = (state.wishlists[receiver.id] || [])
      .filter(w => w.title.trim())
      .map((w, i) => {
        let line = `${i + 1}. ${w.title}`;
        if (w.description) line += ` - ${w.description}`;
        if (w.link) line += ` | Link: ${w.link}`;
        if (w.notes) line += ` | ${w.notes}`;
        return line;
      }).join('\n') || i18n.t('email_no_wishlist');

    const emailHtml = buildEmailHtml(giver.name, receiver.name, wishlistText, eventName, budget || 'N/A');

    try {
      await emailjs.send(emailjsServiceId, emailjsTemplateId, {
        to_email: giver.email,
        email_subject: i18n.t('email_subject').replace('{event}', eventName),
        email_body: emailHtml,
      });
      sent++;
    } catch (e) {
      console.error(`Email error (${giver.name}):`, e);
      errors++;
    }
  }

  btn.disabled = false;
  btn.innerHTML = `<i class="fas fa-envelope"></i> ${i18n.t('sorteo_send_email')}`;
  toggleModal(false);

  if (!errors) {
    toast(i18n.t('sorteo_sent_ok').replace('{n}', sent), 'success');
  } else {
    toast(i18n.t('sorteo_sent_errors').replace('{sent}', sent).replace('{errors}', errors), 'error');
  }
}

// ==================== CLOUD SYNC ====================
async function syncToCloud() {
  const binId = state.config.npointBinId;
  if (!binId) { toast(i18n.t('wishlists_urls_requires'), 'error'); return; }

  CloudStorage.init(binId);
  toast('⏳ Uploading...', 'info');
  const ok = await CloudStorage.safeSave((cloud) => ({...cloud,...state,wishlists:{...(cloud.wishlists||{}),...state.wishlists}}));
  toast(ok ? '✅ Uploaded to cloud' : '❌ Upload failed', ok ? 'success' : 'error');
}

async function syncFromCloud() {
  const binId = state.config.npointBinId;
  if (!binId) { toast(i18n.t('wishlists_urls_requires'), 'error'); return; }

  CloudStorage.init(binId);
  toast('⏳ Downloading...', 'info');
  const data = await CloudStorage.load();

  if (!data) { toast('❌ Download failed', 'error'); return; }

  // Merge: keep local config keys (emailjs, npoint), overwrite the rest
  const localConfig = { ...state.config };
  // Merge: cloud brings new registrations, local preserves pending edits
    state.wishlists = { ...data.wishlists, ...state.wishlists };
    state.sorteoResult = data.sorteoResult ?? state.sorteoResult;
    state.sorteoDate = data.sorteoDate ?? state.sorteoDate;
    state.families = state.families.map(f => { const cf = data.families?.find(x => x.id === f.id); if (!cf) return f; cf.members.forEach(cm => { if (!f.members.find(m => m.id === cm.id)) f.members.push(cm); }); f.members = f.members.map(m => { const cm = cf.members.find(x => x.id === m.id); return cm ? { ...m, password: cm.password || m.password, avatar: cm.avatar || m.avatar } : m; }); return f; });
  state.config.npointBinId = localConfig.npointBinId;
  state.config.emailjsPublicKey = localConfig.emailjsPublicKey;
  state.config.emailjsServiceId = localConfig.emailjsServiceId;
  state.config.emailjsTemplateId = localConfig.emailjsTemplateId;
  state.config.senderEmail = localConfig.senderEmail;

  saveState();
  loadConfigUI();
  renderFamilies();
  populateWishlistSelect();
  toast('✅ Downloaded from cloud', 'success');
}

// ==================== EXPORT EXCEL ====================
function exportExcel(type) {
  if (typeof XLSX === 'undefined') {
    toast('SheetJS (XLSX) not loaded', 'error');
    return;
  }

  const wb = XLSX.utils.book_new();
  const members = getAllMembers();
  const map = Object.fromEntries(members.map(m => [m.id, m]));

  if (type === 'participants' || type === 'all') {
    const data = members.map(m => ({
      Family: m.familyName,
      Name: m.name,
      Email: m.email
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Participants');
  }

  if (type === 'wishlists' || type === 'all') {
    const data = [];
    members.forEach(m => {
      (state.wishlists[m.id] || []).forEach((w, i) => {
        data.push({
          Name: m.name,
          Family: m.familyName,
          '#': i + 1,
          Gift: w.title,
          Link: w.link,
          Image: w.imageUrl,
          Description: w.description,
          Notes: w.notes
        });
      });
    });
    if (!data.length) data.push({ Name: 'No wishlists yet' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Wishlists');
  }

  if (type === 'sorteo' || type === 'all') {
    const data = (state.sorteoResult || []).map(r => {
      const g = map[r.giverId], rv = map[r.receiverId];
      return {
        Giver: g?.name || '?',
        'Giver Family': g?.familyName || '?',
        'Giver Email': g?.email || '?',
        Receiver: rv?.name || '?',
        'Receiver Family': rv?.familyName || '?'
      };
    });
    if (!data.length) data.push({ Giver: 'No draw yet' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Draw');
  }

  const filename = `${state.config.eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${type}.xlsx`;
  XLSX.writeFile(wb, filename);
  toast(`✅ ${filename}`, 'success');
}
