// curl -k https://localhost:6299/
var https = require('https');
var fs = require('fs');
var ytdl = require('ytdl-core'); //https://www.npmjs.com/package/ytdl-core
var url = require('url');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var child_process = require('child_process');
var startStopDaemon = require('start-stop-daemon');

var httpsOptions = {
    key: fs.readFileSync('./tls/key.pem'),
    cert: fs.readFileSync('./tls/cert.pem')
};

var server = function (port) {

    https.createServer(httpsOptions, function (req, res) {
    // process.on('uncaughtException', function (err) {
    //     res.writeHead(200, {'Content-Type': 'text/html'});
    //     return res.end("There was some type of error :/");
    // });

    if (req.url == '/ping'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        return res.end("Hello, world.");
    }

    var query = url.parse(req.url, true).query;

    var destination = (query.destination) ? path.normalize(query.destination) : null,
        // quality = query.quality,
        inputTitle = query.inputTitle,
        link = query.link;

    var inputPass = true;
    if (!destination || !fs.existsSync(destination) || !fs.statSync(destination).isDirectory()){
        res.write("Destination is invalid\n");
        inputPass = !inputPass;
    }

    // if (['lowest', 'highest', '1080', '720', '480', '360', '240', '144'].indexOf(quality) < 0 && quality){
    //     res.write("quality is invalid\n");
    //     inputPass = !inputPass;
    // }

    if (!inputPass){
        return res.end('\n');
    }

    var infoOptions = {
        downloadURL: true
    };

    var downloadOptions = {
        // quality: quality || 'highest',
    };

    // console.log('____________________________INPUT INFORMATION____________________________');
    // console.log("destination: " + destination);
    // console.log("quality: " + quality);
    // console.log("inputTitle: " + inputTitle);
    // console.log("link: " + link);

    ytdl.getInfo(link, infoOptions, function(err, info){
        if (err){
            console.log('there was an error');
            res.writeHead(500);
            return res.end("This url is not valid");
        }

        var title = inputTitle || info.title;
        var thumbnailurl = info.thumbnail_url;

        var location = path.join(destination, title) + '.mp3';

        ytdl.downloadFromInfo(info, downloadOptions)
            .on('format', function(format){ // ytdl has decided on a format, lets start piping it and convert all of the data

                var args = ['-i', 'pipe:0', '-q:a', '0', '-map', 'a'];
                // args.concat(['-metadata', 'artist=\"lmfao\"']);
                // args.concat(['-f', filterType]);
                args.push(location);
                var converter = child_process.spawn('ffmpeg', args);

                converter.stderr.pipe(process.stdout);

                this.on('end', function() {
                    console.log('Finished processing');
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end("video successfully downloaded");
                })

                .on('error', function(err){
                    console.log(err);
                })
                .pipe(converter.stdin);

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

// startStopDaemon({
//     outFile: '/Users/jackson/Desktop/out.txt',
//     errFile: '/Users/jackson/Desktop/err.txt',
//     cwd: '/Users/jackson/Documents/Youtube-dl'
// }, server(6299));

