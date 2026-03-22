import { APP_EVENTS, CSS_CLASS } from '../../../shared/constants.js';
import { EventBus } from '../../../shared/EventBus.js';

/**
 * Renders the connected-users list in the right sidebar.
 */
export class UserListUI {
  constructor(userStore) {
    this._userStore       = userStore;
    this._panel           = document.querySelector(`.${CSS_CLASS.USERS_PANEL}`);
    this._list            = null;
    this._peerConnections = {};
    this._myUserId        = null;
  }

  mount() {
    this._buildPanel();
    EventBus.on(APP_EVENTS.USER_JOINED,    () => this._render());
    EventBus.on(APP_EVENTS.USER_LEFT,      () => this._render());
    EventBus.on(APP_EVENTS.USER_UPDATED,   () => this._render());
    EventBus.on(APP_EVENTS.PROFILE_UPDATED,() => this._render());
  }

  /** Called by app.js whenever peer connections change. */
  setPeerConnections(peerConnections, myUserId) {
    this._peerConnections = peerConnections;
    this._myUserId        = myUserId;
    this._render();
  }

  _buildPanel() {
    const header      = document.createElement('header');
    header.className  = CSS_CLASS.USERS_HEADER;
    header.textContent = 'Usuarios';

    this._list           = document.createElement('ul');
    this._list.className = CSS_CLASS.USER_LIST;

    this._panel.innerHTML = '';
    this._panel.appendChild(header);
    this._panel.appendChild(this._list);
  }

  _render() {
    if (!this._list) return;
    this._list.innerHTML = '';

    // Current user always first
    this._list.appendChild(
      this._buildItem(
        this._userStore.getCurrentUsername(),
        this._userStore.getCurrentAvatar(),
        true,
      ),
    );

    // Remote peers
    Object.keys(this._peerConnections).forEach(userId => {
      if (userId === this._myUserId) return;
      this._list.appendChild(
        this._buildItem(
          this._userStore.getUsername(userId),
          this._userStore.getAvatar(userId),
          false,
        ),
      );
    });
  }

  _buildItem(username, avatarSrc, isSelf) {
    const li = document.createElement('li');
    li.className = isSelf
      ? `${CSS_CLASS.USER_ITEM} ${CSS_CLASS.CURRENT_USER}`
      : CSS_CLASS.USER_ITEM;

    const img     = document.createElement('img');
    img.src       = avatarSrc;
    img.alt       = 'Avatar';
    img.className = CSS_CLASS.USER_AVATAR;

    const span         = document.createElement('span');
    span.textContent   = isSelf ? `${username} (Tú)` : username;

    li.appendChild(img);
    li.appendChild(span);
    return li;
  }
}
