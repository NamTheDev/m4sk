const { Colors } = require("discord.js");
const { textDatabase } = require("multi-purpose");

module.exports = {
    defaultEmbedColor: Colors.DarkRed,
    economy: new textDatabase('economy')
}