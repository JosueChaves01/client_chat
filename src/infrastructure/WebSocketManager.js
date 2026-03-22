import { logger } from '../shared/logger.js';

/**
 * Manages the WebSocket connection lifecycle and message routing.
 * Queues outgoing messages when the socket is not yet open.
 */
export class WebSocketManager {
  constructor(url) {
    this._url      = url;
    this._ws       = null;
    this._handlers = new Map();
    this._queue    = [];
    this._ready    = false;
    this._flushing = false;
  }

  connect() {
    this._ws = new WebSocket(this._url);

    this._ws.onopen = () => {
      logger.log('WebSocket connected.');
      this._ready = true;
      this._flush();
    };

    this._ws.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); }
      catch { logger.error('Invalid WebSocket message:', event.data); return; }

      const handler = this._handlers.get(msg.type);
      if (handler) handler(msg);
      else logger.log('Unhandled message type:', msg.type);
    };

    this._ws.onclose = () => { logger.log('WebSocket closed.'); this._ready = false; };
    this._ws.onerror = (e) => logger.error('WebSocket error:', e);
  }

  onMessage(type, handler) {
    this._handlers.set(type, handler);
  }

  send(message) {
    if (this._ready) {
      this._ws.send(JSON.stringify(message));
    } else {
      this._queue.push(message);
    }
  }

  isConnected() {
    return this._ws !== null && this._ws.readyState === WebSocket.OPEN;
  }

  _flush() {
    if (this._flushing) return;
    this._flushing = true;
    while (this._queue.length > 0 && this._ready) {
      this._ws.send(JSON.stringify(this._queue.shift()));
    }
    this._flushing = false;
  }
}
