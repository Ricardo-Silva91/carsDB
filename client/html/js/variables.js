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
	var base_url_rest = "http://192.168.1.84:8090/";
	var base_url_for_pics = "http://192.168.1.84:8090/getCarPic?carId=";
 }