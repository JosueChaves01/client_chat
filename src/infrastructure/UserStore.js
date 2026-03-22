import { STORAGE_KEY, VALIDATION, AVATAR, APP_EVENTS } from '../shared/constants.js';
import { EventBus } from '../shared/EventBus.js';

function buildAvatarUrl(name, bg = AVATAR.DEFAULT_BG, color = AVATAR.DEFAULT_COLOR) {
  return `${AVATAR.BASE_URL}?name=${encodeURIComponent(name)}&background=${bg}&color=${color}`;
}

/**
 * Manages all user data (current user + remote peers) and persists the
 * current user's profile to localStorage.
 */
class UserStore {
  constructor() {
    this._remoteUsers = new Map(); // userId → { username, avatar }
    this._currentUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
    this._currentUsername = 'User';
    this._currentAvatar = buildAvatarUrl('User');
    this._load();
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  _load() {
    const raw = localStorage.getItem(STORAGE_KEY.USER_PROFILE);
    if (!raw) { this._save(); return; }
    try {
      const { userId, username, avatar } = JSON.parse(raw);
      if (userId) this._currentUserId = userId;
      if (username) this._currentUsername = username;
      if (avatar) this._currentAvatar = avatar;
    } catch {
      this._save();
    }
  }

  _save() {
    localStorage.setItem(STORAGE_KEY.USER_PROFILE, JSON.stringify({
      userId:   this._currentUserId,
      username: this._currentUsername,
      avatar:   this._currentAvatar,
    }));
  }

  // ── Current user ───────────────────────────────────────────────────────────

  getCurrentUserId()   { return this._currentUserId; }
  getCurrentUsername() { return this._currentUsername; }
  getCurrentAvatar()   { return this._currentAvatar; }

  /**
   * Updates the current user's profile and emits PROFILE_UPDATED.
   * Pass null for a field to leave it unchanged.
   */
  updateCurrentUser(username, avatar) {
    if (username !== null && username !== undefined) {
      const trimmed = username.trim();
      if (
        trimmed.length < VALIDATION.USERNAME_MIN ||
        trimmed.length > VALIDATION.USERNAME_MAX ||
        !VALIDATION.USERNAME_PATTERN.test(trimmed)
      ) return;
      this._currentUsername = trimmed;
    }
    if (avatar) this._currentAvatar = avatar;
    this._save();
    EventBus.emit(APP_EVENTS.PROFILE_UPDATED, {
      userId:   this._currentUserId,
      username: this._currentUsername,
      avatar:   this._currentAvatar,
    });
  }

  // ── Remote users ───────────────────────────────────────────────────────────

  updateUser(userId, username, avatar) {
    this._remoteUsers.set(userId, { username, avatar });
  }

  removeUser(userId) {
    this._remoteUsers.delete(userId);
  }

  getUsername(userId) {
    if (userId === this._currentUserId) return this._currentUsername;
    const user = this._remoteUsers.get(userId);
    return user ? user.username : userId;
  }

  getAvatar(userId) {
    if (userId === this._currentUserId) return this._currentAvatar;
    const user = this._remoteUsers.get(userId);
    if (user && user.avatar) return user.avatar;
    return buildAvatarUrl(userId, AVATAR.FALLBACK_BG, AVATAR.FALLBACK_COLOR);
  }
}

export const userStore = new UserStore();
