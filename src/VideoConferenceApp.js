/**
 * @file VideoConferenceApp.js
 * Este archivo define la clase principal que orquesta toda la aplicación de videoconferencia.
 * Actúa como el "cerebro" de la aplicación, inicializando y coordinando todos los módulos
 * (WebRTC, WebSocket, UI, etc.) para que funcionen juntos.
 */
import config from './config.js';
import { PeerConnectionManager } from './PeerConnectionManager.js';
import { WebSocketManager } from './WebSocketManager.js';
import { WebRTCManager } from './WebRTCManager.js';
import { UIManager } from './UIManager.js';
import { userManager } from './UserManager.js';


/**
 * Clase principal que orquesta toda la aplicación de videoconferencia.
 * Responsabilidades:
 * - Inicializar todos los managers.
 * - Gestionar el flujo de arranque de la aplicación.
 * - Registrar los manejadores de eventos del WebSocket.
 */
export class VideoConferenceApp {
    /**
     * Construye la aplicación, inicializando todos los gestores necesarios.
     * @param {HTMLVideoElement} localVideoElement - El elemento de video donde se mostrará el stream local.
     */
    constructor(localVideoElement) {
        this.localVideoElement = localVideoElement;
        this.peerManager = new PeerConnectionManager();
        this.wsManager = new WebSocketManager(config.WEBSOCKET_URL);
        this.rtcManager = new WebRTCManager(this.peerManager, UIManager, this.wsManager, userManager);
        this.uiManager = UIManager;
        this.userManager = userManager;
    }

    /**
     * Inicia la aplicación siguiendo una secuencia ordenada:
     * 1. Configura los medios locales (cámara/micrófono).
     * 2. Registra los manejadores de eventos del WebSocket.
     * 3. Se conecta al servidor WebSocket.
     */
    async start() {
        // Acoplar el rtcManager al peerManager para la notificación del stream.
        this.peerManager.setRtcManager(this.rtcManager);

        // Listen for profile updates
        document.addEventListener('userProfileUpdated', () => {
            // Update the user list when profile changes
            this.updateUserList();
            
            // Notify other peers about the name change
            if (this.wsManager && this.wsManager.isConnected()) {
                this.wsManager.send({
                    type: 'userUpdate',
                    userId: this.userManager.getCurrentUserId(),
                    username: this.userManager.getCurrentUsername(),
                    avatar: this.userManager.getCurrentAvatar()
                });
            }
        });

        await this.setupLocalMedia(); // Paso 1: Configurar medios locales (Cámara/Micrófono).
        this.registerWebSocketHandlers(); // Paso 2: Registrar manejadores de eventos del WebSocket.
        this.wsManager.connect(); // Paso 3: Conectar al servidor WebSocket.
    }

    /**
     * Solicita acceso a la cámara y micrófono del usuario y muestra el video en la UI.
     */
    async setupLocalMedia() {
        try {
            const stream = await this.peerManager.setupLocalStream();
            this.localVideoElement.srcObject = stream;
            console.log('Stream local obtenido y listo.');
        } catch (error) {
            console.error('Error al configurar el stream local:', error);
            alert('No se pudo acceder a la cámara y al micrófono. Por favor, verifica los permisos y refresca la página.');
            throw error; // Detener la ejecución si no se puede obtener el stream.
        }
    }

    /**
     * Envía un mensaje de chat a través del WebSocket y lo muestra en la UI local.
     * @param {string} text - El contenido del mensaje.
     */
    sendChatMessage(text) {
        if (!text || !text.trim()) return;

        const message = {
            type: 'chat-message',
            content: text
        };

        this.wsManager.send(message);
        // Muestra el mensaje localmente usando el nombre de usuario actual
        const myUsername = this.userManager.getUsername(this.rtcManager.myUserId);
        this.uiManager.addChatMessage(text, `${myUsername} (Tú)`);
    }

    /**
     * Actualiza el nombre de usuario en el servidor.
     * @param {string} newUsername - El nuevo nombre de usuario.
     */
    setUsername(newUsername) {
        if (!newUsername || !newUsername.trim()) return;
        
        const username = newUsername.trim();
        this.wsManager.send({ 
            type: 'set-username', 
            username: username 
        });
        
        // Actualizar el perfil localmente
        const currentUser = this.userManager.getCurrentUser();
        if (currentUser) {
            currentUser.username = username;
            this.userManager.saveCurrentUser(currentUser);
        }
    }

    /**
     * Envía una solicitud para cambiar el nombre de usuario.
     * @param {string} newUsername - El nuevo nombre de usuario.
     */
    setUsername(newUsername) {
        this.wsManager.send({ type: 'set-username', username: newUsername });
    }

    /**
     * Activa/desactiva el micrófono.
     * @returns {boolean} El nuevo estado de la pista de audio.
     */
    toggleAudio() {
        return this.peerManager.toggleAudio();
    }

    /**
     * Activa/desactiva la cámara.
     * @returns {boolean} El nuevo estado de la pista de video.
     */
    toggleVideo() {
        return this.peerManager.toggleVideo();
    }

    /**
     * Registra todos los manejadores para los mensajes del WebSocket.
     * Aquí es donde la aplicación reacciona a los eventos de señalización del servidor.
     */
    registerWebSocketHandlers() {
        // Evento: El servidor nos asigna un ID y un username inicial.
        this.wsManager.onMessage('assign-id', (message) => {
            console.log('Evento recibido: assign-id', message);
            this.rtcManager.setMyUserId(message.userId);
            
            // Usar el nombre de perfil existente si está disponible
            const currentUser = this.userManager.getCurrentUser();
            const username = currentUser?.username || message.username;
            
            // Actualizar el usuario con el nombre del perfil
            this.userManager.updateUser(message.userId, username);
            console.log(`ID de usuario asignado: ${message.userId} como ${username}`);
            
            // Notificar al servidor sobre el nombre de usuario
            if (currentUser?.username) {
                this.wsManager.send({
                    type: 'set-username',
                    username: currentUser.username
                });
            }
        });

        // Evento: Un nuevo usuario se ha unido a la sala.
        this.wsManager.onMessage('user-joined', (message) => {
            console.log('Procesando evento: user-joined', message);
            this.rtcManager.handleUserJoined(message.userId);
        });

        // Evento: Al entrar, el servidor nos envía una lista de los usuarios que ya estaban en la sala.
        this.wsManager.onMessage('existing-users', (message) => {
            console.log('Procesando evento: existing-users', message);
            message.users.forEach(user => {
                this.userManager.updateUser(user.userId, user.username);
                this.rtcManager.handleUserJoined(user.userId);
            });
        });

        // Evento: Un usuario ha abandonado la sala.
        this.wsManager.onMessage('user-left', (message) => {
            console.log('Procesando evento: user-left', message);
            this.userManager.removeUser(message.userId);
            this.rtcManager.handleUserLeft(message.userId);
        });

        // Evento: Recibimos un mensaje de chat de otro usuario.
        this.wsManager.onMessage('chat-message', (message) => {
            console.log('Procesando evento: chat-message', message);
            this.uiManager.addChatMessage(message.content, message.fromUsername);
        });

        // Evento: Un usuario ha actualizado su nombre.
        this.wsManager.onMessage('user-updated', (message) => {
            console.log('Procesando evento: user-updated', message);
            this.userManager.updateUser(message.userId, message.username);
            this.rtcManager.updateUserListUI(); // Forzar actualización de la lista de usuarios
        });

        // Evento: Recibimos una "oferta" de otro par para iniciar una conexión WebRTC.
        // Una 'offer' es un mensaje (con formato SDP) que describe cómo un par quiere comunicarse
        // (qué codecs de audio/video soporta, etc.). Es el primer paso para establecer una conexión.
        this.wsManager.onMessage('offer', (message) => {
            console.log('Procesando evento: offer (oferta)', message);
            this.rtcManager.handleOffer(message.fromUserId, message.offer);
        });

        // Evento: Recibimos una "respuesta" a una oferta que enviamos previamente.
        // Una 'answer' es la respuesta a una 'offer'. El par que la recibe confirma los parámetros
        // de comunicación y envía su propia descripción de sesión (SDP). Con la oferta y la respuesta,
        // ambos pares saben cómo comunicarse.
        this.wsManager.onMessage('answer', (message) => {
            console.log('Procesando evento: answer (respuesta)', message);
            this.rtcManager.handleAnswer(message.fromUserId, message.answer);
        });

        // Evento: Recibimos un "candidato ICE".
        // ICE (Interactive Connectivity Establishment) es el protocolo que usa WebRTC para encontrar
        // la mejor ruta de conexión posible entre dos pares, incluso si están detrás de firewalls o NAT.
        // Un 'candidato ICE' es una dirección de red (IP y puerto) que podría usarse para la conexión.
        // Los pares intercambian múltiples candidatos y eligen el que funcione.
        this.wsManager.onMessage('ice-candidate', (message) => {
            console.log('Procesando evento: ice-candidate (candidato ICE)', message);
            this.rtcManager.handleIceCandidate(message.fromUserId, message.candidate);
        });
    }
}