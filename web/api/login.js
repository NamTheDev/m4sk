const { Routes } = require("discord.js")
const { rest } = require("../../src")

module.exports = {
    type: 'post',
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res
    */
    async execute(req, res) {
        console.log(req.body)
        res.send('Successfully logged in!')
    }
}