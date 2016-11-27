
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

var cookie = getCookie('carsDB_token');
//var url_rest = base_url_rest + 'numberOfAlbums?token=' + cookie;

/*
$.ajax({
    url: url_rest
}).then(function (data) {

    var json = data;
    if (json != null && json['op'] == 'success') {
        //alert(json['totalAlbums']);
        //$('#total-albums')[0].innerText = json['totalAlbums'];
        window.location.href = "home.html";
    }
    else {
        //alert('something is wrong');
        //alert("jogos");
    }
});
*/


$("form").on('submit', function (e) {
    //ajax call here

    var alias = $('#inputAlias')[0].value;
    var pass = $('#inputPassword')[0].value;
    var url_rest = base_url_rest + 'login';


    //alert('b');
/*
    $.ajax({
        url: url_rest,
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify( { "userName": alias, "password": pass } ),
        success: function( data, status ){
            var json = data;
            if (json != null && json['result'] == 'success') {
                //alert('logout successful');
                document.cookie="carsDB_token = "+json.token+";path=/;";
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

*/
    $.post(url_rest,
        {
            userName: alias,
            password: pass
        },
        function (data, status) {
            var json = data;
            if (json != null && json['result'] == 'success') {
                //alert('logout successful');
                document.cookie="carsDB_token = "+json.token+";path=/;";
                window.location.href = "home.html";
            }
            else {
                alert('something is wrong:' + json['message']);
                //window.location.href = "index.html";
            }
        });

    //stop form submission
    e.preventDefault();
});


$(document).ready(function () {

    console.log("doc ready");


    var url_rest = base_url_rest + 'checkValidToken?token=' + getCookie('carsDB_token');

    $.ajax({
        url: url_rest,
        type: 'get',
        success: function( data, status ){
            var json = data;
            if (json != null && json['result'] == 'success') {
                //alert('logout successful');
                window.location.href = "home.html";
            }
            else {
                //alert('something is wrong:' + json['message']);
                console.log('no valid cookie');
                //window.location.href = "index.html";
            }
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log( errorThrown );
        }
    });


});