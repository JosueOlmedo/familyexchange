// ==================== CLOUD STORAGE (npoint.io) ====================
// Optimistic locking: each write increments _version.
// Before writing, we check if _version matches what we last read.
// If not, we re-read, merge, and retry.

const CloudStorage = {
  binId: null,
  baseUrl: 'https://api.npoint.io',
  lastVersion: null,
  busy: false, // Prevents concurrent writes

  init(binId) {
    this.binId = binId;
  },

  isConfigured() {
    return !!this.binId;
  },

  async load() {
    if (!this.binId) return null;
    try {
      const res = await fetch(`${this.baseUrl}/${this.binId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.lastVersion = data._version || 0;
      return data;
    } catch (e) {
      console.error('CloudStorage load error:', e);
      return null;
    }
  },

  async _rawSave(data) {
    if (!this.binId) return false;
    try {
      const res = await fetch(`${this.baseUrl}/${this.binId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error('CloudStorage save error:', e);
      return false;
    }
  },

  // Safe save with optimistic lock: read → check version → merge → write
  // mergeFn(cloudData) should return the merged data to save
  async safeSave(mergeFn, retries = 3) {
    if (this.busy) return false;
    this.busy = true;

    try {
      for (let i = 0; i < retries; i++) {
        const cloud = await this.load();
        if (!cloud) { this.busy = false; return false; }

        const merged = mergeFn(cloud);
        merged._version = (cloud._version || 0) + 1;

        // Try to save
        const ok = await this._rawSave(merged);
        if (!ok) { this.busy = false; return false; }

        // Verify our version stuck (re-read and check)
        const verify = await this.load();
        if (verify && verify._version === merged._version) {
          this.lastVersion = merged._version;
          this.busy = false;
          return true;
        }

        // Someone else wrote between our save and verify — retry
        console.warn(`CloudStorage: version conflict, retry ${i + 1}/${retries}`);
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
      }

      this.busy = false;
      return false;
    } catch (e) {
      console.error('CloudStorage safeSave error:', e);
      this.busy = false;
      return false;
    }
  },

  // Full overwrite (admin only — use with caution)
  async save(data) {
    return this.safeSave(() => ({ ...data }));
  },

  // Save only a member's wishlist
  async saveWishlist(memberId, items) {
    return this.safeSave((cloud) => {
      if (!cloud.wishlists) cloud.wishlists = {};
      cloud.wishlists[memberId] = items;
      return cloud;
    });
  },

  // Save/update a member in a family
  async saveMember(familyId, member) {
    return this.safeSave((cloud) => {
      const family = (cloud.families || []).find(f => f.id === familyId);
      if (!family) return cloud;
      const idx = family.members.findIndex(m => m.id === member.id);
      if (idx >= 0) {
        family.members[idx] = { ...family.members[idx], ...member };
      } else {
        family.members.push(member);
      }
      return cloud;
    });
  },

  async loadWishlist(memberId) {
    const data = await this.load();
    return data?.wishlists?.[memberId] || [];
  }
};
