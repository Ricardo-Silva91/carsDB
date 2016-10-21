/*** Requirements ****/
var http = require('http');
var express = require('express');
var app = express();
var fs = require("fs");
var async = require("async");


/********* Https support ***********/

var https = require('https');
var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};


/********** multer for picture upload ***********/

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/pics/')
    },
    filename: function (req, file, cb) {
        var token = req.body.token;
        var albumArtist = req.body.albumArtist;
        var albumTitle = req.body.albumTitle;

        console.log('upload pic: ' + token + ' ' + albumTitle + ' ' + albumArtist)

        var filesPath = [albums_path, users_path, artist_path, titles_path, log_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {
            var users = JSON.parse(results[1]);
            var albums = JSON.parse(results[0]);
            var log = JSON.parse(results[4]);

            //console.log(users);
            var userPos = getUserPositionByToken(users, token);
            //console.log(token)

            //if user exists
            if (userPos != null && userPos != -1 && albumArtist != null && albumTitle != null) {
                console.log('upload Pic: user approved');
                //check if album exists
                console.log('upload pic: will search for: ' + albumArtist + ' ' + albumTitle);
                var albumPos = getAlbumPosition(albums, albumArtist, albumTitle);

                //album exists
                if (albumPos == -1) {
                    console.log('upload Pic: album is non-existent');
                    cb(null, 'trash.trash');

                }
                else {
                    //must write file
                    console.log('upload Pic: album found. pos: ' + albumPos);
                    albums[albumPos]['pic_name'] = albumPos + '.jpg';

                    console.log(JSON.stringify(albums[albumPos]));

                    fs.writeFile(albums_path, JSON.stringify(albums), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_albums_path, 'albums=' + JSON.stringify(albums), function (err) {
                        console.error(err)
                    });

                    //update list files


                    //log
                    var log_entry = JSON.parse(album_template);

                    log_entry['title'] = albumTitle;
                    log_entry['what_happened'] = 'Album ' + albumTitle + ' edited.';
                    log_entry['when_ih'] = getCurrentDate() + ' ' + getCurrentTime();
                    log_entry['type'] = 2;

                    log[log.length] = log_entry;
                    fs.writeFile(log_path, JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_log_path, 'log=' + JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    cb(null, albumPos + '.jpg');
                }

            }
            //if not
            else {
                console.log('upload Pic: invalid token');
                cb(null, 'trash.trash');
            }
        });


    }
});

var upload = multer({storage: storage});

/****Final Variables & Templates****/
var albums_path = __dirname + '/data/albums.json';
var public_albums_path = __dirname + '/html/data/Public_albums.js';
var artist_path = __dirname + '/data/artist_list.json';
var public_artist_path = __dirname + '/html/data/Public_artist_list.js';
var titles_path = __dirname + '/data/title_list.json';
var public_titles_path = __dirname + '/html/data/Public_title_list.js';
var log_path = __dirname + '/data/log.json';
var public_log_path = __dirname + '/html/data/Public_log.js';

var users_path = __dirname + '/data/users.json';
var pics_path = __dirname + '/data/pics/';

var album_template = '{"title":"","artist":"","approved":false,"genre":"","pic_name":"notAvailable.jpg","date_included":"","comment":"","id":-1}';
var log_entry_template = '{"title":"Wax & Wane","what_happened":"Album Wax & Wane edited.","when_ih":"08/24/2016 01:08","type":-1}'
var track_template = '{"number":-1,"title":""}';


/**** Initial Things *****/

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({

    extended: true
}));


/**** Private functions ****/

function isArtistInList(artists, artistName) {
    var res = false;
    for (var i = 0; i < artists.length; i++) {
        if (artists[i] == artistName) {
            res = true;
            break;
        }
    }
    return res;
}

function isTitleInList(titles, title) {
    var res = false;
    for (var i = 0; i < titles.length; i++) {
        if (titles[i] == title) {
            res = true;
            break;
        }
    }
    return res;
}

function refreshLists() {

    console.log('refreshing lists');

    var titles = [];
    var artists = [];
    var album;

    fs.readFile(__dirname + "/data/" + "albums.json", 'utf8', function (err, data) {

        var albums = JSON.parse(data);
        //console.log('data[0]: ' + JSON.stringify(albums[0]));
        //console.log('albums length: ' + albums.length);
        //console.log('data[0] title: ' + albums[0]['title']);

        for (var i = 0; i < albums.length; i++) {
            album = albums[i];
            if (!isArtistInList(artists, album['artist'])) {
                //console.log(album['artists']);
                artists[artists.length] = album['artist'];
            }
            if (!isTitleInList(titles, album['title'])) {
                titles[titles.length] = album['title'];
            }
        }

        //console.log(JSON.stringify(artists));

        fs.writeFile(public_albums_path, 'albums=' + JSON.stringify(albums), function (err) {
            console.error(err)
        });

        fs.writeFile(titles_path, JSON.stringify(titles), function (err) {
            console.error(err)
        });

        fs.writeFile(public_titles_path, 'titles=' + JSON.stringify(titles), function (err) {
            console.error(err)
        });

        fs.writeFile(artist_path, JSON.stringify(artists), function (err) {
            console.error(err)
        });

        fs.writeFile(public_artist_path, 'artists=' + JSON.stringify(artists), function (err) {
            console.error(err)
        });

        console.log('lists refreshed');

    });
}

function getUserPositionByToken(users, token) {

    //console.log(users.length)
    for (var i = 0; i < users.length; i++) {
        //console.log(users[i]['token'])
        if (users[i]['token'] == token) {
            return i;
        }
    }

    return -1;

}

function getAlbumPosition(albums, album_artist, album_title) {

    var res = -1;

    if (album_artist != null && album_title != null) {
        for (var i = 0; i < albums.length; i++) {
            if (albums[i]['artist'] == album_artist && albums[i]['title'] == album_title) {
                res = i;
                break;
            }
        }
    }

    return res;
}


function getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy;
    return today;
}

function getCurrentTime() {
    var d = new Date();

    return d.getHours() + ':' + d.getSeconds();
}

function artistExists(artists, albumArtist) {
    var res = -1;

    if (albumArtist != null) {
        for (var i = 0; i < artists.length; i++) {
            if (artists[i] == albumArtist) {
                res = 1;
                break;
            }
        }
    }

    return res;
}

function titleExists(titles, albumTitle) {
    var res = -1;

    if (albumTitle != null) {
        for (var i = 0; i < titles.length; i++) {
            if (titles[i] == albumTitle) {
                res = 1;
                break;
            }
        }
    }

    return res;
}

function trackExists(tracks, trackNumber) {
    var res = -1;

    if (trackNumber != null) {
        for (var i = 0; i < tracks.length; i++) {
            if (tracks[i]['number'] == trackNumber) {
                res = i;
                break;
            }
        }
    }

    return res;
}


function deleteTrack_local(tracks, trackNumber) {
    var res = [];

    if (trackNumber != null) {
        for (var i = 0; i < tracks.length; i++) {
            if (tracks[i]['number'] != trackNumber) {
                res[res.length] = tracks[i];
            }
        }
    }

    return res;
}


/**** GET METHODS ****/

app.get('/listAlbums', function (req, res) {
    fs.readFile(__dirname + "/data/" + "albums.json", 'utf8', function (err, data) {
        //console.log( data );
        res.end(data);
    });
});

app.get('/getAlbumDetails/:id', function (req, res) {
    // First read existing users.
    fs.readFile(__dirname + "/data/" + "albums.json", 'utf8', function (err, data) {
        var albums = JSON.parse(data);
        var id = req.params.id;
        if (id < 0 || id >= albums.length) {
            console.log("id out of bounds");
            res.status(200).end(JSON.stringify('{\'error\': \'id out of bounds\'}'));
            return
        }
        var album = albums[id];
        if (album['id'] == id) {
            console.log('id matches position');
            res.status(200).end(JSON.stringify(album));
        }
        else {
            for (var i = albums.length - 1; i >= 0; i--) {
                if (albums[i]['id'] == id) {
                    console.log("list not sorted");
                    res.status(200).end(JSON.stringify(albums[i]));
                }
            }
        }
    });
});

app.get('/login', function (req, res) {
    fs.readFile(__dirname + "/data/" + "users.json", 'utf8', function (err, data) {
        var users = JSON.parse(data);
        var alias = req.query.alias;
        var pass = req.query.pass;

        for (var i = 0; i < users.length; i++) {
            if (users[i]['alias'] == alias) {

                console.log('user ' + users[i]['alias'] + ' found');

                if (users[i]['pass'] == pass) {
                    var token = Math.random();
                    users[i]['token'] = token;

                    fs.writeFile(__dirname + "/data/" + "users.json", JSON.stringify(users), function (err) {
                        console.error(err)
                    });

                    res.status(200).json({
                        alias: alias,
                        token: token
                    })
                }
                else {
                    console.log('wrong pass for user ' + alias);
                    res.status(200).json({
                        alias: alias,
                        token: null
                    })
                }

                return;
            }
        }

        console.log('user ' + alias + ' not found');
        res.status(200).json({
            alias: alias,
            token: null
        })

    });
});

app.get('/logout', function (req, res) {
    fs.readFile(__dirname + "/data/" + "users.json", 'utf8', function (err, data) {
        var users = JSON.parse(data);
        var token = req.query.token;
        var userPos = getUserPositionByToken(users, token);

        if (userPos != -1) {
            users[userPos]['token'] = null;

            fs.writeFile(__dirname + "/data/" + "users.json", JSON.stringify(users), function (err) {
                console.error(err)
            });

            res.status(200).json({
                alias: users[userPos]['alias'],
                logout: 'success'
            })
        }
        else {
            console.log('token injection detected');
            res.status(200).json({
                alias: null,
                logout: 'fail'
            })
        }


    });
});

app.get('/numberOfAlbums', function (req, res) {

    console.log('numberOfAlbums: entered')
    var token = req.query.token;
    var filesPath = [albums_path, users_path];

    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var albums = JSON.parse(results[0]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        if (userPos != null && userPos != -1) {
            //console.log('jogos')
            res.status(200).json({
                totalAlbums: albums.length,
                op: 'success'
            });
        }
        else {
            //console.log('jogos2131')
            res.status(200).json({
                totalAlbums: 0,
                op: 'fail'
            });
        }
    });

});

/**** POST methods ****/

app.post('/addAlbum', function (req, res) {

    console.log('add album: entered function');

    var token = req.body.token;
    var albumArtist = req.body.albumArtist;
    var albumTitle = req.body.albumTitle;
    var sampled = req.body.sampled;

    console.log('received: ' + token + ' ' + albumArtist + ' ' + albumTitle + ' ' + sampled + ' ');

    var filesPath = [albums_path, users_path, artist_path, titles_path, log_path];

    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var albums = JSON.parse(results[0]);
        var artists = JSON.parse(results[2]);
        var titles = JSON.parse(results[3]);
        var log = JSON.parse(results[4]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        //if user exists
        if (userPos != null && userPos != -1 && albumArtist != null && albumTitle != null && sampled != null) {
            console.log('add album: user approved');
            //check if album exists
            var albumPos = getAlbumPosition(albums, albumArtist, albumTitle);

            //album exists
            if (albumPos != -1) {
                console.log('add album: album already exists');
                res.status(200).json({
                    op: 'fail',
                    error: 'album exists'
                })
            }
            else {

                console.log('add album: new album');
                //must add album to json and write file
                var newAlbum = JSON.parse(album_template);

                //default values
                newAlbum['id'] = albums.length;
                newAlbum['title'] = albumTitle;
                newAlbum['artist'] = albumArtist;
                newAlbum['date_included'] = getCurrentDate();

                if (sampled == "true") {
                    newAlbum['approved'] = true;
                }


                albums[albums.length] = newAlbum;
                fs.writeFile(albums_path, JSON.stringify(albums), function (err) {
                    console.error(err)
                });

                fs.writeFile(public_albums_path, 'albums=' + JSON.stringify(albums), function (err) {
                    console.error(err)
                });

                //update list files

                //titles
                if (titleExists(titles, albumTitle) == -1) {
                    titles[titles.length] = albumTitle;

                    fs.writeFile(titles_path, JSON.stringify(titles), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_titles_path, 'titles=' + JSON.stringify(titles), function (err) {
                        console.error(err)
                    });
                }

                //artists
                if (artistExists(artists, albumArtist) == -1) {
                    artists[artists.length] = albumTitle;

                    fs.writeFile(artist_path, JSON.stringify(artists), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_artist_path, 'artists=' + JSON.stringify(artists), function (err) {
                        console.error(err)
                    });
                }

                //log
                var log_entry = JSON.parse(album_template);

                log_entry['title'] = albumTitle;
                log_entry['what_happened'] = 'Car ' + albumTitle + ' added.';
                log_entry['when_ih'] = getCurrentDate() + ' ' + getCurrentTime();
                log_entry['type'] = 1;

                log[log.length] = log_entry;
                fs.writeFile(log_path, JSON.stringify(log), function (err) {
                    console.error(err)
                });

                fs.writeFile(public_log_path, 'log=' + JSON.stringify(log), function (err) {
                    console.error(err)
                });

                res.status(200).json({
                    op: 'success'
                })
            }

        }
        //if not
        else {
            console.log('add album: invalid token');
            res.status(200).json({
                op: 'fail',
                error: 'token not approved or missing parameters'
            })
        }
    });

});

app.post('/editAlbum', function (req, res) {

    console.log('edit album: entered function');

    var token = req.body.token;
    var albumArtist = req.body.albumArtist;
    var albumTitle = req.body.albumTitle;
    var albumGenre = req.body.albumGenre;
    var albumComment = req.body.albumComment;
    var albumApproved = req.body.albumApproved;

    var oldTitle = req.body.oldTitle;
    var oldArtist = req.body.oldArtist;

    var filesPath = [albums_path, users_path, artist_path, titles_path, log_path];

    console.log('received: ' + token + ' ' + albumArtist + ' ' + albumTitle + ' ' + albumGenre + ' ' + albumComment + ' ' + albumApproved + ' ');

    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var albums = JSON.parse(results[0]);
        var artists = JSON.parse(results[2]);
        var titles = JSON.parse(results[3]);
        var log = JSON.parse(results[4]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        //if user exists
        if (userPos != null && userPos != -1 && albumArtist != null && albumTitle != null && albumGenre != null && albumComment != null && albumApproved != null) {
            console.log('edit album: user approved');
            //check if album exists
            console.log('edit album: will search for: ' + oldTitle + ' ' + oldArtist);
            var albumPos = getAlbumPosition(albums, oldArtist, oldTitle);

            //album exists
            if (albumPos == -1) {
                console.log('edit album: album is non-existent');
                res.status(200).json({
                    op: 'fail',
                    error: 'album non-existent'
                })
            }
            else {

                console.log('edit album: album found. pos: ' + albumPos);
                //must edit album in json and write file
                var newAlbum = albums[albumPos];

                //change values
                newAlbum['title'] = albumTitle;
                newAlbum['artist'] = albumArtist;
                newAlbum['genre'] = albumGenre;
                newAlbum['comment'] = albumComment;
                newAlbum['approved'] = albumApproved == "true";
                console.log(newAlbum['approved']);

                albums[albumPos] = newAlbum;
                fs.writeFile(albums_path, JSON.stringify(albums), function (err) {
                    console.error(err)
                });

                fs.writeFile(public_albums_path, 'albums=' + JSON.stringify(albums), function (err) {
                    console.error(err)
                });

                //update list files

                //titles
                if (titleExists(titles, albumTitle) == -1) {
                    titles[titles.length] = albumTitle;

                    fs.writeFile(titles_path, JSON.stringify(titles), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_titles_path, 'titles=' + JSON.stringify(titles), function (err) {
                        console.error(err)
                    });
                }

                //artists
                if (artistExists(artists, albumArtist) == -1) {
                    artists[artists.length] = albumTitle;

                    fs.writeFile(artist_path, JSON.stringify(artists), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_artist_path, 'artists=' + JSON.stringify(artists), function (err) {
                        console.error(err)
                    });
                }

                //log
                var log_entry = JSON.parse(album_template);

                log_entry['title'] = albumTitle;
                log_entry['what_happened'] = 'Album ' + albumTitle + ' edited.';
                log_entry['when_ih'] = getCurrentDate() + ' ' + getCurrentTime();
                log_entry['type'] = 2;

                log[log.length] = log_entry;
                fs.writeFile(log_path, JSON.stringify(log), function (err) {
                    console.error(err)
                });

                fs.writeFile(public_log_path, 'log=' + JSON.stringify(log), function (err) {
                    console.error(err)
                });

                res.status(200).json({
                    op: 'success'
                })
            }

        }
        //if not
        else {
            console.log('edit album: invalid token');
            res.status(200).json({
                op: 'fail',
                error: 'token not approved or missing parameters'
            })
        }
    });

});


app.post('/addTrack', function (req, res) {

    console.log('add track: entered function');

    var token = req.body.token;
    var albumArtist = req.body.albumArtist;
    var albumTitle = req.body.albumTitle;
    var trackTitle = req.body.trackTitle;
    var trackNumber = req.body.trackNumber;


    var filesPath = [albums_path, users_path, artist_path, titles_path, log_path];


    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var albums = JSON.parse(results[0]);
        var artists = JSON.parse(results[2]);
        var titles = JSON.parse(results[3]);
        var log = JSON.parse(results[4]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        //if user exists
        if (userPos != null && userPos != -1 && albumArtist != null && albumTitle != null && trackNumber != null && trackTitle != null) {
            console.log('add track: user approved');
            //check if album exists
            console.log('add track: will search for: ' + albumTitle + ' ' + albumArtist);
            var albumPos = getAlbumPosition(albums, albumArtist, albumTitle);

            //album exists
            if (albumPos == -1) {
                console.log('add track: album is non-existent');
                res.status(200).json({
                    op: 'fail',
                    error: 'album non-existent'
                })
            }
            else {

                console.log('add track: album found. pos: ' + albumPos);

                if (trackExists(albums[albumPos]['tracks'], trackNumber) == -1) {

                    //must edit album in json and write file
                    var newAlbum = albums[albumPos];
                    var newTrack = JSON.parse(track_template);
                    newTrack['title'] = trackTitle;
                    newTrack['number'] = trackNumber;

                    //change values
                    newAlbum['tracks'][newAlbum['tracks'].length] = newTrack;

                    albums[albumPos] = newAlbum;
                    fs.writeFile(albums_path, JSON.stringify(albums), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_albums_path, 'albums=' + JSON.stringify(albums), function (err) {
                        console.error(err)
                    });

                    //log
                    var log_entry = JSON.parse(album_template);

                    log_entry['title'] = albumTitle;
                    log_entry['what_happened'] = 'Track added to ' + albumTitle;
                    log_entry['when_ih'] = getCurrentDate() + ' ' + getCurrentTime();
                    log_entry['type'] = 3;

                    log[log.length] = log_entry;
                    fs.writeFile(log_path, JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_log_path, 'log=' + JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    res.status(200).json({
                        op: 'success'
                    })
                }

                else {
                    console.log('add track: track exists');
                    res.status(200).json({
                        op: 'fail',
                        error: 'track exists'
                    })
                }
            }
        }
        //if not
        else {
            console.log('add track: invalid token');
            res.status(200).json({
                op: 'fail',
                error: 'token not approved or missing parameters'
            })
        }
    });

});

app.post('/editTrack', function (req, res) {

    console.log('edit track: entered function');

    var token = req.body.token;
    var albumArtist = req.body.albumArtist;
    var albumTitle = req.body.albumTitle;
    var trackTitle = req.body.trackTitle;
    var trackNumber = req.body.trackNumber;
    var oldTrackTitle = req.body.oldTrackTitle;
    var oldTrackNumber = req.body.oldTrackNumber;


    var filesPath = [albums_path, users_path, artist_path, titles_path, log_path];


    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var albums = JSON.parse(results[0]);
        var artists = JSON.parse(results[2]);
        var titles = JSON.parse(results[3]);
        var log = JSON.parse(results[4]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        //if user exists
        if (userPos != null && userPos != -1 && albumArtist != null && albumTitle != null && trackNumber != null && trackTitle != null) {
            console.log('edit track: user approved');
            //check if album exists
            console.log('edit track: will search for: ' + albumTitle + ' ' + albumArtist);
            var albumPos = getAlbumPosition(albums, albumArtist, albumTitle);

            //album exists
            if (albumPos == -1) {
                console.log('edit track: album is non-existent');
                res.status(200).json({
                    op: 'fail',
                    error: 'album non-existent'
                })
            }
            else {

                console.log('edit track: album found. pos: ' + albumPos);
                var trackPos = trackExists(albums[albumPos]['tracks'], oldTrackNumber);

                if (trackPos != -1) {

                    //must edit album in json and write file
                    var newAlbum = albums[albumPos];
                    var newTrack = albums[albumPos]['tracks'][trackPos];
                    newTrack['title'] = trackTitle;
                    newTrack['number'] = trackNumber;

                    //change values
                    newAlbum['tracks'][trackPos] = newTrack;

                    albums[albumPos] = newAlbum;
                    fs.writeFile(albums_path, JSON.stringify(albums), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_albums_path, 'albums=' + JSON.stringify(albums), function (err) {
                        console.error(err)
                    });

                    //log
                    var log_entry = JSON.parse(album_template);

                    log_entry['title'] = albumTitle;
                    log_entry['what_happened'] = 'Album ' + albumTitle + ' edited.';
                    log_entry['when_ih'] = getCurrentDate() + ' ' + getCurrentTime();
                    log_entry['type'] = 2;

                    log[log.length] = log_entry;
                    fs.writeFile(log_path, JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_log_path, 'log=' + JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    res.status(200).json({
                        op: 'success'
                    })
                }

                else {
                    console.log('edit track: track non-existent');
                    res.status(200).json({
                        op: 'fail',
                        error: 'track exists'
                    })
                }
            }
        }
        //if not
        else {
            console.log('edit track: invalid token');
            res.status(200).json({
                op: 'fail',
                error: 'token not approved or missing parameters'
            })
        }
    });

});

app.post('/deleteTrack', function (req, res) {

    console.log('delete track: entered function');

    var token = req.body.token;
    var albumArtist = req.body.albumArtist;
    var albumTitle = req.body.albumTitle;
    var oldTrackNumber = req.body.oldTrackNumber;


    var filesPath = [albums_path, users_path, artist_path, titles_path, log_path];


    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var albums = JSON.parse(results[0]);
        var artists = JSON.parse(results[2]);
        var titles = JSON.parse(results[3]);
        var log = JSON.parse(results[4]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        //if user exists
        if (userPos != null && userPos != -1 && albumArtist != null && albumTitle != null) {
            console.log('delete track: user approved');
            //check if album exists
            console.log('delete track: will search for: ' + albumTitle + ' ' + albumArtist);
            var albumPos = getAlbumPosition(albums, albumArtist, albumTitle);

            //album exists
            if (albumPos == -1) {
                console.log('delete track: album is non-existent');
                res.status(200).json({
                    op: 'fail',
                    error: 'album non-existent'
                })
            }
            else {

                console.log('delete track: album found. pos: ' + albumPos);
                var trackPos = trackExists(albums[albumPos]['tracks'], oldTrackNumber);

                if (trackPos != -1) {

                    //must edit album in json and write file
                    var newAlbum = albums[albumPos];
                    newAlbum['tracks'] = deleteTrack_local(newAlbum['tracks'], oldTrackNumber);

                    albums[albumPos] = newAlbum;
                    fs.writeFile(albums_path, JSON.stringify(albums), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_albums_path, 'albums=' + JSON.stringify(albums), function (err) {
                        console.error(err)
                    });

                    //log
                    var log_entry = JSON.parse(album_template);

                    log_entry['title'] = albumTitle;
                    log_entry['what_happened'] = 'Album ' + albumTitle + ' edited.';
                    log_entry['when_ih'] = getCurrentDate() + ' ' + getCurrentTime();
                    log_entry['type'] = 2;

                    log[log.length] = log_entry;
                    fs.writeFile(log_path, JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_log_path, 'log=' + JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    res.status(200).json({
                        op: 'success'
                    })
                }

                else {
                    console.log('delete track: track non-existent');
                    res.status(200).json({
                        op: 'fail',
                        error: 'track exists'
                    })
                }
            }
        }
        //if not
        else {
            console.log('delete track: invalid token');
            res.status(200).json({
                op: 'fail',
                error: 'token not approved or missing parameters'
            })
        }
    });

});

app.post('/uploadPic_template', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log('token: ' + req.body.token);
    console.log('file name: ' + req.file.filename);

    if (req.file.filename == 'trash.trash') {
        res.status(200).json({
            op: 'fail',
            error: 'trash'
        })
    }
    else {
        res.status(200).json({
            op: 'success'
        })
    }


    /*
     fs.rename( __dirname + '/uploads/894929aef414271f5f7a11d00862daa9',  __dirname + '/uploads/test.jpg', function(err) {
     if ( err ) console.log('ERROR: ' + err);
     });*/

    res.send('asd');
});


/**** Put server running ****/

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    refreshLists();

    console.log("REST app listening at http://%s:%s", host, port);

});

/*
var server2 = https.createServer(options, app).listen(8080, function () {

    var host = server2.address().address;
    var port = server2.address().port;

    console.log('Secure rest running on https://%s:%s', host, port);
});
*/

/********************* Break! this section is for routine check on server ******************/

var minutes = 30, the_interval = minutes * 60 * 1000;
setInterval(function () {
    console.log("I am doing my 6 seconds check");
    // do your stuff here
}, the_interval);


/********************* Break! beyond this point only web page stuff! ***********************/


var wepPage_express = require("express");
var wepPage_app2 = wepPage_express();
var wepPage_router = wepPage_express.Router();
var wepPage_path = __dirname + '/html/';
var wepPage_path_pics = __dirname + '/data/pics/';
wepPage_app2.use(wepPage_express.static(__dirname + '/html/'));
var wepPage_https = require('https');

wepPage_router.use(function (req, res, next) {
    console.log("/" + req.method);
    next();
});

wepPage_router.get("/", function (req, res) {
    res.sendFile(wepPage_path + "index.html");
});


wepPage_router.get("/getPicture", function (req, res) {


    if (req.query.pic_name != null && req.query.pic_name != 'null') {
        fs.exists(wepPage_path_pics + req.query.pic_name, function (exists) {
            if (exists) {
                console.log('getPicture: pic found');
                res.sendFile(wepPage_path_pics + req.query.pic_name);
            } else {
                console.log('getPicture: pic non-existent');
                res.sendFile(wepPage_path_pics + "notAvaliable.jpg");
            }
        });

    }
    else {
        res.sendFile(wepPage_path_pics + "notAvaliable.jpg");
    }
});

wepPage_app2.use("/", wepPage_router);

wepPage_app2.use(wepPage_express.static(__dirname));

wepPage_app2.use("*", function (req, res) {
    res.sendFile(wepPage_path + "404.html");
});


var webPage_server2 = wepPage_app2.listen(process.env.PORT || 80, function () {

    var host = webPage_server2.address().address;
    var port = webPage_server2.address().port;

    console.log("Web page Live at http://%s:%s", host, port);
});
/*
var webPage_server2 = wepPage_https.createServer(options, wepPage_app2).listen(process.env.PORT || 443, function () {

    var host = webPage_server2.address().address;
    var port = webPage_server2.address().port;

    console.log('Secure Web page Live at https://%s:%s', host, port);
});*/