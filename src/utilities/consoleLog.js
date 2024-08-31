// Import the node-fetch library for making HTTP requests
const fetch = require("node-fetch");

/**
 * Logs a message to both a remote API and the local console.
 * @param {string} message - The message to be logged.
 */
async function consoleLog(message) {
    // Send the log message to a remote API
    await fetch(`https://mask-xpuq.onrender.com/api/consoleLog?key=${process.env.SECRET_KEY}&message=${message}&author=m4sk [${new Date()}]`);
    
    // Also log the message to the local console
    console.log(message);
}

// Export the consoleLog function for use in other modules
module.exports = { consoleLog };