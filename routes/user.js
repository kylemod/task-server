const router = require('express')()
const User = require('../models/User')

router.post('/get-users', async (req, res) => {
  const { company } = req.body
  
  let users = await User.find()
  let filteredUser = await users.filter(user => user.company == company)
  let allUsers = await filteredUser.map(user => {
    // 
    let cont = {}
    cont._id = user._id
    cont.firstName = user.firstName
    cont.lastName = user.lastName
    cont.email = user.email
    cont.role = user.role
    cont.approved = user.approved
    cont.company = user.company
    cont.statistics = user.statistics
    //cont.password = ''
    return cont
  })
  res.send(allUsers)
})

router.post("/get-user-statistics", async(req, res) => {
  const id = req.body.id
  
  let statistics;
  
  try {
    let user = await User.findById({ _id: id })
    statistics = user.statistics
  
    res.send(statistics)
  } catch(err) {
    res.status(500).send(err)
  }

})

router.get('/all-superadmin', async (req, res) => {
  let users = await User.find()
  let superadmins = await users.filter(u => u.role == 'superadmin')
  res.send(superadmins)
})

router.post('/get-superadmins', async(req, res) => {
  const { company } = req.body
  
  let users = await User.find()
  let superadmins = await users.filter(user => user.role == 'superadmin')
  let filteredUser = await superadmins.filter(user => user.company == company)
  let allUsers = await filteredUser.map(user => {
    // 
    let cont = {}
    cont._id = user._id
    cont.firstName = user.firstName
    cont.lastName = user.lastName
    cont.email = user.email
    cont.role = user.role
    cont.approved = user.approved
    cont.company = user.company
    //cont.password = ''
    return cont
  })
  
  res.send(filteredUser)
})

router.delete('/delete-request/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.send({ msg: 'Account request deleted!' })
  } catch(err) {
    res.status(500).send(err)
  }
})

router.put('/accept-request/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      approved: true
    })
    res.send({ msg: 'Account verified!' })
  } catch(err) {
    res.status(500).send(err)
  }
})

module.exports = router