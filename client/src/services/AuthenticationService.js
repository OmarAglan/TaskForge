/**
 * Registers a new user with the credentials provided.
 * 
 * @param {Object} credentials - The user credentials.
 * @returns {Promise} A promise that resolves with the API response.
 */
import Api from "./Api";

export default {
    register(credentials) {
        return Api().post('/register', credentials);
    },
    login(credentials) {
        return Api().post('/login', credentials);
    }
}