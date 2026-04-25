// ==================== CLOUD STORAGE (npoint.io) ====================
// npoint.io: Free JSON storage, no signup, REST API
// Create a bin at https://www.npoint.io/ and paste the ID here

const CloudStorage = {
  binId: null,
  baseUrl: 'https://api.npoint.io',

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
      return await res.json();
    } catch (e) {
      console.error('CloudStorage load error:', e);
      return null;
    }
  },

  async save(data) {
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

  // Save only a member's wishlist (partial update via path)
  async saveWishlist(memberId, items) {
    if (!this.binId) return false;
    try {
      const data = await this.load();
      if (!data) return false;
      if (!data.wishlists) data.wishlists = {};
      data.wishlists[memberId] = items;
      return await this.save(data);
    } catch (e) {
      console.error('CloudStorage saveWishlist error:', e);
      return false;
    }
  },

  async loadWishlist(memberId) {
    const data = await this.load();
    return data?.wishlists?.[memberId] || [];
  }
};
