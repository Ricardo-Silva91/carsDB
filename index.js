/********************* Break! beyond this point only web page stuff! ***********************/

var db_url = "http://94.63.5.193:3001/";

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


var proxy = require('http-proxy').createProxyServer({
    host: db_url,
    // port: 80
});
wepPage_router.use(
    [
    '/rest_server'
    ],
    function (req, res, next) {

        console.log(req.url);

        proxy.web(req, res, {
            target: db_url
        }, next);
});

/*
wepPage_router.get(
    [
        '/checkValidToken',
        '/allCars',
        '/getCarPic',
        '/oneCar',
        '/addCar',
        '/editCar',
        '/login',
        '/uploadPic_template',
        '/farcus/:farcus/',
        '/hoop(|la|lapoo|lul)/poo'
    ],
    function (req, res) {
        res.json({
            abc: "jogos"
        });
    });
*/

wepPage_app2.use("/", wepPage_router);

wepPage_app2.use(wepPage_express.static(__dirname));

wepPage_app2.use("*", function (req, res) {
    res.sendFile(wepPage_path + "404.html");
});


var webPage_server2 = wepPage_app2.listen(process.env.PORT || 5001, function () {

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