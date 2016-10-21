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

function searchTitleBrief(title) {
    var res = -1;

    for (var i = 0; i < albums.length; i++) {
        if (title == albums[i]['title']) {
            res = i;
            break;
        }
    }

    return res;
}


function searchTitle(title, artist) {
    var res = -1;

    for (var i = 0; i < albums.length; i++) {
        if (title == albums[i]['title'] && artist == albums[i]['artist']) {
            res = i;
            break;
        }
    }

    return res;
}

function getArtistsPerAlbum(title) {
    var res = [];

    for (var i = 0; i < albums.length; i++) {
        if (title == albums[i]['title']) {
            res[res.length] = albums[i]['artist'];
            //alert(albums[i]['artist']);
        }
    }

    return res;
}

function getAlbumsPerArtist(artist) {
    var res = [];

    for (var i = 0; i < albums.length; i++) {
        if (artist == albums[i]['artist']) {
            res[res.length] = albums[i]['title'];
            //alert(albums[i]['artist']);
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

    var albumTitle = $('#search_input_titles')[0].value;
    var albumArtist = $('#search_input_artists')[0].value;
    var albumPos = searchTitle(albumTitle, albumArtist);
    //alert('album pos: ' + albumPos);

    if (albumPos != -1) {
        window.location.href = "editAlbum.html?id=" + albumPos;
    }
    else {
        alert('Album not in Database');
    }


    //stop form submission
    e.preventDefault();
});

$('input#search_input_titles').on('keyup click', function () {
    var albumTitle = $('#search_input_titles')[0].value;
    var albumArtists = getArtistsPerAlbum(albumTitle);
    //console.log(albumArtists[0]);
    $("#search_input_artists").autocomplete({
        source: albumArtists
    });
    $('#search_input_artists')[0].value = albumArtists[0];

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
        source: titles
    });

    $("#search_input_artists").autocomplete({
        source: artists
    });

    $('.ui-autocomplete, .ui-front').appendTo('#sidebar');
    $('.ui-autocomplete').attr('class', "ui-autocomplete ui-front ui-menu ui-widget ui-widget-content panel panel-green");
    $('.ui-autocomplete').attr('style', "display: none; width: 251px; position: relative; top: -303px; left: 15px; cursor: pointer; z-index: 99;");

    console.log("auto complete");

});