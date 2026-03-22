const _LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const _isLocalhost = _LOCAL_HOSTS.includes(window.location.hostname);

export const config = {
  WEBSOCKET_URL: _isLocalhost
    ? `ws://${window.location.hostname}:8000`
    : 'wss://server-chat-websocket-aacedpffgncxgyed.switzerlandnorth-01.azurewebsites.net',
};
