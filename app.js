const express = require('express')
const app = express()
const session = require('express-session')
const port = 3000
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

const connectionString = "mongodb+srv://databasecapstone01:database01@cluster0.tzugbxd.mongodb.net/task-tracking-tool?retryWrites=true&w=majority"
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}
mongoose.connect(connectionString, options)
  .then(res => {
    console.log("Connected to Database!")
  })
  .catch(err => {
    console.log(`Error: ${err}`)
  })
  
// routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const workspaceRoutes = require('./routes/workspace')
const taskRoutes = require('./routes/task')
const taskUserRoutes = require('./routes/task.user')
const workspaceUserRoutes = require('./routes/workspace.user')

app.get('/', (req, res) => {
  res.send('task tracking tool api')
})

app.use('/api/auth', authRoutes)
app.use('/api/workspace', workspaceRoutes)
app.use('/api/task', taskRoutes)
app.use('/api/task/user/', taskUserRoutes)
app.use('/api/workspace/user/', workspaceUserRoutes)
app.use("/api/user", userRoutes);

//app.options('*', cors())

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})