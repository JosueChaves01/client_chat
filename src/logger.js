const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const logger = {
    log:   (...args) => { if (isDev) console.log(...args); },
    warn:  (...args) => { if (isDev) console.warn(...args); },
    error: (...args) => console.error(...args), // Los errores siempre se muestran
};
