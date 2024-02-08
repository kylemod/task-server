const express = require('express')
const app = express()
const session = require('express-session')
const port = 3000
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors')
const multer = require('multer')
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');

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

const conn = mongoose.connection;

// Initialize GridFS stream
let gfs;

conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
});

// Multer storage engine using GridFS
const storage = new GridFsStorage({
  url: connectionString,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'uploads'
    };
  }
});

const upload = multer({ storage });

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});

// Get file endpoint
app.get('/files', (req, res) => {
  gfs.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No files found' });
    }

    return res.json({ files });
  });
});
  
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