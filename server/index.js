// Declaring Dependencies
const express = require('express')
const fs = require('fs')

var app = express()
const port = 3000


class stream {
    constructor(path, id) {
        this.path = `videos/${path}`
        this.stat = fs.statSync(this.path)
        this.fileSize = this.stat.size
        this.postingPath = '/' + id
    }
    poster(req, res, object) {
        
            object.range = req.headers.range
            if (object.range) {
                object.parts = object.range.replace(/bytes=/, "").split("-")
                object.start = parseInt(object.parts[0], 10)
                object.end = object.parts[1]
                    ? parseInt(parts[1], 10)
                    : object.fileSize - 1
                object.chunksize = (object.end - object.start) + 1
                object.file = fs.createReadStream(object.path, [object.start, object.end])
                object.head = {
                    'Content-Range': `bytes ${object.start}-${object.end}/${object.fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': object.chunksize,
                    'Content-Type': 'video/mp4',
                }
                res.writeHead(206, object.head);
                object.file.pipe(res);
            } else {
                object.head = {
                    'Content-Length': object.fileSize,
                    'Content-Type': 'video/mp4',
                }
                res.writeHead(200, object.head)
                fs.createReadStream(object.path).pipe(res)
                console.log(`User accessed "${this.postingPath}"`)

            }
    }
    post() {
        let object = this
        app.get(this.postingPath, function (req, res) {
            object.poster(req, res, object)
        })
        console.log(`http://localhost:${port}${this.postingPath}`)
    }
}

const videosPath = './videos'
const videoConfig = './videos.json'
var initStreams = {}

var videosDir = fs.readdirSync(videosPath)
var streamslist = {}

//sees if the config file exsist
if(fs.existsSync(videoConfig)){
    let rawdata = fs.readFileSync(videoConfig)
    let _videoConfig = JSON.parse(rawdata)

    //checks if a video is missing from the config
    for(i = 0; i < Object.keys(_videoConfig).length; i++){
        for(x = 0; x < videosDir.length; x++){
            if(_videoConfig[Object.keys(_videoConfig)[i]] == videosDir[0]){
                videosDir.splice(0)
            }
        }
    }
    
    //adds vidoe to config
    for(i = 0; i < videosDir.length; i++){
        _videoConfig[Math.random().toString(36).substr(2, 9)] = videosDir[i]
    }
    let data = JSON.stringify(_videoConfig, null, 2);
    fs.writeFile(videoConfig, data, (err) => {
        if (err) throw err;});
    streamslist = _videoConfig
} else {
    //if the config does not exsist make a new one
    let videoslist = {}
    for(i = 0; i < videosDir.length; i++){
        videoslist[Math.random().toString(36).substr(2, 9)] = videosDir[i]
    }
    let data = JSON.stringify(videoslist, null, 2);
    fs.writeFile(videoConfig, data, (err) => {
        if (err) throw err;});
    streamslist = videoslist
}

var streams = []

for(i = 0; i < Object.keys(streamslist).length; i++){
    streams[i] = new stream(streamslist[Object.keys(streamslist)[i]], Object.keys(streamslist)[i]) 
}

for(i = 0; i < streams.length; i++){
    streams[i].post()
}

var server = app.listen(port)
console.log(`App listen on port ${port}`)