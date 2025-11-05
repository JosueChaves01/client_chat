import { userManager } from './UserManager.js';

/**
 * Gestiona todos los elementos de la interfaz de usuario.
 */
export const UIManager = {
    // Referencias a elementos del DOM
    videoGrid: document.getElementById('videoGrid'),
    messagesList: document.getElementById('messages'),
    messageInput: document.getElementById('messageInput'),
    usersPanel: document.querySelector('.users-panel'),
    usersList: null, // Se creará dinámicamente

    /**
     * Crea y añade un elemento de video para un usuario remoto.
     * @param userId - El ID del usuario.
     * @returns El elemento de video creado.
     */
    createVideoElement: function(userId) {
        // Verificar si ya existe un elemento para este usuario
        let videoElement = document.getElementById(`video-${userId}`);
        
        if (!videoElement) {
            // Si es el video local, usamos el elemento existente
            if (userId === 'local') {
                videoElement = document.getElementById('localVideo');
                if (!videoElement) {
                    videoElement = document.createElement('video');
                    videoElement.id = 'localVideo';
                    videoElement.autoplay = true;
                    videoElement.muted = true;
                    videoElement.playsInline = true;
                    videoElement.className = 'participant-video local-video';
                    
                    const videoContainer = document.createElement('div');
                    videoContainer.className = 'video-container';
                    videoContainer.dataset.userId = 'local';
                    
                    const usernameOverlay = document.createElement('div');
                    usernameOverlay.className = 'video-username';
                    usernameOverlay.textContent = 'Tú';
                    
                    videoContainer.appendChild(videoElement);
                    videoContainer.appendChild(usernameOverlay);
                    UIManager.videoGrid.appendChild(videoContainer);
                }
            } else {
                // Crear el elemento de video para usuario remoto
                videoElement = document.createElement('video');
                videoElement.id = `video-${userId}`;
                videoElement.autoplay = true;
                videoElement.playsInline = true;
                videoElement.className = 'participant-video';
                
                // Crear contenedor para el video
                const videoContainer = document.createElement('div');
                videoContainer.className = 'video-container';
                videoContainer.dataset.userId = userId;
                
                // Añadir overlay de nombre de usuario
                const usernameOverlay = document.createElement('div');
                usernameOverlay.className = 'video-username';
                usernameOverlay.textContent = userManager.getUsername(userId) || `Usuario ${userId.slice(0, 6)}`;
                
                videoContainer.appendChild(videoElement);
                videoContainer.appendChild(usernameOverlay);
                
                // Añadir al grid
                UIManager.videoGrid.appendChild(videoContainer);
            }
            
            // Forzar un reflow para asegurar que los estilos se apliquen
            setTimeout(() => {
                UIManager.updateVideoGridLayout();
            }, 0);
        }
        
        return videoElement;
    },
    
    /**
     * Actualiza el diseño de la cuadrícula de videos según el número de participantes.
     */
    updateVideoGridLayout: function() {
        const videoGrid = UIManager.videoGrid;
        if (!videoGrid) return;
        
        // Obtener todos los contenedores de video
        const videoContainers = Array.from(videoGrid.querySelectorAll('.video-container'));
        const videoCount = videoContainers.length;
        
        // Asegurar que los videos mantengan su relación de aspecto
        videoContainers.forEach(container => {
            const video = container.querySelector('video');
            if (!video) return;
            
            // Asegurar que el video ocupe todo el espacio disponible
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            
            // Actualizar el nombre de usuario
            const usernameOverlay = container.querySelector('.video-username');
            if (usernameOverlay && container.dataset.userId) {
                const username = userManager.getUsername(container.dataset.userId) || 
                               `Usuario ${container.dataset.userId.slice(0, 6)}`;
                usernameOverlay.textContent = username;
            }
        });
    },

    /**
     * Elimina el elemento de video de un usuario.
     * @param userId - El ID del usuario.
     */
    removeVideoElement: function(userId) {
        // No eliminar el video local
        if (userId === 'local') {
            const videoElement = document.getElementById('localVideo');
            if (videoElement && videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
                videoElement.srcObject = null;
            }
            return;
        }
        
        const videoContainer = document.querySelector(`.video-container[data-user-id="${userId}"]`);
        if (videoContainer) {
            // Detener todas las pistas antes de eliminar
            const videoElement = videoContainer.querySelector('video');
            if (videoElement && videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
            }
            
            // Eliminar el contenedor
            videoContainer.remove();
            
            // Actualizar el diseño del grid
            UIManager.updateVideoGridLayout();
        }
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
        
        li.innerHTML = `<strong>${displayName}:</strong> ${text}`;
        UIManager.messagesList.appendChild(li);
        // Scroll hasta el final
        UIManager.messagesList.scrollTop = UIManager.messagesList.scrollHeight;
    },

    /**
     * Actualiza la lista de usuarios en el panel derecho.
     * @param {Object} peerConnections - Mapa de conexiones de pares.
     * @param {string} myUserId - El ID del usuario local para destacarlo.
     */
    updateUserList: function(users, myUserId) {
        if (!UIManager.usersList) {
            UIManager.usersList = document.createElement('ul');
            UIManager.usersList.className = 'users-list';
            UIManager.usersPanel.appendChild(UIManager.usersList);
        }

        // Limpiar la lista actual
        UIManager.usersList.innerHTML = '';

        // Añadir el usuario actual primero
        const currentUserItem = document.createElement('li');
        currentUserItem.className = 'user-item current-user';
        currentUserItem.innerHTML = `
            <img src="${userManager.getCurrentAvatar()}" alt="Avatar" class="user-avatar">
            <span>${userManager.getCurrentUsername()} (Tú)</span>
        `;
        UIManager.usersList.appendChild(currentUserItem);

        // Añadir cada usuario remoto a la lista
        Object.entries(peerConnections).forEach(([userId, peerConnection]) => {
            if (userId === myUserId) return; // Saltar el usuario actual
            
            const userItem = document.createElement('li');
            userItem.className = 'user-item';
            const username = userManager.getUsername(userId) || `Usuario ${userId.slice(0, 6)}`;
            userItem.innerHTML = `
                <img src="${userManager.getAvatar(userId)}" alt="Avatar" class="user-avatar">
                <span>${username}</span>
            `;
            UIManager.usersList.appendChild(userItem);
        });
    }
};