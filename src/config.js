const { REST } = require("discord.js");
const { readFileSync } = require("fs");

module.exports = {
  owner: "1202507536838828083",
  token: readFileSync('token.txt', 'utf-8'),
  rest: new REST({ version: "10" })
}
