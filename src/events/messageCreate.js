// Import the claimAutofarmCredits function from the autofarm utility
const { claimAutofarmCredits } = require('../utilities/autofarm');

module.exports = {
    // Define the name of the event this module handles
    name: 'messageCreate',
    
    // Define the execute function that will be called when a message is created
    async execute(message) {
        // Attempt to claim autofarm credits for the message author
        const messageContent = await claimAutofarmCredits(message.author.id);
        
        // If there's a message content (i.e., credits were claimed), reply to the message
        if (messageContent) message.reply(messageContent);
    },
};
