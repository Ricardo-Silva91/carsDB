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

var files;

function disableAllInputs() {

    for (var i = 2; i < $('input').length; i++) {
        $('input')[i].disabled = true;
    }
    $('.box-danger').attr('style',"visibility: hidden")



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
                disableAllInputs();
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

}

$(document).ready(function () {


    checkCookie();

    var id = parent.document.URL.substring(parent.document.URL.indexOf('id='), parent.document.URL.length).split('=')[1].split('#')[0];

    //alert('album ID: ' + id);
    $('#albumIdLabel')[0].innerText = id;

    $.when(getCars()).done(function () {
        $('#date_included')[0].innerText = cars[id]['date_included'];
        $('#inputTitle')[0].value = cars[id]['model'];
        $('#inputArtist')[0].value = cars[id]['brand'];
        $('#inputGenre')[0].value = cars[id]['scale'];
        $('#inputRep')[0].value = cars[id]['replica_brand'];
        $('#inputComment')[0].value = cars[id]['comment'];

        $("#albumPicShow").attr("src", base_url_for_pics + cars[id]['id']);
        $('input[type=file]#inputPic').on('change', prepareUpload);

// Grab the files and set them to our variable
        function prepareUpload(event) {
            files = event.target.files;
            //alert('new file')
        }

    });

});

$("#edit_album_form").on('submit', function (e) {


    e.preventDefault();

    //ajax call here

    var albumTitle = $('#inputTitle')[0].value;
    var albumArtist = $('#inputArtist')[0].value;
    var albumScale = $('#inputGenre')[0].value;
    var albumComment = $('#inputComment')[0].value;
    var albumRepBrand = $('#inputRep')[0].value;
    //alert(isSamples);

    var url_rest = base_url_rest + 'editCar';

    var car = {
        model: albumTitle,
        brand: albumArtist,
        scale: albumScale,
        replica_brand: albumRepBrand,
        comment: albumComment,
        id: $('#albumIdLabel')[0].innerText
    };

    //alert('edit album');

    $.post(url_rest,
        {
            token: cookie,
            Car: car
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

    window.location.reload();

});


var dataURLToBlob = function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}

$("#upload_pic_form").on('submit', function (e) {


    e.preventDefault();

    //ajax call here


    if ($('input[type=file]#inputPic').val() != "") {
        var file = $('input[type=file]')[0].files[0];

        if(file.type.match(/image.*/)) {
            console.log('An image has been loaded');

            // Load the image
            var reader = new FileReader();
            reader.onload = function (readerEvent) {
                var image = new Image();
                image.onload = function (imageEvent) {

                    // Resize the image
                    var canvas = document.createElement('canvas'),
                        max_size = 1280,// TODO : pull max size from a site config
                        width = image.width,
                        height = image.height;
                    if (width > height) {
                        if (width > max_size) {
                            height *= max_size / width;
                            width = max_size;
                        }
                    } else {
                        if (height > max_size) {
                            width *= max_size / height;
                            height = max_size;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                    var dataUrl = canvas.toDataURL('image/jpeg');
                    var resizedImage = dataURLToBlob(dataUrl);
                    $.event.trigger({
                        type: "imageResized",
                        blob: resizedImage,
                        url: dataUrl
                    });
                }
                image.src = readerEvent.target.result;
            }
            reader.readAsDataURL(file);
        }




    }

    //window.location.reload();

});

$(document).on("imageResized", function (event) {


    var carId = $('#albumIdLabel')[0].innerText;
    url_rest = base_url_rest + 'uploadPic_template';

    var formData = new FormData();
    formData.append('token', cookie);
    formData.append('carId', carId);
    formData.append('avatar', event.blob);

    //formData.append('avatar', $('input[type=file]')[0].files[0]);

    $.ajax({
        type: 'POST',
        url: url_rest,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            window.location.reload();
            //alert(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
            console.log('ERRORS: ' + textStatus);
            // STOP LOADING SPINNER
        }
    });
});