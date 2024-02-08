const mongoose = require('mongoose')
const Schema = mongoose.Schema

const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  tasks: {
    type: Array,
    required: true
  },
  company: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Workspace', taskSchema)