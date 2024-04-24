const { readFileSync } = require("fs");

module.exports = {
  prefix: ">",
  owner: "1202507536838828083",
  token: readFileSync('src/token.txt', 'utf-8')
}
