const router = require('express')()
const Workspace = require('../models/Workspace')

router.post('/get-workspace', async(req, res) => {
  const { userId } = req.body
  try {
    let task = []
    let workspace = await Workspace.find()
    await workspace.forEach(data => {
      data.tasks.forEach(t => {
        task.push(t)
      })
    })
    let allTask = await task.filter(t => t.assignedUser.id == userId)
    res.send(allTask)
  } catch(err) {
    res.status(500).send(err)
  }
})

router.post('/selected-workspace', async(req, res) => {
  const { workspaceId, userId } = req.body
  try {
    let workspace = await Workspace.findById({ _id: workspaceId})
    let allTasks = await workspace.tasks.filter(task => task.assignedUser.id == userId)
    res.send(allTasks)
  } catch(err) {
    res.status(500).send(err)
  }
})

module.exports = router