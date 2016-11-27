/**
 * Created by rofler on 8/29/16.
 */
$(document).ready(function () {

    /*
     $("#inputArtist").autocomplete({
     source: artists
     });

     $('.ui-autocomplete, .ui-front').appendTo('.form-horizontal');
     $('.ui-autocomplete').attr('class', "ui-autocomplete ui-front ui-menu ui-widget ui-widget-content panel panel-green");
     $('.ui-autocomplete').attr('style', "display: none; width: 251px; position: relative; top: -303px; left: 15px; cursor: pointer; z-index: 99;");
     */
    console.log("auto complete on artist input");

});


$("#add_album_form").on('submit', function (e) {


    e.preventDefault();

    //ajax call here

    var albumTitle = $('#inputTitle')[0].value;
    var albumArtist = $('#inputArtist')[0].value;
    var albumScale = $('#inputScale')[0].value;
    var albumRepBrand = $('#inputRepBrand')[0].value;

    //alert(isSamples);

    var cookie = getCookie('carsDB_token');
    var url_rest = base_url_rest + 'addCar';

    var car = {model: albumTitle,
        brand: albumArtist,
        scale: albumScale,
        replica_brand: albumRepBrand};
/*
    $.post(url_rest,
        {
            token: cookie,
            Car: car
        },
        function (data, status) {
            var json = data;
            if (json != null && json['result'] == 'success') {
                //alert('logout successful');
                window.location.href = "home.html";
            }
            else {
                alert('something is wrong:' + json['message']);
                //window.location.href = "index.html";
            }
        });

*/
    $.ajax({
        url: url_rest,
        type: 'post',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify( { "token": cookie, "Car": car } ),
        success: function( data, status ){
            var json = data;
            if (json != null && json['result'] == 'success') {
                //alert('logout successful');
                window.location.href = "home.html";
            }
            else {
                alert('something is wrong:' + json['message']);
                //window.location.href = "index.html";
            }
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log( errorThrown );
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
});