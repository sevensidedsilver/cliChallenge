var readline = require('readline')
var util = require('util')
var debug = util.debuglog('cli debug')
var events = require('events')
class _events extends events{}
var e = new _events()

var cli = {}

// initialize store
var store = [
  {
    key: "foo",
    value: "pop",
    session: 0
  },
  {
    key: "apple",
    value: "dog",
    session: 1
  },
  {
    key: "mango",
    value: "dog",
    session: 2
  },
  {
    key: "keyboard",
    value: "report",
    session: 2
  }
]

let sessionCount = 0

// input handlers
e.on('HELP', function(str){
  cli.responders.help()
})

e.on('SET', function(str, split){

  cli.responders.set(str, split)
})

e.on('GET', function(str, split){
  cli.responders.get(str)
})

e.on('DELETE', function(str) {
  cli.responders.delete(str)
})

e.on('COUNT', function(str){
  cli.responders.count(str)
})

e.on('BEGIN', function(str){
  cli.responders.begin(str)
})

e.on('COMMIT', function(str){
  cli.responders.commit(str)
})

e.on('ROLLBACK', function(str){
  cli.responders.rollback(str)
})



// responses to Input
cli.responders = {}

cli.responders.help = function(){
  console.log('you asked for help')
}

cli.responders.set = function(str, split) {
  store = store.map((item) => {
    if (item.key == str[1] && item.session == sessionCount) {
      return {key: str[1] ,value: str[2], session: sessionCount}
    } else return item
  })

  let storeKeys = store.map((item) => {return item.key})
  if (storeKeys.indexOf(str[1]) == -1) {
    store.push({key: str[1], value: str[2], session: sessionCount})
  }
}

cli.responders.get = function(str, split){
    store.forEach((item) => {
      if (str[1] == item.key) {
        console.log(item.value)
        return true
      }
    })
}

cli.responders.delete = function(str) {

  store = store.filter((item) => {
    if (str[1] !== item.key) {
      return item
    }
  })

}

cli.responders.count = function(str){
  let countValues = 0
  store.forEach((item) =>{
    if (item.value == str[1]){
      countValues = countValues + 1
    }
  })
  console.log(countValues)
}

cli.responders.begin = function(str) {
  sessionCount = sessionCount + 1
}

cli.responders.commit = function(str) {
  console.log(str)
}

cli.responders.rollback = function(str) {
  console.log(str)
}

// input processing
cli.processInput = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false
  // process input only if user typed something
  if(str){
    // commands here:
    var uniqueInputs = [
      'HELP',
      'EXIT',
      'GET'
    ]
    // emit event for different commands
    var matchFound = false
    var counter = 0

    uniqueInputs.some(function(input){
      if (str.indexOf(input) > -1){
        matchFound = true
        // event
        e.emit(input, str)
        return true
      }
    })

    // commands
    var recordCommands = [
      'GET',
      'DELETE',
      'COUNT',
      'SET',
      'BEGIN',
      'COMMIT',
      'ROLLBACK'
    ]
    // split command string by spaces
    let split = str.split(' ')
    recordCommands.some(function(input) {
      // SET command
      if (split[0].indexOf(input) > -1 && split[0] == 'SET' && split.length == 3) {

        matchFound = true
        e.emit(input, split)
        return true
      }
      // if first word is included, and includes 1 other string
      else if (split[0].indexOf(input) > -1 && split.length == 2 && split[0] !== 'SET') {
        matchFound = true
        //event
        e.emit(input, split)
        return true
      } else if (split[0].indexOf(input) > -1 && split.length == 1 && recordCommands.indexOf(split[0]) > 3) {
        matchFound = true
        e.emit(input, split)
        return true
      }
  })


    // not a valid command message
    if (!matchFound) {
      console.log('not a valid command')
    }
  }

}

cli.init = function(){
  // send start message to console
  console.log('The CLI has started')

  // Input symbol
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>'
  })

  // initial prompt
  _interface.prompt()

  // handle Input
  _interface.on('line', function(str){
    //send to input processing
    cli.processInput(str);
    //reinitialize the prompt
    _interface.prompt()

  })

  //stop the CLI and kill process
  _interface.on('close', function(){
    process.exit(0)
  })


}





cli.init()
