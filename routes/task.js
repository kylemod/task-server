const router = require('express')()
const Workspace = require('../models/Workspace')
const Task = require('../models/Task')
const User = require('../models/User')

router.post('/create-task', async (req, res) => {
  const { title, workspace, date, todos, assignedUser, company, dueDate } = req.body
  
  const isTitleExist = await Task.findOne({ title })
  
  let user = await User.findById({ _id: assignedUser.id })
  
  const createTask = async () => {
    //try {
      let task = await Task.create({
        title,
        workspace,
        date,
        assignedUser,
        todos,
        company,
        dueDate
      })
      
      let updateWorkspace = await Workspace.findByIdAndUpdate(workspace.id, {
        $push: { tasks: task }
      })
      
      let month = new Intl.DateTimeFormat('en-US', {
        month: 'long',
      }).format(new Date());
      let day = new Date().getDate()
      let year = new Date().getFullYear()
      let d = [month,day,year].join(' ')
      
      let stats = await user.statistics
      let newTask = await stats.task.newTask
      let addedNewTask = newTask + 1
      let requestData = []
      
      let reqs = await user.statistics.task.request
      
      if(reqs.length > 0) {
        let filteredReq = await reqs.filter(data => data.date == d)
        
        if(filteredReq.length > 0) {
          let addedReq = filteredReq[0].request + 1
          let newData = await reqs.map(data => data.date == d ? {...data, request: addedReq } : data)
        
        let statistics = await User.findByIdAndUpdate({ _id: assignedUser.id }, {
          statistics: {
            task: {
              request: newData,
              datesCompleted: stats.task.datesCompleted,
            }
          }
        })
 
        } else {
          requestData = [...reqs]
           
          let newReq = {
            date: d,
            request: 1
          }
          
          requestData.push(newReq)
         
          let statistics = await User.findByIdAndUpdate({ _id: assignedUser.id }, {
            statistics: {
              task: {
                request: requestData,
                datesCompleted: stats.task.datesCompleted,
              }
            }
          })
        }
      } else {
        let newReq = {
          date: d,
          request: 1
        }
        requestData.push(newReq)
        
        let statistics = await User.findByIdAndUpdate({ _id: assignedUser.id }, {
          statistics: {
            task: {
              request: requestData,
              datesCompleted: stats.task.datesCompleted,
            }
          }
        })
      }
      
      res.send('successfully created')
    //} catch(err) {
      //res.status(500).send(err)
    //}
  }
  
  if(!isTitleExist) {
    createTask()
  } else {
    if(isTitleExist.title == title) {
      return res.status(409).send({ title: 'Title is already exist.' })
    }
  }
})

router.get('/get-task', async(req, res) => {
  try {
    let date = new Date()
    const tasks = await Task.find()
    let status = await tasks.map(t => {
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

router.post('/selected-task', async(req, res) => {
  
  const id = req.body.id
  try {
    let task = await Task.findById({ _id: id })
    res.send([task])
  } catch(err) {
    res.status(500).send(err)
  }
})

router.post('/update-assign', async(req, res) => {
  const { id, userInfo, workspaceId } = req.body
  try {
    let assignedUser = {
      id: userInfo.id,
      name: `${userInfo.fName} ${userInfo.lName}`
    }
  
    let task = await Task.findByIdAndUpdate(id, {
      assignedUser
    })
    
    let tempTask = []
    let allTask = await Task.findOne({ _id: id })
    
    let workspaceTasks = await Workspace.findOne({ _id: workspaceId })
    
    let theTask = workspaceTasks.tasks.filter(task => task._id != id )
    
    tempTask = [...theTask]
    tempTask.push(allTask)
    
    let updateWorkspaceTask = await Workspace.findByIdAndUpdate(workspaceId, {
      tasks: tempTask
    })
    
    res.send(updateWorkspaceTask)
  } catch(err) {
    res.status(500).send(err)
  }
})

router.post('/update-task', async (req, res) => {
  const { title, taskId, workspaceId, todos } = req.body
  
  try {
    let task = await Task.findByIdAndUpdate(taskId, {
      title,
      todos
    })
    
    let tempTask = []
    let allTask = await Task.findOne({ _id: taskId })
    
    let workspaceTasks = await Workspace.findOne({ _id: workspaceId })
    
    let theTask = workspaceTasks.tasks.filter(task => task._id != taskId )
    
    tempTask = [...theTask]
    tempTask.push(allTask)
    
    let updateWorkspaceTask = await Workspace.findByIdAndUpdate(workspaceId, {
      tasks: tempTask
    })
    
    let month = new Intl.DateTimeFormat('en-US', {
        month: 'long',
    }).format(new Date());
    let day = new Date().getDate()
    let year = new Date().getFullYear()
    let d = [month,day,year].join(' ')
    
    let isCompleted = await allTask.todos.every(d => d.done == true)
    let userId = allTask.assignedUser.id
    let user = await User.findById({ _id: userId })
    
    let userRequest = await user.statistics.task.request
    let completedData = await user.statistics.task.datesCompleted
  
    if(isCompleted) {
      if(completedData.length > 0) {
        let filteredData = await completedData.filter(data => data.date == d)
        
        if(filteredData.length > 0) {
          let addedCompleted = filteredData[0].completed + 1
          
          let newData = await completedData.map(data => data.date == d ? {...data, completed: addedCompleted } : data)
          
          let statistics = await User.findByIdAndUpdate({ _id: userId }, {
            statistics: {
              task: {
                request: userRequest,
                datesCompleted: newData,
              }
            }
          })

        } else {
          let newCompleted = {
            date: d,
            completed: 1
          }
          
          completedData.push(newCompleted)
          
          let statistics = await User.findByIdAndUpdate({ _id: userId }, {
            statistics: {
              task: {
                request: userRequest,
                datesCompleted: completedData,
              }
            }
          })
        }
        
      } else {
        let newCompleted = {
          date: d,
          completed: 1
        }
        
        completedData.push(newCompleted)
        
        let statistics = await User.findByIdAndUpdate({ _id: userId }, {
          statistics: {
            task: {
              request: userRequest,
              datesCompleted: completedData,
            }
          }
        })
        
      }
    }
    
    res.send("task updated")
  } catch(err) {
    res.status(500).send(err)
  }
})

router.post('/delete-task', async (req, res) => {
  const { taskId, workspaceId } = req.body
  
  try {
    let task = await Task.findByIdAndDelete({ _id: taskId })
    
    let workspaceTasks = await Workspace.findOne({ _id: workspaceId })
    
    let theTask = workspaceTasks.tasks.filter(task => task._id != taskId )
    
    let updateWorkspaceTask = await Workspace.findByIdAndUpdate(workspaceId, {
      tasks: theTask
    })
    
    res.send('task deleted')
  } catch(err) {
    res.status(500).send(err)
  }
})

router.get('/test', async (req, res) => {
  res.send('kss')
})

module.exports = router