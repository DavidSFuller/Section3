const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

  const checkPhone = (val) => {
    console.log ('in checkPhone', val, )
    return (!isNaN(val) || /^[0-9]{2}-[0-9]*$/.test(val) || /^[0-9]{3}-[0-9]*$/.test(val))
  }

const phoneSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3
  },
  number: {
    type: String,
    minLength: 8,
    validate: {validator: checkPhone,
               message: props => `${props.value} is not a valid phone number!`}
  },
  id: Number
})

phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Phonebook', phoneSchema)