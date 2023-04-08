const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person.js')
const { mongo, default: mongoose } = require('mongoose')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = []

app.get('/', (req, res) => {
    res.send('<h1>Congrats! You\'ve reached the server.</h1>')
})

app.get('/info', (req, res) => {
    res.send(`<p>Phone book has info for ${persons.length} people</p><p>${new Date}</p>`)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons =>
    res.json(persons))
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }

/* 
TODO Check if a person is already in DB removed.
I want to integrate with Mongo first in a basic way.
 */
  // if (persons.find(p => p.name === body.name)) {
  //   return res.status(400).json({
  //     error: 'name already exists'
  //   })
  // }

/*  I removed the following code to check if a person with the same name is already in the database.
    This check should be on the FE. BE should only handle the PUT request
     */
  // Person.find({ name: "Dashenka" })
  //   .then(result => {
  //     console.log('name found in database')
  //     if(result) {
  //       console.log('updating a person..')
  //       return
  //     }
  //   })

  console.log('adding a person..')
  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(result => {
    console.log('person added')
    mongoose.connection.close()
  })

  res.json(person)
  res.status(200).end()
})

app.put('/api/persons/:id', (req, res, next) => {
  console.log('updating a person..')
  const id = req.params.id
  const body = req.body
  const number = body.number
  
  Person.findByIdAndUpdate(id, { number: number}, { new: true })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error))
})

// TODO Mongo integration.
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.statusMessage = "Person with this id doesn't exist."
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete( req.params.id )
      .then(result => {
        if(result) {
          res.statusMessage = "person successfully deleted"
          res.status(204).end()
        } else {
          res.statusMessage = "person not found"
          res.status(404).end()
        }
      })
      .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})