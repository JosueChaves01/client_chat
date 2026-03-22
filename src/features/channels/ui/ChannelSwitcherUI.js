import { CSS_CLASS, CHANNEL, DOM_ID, APP_EVENTS } from '../../../shared/constants.js';
import { EventBus } from '../../../shared/EventBus.js';

/**
 * Manages channel tab switching between #general (text) and #voice-chat (video).
 */
export class ChannelSwitcherUI {
  constructor() {
    this._items       = document.querySelectorAll(`.${CSS_CLASS.CHANNEL_ITEM}`);
    this._generalView = document.getElementById(DOM_ID.GENERAL_VIEW);
    this._voiceView   = document.getElementById(DOM_ID.VOICE_VIEW);
  }

  /**
   * @param {Object} opts
   * @param {Function} opts.onVoiceJoin - Called when user navigates to voice-chat.
   */
  mount({ onVoiceJoin }) {
    this._items.forEach(item => {
      item.addEventListener('click', () => {
        const channel = item.dataset.channel;

        this._items.forEach(i => i.classList.remove(CSS_CLASS.ACTIVE));
        item.classList.add(CSS_CLASS.ACTIVE);

        if (channel === CHANNEL.GENERAL) {
          this._voiceView.classList.add(CSS_CLASS.HIDDEN);
          this._generalView.classList.remove(CSS_CLASS.HIDDEN);
        } else if (channel === CHANNEL.VOICE_CHAT) {
          this._generalView.classList.add(CSS_CLASS.HIDDEN);
          this._voiceView.classList.remove(CSS_CLASS.HIDDEN);
          onVoiceJoin();
        }

        EventBus.emit(APP_EVENTS.CHANNEL_CHANGED, { channel });
      });
    });
  }

  /** Programmatically switch to #general without triggering onVoiceJoin. */
  activateGeneral() {
    this._items.forEach(i => i.classList.remove(CSS_CLASS.ACTIVE));
    const generalItem = document.querySelector(`[data-channel="${CHANNEL.GENERAL}"]`);
    if (generalItem) generalItem.classList.add(CSS_CLASS.ACTIVE);
    this._voiceView.classList.add(CSS_CLASS.HIDDEN);
    this._generalView.classList.remove(CSS_CLASS.HIDDEN);
    EventBus.emit(APP_EVENTS.CHANNEL_CHANGED, { channel: CHANNEL.GENERAL });
  }
}
