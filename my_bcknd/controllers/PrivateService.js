'use strict';
var fs = require("fs");
var async = require("async");

var tools = require('./methods');

var cars_path = "./data/cars.json";
var users_path = "./data/users.json";
var pics_path = "./data/pics/";

exports.addCarPOST = function (args, res, next, req) {
    /**
     * parameters expected in the args:
     * car (CAR&amp;TOKEN)
     **/
    var examples = {};
    examples['application/json'] = {
        "result": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');

        //console.log("car: " + JSON.stringify(args.Car.value));

        var car = args.Car.value.Car;
        var token = args.Car.value.token;




        console.log('addCar - received: ' + JSON.stringify(req.body));

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
    }
    else {
        res.end();
    }

}

exports.editCarPOST = function (args, res, next) {
    /**
     * parameters expected in the args:
     * car (CAR&amp;TOKEN)
     **/
    var examples = {};
    examples['application/json'] = {
        "result": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');

        //console.log("car: " + JSON.stringify(args.Car.value));

        var car = args.Car.value.Car;
        var token = args.Car.value.token;


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
    }
    else {
        res.end();
    }
}

exports.loginPOST = function (args, res, next) {
    /**
     * parameters expected in the args:
     * loginInfo (LoginInfo)
     **/

    console.log("login: entered.");

    var examples = {};
    examples['application/json'] = {
        "result": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');


        var name = args.loginInfo.value.userName;
        var pass = args.loginInfo.value.password;

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


        /*
         if (token != null && car != null && tools.carIsGood(car)) {

         }
         */
    }
    else {
        res.end();
    }

}

exports.uploadPicPOST = function (args, res, next) {
    /**
     * parameters expected in the args:
     * car (UpPicDef)
     **/
    var examples = {};
    examples['application/json'] = {
        "result": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    }
    else {
        res.end();
    }

}

exports.checkValidTokenGET = function (args, res, next) {

    var examples = {};
    examples['application/json'] = {
        "result": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');

        var token = args.token.value;

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
    }
    else {
        res.end();
    }

}

