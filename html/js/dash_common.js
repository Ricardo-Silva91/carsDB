/**
 * Created by rofler on 8/28/16.
 */



function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function searchTitleBrief(model) {
    var res = -1;

    for (var i = 0; i < cars.length; i++) {
        if (model == cars[i]['model']) {
            res = i;
            break;
        }
    }

    return res;
}


function searchTitle(model, brand) {
    var res = -1;

    for (var i = 0; i < cars.length; i++) {
        if (model == cars[i]['model'] && brand == cars[i]['brand']) {
            res = i;
            break;
        }
    }

    return res;
}

function getArtistsPerAlbum(model) {
    var res = [];

    for (var i = 0; i < cars.length; i++) {
        if (model == cars[i]['model']) {
            res[res.length] = cars[i]['brand'];
            //alert(cars[i]['artist']);
        }
    }

    return res;
}

function getAlbumsPerArtist(brand) {
    var res = [];

    for (var i = 0; i < cars.length; i++) {
        if (brand == cars[i]['brand']) {
            res[res.length] = cars[i]['model'];
            //alert(cars[i]['artist']);
        }
    }

    return res;
}

function imageExists(image_url) {

     var http = new XMLHttpRequest();

     http.open('HEAD', image_url, false);
     http.send();

     return http.status != 404;
/*
    $.ajax({
        url: image_url,
        success: function (data) {
            alert('success');
            return true;
        },
        error: function (data) {
            alert('error');
            return false;
        }
    });
*/
}


$(".btn-logout").click(function () {
    //ajax call here

    var cookie = getCookie('MusicDB_token');
    var url_rest = base_url_rest + 'logout?token=' + cookie;
    // alert(url_rest)
    //alert('b');

    $.ajax({
        url: url_rest
    }).then(function (data) {

        var json = data;
        if (json != null && json['logout'] == 'success') {
            alert('logout successful');
            window.location.href = "index.html";
        }
        else {
            alert('something is wrong');
            window.location.href = "index.html";
        }


    });

});

$(".sidebar-form").on('submit', function (e) {
    //ajax call here

    var model = $('#search_input_titles')[0].value;
    var brand = $('#search_input_artists')[0].value;
    var carPos = searchTitle(model, brand);
    //alert('album pos: ' + albumPos);

    if (carPos != -1) {
        window.location.href = "editAlbum.html?id=" + carPos;
    }
    else {
        alert('Album not in Database');
    }


    //stop form submission
    e.preventDefault();
});

$('input#search_input_titles').on('keyup click', function () {
    var model = $('#search_input_titles')[0].value;
    var brand = getArtistsPerAlbum(model);
    //console.log(albumArtists[0]);
    $("#search_input_artists").autocomplete({
        source: brand
    });
    $('#search_input_artists')[0].value = brand[0];

});
/*
 $('input#search_input_artists').on( 'keyup click', function () {
 var artist = $('#search_input_artists')[0].value;
 var albums = getAlbumsPerArtist(artist);
 //console.log(albumArtists[0]);
 $( "#search_input_titles" ).autocomplete({
 source: albums
 });
 //$('#search_input_titles')[0].value = albums[0];

 } );*/


$(document).ready(function () {


    $("#search_input_titles").autocomplete({
        source: models
    });

    $("#search_input_artists").autocomplete({
        source: brands
    });

    $('.ui-autocomplete, .ui-front').appendTo('#sidebar');
    $('.ui-autocomplete').attr('class', "ui-autocomplete ui-front ui-menu ui-widget ui-widget-content panel panel-green");
    $('.ui-autocomplete').attr('style', "display: none; width: 251px; position: relative; top: -303px; left: 15px; cursor: pointer; z-index: 99;");

    console.log("auto complete");

});