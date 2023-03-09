require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: function (req, res) { return req.method !== 'POST' }
}))

const Phonebook = require('./models/phonebook')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
app.use(requestLogger)
app.use(express.static('build'))

/*
let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
  ]
*/

app.get('/', (request, response) => {
  response.send('<h1>This is Helsinki Full Stack Part 3</h1>')
})

app.get('/api/persons', (request, response) => {
  console.log('/api/persons...')
  Phonebook.find({}).then(persons => {
    console.log('...then', persons)
    response.json(persons)
  })
})

//app.get('/api/info', (request, response) => {
//  response.send(`Phonebook has info for ${persons.length} people<p>${Date()}</p>`)
//})

app.get('/api/persons/:id', (request, response) => {
  const query = { id: request.params.id }
  console.log(query)
  Phonebook.find(query).then(person => {
    //if (person) {
    //  response.json(person)
    //} else {
    //   response.status(404).send('Current id does not exist')
    //}
    console.log({person})
    response.json(person)
  })
})

/*
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})
*/

const generateId = (max) => {
  const randomNumber = Math.random()
  const selection = Math.floor(randomNumber*max); // 0<=max<1
  console.log('generateId',selection)
  return selection
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  // check name in case it already exists by another application
  const query = { name: body.name }
  Phonebook.findOne(query)
    .then (person => {
      console.log(person)
      if (person) {
         return response.status(400).json({error: 'name must be unique'})
      }
      else {
        const person = new Phonebook({
          name: body.name,
          number: body.number,
          id: generateId(1000),
        })
        person.save().then(savedPerson => {
          response.json(savedPerson)
        })
      }
    })
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})