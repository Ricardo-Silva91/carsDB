/**
 * Created by rofler on 8/29/16.
 */

var oldModel;
var oldBrand;
var files;
var must_delete = false;

$(document).ready(function () {

    var id = parent.document.URL.substring(parent.document.URL.indexOf('id='), parent.document.URL.length).split('=')[1].split('#')[0];

    //alert('album ID: ' + id);
    $('#albumIdLabel')[0].innerText = id;
    $('#date_included')[0].innerText = cars[id]['date_included'];
    $('#inputTitle')[0].value = cars[id]['model'];
    $('#inputArtist')[0].value = cars[id]['brand'];
    $('#inputGenre')[0].value = cars[id]['replica_brand'];
    $('#inputComment')[0].value = cars[id]['comment'];

    //if (imageExists(base_url_for_pics + albums[id]['pic_name'])) {
        //alert('will load pic')
        $("#albumPicShow").attr("src", base_url_for_pics + cars[id]['pic_name']);
    //}
    //else {
    //    $("#albumPicShow").attr("src", 'img/404.gif');
        //alert('nope')
    //}



    $("#inputArtist").autocomplete({
        source: brands
    });

    $('.ui-autocomplete, .ui-front').appendTo('#edit_album_form');
    $('.ui-autocomplete').attr('class', "ui-autocomplete ui-front ui-menu ui-widget ui-widget-content panel panel-green");
    $('.ui-autocomplete').attr('style', "display: none; width: 251px; position: relative; top: -303px; left: 15px; cursor: pointer; z-index: 99;");


    oldModel = cars[id]['model'];
    oldBrand = cars[id]['brand'];

// Add events
    $('input[type=file]#inputPic').on('change', prepareUpload);

// Grab the files and set them to our variable
    function prepareUpload(event) {
        files = event.target.files;
        //alert('new file')
    }


});

$("#edit_album_form").on('submit', function (e) {


    e.preventDefault();

    //ajax call here

    var model = $('#inputTitle')[0].value;
    var brand = $('#inputArtist')[0].value;
    var scale = $('#inputGenre')[0].value;
    var comment = $('#inputComment')[0].value;

    var replica_brand = "abc";
    //alert(isSamples);

    var cookie = getCookie('MusicDB_token');
    var url_rest = base_url_rest + 'editCar';

    //alert('edit album');

    $.post(url_rest,
        {
            token: cookie,
            brand: brand,
            model: model,
            scale: scale,
            comment: comment,
            replica_brand: replica_brand,
            oldTitle: oldModel,
            oldArtist: oldBrand
        },
        function (data, status) {
            var json = data;
            if (json != null && json['op'] == 'success') {
                //alert('logout successful');
                //window.location.reload();
            }
            else {
                alert('something is wrong:' + json['error']);
                //window.location.href = "index.html";
            }
        });

    if ($('input[type=file]#inputPic').val() != "") {
        url_rest = base_url_rest + 'uploadPic';
        alert('upload pic: ' + url_rest);
        $.post(url_rest,
            {
                token: cookie,
                brand: brand,
                model: model,
                carPic: files[0]
            },
            function (data, status) {
                alert(data);
                var json = data;
                if (json != null && json['op'] == 'success') {
                    alert('logout successful');
                    window.location.reload();
                }
                else {
                    alert('something is wrong:' + json['error']);
                    //window.location.href = "index.html";
                }
            });
    }

    window.location.reload();

});


$("#upload_pic_form").on('submit', function (e) {


    e.preventDefault();

    //ajax call here

    //var url_rest = base_url_rest + 'uploadPic';
    var cookie = getCookie('MusicDB_token');

    /*
     $.ajax({
     url: url_rest,
     type: 'POST',
     data: files[0],
     processData: false,
     contentType: false,
     success: function(data){
     console.log('upload successful!');
     }
     });
     */
    var model = oldModel;
    var brand = oldBrand;


    if ($('input[type=file]#inputPic').val() != "") {
        url_rest = base_url_rest + 'uploadPic_template';
        //alert('upload pic: ' + url_rest);
     /*   $.post(url_rest,
            {
                token: cookie,
                albumArtist: albumArtist,
                albumTitle: albumTitle,
                avatar: files[0]
            },
            function (data, status) {
                alert(data);
                var json = data;
                if (json != null && json['op'] == 'success') {
                    alert('logout successful');
                    window.location.reload();
                }
                else {
                    alert('something is wrong:' + json['error']);
                    //window.location.href = "index.html";
                }
            });
            */
        var formData = new FormData();
        formData.append('token', cookie);
        formData.append('brand', brand);
        formData.append('model', model);
        formData.append('avatar', $('input[type=file]')[0].files[0]);

        $.ajax({
            type: 'POST',
            url: url_rest,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data){
                window.location.reload();
                //alert(data);
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
                // Handle errors here
                console.log('ERRORS: ' + textStatus);
                // STOP LOADING SPINNER
            }
        });

    }

    //window.location.reload();

});