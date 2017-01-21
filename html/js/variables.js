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
	var base_url_rest = "http://188.37.120.37:3001/";
	var base_url_for_pics = "http://188.37.120.37:3001/getCarPic?carId=";
 }