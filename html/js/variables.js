/**
 * Created by rofler on 8/28/16.
 */
var going_local = false;

 if (going_local) {
	var base_url_rest = "http://localhost:8090/";
	var base_url_for_pics = "http://localhost:8090/getCarPic?carId=";
 }
 else
 {
     var base_url_rest = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + "/rest_server/";
     var base_url_for_pics = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + "/rest_server/getCarPic?carId=";
 }