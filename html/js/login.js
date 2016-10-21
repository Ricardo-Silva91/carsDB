
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

var cookie = getCookie('MusicDB_token');
var url_rest = base_url_rest + 'numberOfAlbums?token=' + cookie;


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



$("form").on('submit', function (e) {
    //ajax call here

    var alias = $('#inputAlias')[0].value;
    var pass = $('#inputPassword')[0].value;
    var url_rest = base_url_rest + 'login?alias=' + alias + '&pass=' + pass;


    //alert('b');

    $.ajax({
        url: url_rest
    }).then(function(data) {

        var json = data;
        if(json['alias']==alias && json['token']!=null)
        {
            document.cookie="MusicDB_token = "+json['token']+";path=/;";
            window.location.href = "home.html";
        }
        else
        {
            alert('wrong alias/password.\nPlease try again.')
        }

    });

    //stop form submission
    e.preventDefault();
});