const cat = require('cat-loggr');
const log = new cat();
const fs = require('fs');

function mrequire(path) {
    return require('./modules/' + path)
}
log.init("ai.js called")
let base = "This is a chat between an AI and a Human. The AI's name is %Name%, the ai is a %Gender%, the AI's age is %Age%. The ai is %Personality%.\n"
let isinit = false

function processPersonality(p) {
    if (!p) {
        log.error("No personality given.");
        return false
    }
    if (!fs.existsSync("./prompts/" + p + '.json')) {
        log.error("Invalid personality given");
        return false
    }
    const data = JSON.parse(fs.readFileSync('./prompts/' + p + '.json', 'utf-8'))
    const fdata = base.replace("%Name%", data.Name).replace("%Age%", data.Age).replace("%Gender%", data.Gender).replace("%Personality%", data.Personality.join(', ')) + data.Prompt
    log.info("Successfully created personality prompt.")
    return fdata
}

class AI {
    constructor(config) {
        if (!config) {
            return log.error("No options provided. Error")
        }
        if (!config.api || !config.prompt) {
            return log.error("Invalid options.")
        }
        const {
            Configuration,
            OpenAIApi
        } = require("openai");

        const configuration = new Configuration({
            apiKey: config.api || '',
        });
        this.openai = new OpenAIApi(configuration);
        this.openai.pers = config.prompt
        let personality = processPersonality(config.prompt)
        if (!personality) {
            log.error("Invalid personality! Switching to default.");
            personality = processPersonality("default")
        }
        this.openai.prompt = personality
        isinit = true
        log.info("Client successfully initialized")
    }
    processInput(text) {
        if (!isinit || !text) {
            return log.error("You have not initialized the ai client or have not provided text.")
        }
        log.info("Processing text entry")
        return new Promise(async(res, rej) => {
            if (text == '!clear') {
                this.openai.prompt = processPersonality(this.openai.pers)
                res("Reset prompt back to original state! (" + this.openai.pers + ')')
                log.info("prompt reset")
                return
            }
            if (text.split(' ')[0] == '!swap') {
                if (processPersonality(text.split(' ')[1])) {
                    this.openai.pers = text.split(' ')[1]
                    this.openai.prompt = processPersonality(this.openai.pers)
                    res("Prompt changed and personality reset. Current prompt: " + this.openai.pers)
                } else {
                    res("Prompt invalid. Case sensitive!")
                }
                return
            }
            const response = await this.openai.createCompletion("code-davinci-002", { // replace code with text if you do not have codex
                    prompt: this.openai.prompt + text + '\nAI:',
                    temperature: 0.75,
                    max_tokens: 300,
                    stop: ["AI:", "\n"],
                }).then((r) => {
                    log.info("Response succeeded.")
                    res(r.data.choices[0].text)
                    this.openai.prompt = this.openai.prompt + text + '\nAI:' + r.data.choices[0].text + '\nHuman:'
                })
                .catch(() => {
                    log.error("Response errored, most likely ratelimited.")
                    res("Bot is rate limited. Please wait `10` seconds.")
                })
        })

    }
}


module.exports = AI
