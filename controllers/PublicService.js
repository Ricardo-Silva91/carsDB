'use strict';
var fs = require("fs");
var async = require("async");

var tools = require('./methods');

var cars_path = "./data/cars.json";
var pics_path = "./data/pics/";


exports.allCarsGET = function (args, res, next) {
    /**
     * parameters expected in the args:
     **/
    var examples = {};
    examples['application/json'] = [{
        "replica_brand": "aeiou",
        "date_included": "aeiou",
        "scale": "aeiou",
        "model": "aeiou",
        "comment": "aeiou",
        "id": 123,
        "brand": "aeiou",
        "pic_name": "aeiou"
    }];
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');

        var filesPath = [cars_path];

        async.map(filesPath, function (filePath, cb) { //reading files or dir
            fs.readFile(filePath, 'utf8', cb);
        }, function (err, results) {

            //console.log("cars: " + results[0]);
            var cars = JSON.parse(results[0]);

            res.end(JSON.stringify(cars));

        });
    }
    else {
        res.end(JSON.stringify("{code: 2,message: 'bar car ID',fields: 'carId'}"));
    }

}

exports.getCarPicGET = function (args, res, next) {

    //console.log("dirname: " + __dirname + '/..');

    /**
     * parameters expected in the args:
     * carId (Integer)
     **/
    var examples = {};
    examples['application/json'] = "";
    if (Object.keys(examples).length > 0) {
        //res.setHeader('Content-Type', 'application/json');

        var carId = args.carId.value;
        if (carId != null && carId >= 0) {
            fs.exists(pics_path + carId + '.jpg', function (exists) {
                if (exists) {
                    console.log('getCarPicGET: pic found');
                    res.sendFile(pics_path + carId + '.jpg', {root: __dirname + '/..'});
                } else {
                    console.log('getCarPicGET: pic non-existent');
                    res.sendFile(pics_path + "notAvaliable.jpg", {root: __dirname + '/..'});
                }
            });
        }
        else {
            res.end(JSON.stringify("{code: 2,message: 'bar car ID',fields: 'carId'}"));
        }
    }
    else {
        res.end();
    }

}

exports.oneCarGET = function (args, res, next) {
    /**
     * parameters expected in the args:
     * carId (Integer)
     **/
    var examples = {};
    examples['application/json'] = {
        "replica_brand": "aeiou",
        "date_included": "aeiou",
        "scale": "aeiou",
        "model": "aeiou",
        "comment": "aeiou",
        "id": 123,
        "brand": "aeiou",
        "pic_name": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');

        var carId = args.carId.value;
        if (carId != null && carId >= 0) {

            var filesPath = [cars_path];

            async.map(filesPath, function (filePath, cb) { //reading files or dir
                fs.readFile(filePath, 'utf8', cb);
            }, function (err, results) {

                //console.log("cars: " + results[0]);
                var cars = JSON.parse(results[0]);

                var carPos = tools.findCars(cars, carId);

                if (carPos != -1) {
                    console.log('oneCar: car found.')
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
    }
    else {
        res.end();
    }
}

exports.rootGET = function (args, res, next) {
    /**
     * parameters expected in the args:
     **/
    var examples = {};
    examples['application/json'] = "aeiou";
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    }
    else {
        res.end();
    }

}

