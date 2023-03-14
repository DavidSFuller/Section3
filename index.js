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

const errorHandler = (error, request, response, next) => {
  //console.log('in errorHandler:')
  //console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
app.use(requestLogger)
app.use(express.static('build'))

let persons = []

app.get('/', (request, response) => {
  response.send('<h1>This is Helsinki Full Stack Part 3</h1>')
})

//----------------------------------------------------------
// GET ALL ENTRIES
//----------------------------------------------------------

app.get('/api/persons', (request, response, next) => {
  console.log('/api/persons...')
  Phonebook.find({})
    .then(persons => {
      console.log('...then', persons)
      response.json(persons)
    })
    .catch(error => next(error))
})

//----------------------------------------------------------
// Return Infromation
//----------------------------------------------------------

app.get('/api/info', (request, response) => {
  Phonebook.countDocuments()
    .then (numentries => {
      console.log('numentries=', numentries)
      response.send(`Phonebook has info for ${numentries} people<p>${Date()}</p>`)})
})

//----------------------------------------------------------
// FIND AN ENTRY
//----------------------------------------------------------

app.get('/api/persons/:id', (request, response, next) => {
  Phonebook.findById(request.params.id)
    .then(person => {
      console.log({ person })
      response.json(person)
    })
    .catch(error => next(error))
})

//----------------------------------------------------------
// DELETE AN ENTRY
//----------------------------------------------------------

app.delete('/api/persons/:id', (request, response, next) => {
  const body = request.body
  console.log(body)
  Phonebook.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//----------------------------------------------------------
// INSERT A NEW ENTRY
//----------------------------------------------------------

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // check name in case it already exists by another application
  const query = { name: body.name }
  Phonebook.findOne(query)
    .then (person => {
      console.log(person)
      if (person) {
        response.status(400).json({ error: 'name must be unique' }).end()
      }
      else {
        const person = new Phonebook({
          name: body.name,
          number: body.number,
        })
        person
          .save()
          .then (savedPerson => {response.json(savedPerson)})
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})

//----------------------------------------------------------
// UPDATE A NEW ENTRY
//----------------------------------------------------------

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }
  console.log('Update', request.params.id, person)
  Phonebook.findByIdAndUpdate(request.params.id, person,
    { new: true, runValidators: true, context: 'query' })
    .then (updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})