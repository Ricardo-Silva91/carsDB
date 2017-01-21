/**
 * Created by rofler on 8/29/16.
 */

var cars;
var cookie = getCookie('carsDB_token');

function getCars() {

    console.log('jogos')
    // body...
    var url_rest = base_url_rest + 'allCars';

    return $.ajax({
        url: url_rest
    }).then(function (data) {

        cars = data;
        console.log(JSON.stringify(data));

    });

}

$(document).ready(function () {

    $.when(getCars()).done(function () {
        var elem = document.createElement('li');
        var elem_child1 = '<img src="" alt="User Image"><a class="users-list-name" href="#">Alexander Pierce</a><span class="users-list-date">Today</span>';//document.createElement('li');


        for (var i = 0; i < cars.length; i++) {
            elem = document.createElement('li');
            //console.log(base_url_for_pics + cars[i]['pic_name']);
            elem_child1 = '<a href="editCar.html?id=' + i + '"><img style="width: 30%; height: 50%" src=' + base_url_for_pics + cars[i]['id'] + ' alt="User Image"> </a><a class="users-list-name" href="editAlbum.html?id=' + i + '">' + cars[i]['model'] + '</a><span class="users-list-date">' + cars[i]['brand'] + '</span>';//document.createElement('li');
            elem.innerHTML = elem_child1;
            $('#new_albums_painting')[0].appendChild(elem);
        }


        var t = $('#albumsTable').DataTable();

        for (var it = 0; it < cars.length; it++) {
            t.row.add([
                cars[it]['id'],
                cars[it]['model'],
                cars[it]['brand'],
                cars[it]['scale'],
                cars[it]['replica_brand'],
            ]).draw(false);
        }
    });


});

$('#albumsTable tbody').on('click', 'tr', function () {


    window.location.href = "editCar.html?id=" + $(this).children()[0].innerText;

});