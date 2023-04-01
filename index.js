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

/* 
Generating ID not needed anymore, Mongo generates it itself.
 */
// const generateId = () => {
//   return Math.floor(Math.random() * 1000000)
// }

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }

/* 
Check if a person is already in DB removed.
I want to integrate with Mongo first in a basic way.
 */
  // if (persons.find(p => p.name === body.name)) {
  //   return res.status(400).json({
  //     error: 'name already exists'
  //   })
  // }

  console.log("adding a person..")
  const person = new Person({
    // id: generateId(),
    name: body.name,
    number: body.number
  })

  person.save().then(result => {
    console.log('person added')
    mongoose.connection.close()
  })

  // persons = persons.concat(person)
  // console.log(req.headers)
  res.json(person)
  res.status(200).end()
})

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

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})