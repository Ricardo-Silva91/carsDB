/**
 * Created by rofler on 8/29/16.
 */
//always do this!!
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
    }
    else {
        //alert('something is wrong');
        window.location.href = "404.html";
        //alert("jogos");
    }
});