// curl -k https://localhost:6299/
var https = require('https');
var fs = require('fs');
var ytdl = require('ytdl-core'); //https://www.npmjs.com/package/ytdl-core
var startStopDaemon = require('start-stop-daemon'); //https://www.npmjs.com/package/start-stop-daemon
var url = require('url');
var path = require('path');
var ffmetadata = require("ffmetadata");
var Transcoder = require('stream-transcoder');
var mp4 = require('mp4-parser');
var ffmpeg = require('fluent-ffmpeg');

var httpsOptions = {
    key: fs.readFileSync('./tls/key.pem'),
    cert: fs.readFileSync('./tls/cert.pem')
};
var infoOptions = {
    downloadURL: true
};
var downloadOptions = {
    //filter: function(format) {
        //return format.container == 'webm';
    //},
    filter: 'audioonly',
    quality: 'highest'
};

var server = function (port) { https.createServer(httpsOptions, function (req, res) {
    if (req.url == '/ping'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        return res.end("Hello, world.");
    }

    var query = url.parse(req.url, true).query;
    var info = url.parse(req.url, true);

    var destination = (query.destination) ? path.normalize(query.destination) : null,
        quality = query.quality,
        filter = query.filter,
        format = query.format,
        title = query.title,
        link = query.link;

    if (!destination || !fs.existsSync(destination) || !fs.statSync(destination).isDirectory()){
        res.writeHead(500, {'Content-Type': 'text/html'});
        return res.end("Destination is invalid");
    }

    console.log();
    console.log("destination: " + destination);
    console.log("quality: " + quality);
    console.log("filter: " + filter);
    console.log("format: " + format);
    console.log("title: " + title);
    console.log("link: " + link);

    ytdl.getInfo(link, infoOptions, function(err, info){
        if (err){
            console.log('there was an error');
            res.writeHead(500);
            return res.end("This url is not valid");
        }

        title = title || info.title;
        var location = destination;
        var thumbnailurl = info.thumbnail_url;

        // console.log();
        // console.log("title: " + title);
        // console.log("location: " + location);
        // console.log("extension: " + extension);
        // console.log("thumbnailurl: " + thumbnailurl);


        ytdl.downloadFromInfo(info, downloadOptions)
            .on('format', function(format){ // ytdl has decided on a format, lets start piping it and convert all of the data

                this
                    .on('end', function(){


                        // // Read song.mp3 metadata
                        // ffmetadata.read(path.join(location, title) + '.mp4', function(err, data) {
                        //     if (err) console.error("Error reading metadata", err);
                        //     else console.log(data);
                        // });

                        // // Set the artist for song.mp3
                        // var data = {
                        //     //artist: "Me",
                        //     // duration: 10
                        // };
                        // var options = {
                        //     attachments: ['cover']
                        // };
                        // ffmetadata.write(path.join(location, title) + '.mp4', data, function(err) {
                        //     if (err) console.error("Error writing metadata", err);
                        //     else console.log("Data written");
                        // });


                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end("video successfully downloaded");
                    })

                    .pipe(fs.createWriteStream(path.join(location, title) + '.mp4'));


            })
            .on('error', function(err){
                this.unpipe();
                res.writeHead(500, {'Content-Type': 'text/html'});
                return res.end("There was a problem downloading the video: " + title);
            })
            .pause();


    });

}).listen(port);};

server(6299);
//startStopDaemon(server(6299));


//.on('metadata', function(data){
//     console.log(data.input.streams);
// })
// .on('error', function(err){
//     console.log(err)
// })
// .on('finish', function(){
//     console.log('done!')
// })

// .maxSize(320, 240)
// .videoCodec('h264')
// .videoBitrate(800 * 1000)
// .fps(25)

// //.audioCodec('flac')
// .sampleRate(44100)
// .channels(2)
// .audioBitrate(128 * 1000)
// .format('mp4')
// .stream()
// .pipe(fs.createWriteStream(path.join(location, title) + '.mp4'));
