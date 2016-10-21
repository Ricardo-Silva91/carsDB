/**
 * Created by rofler on 8/28/16.
 */
 var going_local = false;

 if (going_local) {
	var base_url_rest = "http://localhost:8080/";
	var base_url_for_pics = "http://localhost/getPicture?pic_name=";
 }
 else
 {
	var base_url_rest = "https://carsdbrest.herokuapp.com/";
	var base_url_for_pics = "https://carsdbrest.herokuapp.com/getPicture?pic_name=";
 }