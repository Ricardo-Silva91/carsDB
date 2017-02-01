/**
 * Created by Ricardo on 26/01/2017.
 */

var currentBrandCars;
var currentBrand;
var brands;

function filterCarsByBrand(brand) {

    currentBrand = brand;
    currentBrandCars = [];

    for(var i=0; i<cars.length; i++)
    {
        if(cars[i].brand == brand)
        {
            currentBrandCars.push(cars[i]);
        }
    }
}



function populateCarousel() {

    $($('#dg-container').children()[0]).html("");
    $('#extensiveCars').html("");

    for(var i=0; i<currentBrandCars.length; i++)
    {
        //var newElement = '<a target="_blank" href="../../editCar.html?id=' + currentBrandCars[i].id + '"><img src="' + base_url_for_pics + currentBrandCars[i].id + '" alt="image1"/></a>'
        var newElement = '<a  class="modalCaller" title="' + currentBrandCars[i].id + '"><img src="' + base_url_for_pics + currentBrandCars[i].id + '" alt="image1"/></a>'

        $($('#dg-container').children()[0]).append(newElement);

        var newElementIsotope = '<div class="grid_1_of_4 images_1_of_4">' +
            '<a class="modalCaller" title="' + currentBrandCars[i].id + '">' +
            '<img src="' + base_url_for_pics + currentBrandCars[i].id + '">' +
            '</a>' +
            '<a class="modalCaller" title="' + currentBrandCars[i].id + '">' +
            '<h3>'+ currentBrandCars[i].model + '</h3>' +
            '</a>' +
            '</div>';
        $('#extensiveCars').append(newElementIsotope);

    }

}

function getBrands() {

    brands = [];

    for(var i=0; i<cars.length; i++)
    {
        if($.inArray(cars[i].brand, brands) == -1)
        {
            brands.push(cars[i].brand);
        }
    }

    brands.sort();

    for(i=0; i<brands.length; i++)
    {
        var newElement = '<option value="' + brands[i] + '">' + brands[i] + '</option>'
        $('#brandDropdown').append(newElement);
    }

}

$("#brandDropdown").change(function() {


    $('#carouselContainer').html('<section id="dg-container" class="dg-container">' +
        '<div class="dg-wrapper">' +
        '</div>' +
        '</section>');

    currentBrand = $('#brandDropdown')[0].value;
    filterCarsByBrand(currentBrand);
    populateCarousel();

    $(".modalCaller").click(function () {
        getTheModal(this.title);
    });
    $(function () {
        $('#dg-container').gallery({
            autoplay: true
        });
    });

});

function getCarPosByID(id)
{
    var result = -1;

    for(var i=0; i<cars.length; i++)
    {
        if(cars[i].id == id)
        {
            result = i;
            break;
        }
    }

    return result;

}

function getTheModal(title) {

    console.log("getting the modal for carId= " + title);

    var carPos = getCarPosByID(title);

    $("#modalID").html(cars[carPos].id);
    $("#modalModel").html(cars[carPos].model);
    $("#modalBrand").html(cars[carPos].brand);
    $("#modalReplica").html(cars[carPos].replica_brand);
    $("#modalScale").html(cars[carPos].scale);
    $("#modalDate").html(cars[carPos].date_included);
    $("#modalComments").html(cars[carPos].comment);

    $("#modalPic").attr('src', base_url_for_pics + title);

    $("#CarDetailsModal").modal('show');

}

$(document).ready(function () {
    console.log("doc ready");

    $.when(getCars()).done(function () {

        filterCarsByBrand(cars[Math.floor(Math.random() * cars.length) + 1  ].brand);
        populateCarousel();

        $(".modalCaller").click(function () {
            getTheModal(this.title);
        });

        $(function () {
            $('#dg-container').gallery({
                autoplay: true
            });
        });

        getBrands();

        $('#brandDropdown')[0].value = currentBrand;

    });

    //$($('#dg-container').children()[0]).html();

});