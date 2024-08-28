const { rarity } = require("../config");

function spin(numSpins) {
    let totalProbability = 0;

    // Calculate adjusted probabilities for each rarity tier
    let adjustedRarities = rarity.map(r => {
        let adjustmentFactor = 0.25; // Smaller exponent for harder higher tiers
        if (r.tier.includes('S')) {
            adjustmentFactor = 0.0001; // Even smaller exponent for epic and above
        }
        const adjustedProbability = r.baseProbability * Math.pow(numSpins, adjustmentFactor);
        totalProbability += adjustedProbability;
        return {
            tier: r.tier,
            probability: adjustedProbability,
            price: r.price
        };
    });

    // Normalize probabilities
    adjustedRarities = adjustedRarities.map(r => ({
        tier: r.tier,
        probability: r.probability / totalProbability,
        price: r.price
    }));

    let spunItems = [];

    // Perform spins and collect results
    for (let i = 0; i < numSpins; i++) {
        const randomValue = Math.random();
        let cumulativeProbability = 0;

        for (let j = 0; j < adjustedRarities.length; j++) {
            cumulativeProbability += adjustedRarities[j].probability;
            if (randomValue <= cumulativeProbability) {
                const tax = Math.random() * 0.1 + 0.9; // Random tax between 0.9 and 1.0
                spunItems.push({
                    tier: adjustedRarities[j].tier,
                    price: Math.round(adjustedRarities[j].price * tax)
                });
                break;
            }
        }
    }

    // Determine the highest-tier item from spun items
    let highestTierItem = spunItems[0];
    for (let item of spunItems) {
        const currentTierIndex = rarity.findIndex(r => r.tier === item.tier);
        const highestTierIndex = rarity.findIndex(r => r.tier === highestTierItem.tier);
        if (currentTierIndex > highestTierIndex) {
            highestTierItem = item;
        }
    }

    return highestTierItem;
}

module.exports = { spin }