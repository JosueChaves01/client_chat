const _isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const logger = {
  log:   (...args) => { if (_isDev) console.log(...args); },
  warn:  (...args) => { if (_isDev) console.warn(...args); },
  error: (...args) => console.error(...args),
};
