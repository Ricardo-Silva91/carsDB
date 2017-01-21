var app = require('express')();
var http = require('http');
var fs = require('fs');
var serverPort = 3001;
var async = require("async");
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');


var pics_path = "data/pics/";
var cars_path = "data/cars.json";
var users_path = "data/users.json";


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

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({

    extended: true
}));

var multer = require('multer');
var tools = require('./controllers/methods.js');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/pics/')
    },
    filename: function (req, file, cb) {
        var token = req.body.token;
        var carId = req.body.carId;

        var filesPath = [cars_path, users_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {
            var cars = JSON.parse(results[0]);
            var users = JSON.parse(results[1]);

            //console.log(users);
            //console.log(token)

            if (tools.getUserByToken(users, token) != -1) {
                var carPos = tools.findCars(cars, carId);
                if (carPos != -1) {
                    cb(null, carPos + '.jpg');
                } else {
                    console.log('upload Pic: invalid token');
                    cb(null, 'trash.trash');
                }
            } else {
                console.log('upload Pic: invalid token');
                cb(null, 'trash.trash');
            }
        });


    }
});

var upload = multer({storage: storage});


app.get('/', function (req, res) {

    console.log('/ - entered.')
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({result: 'good evening'}));

});


app.get('/checkValidToken', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    var token = req.query.token;

    if (token != null) {
        var filesPath = [users_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {

            var users = JSON.parse(results[0]);

            var userPos = tools.getUserByToken(users, token);

            if (userPos != -1) {
                res.status(200).json({result: 'success', userData: users[userPos]});
            }
            else {
                res.json({code: 6, message: 'bad usr input', fields: 'body'});
            }
        });
    }
    else {
        res.json({code: 6, message: 'bad token input', fields: 'token'});
    }
});


app.get('/allCars', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log('allCars - entered.')

    var filesPath = [cars_path];

    async.map(filesPath, function (filePath, cb) { //reading files or dir
        fs.readFile(filePath, 'utf8', cb);
    }, function (err, results) {

        //console.log("cars: " + results[0]);
        var cars = JSON.parse(results[0]);

        res.end(JSON.stringify(cars));

    });
});

app.get('/getCarPic', function (req, res) {

    console.log('getCarPic - entered.')

    var carId = req.query.carId;
    if (carId != null && carId >= 0) {
        fs.exists(pics_path + carId + '.jpg', function (exists) {
            if (exists) {
                console.log('getCarPic: pic found');
                res.sendFile(pics_path + carId + '.jpg', {root: __dirname});
            } else {
                console.log('getCarPic: pic non-existent');
                res.sendFile(pics_path + "notAvaliable.jpg", {root: __dirname});
            }
        });
    }
    else {
        res.end(JSON.stringify("{code: 2,message: 'bar car ID',fields: 'carId'}"));
    }
});

app.get('/oneCar', function (req, res) {

    console.log('getCarPic - entered.')

    res.setHeader('Content-Type', 'application/json');

    var carId = req.query.carId;
    if (carId != null && carId >= 0) {

        var filesPath = [cars_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {

            //console.log("cars: " + results[0]);
            var cars = JSON.parse(results[0]);

            var carPos = tools.findCars(cars, carId);

            if (carPos != -1) {
                console.log('getCarPic: car found.')
                var car = cars[carPos];
                res.end(JSON.stringify(car));
            }
            else {
                res.json({code: 3, message: 'car not found', fields: 'carId'});
            }
        });
    }
    else {
        res.end(JSON.stringify("{code: 3,message: 'bar car ID',fields: 'carId'}"));
    }
});

/****************  POST  ********************/

app.post('/addCar', function (req, res) {

    //console.log("car: " + JSON.stringify(args.Car.value));
    console.log('addCar - received: ' + JSON.stringify(req.body));

    var car = req.body.Car;
    var token = req.body.token;

    res.setHeader('Content-Type', 'application/json');
    if (token != null && car != null && tools.carIsGood(car)) {

        var filesPath = [cars_path, users_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {

            var cars = JSON.parse(results[0]);
            var users = JSON.parse(results[1]);


            console.log('searching for user with token: ' + token);
            var userPos = tools.getUserByToken(users, token);

            if (userPos != -1) {
                if (!tools.carExists(cars, car)) {

                    var newCar = JSON.parse('{}');
                    newCar.id = cars.length;
                    newCar.model = car.model;
                    newCar.brand = car.brand;
                    newCar.scale = car.scale;
                    newCar.replica_brand = car.replica_brand;
                    newCar.date_included = new Date();
                    newCar.comment = "";

                    cars[cars.length] = newCar;

                    fs.writeFile(cars_path, JSON.stringify(cars), function (err) {
                        console.error(err)
                    });

                    res.status(200).json({result: 'success'});
                }
                else {
                    res.json({code: 4, message: 'car exists', fields: 'Car'});
                }

            }
            else {
                res.json({code: 4, message: 'bad token', fields: 'token'});
            }


        });
    }
    else {
        res.json({code: 4, message: 'bad car input', fields: 'body'});
    }
});


app.post('/editCar', function (req, res) {

    //console.log("car: " + JSON.stringify(args.Car.value));
    console.log('editCar - received: ' + JSON.stringify(req.body));
    res.setHeader('Content-Type', 'application/json');

//console.log("car: " + JSON.stringify(args.Car.value));

    var car = req.body.Car;
    var token = req.body.token;


    if (token != null && car != null && tools.carIsGood(car)) {

        var filesPath = [cars_path, users_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {

            var cars = JSON.parse(results[0]);
            var users = JSON.parse(results[1]);


            console.log('searching for user with token: ' + token);
            var userPos = tools.getUserByToken(users, token);

            if (userPos != -1) {
                var carPos = tools.findCars(cars, car.id);

                if (carPos != -1) {

                    if (car.model != null && car.model != "")
                        cars[carPos].model = car.model;
                    if (car.brand != null && car.brand != "")
                        cars[carPos].brand = car.brand;
                    if (car.scale != null && car.scale != "")
                        cars[carPos].scale = car.scale;
                    if (car.replica_brand != null && car.replica_brand != "")
                        cars[carPos].replica_brand = car.replica_brand;
                    if (car.date_included != null && car.date_included != "")
                        cars[carPos].date_included = car.date_included;
                    if (car.comment != null && car.comment != "")
                        cars[carPos].comment = car.comment;

                    fs.writeFile(cars_path, JSON.stringify(cars), function (err) {
                        console.error(err)
                    });

                    res.status(200).json({result: 'success'});
                }
                else {
                    res.json({code: 4, message: 'car doesn\'t exist', fields: 'Car'});
                }

            }
            else {
                res.json({code: 4, message: 'bad token', fields: 'token'});
            }


        });
    }
    else {
        res.json({code: 4, message: 'bad car input', fields: 'body'});
    }
});


app.post('/login', function (req, res) {

    res.setHeader('Content-Type', 'application/json');

    var name = req.body.userName;
    var pass = req.body.password;

    console.log('user: ' + name + '   pass: ' + pass);

    if (name != null && pass != null) {
        var filesPath = [users_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {

            var users = JSON.parse(results[0]);

            var userPos = tools.findUser(users, pass, name);

            if (userPos != -1) {
                require('crypto').randomBytes(48, function (err, buffer) {
                    var newToken = buffer.toString('hex');

                    users[userPos].token = newToken;

                    fs.writeFile(users_path, JSON.stringify(users), function (err) {
                        console.error(err)
                    });

                    res.status(200).json({result: 'success', token: newToken});

                });
            }
            else {
                res.json({code: 5, message: 'bad usr input', fields: 'body'});
            }
        });
    }
    else {
        res.json({code: 5, message: 'bad usr input', fields: 'body'});
    }
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
});

/**** Put server running ****/

var server = app.listen(serverPort, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("REST app listening at http://%s:%s", host, port);

});
