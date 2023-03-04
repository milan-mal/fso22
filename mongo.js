const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://milanm:${password}@cluster0.biwspvh.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', phoneSchema)

if (process.argv.length<4) {
  Person.find({}).then(    
    result => {
      result.forEach(person => {
        console.log(person)
      })
      mongoose.connection.close()
    }
  )
} else {
  console.log("adding a person..")
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(result => {
    console.log('person added')
    mongoose.connection.close()
  })
}