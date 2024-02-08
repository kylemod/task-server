const router = require('express')()
const Workspace = require('../models/Workspace')
const Task = require('../models/Task')
const User = require('../models/User')

router.post('/get-task', async (req, res) => {
  const { userId } = req.body
  try {
    let date = new Date()
    let tasks = await Task.find()
    let allTask = await tasks.filter(task => task.assignedUser.id == userId)
    let status = await allTask.map(t => {
      let dueDate = new Date(t.dueDate)
      let cont = {}

      if(date > dueDate) {
        
        cont._id = t._id
        cont.title = t.title
        cont.workspace = t.workspace
        cont.date = t.date
        cont.assignedUser = t.assignedUser
        cont.todos = t.todos 
        cont.company = t.company 
        cont.dueDate = t.dueDate
        cont.status = false
      } else {
        cont._id = t._id
        cont.title = t.title
        cont.workspace = t.workspace
        cont.date = t.date
        cont.assignedUser = t.assignedUser
        cont.todos = t.todos 
        cont.company = t.company 
        cont.dueDate = t.dueDate
        cont.status = true
      }

      return cont

    })
    res.send(status)
  } catch(err) {
    res.status(500).send(err)
  }
})

router.post('/comment-task', async (req, res) => {
  let { comments, id } = req.body

  try {
    let task = await Task.findByIdAndUpdate(id, {
      $push: {
        comment: comments
      }
    })
    res.send(comments)

  }catch(err) {
    res.status(500).send(err)
  }
})

router.post('/get-comment-task', async (req, res) => {
  let { id } = req.body

  try {
    let task = await Task.findById(id)
    res.send(task)

  }catch(err) {
    res.status(500).send(err)
  }
})

module.exports = router