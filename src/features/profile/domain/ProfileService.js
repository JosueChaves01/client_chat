import { MSG } from '../../../shared/constants.js';

/**
 * Coordinates profile updates between UserStore and the signaling server.
 */
export class ProfileService {
  constructor(userStore, wsManager) {
    this._userStore = userStore;
    this._ws        = wsManager;
  }

  /**
   * Updates the stored profile and notifies the server.
   * Pass null for a field to leave it unchanged.
   */
  updateProfile(username, avatar) {
    this._userStore.updateCurrentUser(username, avatar);
    if (this._ws.isConnected()) {
      this._ws.send({ type: MSG.SET_USERNAME, username: this._userStore.getCurrentUsername() });
    }
  }

  /** Sends the persisted username to the server right after connection. */
  sendSavedUsername() {
    this._ws.send({ type: MSG.SET_USERNAME, username: this._userStore.getCurrentUsername() });
  }

  getCurrentUsername() { return this._userStore.getCurrentUsername(); }
  getCurrentAvatar()   { return this._userStore.getCurrentAvatar(); }
}
