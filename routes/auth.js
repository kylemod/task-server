const router = require('express')()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
let jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {
  const { firstName, lastName, role, email, password, company } = req.body
  const approved = false
  
  const isEmailExist = await User.findOne({ email })
  //const isCompanyExist = await User.findOne({ company })
  
  const createUser = async () => {
    let salt = await bcrypt.genSaltSync(10)
    let hashedPassword = await bcrypt.hashSync(password, salt)
    let statistics = {
      task: {
        request: [],
        datesCompleted: [],
        completed: 0,
        inProgress: 0,
        newTask: 0
      }
    }
    
    try {
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        role,
        approved,
        password: hashedPassword,
        company,
        statistics
      })
      
      res.status(201).send({ msg: 'New account is created, need to verify.' })
    } catch(err) {
      console.log(`Email: ${email}`)
      console.log(`Error: ${err}`)
      res.status(500).json({ Error: err})
    }
  }
  
  if(!isEmailExist) {
    createUser()
  } else {
    if(isEmailExist.email === email) {
      return res.status(409).json({ error: { 
        email: 'Email is already exist.' 
        }
      })
    }
  }
  
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  
  const isEmailExist = await User.findOne({ email })
  
  if(isEmailExist) {
    let hashedPassword = isEmailExist.password
    await bcrypt.compare(password, hashedPassword, (err, response) => {
      if(err) return res.status(500).send(err)
      if(response) {
        if(!isEmailExist.approved) return res.status(401).json({ error: {
          email: 'Account not verified!'
        }})
        
        let user = {
          id: isEmailExist._id,
          email: isEmailExist.email,
          firstName: isEmailExist.firstName,
          lastName: isEmailExist.lastName,
          role: isEmailExist.role,
          approved: isEmailExist.approved,
          company: isEmailExist.company
        }

        let jwtToken = jwt.sign(
          {userId: user.id},
          'secret',
          { expiresIn: '1h' }
        )

        res.json({
          user,
          authenticated: true,
          token: jwtToken
        })
      } else {
        res.status(401).json({ error: {
          password: 'Invalid password!'
        }})
      }
    })
  } else {
    res.status(404).json({ error: {
      email: "Account doesnt exist!"
    }})
  }
})

router.post('/get-session', async (req, res) => {
  let token = req.body.userId
  
  //if(!req.session.authenticated) return res.status(404).send('no session')
  if(!token) return res.status(404).send('no token available')
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, 'secret')
  } catch(err) {
    return res.status(500).send('invalid token')
  }

  try {
    let user = await User.findById(decodedToken.userId)
    if(!user) {
     res.status(404).send(`No user found' ${user}`)
    } else {

      let userInfo = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        approved: user.approved,
        company: user.company
      }
      
      res.json({
        user: userInfo,
        authenticated: true,
        token: token
      })
    }
  } catch(err) {
    res.status(500).send(err)
  }
  
})


router.get('/get-codenames',async (req, res) => {
  let users = await User.find({ $and: [
      { role: { $eq: 'superadmin' } },
      { approved: { $eq: true  } },
    ] })
    
  let codenames = await users.map(u => {
    let cont = {}
    cont.company = u.company
    return cont
  })
  res.send(codenames)
})

module.exports = router