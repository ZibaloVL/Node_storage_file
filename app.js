const express = require('express');
const bodyParser = require('body-parser'); 
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// Middlware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Mongo URI
const mongoUri = `mongodb+srv://ZibaloVL1971:baracudaZibalo@img-rzvtw.mongodb.net/test`
// Create mongo connections
const conn = mongoose.createConnection(mongoUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Init gfs
let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

app.get('/', (req, res) => {
    res.render('index')
});

const port = 5000;

app.listen(port, () => console.log(`server started on port ${port}`));