/**
 * Minimal publish/subscribe event bus for decoupled feature communication.
 */
const _handlers = new Map();

export const EventBus = {
  on(event, handler) {
    if (!_handlers.has(event)) _handlers.set(event, []);
    _handlers.get(event).push(handler);
  },

  off(event, handler) {
    if (!_handlers.has(event)) return;
    _handlers.set(event, _handlers.get(event).filter(h => h !== handler));
  },

  emit(event, data) {
    if (!_handlers.has(event)) return;
    _handlers.get(event).forEach(h => h(data));
  },
};
