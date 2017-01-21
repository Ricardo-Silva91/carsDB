/**
 * Created by rofler on 8/28/16.
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

function checkCookie() {

    var url_rest = base_url_rest + 'checkValidToken?token=' + getCookie('carsDB_token');

    $.ajax({
        url: url_rest,
        type: 'get',
        success: function (data, status) {
            var json = data;
            if (json != null && json['result'] == 'success') {
                //alert('logout successful');
                //window.location.href = "home.html";

            }
            else {
                //alert('something is wrong:' + json['message']);
                console.log('no valid cookie');
                //window.location.href = "index.html";
                $($('.info-box')[1]).attr('style',"visibility: hidden")
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

}

$(document).ready(function () {


    checkCookie();

    $.when(getCars()).done(function () {
        var elem = document.createElement('li');
        var elem_child1 = '<img src="" alt="User Image"><a class="users-list-name" href="#">Alexander Pierce</a><span class="users-list-date">Today</span>';//document.createElement('li');

        $('#total-albums')[0].innerText = cars.length;

        $('#last-edited-album-title')[0].innerText = cars[cars.length-1]['model'];
        $('#last-edited-album-artist')[0].innerText = cars[cars.length-1]['brand'];

        for(var i = cars.length-1; i>cars.length-13 && i >-1; i--)
        {
            elem = document.createElement('li');
            //console.log(base_url_for_pics + albums[i]['pic_name']);
            elem_child1 = '<a href="editCar.html?id=' + i + '"><img style="width: 60%; height: 50%" src=' + base_url_for_pics + cars[i]['id'] + ' alt="User Image"> </a><a class="users-list-name" href="editCar.html?id=' + i + '">' + cars[i]['model'] + '</a><span class="users-list-date">' + cars[i]['brand'] + '</span>';//document.createElement('li');
            elem.innerHTML = elem_child1;
            $('#new_albums_painting')[0].appendChild(elem);

        }
         console.log('home - doc ready');
    });

    


});