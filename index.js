const repl = require('repl');

repl.start().context.getRandomNumber = getRandomNumber

function getRandomNumber() {
  return "getRandomNumber has been called"
}


