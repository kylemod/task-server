const router = require('express')()
const Workspace = require('../models/Workspace')
const User = require('../models/User')

router.post('/create-workspace', async (req, res) => {
  const { title, company } = req.body
  
  const isTitleExist = await Workspace.findOne({ title })
  
  const createWorkspace = async () => {
    try {
      let workspace = await Workspace.create({
        title,
        company
      })
      res.send("successfully created.")
    } catch(err) {
      res.status(500).send(err)
    }
  }
    
  if(!isTitleExist) {
    createWorkspace()
  } else {
    if(isTitleExist.title == title) {
      return res.status(409).send({ title: 'Title is already exist.' })
    }
  }
})

router.get('/get-workspace', async(req, res) => {
  try {
    let workspace = await Workspace.find()
    res.send(workspace)
  }catch(err) {
    res.status(500).send(err)
  }
})

router.get('/get-users', async (req, res) => {
  try {
    let users = await User.find({ $and: [
      { role: { $ne: 'admin' } },
      { role: { $ne: 'superadmin' } },
      { approved: { $eq: true  } },
    ] })
    
    let allUsers = await users.map(user => {
    let cont = {}
    cont._id = user._id
    cont.firstName = user.firstName
    cont.lastName = user.lastName
    cont.company = user.company
    return cont
  })
    res.send(allUsers)
  } catch(err) {
    res.status(500).send(err)
  }
})

router.post('/selected-workspace', async (req, res) => {
  const { workspaceId } = req.body
  
  try{
    let workspace = await Workspace.findById({ _id: workspaceId })
    res.send(workspace)
  } catch(err) {
    res.status(500).send(err)
  }
})

router.post('/delete-workspace', async (req, res) => {
  const { workspaceId } = req.body
  
  try {
    let workspace = await Workspace.findByIdAndDelete({ _id: workspaceId })
    
    res.send('Workspace deleted')
  }catch(err) {
    res.status(500).send(err)
  }
})

module.exports = router