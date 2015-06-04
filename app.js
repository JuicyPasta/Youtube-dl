// curl -k https://localhost:8000/
var https = require('https');
var fs = require('fs');
var ytdl = require('ytdl-core'); //https://www.npmjs.com/package/ytdl-core
var startStopDaemon = require('start-stop-daemon'); //https://www.npmjs.com/package/start-stop-daemon

var options = {
    key: fs.readFileSync('./tls/key.pem'),
    cert: fs.readFileSync('./tls/cert.pem')
};


startStopDaemon(function() {

    https.createServer(options, function (req, res) {
        // // save location, valid path
        // var destination = req.query.destination;
        // // quality, can either be highest/lowest, or itag value
        // var quality = req.query.quality;
        // // video or audio: video/videoonly/audio/audioonly
        // var filter = req.query.filter;
        // // format
        // var format = req.query.format;

        // // name

        // var title = req.query.title;
        // var videolink = req.query.video;
        // var options = {
        //     filter: 'audioonly'
        // };
        // ytdl(videolink, options).pipe(fs.createWriteStream('./music/'+ title +'.mp4'));


        res.writeHead(200);
        res.end("success\n");
    }).listen(6299);

});
