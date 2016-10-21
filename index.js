/*** Requirements ****/
var http = require('http');
var express = require('express');
var app = express();
var fs = require("fs");
var async = require("async");


/********** multer for picture upload ***********/

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/pics/')
    },
    filename: function (req, file, cb) {
        var token = req.body.token;
        var brand = req.body.brand;
        var model = req.body.model;

        console.log('upload pic: ' + token + ' ' + model + ' ' + brand)

        var filesPath = [cars_path, users_path, brands_path, models_path, log_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {
            var users = JSON.parse(results[1]);
            var cars = JSON.parse(results[0]);
            var log = JSON.parse(results[4]);

            //console.log(users);
            var userPos = getUserPositionByToken(users, token);
            //console.log(token)

            //if user exists
            if (userPos != null && userPos != -1 && brand != null && model != null) {
                console.log('upload Pic: user approved');
                //check if car exists
                console.log('upload pic: will search for: ' + brand + ' ' + model);
                var carPos = getCarPosition(cars, brand, model);

                //car exists
                if (carPos == -1) {
                    console.log('upload Pic: car is non-existent');
                    cb(null, 'trash.trash');

                }
                else {
                    //must write file
                    console.log('upload Pic: car found. pos: ' + carPos);
                    cars[carPos]['pic_name'] = carPos + '.jpg';

                    console.log(JSON.stringify(cars[carPos]));

                    fs.writeFile(cars_path, JSON.stringify(cars), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_cars_path, 'cars=' + JSON.stringify(cars), function (err) {
                        console.error(err)
                    });

                    //update list files


                    //log
                    var log_entry = JSON.parse(log_entry_template);

                    log_entry['model'] = model;
                    log_entry['what_happened'] = 'Car ' + model + ' edited.';
                    log_entry['when_ih'] = getCurrentDate() + ' ' + getCurrentTime();
                    log_entry['type'] = 2;

                    log[log.length] = log_entry;
                    fs.writeFile(log_path, JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_log_path, 'log=' + JSON.stringify(log), function (err) {
                        console.error(err)
                    });

                    cb(null, carPos + '.jpg');
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
var cars_path = __dirname + '/data/cars.json';
var public_cars_path = __dirname + '/data/Public_cars.js';
var brands_path = __dirname + '/data/brand_list.json';
var public_brands_path = __dirname + '/data/Public_brand_list.js';
var models_path = __dirname + '/data/model_list.json';
var public_models_path = __dirname + '/data/Public_model_list.js';
var log_path = __dirname + '/data/log.json';
var public_log_path = __dirname + '/html/data/Public_log.js';

var users_path = __dirname + '/data/users.json';
var pics_path = __dirname + '/data/pics/';

var car_template = '{"model": "Z3","brand": "Audi","scale": "1/43","replica_brand": "durago","pic_name": "0.jpg","date_included": "09/04/2016","comment": "","id": 0}';
var log_entry_template = '{"model": "You Can`t Imagine How Much Fun We`re Having","what_happened": "model z3 added.","when_ih": "08/15/2015 14:20","type": 1}'


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

function isBrandInList(brands, brandName) {
    var res = false;
    for (var i = 0; i < brands.length; i++) {
        if (brands[i] == brandName) {
            res = true;
            break;
        }
    }
    return res;
}

function isModelInList(models, model) {
    var res = false;
    for (var i = 0; i < models.length; i++) {
        if (models[i] == model) {
            res = true;
            break;
        }
    }
    return res;
}

function refreshLists() {

    console.log('refreshing lists');

    var models = [];
    var brands = [];
    var car;

    fs.readFile(__dirname + "/data/" + "cars.json", 'utf8', function (err, data) {

        var cars = JSON.parse(data);

        for (var i = 0; i < cars.length; i++) {
            car = cars[i];
            if (!isBrandInList(brands, car['brand'])) {
                brands[brands.length] = car['brand'];
            }
            if (!isModelInList(models, car['model'])) {
                models[models.length] = car['model'];
            }
        }

        //console.log(JSON.stringify(artists));

        fs.writeFile(public_cars_path, 'cars=' + JSON.stringify(cars), function (err) {
            console.error(err)
        });

        fs.writeFile(models_path, JSON.stringify(models), function (err) {
            console.error(err)
        });

        fs.writeFile(public_models_path, 'models=' + JSON.stringify(models), function (err) {
            console.error(err)
        });

        fs.writeFile(brands_path, JSON.stringify(brands), function (err) {
            console.error(err)
        });

        fs.writeFile(public_brands_path, 'brands=' + JSON.stringify(brands), function (err) {
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

function getCarPosition(cars, brand, model) {

    var res = -1;

    if (brand != null && model != null) {
        for (var i = 0; i < cars.length; i++) {
            if (cars[i]['brand'] == brand && cars[i]['model'] == model) {
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

function brandExists(brands, brand) {
    var res = -1;

    if (brand != null) {
        for (var i = 0; i < brands.length; i++) {
            if (brands[i] == brand) {
                res = 1;
                break;
            }
        }
    }

    return res;
}

function modelExists(models, model) {
    var res = -1;

    if (model != null) {
        for (var i = 0; i < models.length; i++) {
            if (models[i] == model) {
                res = 1;
                break;
            }
        }
    }

    return res;
}


/**** GET METHODS ****/

app.get('/listCars', function (req, res) {
    fs.readFile(__dirname + "/data/" + "cars.json", 'utf8', function (err, data) {
        //console.log( data );
        res.end(data);
    });
});

app.get('/listPublicCars', function (req, res) {
    fs.readFile(public_cars_path, 'utf8', function (err, data) {
        //console.log( data );
        res.end(data);
    });
});

app.get('/listPublicBrands', function (req, res) {
    fs.readFile(public_brands_path, 'utf8', function (err, data) {
        //console.log( data );
        res.end(data);
    });
});

app.get('/listPublicModels', function (req, res) {
    fs.readFile(public_models_path, 'utf8', function (err, data) {
        //console.log( data );
        res.end(data);
    });
});

app.get("/getPicture", function (req, res) {

    if (req.query.pic_name != null && req.query.pic_name != 'null') {
        fs.exists(pics_path + req.query.pic_name, function (exists) {
            if (exists) {
                console.log('getPicture: pic found');
                res.sendFile(pics_path + req.query.pic_name);
            } else {
                console.log('getPicture: pic non-existent');
                res.sendFile(pics_path + "notAvailable.jpg");
            }
        });

    }
    else {
        res.sendFile(pics_path + "notAvailable.jpg");
    }
});

app.get('/getCarDetails/:id', function (req, res) {
    // First read existing users.
    fs.readFile(__dirname + "/data/" + "cars.json", 'utf8', function (err, data) {
        var cars = JSON.parse(data);
        var id = req.params.id;
        if (id < 0 || id >= cars.length) {
            console.log("id out of bounds");
            res.status(200).end(JSON.stringify('{\'error\': \'id out of bounds\'}'));
            return
        }
        var car = cars[id];
        if (car['id'] == id) {
            console.log('id matches position');
            res.status(200).end(JSON.stringify(car));
        }
        else {
            for (var i = cars.length - 1; i >= 0; i--) {
                if (cars[i]['id'] == id) {
                    console.log("list not sorted");
                    res.status(200).end(JSON.stringify(cars[i]));
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

app.get('/numberOfCars', function (req, res) {

    console.log('numberOfCars: entered')
    var token = req.query.token;
    var filesPath = [cars_path, users_path];

    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var cars = JSON.parse(results[0]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        if (userPos != null && userPos != -1) {
            //console.log('jogos')
            res.status(200).json({
                totalCars: cars.length,
                op: 'success'
            });
        }
        else {
            //console.log('jogos2131')
            res.status(200).json({
                totalCars: 0,
                op: 'fail'
            });
        }
    });

});

/**** POST methods ****/

app.post('/addCar', function (req, res) {

    console.log('add car: entered function');

    var token = req.body.token;
    var brand = req.body.brand;
    var model = req.body.model;

    console.log('received: ' + token + ' ' + brand + ' ' + model + ' ');

    var filesPath = [cars_path, users_path, brands_path, models_path, log_path];

    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var cars = JSON.parse(results[0]);
        var brands = JSON.parse(results[2]);
        var models = JSON.parse(results[3]);
        var log = JSON.parse(results[4]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        //if user exists
        if (userPos != null && userPos != -1 && brand != null && model != null && sampled != null) {
            console.log('add car: user approved');
            var carPos = getCarPosition(cars, brand, model);

            if (carPos != -1) {
                console.log('add car: car already exists');
                res.status(200).json({
                    op: 'fail',
                    error: 'car exists'
                })
            }
            else {

                console.log('add car: new car');
                //must add car to json and write file
                var newCar = JSON.parse(car_template);

                //default values
                newCar['id'] = cars.length;
                newCar['model'] = model;
                newCar['brand'] = brand;
                newCar['date_included'] = getCurrentDate();


                cars[cars.length] = newCar;
                fs.writeFile(cars_path, JSON.stringify(cars), function (err) {
                    console.error(err)
                });

                fs.writeFile(public_cars_path, 'cars=' + JSON.stringify(cars), function (err) {
                    console.error(err)
                });

                //update list files

                //titles
                if (modelExists(models, model) == -1) {
                    models[models.length] = model;

                    fs.writeFile(models_path, JSON.stringify(models), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_models_path, 'models=' + JSON.stringify(models), function (err) {
                        console.error(err)
                    });
                }

                //artists
                if (brandExists(brands, brand) == -1) {
                    brands[brands.length] = model;

                    fs.writeFile(brands_path, JSON.stringify(brands), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_brands_path, 'brands=' + JSON.stringify(brands), function (err) {
                        console.error(err)
                    });
                }

                //log
                var log_entry = JSON.parse(log_entry_template);

                log_entry['title'] = model;
                log_entry['what_happened'] = 'Car ' + model + ' added.';
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
            console.log('add car: invalid token');
            res.status(200).json({
                op: 'fail',
                error: 'token not approved or missing parameters'
            })
        }
    });

});

app.post('/editCar', function (req, res) {

    console.log('edit car: entered function');

    var token = req.body.token;
    var brand = req.body.brand;
    var model = req.body.model;
    var scale = req.body.scale;
    var replica_brand = req.body.replica_brand;
    var comment = req.body.comment;

    var oldModel = req.body.oldModel;
    var oldBrand = req.body.oldBrand;

    var filesPath = [cars_path, users_path, brands_path, models_path, log_path];

    console.log('received: ' + token + ' ' + brand + ' ' + model + ' ' + scale + ' ' + replica_brand + ' ' + comment + ' ');

    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {
        var users = JSON.parse(results[1]);
        var cars = JSON.parse(results[0]);
        var brands = JSON.parse(results[2]);
        var models = JSON.parse(results[3]);
        var log = JSON.parse(results[4]);

        //console.log(users);
        var userPos = getUserPositionByToken(users, token);
        //console.log(token)

        //if user exists
        if (userPos != null && userPos != -1 && brand != null && model != null && scale != null && replica_brand != null && comment != null) {
            console.log('edit car: user approved');
            //check if car exists
            console.log('edit car: will search for: ' + oldModel + ' ' + oldBrand);
            var carPos = getCarPosition(cars, oldBrand, oldModel);

            //car exists
            if (carPos == -1) {
                console.log('edit car: car is non-existent');
                res.status(200).json({
                    op: 'fail',
                    error: 'car non-existent'
                })
            }
            else {

                console.log('edit car: car found. pos: ' + carPos);
                //must edit car in json and write file
                var newCar = cars[carPos];

                //change values
                newCar['model'] = model;
                newCar['brand'] = brand;
                newCar['scale'] = scale;
                newCar['replica_brand'] = replica_brand;
                newCar['comment'] = comment;
                console.log(newCar['comment']);

                cars[carPos] = newCar;
                fs.writeFile(cars_path, JSON.stringify(cars), function (err) {
                    console.error(err)
                });

                fs.writeFile(public_cars_path, 'cars=' + JSON.stringify(cars), function (err) {
                    console.error(err)
                });

                //update list files

                //titles
                if (modelExists(models, model) == -1) {
                    models[models.length] = model;

                    fs.writeFile(models_path, JSON.stringify(models), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_models_path, 'models=' + JSON.stringify(models), function (err) {
                        console.error(err)
                    });
                }

                //artists
                if (brandExists(brands, brand) == -1) {
                    brands[brands.length] = model;

                    fs.writeFile(brands_path, JSON.stringify(brands), function (err) {
                        console.error(err)
                    });

                    fs.writeFile(public_brands_path, 'brands=' + JSON.stringify(brands), function (err) {
                        console.error(err)
                    });
                }

                //log
                var log_entry = JSON.parse(log_entry_template);

                log_entry['model'] = model;
                log_entry['what_happened'] = 'Car ' + model + ' edited.';
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
            console.log('edit car: invalid token');
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

var server = app.listen(process.env.PORT || 80, function () {

    var host = server.address().address;
    var port = server.address().port;

    refreshLists();

    console.log("REST app listening at http://%s:%s", host, port);

});

/********************* Break! this section is for routine check on server ******************/

var minutes = 30, the_interval = minutes * 60 * 1000;
setInterval(function () {
    console.log("I am doing my 6 seconds check");
    // do your stuff here
}, the_interval);

