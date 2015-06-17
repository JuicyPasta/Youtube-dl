// curl -k https://localhost:6299/
var https = require('https');
var fs = require('fs');
var ytdl = require('ytdl-core'); //https://www.npmjs.com/package/ytdl-core
var startStopDaemon = require('start-stop-daemon'); //https://www.npmjs.com/package/start-stop-daemon
var url = require('url');
var path = require('path');

var options = {
    key: fs.readFileSync('./tls/key.pem'),
    cert: fs.readFileSync('./tls/cert.pem')
};

startStopDaemon(function() {
    https.createServer(options, function (req, res) {
        var query = url.parse(req.url, true).query;

        var destination = (query.destination) ? path.normalize(query.destination) : null,
            quality = query.quality,
            filter = query.filter,
            format = query.format,
            title = query.title,
            link = query.link;

        if (!destination || !fs.existsSync(destination) || !fs.statSync(destination).isDirectory())
            return res.end("Destination is invalid");

        console.log("destination: " + destination);
        console.log("quality: " + quality);
        console.log("filter: " + filter);
        console.log("format: " + format);
        console.log("title: " + title);
        console.log("link: " + link);

        var options = {
            filter: filter || 'audioonly',
        };

        ytdl.getInfo(link, function(err, info){
            if (err){
                console.log('there was an error');
                res.writeHead(500);
                return res.end("This url is not valid");
            }
            //console.log(info);
            title = title || info.title;
            // var thumbnailurl = thumbnail_url;

            var downloadPipe = ytdl.downloadFromInfo(info, options)
            .on('error', function(err){
                downloadPipe.unpipe();
                res.writeHead(500, {'Content-Type': 'text/html'});
                return res.end("There was a problem downloading the video: " + title);
            })
            .on('format', function(format){
                console.log(format);

                downloadPipe
                .on('end', function(){ // TRIGGERED when done
                    console.log('done with: ' + title);
                    // res.writeHead(200, {'Content-Type': 'text/html'});
                    // res.end("video successfully downloaded");
                })
                .pipe(fs.createWriteStream(path.join(destination, title) + '.' + format.container));
            }).pause();
        });

        // res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("fuck");


    }).listen(6299);
});

