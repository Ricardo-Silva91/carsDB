/**
 * Created by rofler on 8/29/16.
 */

var oldTitle;
var oldArtist;
var oldTrackTitle;
var oldTrackNumber;
var files;
var must_delete = false;

$(document).ready(function () {

    var id = parent.document.URL.substring(parent.document.URL.indexOf('id='), parent.document.URL.length).split('=')[1].split('#')[0];

    //alert('album ID: ' + id);
    $('#albumIdLabel')[0].innerText = id;
    $('#date_included')[0].innerText = albums[id]['date_included'];
    $('#inputTitle')[0].value = albums[id]['title'];
    $('#inputArtist')[0].value = albums[id]['artist'];
    $('#inputGenre')[0].value = albums[id]['genre'];
    $('#inputComment')[0].value = albums[id]['comment'];
    $('#approved_checkbox')[0].checked = albums[id]['approved'];

    //if (imageExists(base_url_for_pics + albums[id]['pic_name'])) {
        //alert('will load pic')
        $("#albumPicShow").attr("src", base_url_for_pics + albums[id]['pic_name']);
    //}
    //else {
    //    $("#albumPicShow").attr("src", 'img/404.gif');
        //alert('nope')
    //}

    var t = $('#tracksTable').DataTable();

    for (var it = 0; it < albums[id]['tracks'].length; it++) {
        t.row.add([
            albums[id]['tracks'][it]['number'],
            albums[id]['tracks'][it]['title']
        ]).draw(false);
    }


    $("#inputArtist").autocomplete({
        source: artists
    });

    $('.ui-autocomplete, .ui-front').appendTo('#edit_album_form');
    $('.ui-autocomplete').attr('class', "ui-autocomplete ui-front ui-menu ui-widget ui-widget-content panel panel-green");
    $('.ui-autocomplete').attr('style', "display: none; width: 251px; position: relative; top: -303px; left: 15px; cursor: pointer; z-index: 99;");


    oldTitle = albums[id]['title'];
    oldArtist = albums[id]['artist'];

// Add events
    $('input[type=file]#inputPic').on('change', prepareUpload);

// Grab the files and set them to our variable
    function prepareUpload(event) {
        files = event.target.files;
        //alert('new file')
    }


});

$('#tracksTable tbody').on('click', 'tr', function () {

    $('#edit_track_modal_track_number')[0].value = $(this).children()[0].innerText;
    $('#edit_track_modal_track_title')[0].value = $(this).children()[1].innerText;
    oldTrackNumber = $(this).children()[0].innerText;
    oldTrackTitle = $(this).children()[1].innerText;


    $('#edit_track_modal').modal();
    $('#edit_track_modal').modal('show');
    $(this).toggleClass('selected');
});

$('#add_track_btn').on('click', function () {

    //$('#modal_track_number')[0].value = $(this).children()[0].innerText;
    //$('#modal_track_title')[0].value = $(this).children()[1].innerText;

    $('#add_track_modal').modal();
    $('#add_track_modal').modal('show');
    $(this).toggleClass('selected');
});

$("#edit_album_form").on('submit', function (e) {


    e.preventDefault();

    //ajax call here

    var albumTitle = $('#inputTitle')[0].value;
    var albumArtist = $('#inputArtist')[0].value;
    var albumGenre = $('#inputGenre')[0].value;
    var albumComment = $('#inputComment')[0].value;
    var albumApproved = $('#approved_checkbox')[0].checked;
    //alert(isSamples);

    var cookie = getCookie('MusicDB_token');
    var url_rest = base_url_rest + 'editAlbum';

    //alert('edit album');

    $.post(url_rest,
        {
            token: cookie,
            albumArtist: albumArtist,
            albumTitle: albumTitle,
            albumGenre: albumGenre,
            albumComment: albumComment,
            albumApproved: albumApproved,
            oldTitle: oldTitle,
            oldArtist: oldArtist
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
                albumArtist: albumArtist,
                albumTitle: albumTitle,
                albumPic: files[0]
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


$("#add_track_form").on('submit', function (e) {

    e.preventDefault();

    //ajax call here

    var trackTitle = $('#add_modal_track_title')[0].value;
    var trackNumber = $('#add_modal_track_number')[0].value;
    //alert(isSamples);

    var cookie = getCookie('MusicDB_token');
    var url_rest = base_url_rest + 'addTrack';

    //alert('edit album');

    $.post(url_rest,
        {
            token: cookie,
            albumArtist: oldArtist,
            albumTitle: oldTitle,
            trackTitle: trackTitle,
            trackNumber: trackNumber
        },
        function (data, status) {
            var json = data;
            if (json != null && json['op'] == 'success') {
                //alert('logout successful');
                window.location.reload();
            }
            else {
                alert('something is wrong:' + json['error']);
                //window.location.href = "index.html";
            }
        });


});

$('#edit_track_delete_btn').click(function () {
    must_delete = true;
});

$("#edit_track_form").on('submit', function (e) {

    e.preventDefault();

    //ajax call here
    var cookie = getCookie('MusicDB_token');

    if (must_delete == false) {
        var trackTitle = $('#edit_track_modal_track_title')[0].value;
        var trackNumber = $('#edit_track_modal_track_number')[0].value;
        //alert(isSamples);

        var url_rest = base_url_rest + 'editTrack';

        //alert('edit album');

        $.post(url_rest,
            {
                token: cookie,
                albumArtist: oldArtist,
                albumTitle: oldTitle,
                trackTitle: trackTitle,
                trackNumber: trackNumber,
                oldTrackTitle: oldTrackTitle,
                oldTrackNumber: oldTrackNumber
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
    }
    else {
        var url_rest = base_url_rest + 'deleteTrack';

        //alert('edit album');

        $.post(url_rest,
            {
                token: cookie,
                albumArtist: oldArtist,
                albumTitle: oldTitle,
                oldTrackNumber: oldTrackNumber
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
    var albumTitle = oldTitle;
    var albumArtist = oldArtist;


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
        formData.append('albumArtist', albumArtist);
        formData.append('albumTitle', albumTitle);
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