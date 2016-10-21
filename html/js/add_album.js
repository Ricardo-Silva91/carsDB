/**
 * Created by rofler on 8/29/16.
 */
$(document).ready(function () {


    $("#inputArtist").autocomplete({
        source: artists
    });

    $('.ui-autocomplete, .ui-front').appendTo('.form-horizontal');
    $('.ui-autocomplete').attr('class', "ui-autocomplete ui-front ui-menu ui-widget ui-widget-content panel panel-green");
    $('.ui-autocomplete').attr('style', "display: none; width: 251px; position: relative; top: -303px; left: 15px; cursor: pointer; z-index: 99;");

    console.log("auto complete on artist input");

});


$("#add_album_form").on('submit', function (e) {
    //ajax call here

    var albumTitle = $('#inputTitle')[0].value;
    var albumArtist = $('#inputArtist')[0].value;
    var isSamples = $('#samples_checkbox')[0].checked;
    //alert(isSamples);

    var cookie = getCookie('MusicDB_token');
    var url_rest = base_url_rest + 'addAlbum';

    $.post(url_rest,
        {
            token: cookie,
            albumArtist: albumArtist,
            albumTitle: albumTitle,
            sampled: isSamples
        },
        function (data, status) {
            var json = data;
            if (json != null && json['op'] == 'success') {
                //alert('logout successful');
                window.location.href = "home.html";
            }
            else {
                alert('something is wrong:' + json['error']);
                //window.location.href = "index.html";
            }
        });


    /*
     // alert(url_rest)
     //alert('b');

     $.ajax({
     url: url_rest
     }).then(function(data) {

     var json = data;
     if(json!= null && json['op'] == 'success') {
     //alert('logout successful');
     window.location.href = "home.html";
     }
     else {
     alert('something is wrong:' + json['error']);
     //window.location.href = "index.html";
     }


     });*/

    //window.location.href = "editAlbum.html?id=" + albumPos;

    //stop form submission
    e.preventDefault();
});