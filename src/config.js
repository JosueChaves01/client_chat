const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const config = {
    WEBSOCKET_URL: isLocalhost
        ? `ws://${window.location.hostname}:8000`
        : 'wss://server-chat-websocket-aacedpffgncxgyed.switzerlandnorth-01.azurewebsites.net'
};

export default config;
