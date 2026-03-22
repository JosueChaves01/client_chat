import { DOM_ID, CSS_CLASS, TIMING, APP_EVENTS } from '../../../shared/constants.js';
import { EventBus } from '../../../shared/EventBus.js';

/**
 * Controls the profile edit modal and keeps the sidebar profile display in sync.
 */
export class ProfileModalUI {
  constructor(profileService) {
    this._service      = profileService;
    this._modal        = document.getElementById(DOM_ID.PROFILE_MODAL);
    this._trigger      = document.getElementById(DOM_ID.USER_PROFILE);
    this._closeBtn     = this._modal.querySelector(`.${CSS_CLASS.CLOSE_MODAL}`);
    this._saveBtn      = document.getElementById(DOM_ID.SAVE_PROFILE);
    this._usernameInput = document.getElementById(DOM_ID.NEW_USERNAME);
    this._modalAvatar  = document.getElementById(DOM_ID.MODAL_AVATAR);
    this._avatarUpload = document.getElementById(DOM_ID.AVATAR_UPLOAD);
    this._userNameEl   = document.getElementById(DOM_ID.USER_NAME);
    this._userAvatarEl = document.getElementById(DOM_ID.USER_AVATAR);
  }

  mount() {
    this._trigger.addEventListener('click', (e) => { e.stopPropagation(); this._open(); });
    this._closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this._close(); });
    this._saveBtn.addEventListener('click', (e) => { e.stopPropagation(); this._save(); });
    this._usernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._save(); });
    this._avatarUpload.addEventListener('change', (e) => this._handleAvatarUpload(e));
    window.addEventListener('click', (e) => { if (e.target === this._modal) this._close(); });

    EventBus.on(APP_EVENTS.PROFILE_UPDATED, () => this._syncSidebar());
    this._syncSidebar();
  }

  _open() {
    this._usernameInput.value = this._service.getCurrentUsername();
    this._modalAvatar.src     = this._service.getCurrentAvatar();
    this._modal.style.display = 'flex';
    void this._modal.offsetHeight; // force reflow for CSS transition
    this._modal.classList.add('show');
    setTimeout(() => this._usernameInput.focus(), TIMING.FOCUS_DELAY_MS);
  }

  _close() {
    this._modal.classList.remove('show');
    setTimeout(() => {
      if (!this._modal.classList.contains('show')) this._modal.style.display = 'none';
    }, TIMING.MODAL_TRANSITION_MS);
  }

  _save() {
    const username = this._usernameInput.value.trim();
    if (!username) return;
    this._service.updateProfile(username, null);
    this._close();
  }

  _handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this._service.updateProfile(null, e.target.result);
      this._modalAvatar.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  _syncSidebar() {
    this._userNameEl.textContent = this._service.getCurrentUsername();
    this._userAvatarEl.src       = this._service.getCurrentAvatar();
  }
}
