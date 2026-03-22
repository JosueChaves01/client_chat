import { MSG, APP_EVENTS } from '../../../shared/constants.js';
import { EventBus } from '../../../shared/EventBus.js';

/**
 * Manages chat message sending and receiving.
 * Emits APP_EVENTS.CHAT_MESSAGE_SENT and APP_EVENTS.CHAT_MESSAGE_RECEIVED.
 */
export class ChatService {
  constructor(wsManager, userStore) {
    this._ws        = wsManager;
    this._userStore = userStore;
  }

  sendMessage(text) {
    const content = text.trim();
    if (!content) return;
    this._ws.send({ type: MSG.CHAT_MESSAGE, content });
    EventBus.emit(APP_EVENTS.CHAT_MESSAGE_SENT, {
      content,
      fromUsername: `${this._userStore.getCurrentUsername()} (Tú)`,
    });
  }

  handleIncoming(message) {
    EventBus.emit(APP_EVENTS.CHAT_MESSAGE_RECEIVED, {
      content:      message.content,
      fromUsername: message.fromUsername,
    });
  }
}
