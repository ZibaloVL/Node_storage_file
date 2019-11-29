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
const conn = mongoose.createConnection(mongoUri, {
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

//Create Storage engine

const storage = new GridFsStorage({
    url: mongoUri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({
    storage
});

// @route GET
// @dest LOads form
app.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        if(!files || files.length === 0) {
            res.render('index', {files: false});
        } else {
            files.map(file => {
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                    file.isImage = true
                } else {
                    file.isImage = false
                }
            })
            res.render('index', {files: files});
        }
    })
});

//@route POST/upload
//desc Upload file in DB
app.post('/upload', upload.single('file'), (req, res) => {
    //console.log(req)
    /*  res.json({
          file: req.file
      })
    */
    res.redirect('/');
})

//router get /files
//dest Display all files in JSON
app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            })
        }
        return res.json(files);
    })
})

//router get /files/:filename
//dest Display single file object
app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({
        filename: req.params.filename
    }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            })
        }
        return res.json(file)
    })
})

//router get /image/:filename
//dest Display single file object
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({
        filename: req.params.filename
    }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            })
        }
        if (file.contentType === 'image/jpeg' || file.contentType === 'img/png'){
            const readstream = gfs.createReadStream(file.filename)
            readstream.pipe(res)
        } else {
            res.status(404).json({err: 'not image type'})
        }
    })
})

//@route DELETE /files/:id
//desc Ddelete file
app.delete('/files/:id', (req, res) => {
    console.log('method delete')
    console.log('req.params.id', req.params.id)
    gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
        if(err) {
            return res.status(404).json({err: err});
        }
    })
    res.redirect('/')
})

const port = 5000;

app.listen(port, () => console.log(`server started on port ${port}`));