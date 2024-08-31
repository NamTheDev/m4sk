const { Collection } = require('discord.js');
const fetch = require('node-fetch');

class mongoDatabaseCollection {
    apiURL = "https://mask-xpuq.onrender.com/api/economy";
    password = process.env.MONGO_PASSWORD
    async get(key) {
        const response = await fetch(`${this.apiURL}/get?key=${key}`, {
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }
    async set(key, value) {
        const response = await fetch(`${this.apiURL}/set?key=${key}`, {
            method: 'POST', body: JSON.stringify(value),
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }
    async delete(key) {
        const response = await fetch(`${this.apiURL}/delete?key=${key}`, {
            method: 'DELETE',
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }

    async getAll() {
        const response = await fetch(`${this.apiURL}/getAll`, {
            headers: {
                'password': this.password
            }
        });
        return response.json();
    }
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
