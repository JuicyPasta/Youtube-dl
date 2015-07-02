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

var server = function (port) { https.createServer(httpsOptions, function (req, res) {
    process.on('uncaughtException', function (err) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        return res.end("There was some type of error :/");
    });

    if (req.url == '/ping'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        return res.end("Hello, world.");
    }


    var query = url.parse(req.url, true).query;

    var destination = (query.destination) ? path.normalize(query.destination) : null,
        quality = query.quality,
        format = query.format,
        inputTitle = query.inputTitle,
        link = query.link,
        filterType = query.filterType;

    var inputPass = true;
    if (!destination || !fs.existsSync(destination) || !fs.statSync(destination).isDirectory()){
        res.write("Destination is invalid\n");
        inputPass = !inputPass;
    }

    if (['lowest', 'highest', '1080p', '720p', '480p', '360p', '240p', '144p'].indexOf(quality) < 0 && quality){
        res.write("quality is invalid\n");
        inputPass = !inputPass;
    }
    if (['mp3', 'mp4'].indexOf(filterType) < 0 && filterType){
        res.write("filter is invalid\n");
        inputPass = !inputPass;
    }
    if (!inputPass){
        return res.end('\n');
    }

    var infoOptions = {
        downloadURL: true
    };
    var downloadOptions = {
        quality: quality || 'highest',
    };

    console.log('____________________________INPUT INFORMATION____________________________');
    console.log("destination: " + destination);
    console.log("quality: " + quality);
    console.log("format: " + format);
    console.log("inputTitle: " + inputTitle);
    console.log("link: " + link);

    ytdl.getInfo(link, infoOptions, function(err, info){
        if (err){
            console.log('there was an error');
            res.writeHead(500);
            return res.end("This url is not valid");
        }

        var title = inputTitle || info.title;
        var thumbnailurl = info.thumbnail_url;
        // var extension = "";
        // if (info.container) extension = '.' + info.container;
        var location;
        if (filterType == 'mp3'){
            location = path.join(destination, title) + '.mp3';
        }else{
            location = path.join(destination, title) + '.mp4';
        }

        console.log('____________________________VIDEO INFORMATION____________________________');
        console.log("title: " + title);
        // console.log("extension: " + extension);
        console.log("thumbnailurl: " + thumbnailurl);

        ytdl.downloadFromInfo(info, downloadOptions)
            .on('format', function(format){ // ytdl has decided on a format, lets start piping it and convert all of the data

                // var output_path = path.join(location, title) + '.mp4';
                // var output_stream = fs.createWriteStream(path.join(location, title) + '.mp4');

                console.log(location);

                var converter = child_process.spawn('ffmpeg', ['-i', 'pipe:0', '-q:a', '0', '-map', 'a', location]);

                converter.stderr.pipe(process.stdout);

                this.on('end', function() {
                    console.log('Finished processing');
                    // fs.rename(location + '.part', location, function(err){
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end("video successfully downloaded");
                    // });
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

startStopDaemon(server(6299));
