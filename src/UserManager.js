/**
 * Gestiona la relación entre los IDs de usuario y sus nombres de usuario.
 */
class UserManager {
    constructor() {
        this.users = new Map(); // userId -> username
    }

    /**
     * Añade o actualiza un usuario.
     * @param {string} userId - El ID del usuario.
     * @param {string} username - El nombre de usuario.
     */
    updateUser(userId, username) {
        this.users.set(userId, username);
    }

    /**
     * Elimina un usuario.
     * @param {string} userId - El ID del usuario.
     */
    removeUser(userId) {
        this.users.delete(userId);
    }

    /**
     * Obtiene el nombre de usuario a partir de un ID.
     * @param {string} userId - El ID del usuario.
     * @returns {string} El nombre de usuario o el propio ID si no se encuentra.
     */
    getUsername(userId) {
        return this.users.get(userId) || userId;
    }

    /**
     * Obtiene todos los usuarios como un array de objetos.
     * @returns {{userId: string, username: string}[]} Un array de usuarios.
     */
    getAllUsers() {
        return Array.from(this.users.entries()).map(([userId, username]) => ({ userId, username }));
    }
}

// Exportamos una única instancia (Singleton)
export const userManager = new UserManager();
