const mongoose = require('mongoose')

//console.log('num args:',process.argv.length)
if (process.argv.length<3 || process.argv.length>5) {
  console.log('usage: node mongo.js {password} [{name} {number}]')
  process.exit(1)
}

const password = process.argv[2]
const name     = process.argv[3]
const number   = process.argv[4]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.hosqzpr.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String, 
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length===5) {
  const person = new Person({
    name: name,
    number: number
  })
  //console.log('new record:',person.name,person.number)
  person.save().then(result => {
    console.log("added", name, number, 'to phonebook')
    mongoose.connection.close()
  })
}
else {
    console.log('phonebook:')
    Person.find(name ? {"name":name} : {}).then(result => {
        result.forEach(person => {
          console.log(person.name, person.number)
        })
        mongoose.connection.close()
      })
}



