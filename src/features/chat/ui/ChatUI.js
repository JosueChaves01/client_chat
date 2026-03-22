import { APP_EVENTS, DOM_ID } from '../../../shared/constants.js';
import { EventBus } from '../../../shared/EventBus.js';

/**
 * Renders chat messages in the #general view.
 * Listens to CHAT_MESSAGE_SENT and CHAT_MESSAGE_RECEIVED events.
 */
export class ChatUI {
  constructor() {
    this._list  = document.getElementById(DOM_ID.MESSAGES);
    this._input = document.getElementById(DOM_ID.MESSAGE_INPUT);
  }

  mount() {
    EventBus.on(APP_EVENTS.CHAT_MESSAGE_RECEIVED, ({ content, fromUsername }) => {
      this._append(content, fromUsername);
    });
    EventBus.on(APP_EVENTS.CHAT_MESSAGE_SENT, ({ content, fromUsername }) => {
      this._append(content, fromUsername);
    });
  }

  bindSend(onSend) {
    this._input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const text = this._input.value.trim();
      if (!text) return;
      onSend(text);
      this._input.value = '';
    });
  }

  _append(text, displayName) {
    const li     = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${displayName}:`;
    li.appendChild(strong);
    li.appendChild(document.createTextNode(` ${text}`));
    this._list.appendChild(li);
    this._list.scrollTop = this._list.scrollHeight;
  }
}
