/**
 * Gestiona la información de los usuarios incluyendo nombres y avatares.
 */
class UserManager {
    constructor() {
        this.users = new Map(); // userId -> { username, avatar }
        this.currentUserId = `user-${Math.random().toString(36).substr(2, 9)}`; // Fallback si no hay datos guardados
        this.currentUsername = 'User';
        this.currentAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUsername)}&background=C17C54&color=fff`;

        // Load saved user data from localStorage if available
        this.loadUserData();
    }

    /**
     * Loads user data from localStorage
     */
    loadUserData() {
        const savedUser = localStorage.getItem('userProfile');
        if (savedUser) {
            try {
                const { userId, username, avatar } = JSON.parse(savedUser);
                if (userId) this.currentUserId = userId;
                this.currentUsername = username || this.currentUsername;
                this.currentAvatar = avatar || this.currentAvatar;
            } catch (e) {
                console.error('Error loading user data:', e);
            }
        } else {
            // Primera vez: guardar el userId generado para que persista
            this.saveUserData();
        }
    }

    /**
     * Saves user data to localStorage
     */
    saveUserData() {
        const userData = {
            userId: this.currentUserId,
            username: this.currentUsername,
            avatar: this.currentAvatar
        };
        localStorage.setItem('userProfile', JSON.stringify(userData));
    }

    /**
     * Updates the current user's profile
     * @param {string} username - The new username
     * @param {string} [avatar] - The new avatar URL
     */
    updateCurrentUser(username, avatar) {
        if (username) {
            const trimmed = username.trim();
            if (trimmed.length < 1 || trimmed.length > 30) {
                console.warn('updateCurrentUser: el nombre debe tener entre 1 y 30 caracteres.');
                return;
            }
            if (!/^[\w\s\-áéíóúÁÉÍÓÚñÑ]+$/.test(trimmed)) {
                console.warn('updateCurrentUser: el nombre contiene caracteres no permitidos.');
                return;
            }
            this.currentUsername = trimmed;
        }
        if (avatar) this.currentAvatar = avatar;
        this.saveUserData();
        
        // Dispatch event that the user profile was updated
        const event = new CustomEvent('userProfileUpdated', {
            detail: {
                userId: this.currentUserId,
                username: this.currentUsername,
                avatar: this.currentAvatar
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Gets the current user's ID
     * @returns {string} The current user's ID
     */
    getCurrentUserId() {
        return this.currentUserId;
    }

    /**
     * Gets the current user's username
     * @returns {string} The current username
     */
    getCurrentUsername() {
        return this.currentUsername;
    }

    /**
     * Gets the current user's avatar URL
     * @returns {string} The current avatar URL
     */
    getCurrentAvatar() {
        return this.currentAvatar;
    }

    /**
     * Adds or updates a user.
     * @param {string} userId - The user ID.
     * @param {string} username - The username.
     * @param {string} [avatar] - Optional avatar URL.
     */
    updateUser(userId, username, avatar) {
        this.users.set(userId, { username, avatar });
    }

    /**
     * Removes a user.
     * @param {string} userId - The user ID.
     */
    removeUser(userId) {
        this.users.delete(userId);
    }

    /**
     * Gets the username from a user ID.
     * @param {string} userId - The user ID.
     * @returns {string} The username or the ID if not found.
     */
    getUsername(userId) {
        const user = this.users.get(userId);
        return user ? user.username : userId;
    }

    /**
     * Gets the avatar URL from a user ID.
     * @param {string} userId - The user ID.
     * @returns {string} The avatar URL or a default one if not found.
     */
    getAvatar(userId) {
        if (userId === this.currentUserId) {
            return this.currentAvatar;
        }
        const user = this.users.get(userId);
        return user && user.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=2D2424&color=F0E6D2`;
    }

    /**
     * Gets all users as an array of objects.
     * @returns {{userId: string, username: string, avatar: string}[]} An array of users.
     */
    getAllUsers() {
        return Array.from(this.users.entries()).map(([userId, user]) => ({
            userId,
            username: user.username,
            avatar: user.avatar
        }));
    }
}

// Exportamos una única instancia (Singleton)
export const userManager = new UserManager();
