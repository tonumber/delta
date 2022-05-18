const cat = require('cat-loggr');
const log = new cat();
log.init("cmd.js called")
// Handle bot commands
let aic,prefix,client
function setup (sprefix,saic,c) {
    prefix = sprefix;
    aic = saic
    client = c
    log.info("Handler successfully setup!")
  }

function handle(m) {
  if (!prefix) {return log.error("Handler error, have you used the setup class?")}
  if (m.author.bot || m.author.id == client.user.id) {return}
  if (!m.content) {return}
  if (m.content.split(' ')[0] == '!i') {return} // ignore message
  m.channel.startTyping()
  setTimeout(()=>{aic.processInput(m.content).then((r)=>{setTimeout(()=>{m.channel.send(r);m.channel.stopTyping()},r.length*20)});},30*m.content.length)
}
module.exports.setup = setup
module.exports.handle = handle
