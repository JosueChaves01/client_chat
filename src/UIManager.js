import { userManager } from './UserManager.js';

/**
 * Gestiona todos los elementos de la interfaz de usuario.
 */
const _videoGrid = document.getElementById('videoGrid');
const _messagesList = document.getElementById('messages');
const _messageInput = document.getElementById('messageInput');
const _usersPanel = document.querySelector('.users-panel');

if (!_videoGrid) console.error('UIManager: elemento #videoGrid no encontrado en el DOM.');
if (!_messagesList) console.error('UIManager: elemento #messages no encontrado en el DOM.');
if (!_messageInput) console.error('UIManager: elemento #messageInput no encontrado en el DOM.');
if (!_usersPanel) console.error('UIManager: elemento .users-panel no encontrado en el DOM.');

const _mainContainer = document.querySelector('.main-video-container');
if (!_mainContainer) console.error('UIManager: elemento .main-video-container no encontrado en el DOM.');

export const UIManager = {
    // Referencias a elementos del DOM
    videoGrid: _videoGrid,
    messagesList: _messagesList,
    messageInput: _messageInput,
    usersPanel: _usersPanel,
    mainContainer: _mainContainer,
    usersList: null, // Se creará dinámicamente

    // Helper: obtiene el grid de participantes (es dinámico, puede crearse en runtime)
    _getParticipantsGrid: () => document.querySelector('.participants-grid'),

    /**
     * Crea y añade un elemento de video para un usuario remoto.
     * @param {string} userId - El ID del usuario.
     * @returns {HTMLVideoElement} El elemento de video creado.
     */
    createVideoElement: (userId) => {
        // Create video element
        const videoElement = document.createElement('video');
        videoElement.id = `video-${userId}`;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = true; // Mute remote videos by default
        
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-tile';
        videoContainer.id = `video-container-${userId}`;
        
        // Create user info overlay
        const videoInfo = document.createElement('div');
        videoInfo.className = 'video-info';
        
        const audioIndicator = document.createElement('div');
        audioIndicator.className = 'audio-indicator';
        
        const username = document.createElement('span');
        username.className = 'username';
        username.textContent = userManager.getUsername(userId) || `User ${userId.slice(0, 6)}`;
        
        videoInfo.appendChild(audioIndicator);
        videoInfo.appendChild(username);
        
        videoContainer.appendChild(videoElement);
        videoContainer.appendChild(videoInfo);
        
        // If this is the first video, make it the main video
        const mainContainer = UIManager.mainContainer;
        const participantsGrid = UIManager._getParticipantsGrid() || UIManager.createParticipantsGrid();

        if (!mainContainer.querySelector('video')) {
            videoElement.classList.add('main-video');
            videoContainer.classList.add('main-video-container');
            mainContainer.innerHTML = '';
            mainContainer.appendChild(videoContainer);
        } else {
            participantsGrid.appendChild(videoContainer);
        }
        
        // Store reference to the video element
        videoElement._container = videoContainer;
        
        return videoElement;
    },
    
    /**
     * Creates the participants grid container if it doesn't exist
     */
    createParticipantsGrid: () => {
        const mainContainer = UIManager.mainContainer;
        let participantsGrid = UIManager._getParticipantsGrid();
        
        if (!participantsGrid) {
            participantsGrid = document.createElement('div');
            participantsGrid.className = 'participants-grid';
            mainContainer.appendChild(participantsGrid);
        }
        
        return participantsGrid;
    },

    /**
     * Elimina el elemento de video de un usuario.
     * @param {string} userId - El ID del usuario.
     */
    removeVideoElement: (userId) => {
        const videoElement = document.getElementById(`video-${userId}`);
        if (!videoElement) return;
        
        // Remove the video container
        const container = videoElement._container || videoElement.parentNode;
        if (container) {
            container.remove();
        }
        
        // If we removed the main video, promote another video to main
        if (videoElement.classList.contains('main-video')) {
            const participantsGrid = UIManager._getParticipantsGrid();
            const firstChild = participantsGrid && participantsGrid.firstChild;
            if (firstChild && firstChild.isConnected) {
                const nextVideo = firstChild.querySelector('video');
                if (nextVideo && nextVideo.isConnected) {
                    UIManager.promoteToMainVideo(nextVideo);
                }
            }
        }
    },
    
    /**
     * Promotes a video to be the main video
     * @param {HTMLVideoElement} videoElement - The video element to promote
     */
    promoteToMainVideo: (videoElement) => {
        if (!videoElement) return;
        
        const container = videoElement._container || videoElement.parentNode;
        if (!container) return;
        
        // Remove from participants grid
        container.remove();
        
        // Get the current main video
        const mainContainer = UIManager.mainContainer;
        const currentMainVideo = mainContainer.querySelector('video');

        // If there's a current main video, move it to the participants grid
        if (currentMainVideo) {
            const currentContainer = currentMainVideo._container || currentMainVideo.parentNode;
            currentContainer.classList.remove('main-video-container');
            currentMainVideo.classList.remove('main-video');

            const participantsGrid = UIManager._getParticipantsGrid();
            if (participantsGrid) {
                participantsGrid.prepend(currentContainer);
            }
        }

        // Set the new main video
        container.classList.add('main-video-container');
        videoElement.classList.add('main-video');
        mainContainer.innerHTML = '';
        mainContainer.appendChild(container);
    },

    /**
     * Añade un mensaje al contenedor de chat.
     * @param {string} text - El contenido del mensaje.
     * @param {string} [userId] - ID del usuario que envía el mensaje. Si no se proporciona, se asume que es el usuario local.
     */
    addChatMessage: (text, userId) => {
        const li = document.createElement('li');
        const isCurrentUser = !userId || userId === userManager.getCurrentUserId();
        const displayName = isCurrentUser ? 'Tú' : (userManager.getUsername(userId) || `Usuario ${userId.slice(0, 6)}`);

        const strong = document.createElement('strong');
        strong.textContent = `${displayName}:`;
        const textNode = document.createTextNode(` ${text}`);

        li.appendChild(strong);
        li.appendChild(textNode);
        UIManager.messagesList.appendChild(li);
        // Scroll hasta el final
        UIManager.messagesList.scrollTop = UIManager.messagesList.scrollHeight;
    },

    /**
     * Actualiza la lista de usuarios en el panel derecho.
     * @param {Object} peerConnections - Mapa de conexiones de pares.
     * @param {string} myUserId - El ID del usuario local para destacarlo.
     */
    updateUserList: (peerConnections = {}, myUserId) => {
        if (!UIManager.usersList) {
            // Si la lista no existe, la creamos una sola vez.
            const header = document.createElement('header');
            header.className = 'users-header';
            header.textContent = 'Usuarios';
            UIManager.usersList = document.createElement('ul');
            UIManager.usersList.className = 'user-list';
            UIManager.usersPanel.innerHTML = ''; // Limpiar el panel
            UIManager.usersPanel.appendChild(header);
            UIManager.usersPanel.appendChild(UIManager.usersList);
        }

        // Limpiar la lista actual
        UIManager.usersList.innerHTML = '';

        // Añadir el usuario actual primero
        const currentUserItem = document.createElement('li');
        currentUserItem.className = 'user-item current-user';
        const currentAvatar = document.createElement('img');
        currentAvatar.src = userManager.getCurrentAvatar();
        currentAvatar.alt = 'Avatar';
        currentAvatar.className = 'user-avatar';
        const currentSpan = document.createElement('span');
        currentSpan.textContent = `${userManager.getCurrentUsername()} (Tú)`;
        currentUserItem.appendChild(currentAvatar);
        currentUserItem.appendChild(currentSpan);
        UIManager.usersList.appendChild(currentUserItem);

        // Añadir cada usuario remoto a la lista
        Object.entries(peerConnections).forEach(([userId, peerConnection]) => {
            if (userId === myUserId) return; // Saltar el usuario actual

            const userItem = document.createElement('li');
            userItem.className = 'user-item';
            const username = userManager.getUsername(userId) || `Usuario ${userId.slice(0, 6)}`;
            const avatar = document.createElement('img');
            avatar.src = userManager.getAvatar(userId);
            avatar.alt = 'Avatar';
            avatar.className = 'user-avatar';
            const span = document.createElement('span');
            span.textContent = username;
            userItem.appendChild(avatar);
            userItem.appendChild(span);
            UIManager.usersList.appendChild(userItem);
        });
    }
};