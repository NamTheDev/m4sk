const { Collection } = require('discord.js');
const fetch = require('node-fetch');

/**
 * A class representing a MongoDB collection with methods to interact with a remote API.
 */
class mongoDatabaseCollection {
    // The base URL for the API endpoints
    apiURL = "https://mask-xpuq.onrender.com/api/economy";
    // The password for API authentication, retrieved from environment variables
    password = process.env.MONGO_PASSWORD

    /**
     * Retrieves a value from the database for a given key.
     * @param {string} key - The key to retrieve the value for.
     * @returns {Promise<Object>} The retrieved value as a JSON object.
     */
    async get(key) {
        const response = await fetch(`${this.apiURL}/get?key=${key}`, {
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }

    /**
     * Sets a value in the database for a given key.
     * @param {string} key - The key to set the value for.
     * @param {*} value - The value to set.
     * @returns {Promise<Object>} The response from the server as a JSON object.
     */
    async set(key, value) {
        const response = await fetch(`${this.apiURL}/set?key=${key}`, {
            method: 'POST', 
            body: JSON.stringify(value),
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }

    /**
     * Deletes a value from the database for a given key.
     * @param {string} key - The key to delete the value for.
     * @returns {Promise<Object>} The response from the server as a JSON object.
     */
    async delete(key) {
        const response = await fetch(`${this.apiURL}/delete?key=${key}`, {
            method: 'DELETE',
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }

    /**
     * Retrieves all key-value pairs from the database.
     * @returns {Promise<Object>} All key-value pairs as a JSON object.
     */
    async getAll() {
        const response = await fetch(`${this.apiURL}/getAll`, {
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }

    /**
     * Deletes all key-value pairs from the database.
     * @returns {Promise<Object>} The response from the server as a JSON object.
     */
    async deleteAll() {
        const response = await fetch(`${this.apiURL}/deleteAll`, {
            method: 'DELETE',
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }
}

module.exports = mongoDatabaseCollection;
