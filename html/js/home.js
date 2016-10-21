/**
 * Created by rofler on 8/28/16.
 */
$(document).ready(function () {

    var cookie = getCookie('MusicDB_token');
    var url_rest = base_url_rest + 'numberOfCars?token=' + cookie;


    $.ajax({
        url: url_rest
    }).then(function (data) {

        var json = data;
        if (json != null && json['op'] == 'success') {
            //alert(json['totalAlbums']);
            $('#total-albums')[0].innerText = json['totalCars'];
        }
        else {
            //alert('something is wrong');
            window.location.href = "404.html";
            //alert("jogos");
        }
    });

    $('#last-edited-album-title')[0].innerText = cars[cars.length-1]['model'];
    $('#last-edited-album-artist')[0].innerText = cars[cars.length-1]['brand'];

    var elem = document.createElement('li');
    var elem_child1 = '<img src="" alt="User Image"><a class="users-list-name" href="#">Alexander Pierce</a><span class="users-list-date">Today</span>';//document.createElement('li');



    for(var i = cars.length-1; i>cars.length-13; i--)
    {
        elem = document.createElement('li');
        //console.log(base_url_for_pics + cars[i]['pic_name']);
        elem_child1 = '<a href="editAlbum.html?id=' + i + '"><img style="width: 60%; height: 50%" src=' + base_url_for_pics + cars[i]['pic_name'] + ' alt="User Image"> </a><a class="users-list-name" href="editAlbum.html?id=' + i + '">' + cars[i]['model'] + '</a><span class="users-list-date">' + cars[i]['brand'] + '</span>';//document.createElement('li');
        elem.innerHTML = elem_child1;
        $('#new_albums_painting')[0].appendChild(elem);
    }


});