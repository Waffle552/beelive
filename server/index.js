// Declaring Dependencies
const express = require('express')
const fs = require('fs')

var app = express()
const port = 3000


class stream {
    constructor(path) {
        this.path = `videos/${path}`
        this.stat = fs.statSync(this.path)
        this.fileSize = this.stat.size
        this.postingPath = '/' + Math.random().toString(36).substr(2, 9);
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

var initStreams = {}


streams = [new stream('vid1Done.mp4'), new stream('Whenyorureallybadatr6.mp4')]

for(i = 0; i < streams.length; i++){
    streams[i].post()
}

var server = app.listen(port)
console.log(`App listen on port ${port}`)