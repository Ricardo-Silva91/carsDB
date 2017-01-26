/**
 * Created by Ricardo on 26/01/2017.
 */

var cars;

function getCars() {

    console.log('bu')
    // body...
    var url_rest = base_url_rest + 'allCars';

    return $.ajax({
        url: url_rest
    }).then(function (data) {

        cars = data;
        //console.log(JSON.stringify(data));

    });

}