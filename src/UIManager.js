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
     * @param {string} userId - El ID del usuario.
     * @returns {HTMLVideoElement} El elemento de video creado.
     */
    createVideoElement: (userId) => {
        const videoElement = document.createElement('video');
        videoElement.id = `video-${userId}`;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        UIManager.videoGrid.appendChild(videoElement);
        return videoElement;
    },

    /**
     * Elimina el elemento de video de un usuario.
     * @param {string} userId - El ID del usuario.
     */
    removeVideoElement: (userId) => {
        const videoElement = document.getElementById(`video-${userId}`);
        if (videoElement) {
            videoElement.remove();
        }
    },

    /**
     * Añade un mensaje al contenedor de chat.
     * @param {string} text - El contenido del mensaje.
     * @param {string} sender - Quién envió el mensaje (e.g., 'Yo' o un ID de usuario).
     */
    addChatMessage: (text, sender = 'Yo') => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${sender}:</strong> ${text}`;
        UIManager.messagesList.appendChild(li);
        // Scroll hasta el final
        UIManager.messagesList.scrollTop = UIManager.messagesList.scrollHeight;
    },

    /**
     * Actualiza la lista de usuarios en el panel derecho.
     * @param {{userId: string, username: string}[]} users - Un array de objetos de usuario.
     * @param {string} myUserId - El ID del usuario local para destacarlo.
     */
    updateUserList: (users, myUserId) => {
        if (!UIManager.usersList) {
            // Si la lista no existe, la creamos una sola vez.
            const header = document.createElement('header');
            header.className = 'users-header';
            header.textContent = 'Users';
            UIManager.usersList = document.createElement('ul');
            UIManager.usersList.className = 'user-list';
            UIManager.usersPanel.innerHTML = ''; // Limpiar el panel
            UIManager.usersPanel.appendChild(header);
            UIManager.usersPanel.appendChild(UIManager.usersList);
        }

        // Limpiar la lista actual
        UIManager.usersList.innerHTML = '';

        // Añadir cada usuario a la lista
        users.forEach(user => {
            const li = document.createElement('li');
            li.className = 'user-item';
            li.textContent = user.userId === myUserId ? `${user.username} (Tú)` : user.username;
            UIManager.usersList.appendChild(li);
        });
    }
};