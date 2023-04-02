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

  console.log("adding a person..")
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

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})