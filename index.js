const cat = require('cat-loggr');
const log = new cat();

function mrequire(path) { return require('./modules/' + path) }
log.init("index.js started")

const aifig = { "prompt": "default", "api": "PUT OPENAI API KEY HERE!" } // note - if you do not have openai's codex, replace "code-davinci-002" with "text-davinci-002" in modules/ai.js
const ai = mrequire('ai.js');
const aic = new ai(aifig)
const handler = mrequire('cmd.js');

const utils = mrequire('utils.js');


const discord = require('discord.js'); // this uses discord.js v12 (this does not work on a user token, to switch it to user tokens, replace discord.js with 'discord.js-selfbot' and run 'npm remove discord.js && npm i discord.js-selfbot', it will be slow!)
const client = new discord.Client();
client.on('ready', () => {
    log.init("Client logged into " + client.user.tag + " - Prompt: " + aifig.prompt);
    handler.setup("!", aic, client) // prefix hasnt been used yet but will in a future update! only command is !clear
})
client.on('message', handler.handle)
client.login("DISCORD TOKEN HERE")