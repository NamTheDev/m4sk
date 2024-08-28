const { economy } = require("../config");

async function activateAutofarmBot(userID, rarity) {
    // Fetch the user's economy data
    const userEconomy = await economy.get(userID);

    // Define duration multipliers for different rarities
    const rarityDurationMultiplier = {
        'C (common)': 1,
        'B (uncommon)': 2,
        'A (rare)': 4,
        'A+ (epic)': 6,
        'S (legendary)': 8,
        'S+ (mythical)': 10,
        'S++ (relic)': 12,
        'S+++ (ultimate)': 14
    };

    // Set the base duration for which the autofarm bot is active (e.g., 24 hours)
    const baseDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const multiplier = rarityDurationMultiplier[rarity] || 1; // Default to 1 if rarity not found
    const expireDuration = baseDuration * multiplier; // Adjusted duration based on rarity

    const currentTime = Date.now();

    // Check if the user already has an active autofarm bot and if it's still within the active duration
    if (userEconomy.autofarm?.active && currentTime < userEconomy.autofarm.expireDate) {
        return `Your autofarm bot is already active. Next collection available <t:${Math.floor(userEconomy.autofarm.expireDate / 1000)}:R>.`;
    }

    // Activate the autofarm bot, set the expiration date
    userEconomy.autofarm = {
        active: true,
        expireDate: currentTime + expireDuration // Set the expiration date
    };

    // Save the updated user economy data
    await economy.set(userID, userEconomy);

    // Notify the user that the autofarm bot is activated with the expiration date
    return `Autofarm bot activated! It will automatically collect credits every hour. The bot will expire <t:${Math.floor(userEconomy.autofarm.expireDate / 1000)}:R>.`;
}

async function claimAutofarmCredits(userID) {
    // Fetch the user's economy data
    const userEconomy = await economy.get(userID);

    // Get the current time
    const currentTime = Date.now();

    // Check if the autofarm bot is active and has not expired
    if (!userEconomy || !userEconomy.autofarm?.active || currentTime >= userEconomy.autofarm.expireDate) return;

    // Calculate the amount of credits to claim
    const expireDate = userEconomy.autofarm.expireDate;
    const credits = Math.floor(expireDate / (24 * 60 * 60 * 1000)); // Example: 1 credit per day remaining

    // Update userEconomy to add the credits
    userEconomy.wallet += credits;
    // Optionally, deactivate the autofarm bot after claiming
    userEconomy.autofarm.active = false;

    // Save the updated user economy data
    await economy.set(userID, userEconomy);

    // Return the message with the amount of credits claimed
    return `You have successfully claimed ${credits} credits from your autofarm bot.`;
}

module.exports = {claimAutofarmCredits, activateAutofarmBot}