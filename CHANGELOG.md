# 📋 CHANGELOG

## [2.0.0] - Firebase Migration ✅

### Breaking Changes
- Migrated from npoint.io to Firebase Realtime Database
- Removed localStorage for data (only session + preferences)
- URLs no longer need `?bin=` parameter
- Participant URL simplified to just `my-list.html`

### Added
- Firebase atomic operations per path (no more full-file overwrites)
- Object-to-array conversion for Firebase compatibility
- Theme toggle + language toggle in participant page header
- Link to participant page from admin nav
- Admin auto-loads config from Firebase on start

### Removed
- npoint.io integration
- localStorage data persistence
- Auto-sync debounce logic
- Optimistic locking (_version field)
- All merge/conflict resolution code

### Fixed
- Data loss from concurrent writes (Firebase handles atomicity)
- Config not loading on fresh browser
- Participant page not showing buttons

---

## [1.0.0] - Complete Release (npoint.io) ✅

### Features
- Admin panel: config, families, wishlists, sorteo, export
- Participant portal: register, login, wishlist, match results
- Dark/light mode + ES/EN in both pages
- Emoji avatars (offline, no dependencies)
- Roulette animation for sorteo
- Family restriction in draw
- EmailJS HTML bilingual emails
- Excel export (SheetJS)
- Admin PIN protection
- Password per participant + reset from admin
- Shared email support (kids using parent's email)
- Pre-draw validation (missing email/wishlist warnings)
- Auto-registration from shared base URL

---

## [0.1.0] - Initial Version

- Basic families, wishlists, sorteo
- localStorage only
- Christmas theme with snowflakes
