// ==================== FIREBASE STORAGE ====================
// Atomic operations per path — no more full-file overwrites
// Each write only touches its specific path in the database

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC94_jxcbZCPxNayFitDZWwKTY6TCRC5dQ",
  authDomain: "familiexchange.firebaseapp.com",
  databaseURL: "https://familiexchange-default-rtdb.firebaseio.com",
  projectId: "familiexchange"
};

const CloudStorage = {
  dbUrl: FIREBASE_CONFIG.databaseURL,
  ready: true,

  init() {
    // No-op: Firebase URL is hardcoded
  },

  isConfigured() {
    return true;
  },

  // Read entire state
  async load() {
    try {
      const res = await fetch(`${this.dbUrl}/exchange.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data || {};
    } catch (e) {
      console.error('Firebase load error:', e);
      return null;
    }
  },

  // Write entire state (admin full sync)
  async save(data) {
    try {
      const res = await fetch(`${this.dbUrl}/exchange.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error('Firebase save error:', e);
      return false;
    }
  },

  // ATOMIC: Save only config
  async saveConfig(config) {
    try {
      const res = await fetch(`${this.dbUrl}/exchange/config.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return res.ok;
    } catch (e) {
      console.error('Firebase saveConfig error:', e);
      return false;
    }
  },

  // ATOMIC: Save only families array
  async saveFamilies(families) {
    try {
      const res = await fetch(`${this.dbUrl}/exchange/families.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(families)
      });
      return res.ok;
    } catch (e) {
      console.error('Firebase saveFamilies error:', e);
      return false;
    }
  },

  // ATOMIC: Save only one member's wishlist
  async saveWishlist(memberId, items) {
    try {
      const res = await fetch(`${this.dbUrl}/exchange/wishlists/${memberId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });
      return res.ok;
    } catch (e) {
      console.error('Firebase saveWishlist error:', e);
      return false;
    }
  },

  // ATOMIC: Save/update a member in a family (read-modify-write on families only)
  async saveMember(familyId, member) {
    try {
      // Read current families
      const res = await fetch(`${this.dbUrl}/exchange/families.json`);
      if (!res.ok) return false;
      const families = await res.json() || [];

      const family = families.find(f => f.id === familyId);
      if (!family) return false;

      const idx = family.members.findIndex(m => m.id === member.id);
      if (idx >= 0) {
        family.members[idx] = { ...family.members[idx], ...member };
      } else {
        family.members.push(member);
      }

      return await this.saveFamilies(families);
    } catch (e) {
      console.error('Firebase saveMember error:', e);
      return false;
    }
  },

  // ATOMIC: Save sorteo result + date
  async saveSorteo(result, date) {
    try {
      const res = await fetch(`${this.dbUrl}/exchange/sorteoResult.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      const res2 = await fetch(`${this.dbUrl}/exchange/sorteoDate.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(date)
      });
      return res.ok && res2.ok;
    } catch (e) {
      console.error('Firebase saveSorteo error:', e);
      return false;
    }
  },

  // ATOMIC: Clear sorteo
  async clearSorteo() {
    try {
      await fetch(`${this.dbUrl}/exchange/sorteoResult.json`, { method: 'DELETE' });
      await fetch(`${this.dbUrl}/exchange/sorteoDate.json`, { method: 'DELETE' });
      return true;
    } catch (e) {
      console.error('Firebase clearSorteo error:', e);
      return false;
    }
  },

  // Read only wishlists
  async loadWishlists() {
    try {
      const res = await fetch(`${this.dbUrl}/exchange/wishlists.json`);
      return (await res.json()) || {};
    } catch (e) {
      return {};
    }
  },

  // Read only families
  async loadFamilies() {
    try {
      const res = await fetch(`${this.dbUrl}/exchange/families.json`);
      return (await res.json()) || [];
    } catch (e) {
      return [];
    }
  }
};
