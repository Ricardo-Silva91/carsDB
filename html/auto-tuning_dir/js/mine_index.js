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
        var newElement = '<a target="_blank" href="../../editCar.html?id=' + currentBrandCars[i].id + '"><img src="' + base_url_for_pics + currentBrandCars[i].id + '" alt="image1"/></a>'
        $($('#dg-container').children()[0]).append(newElement);

        var newElementIsotope = '<div class="grid_1_of_4 images_1_of_4">' +
            '<a href="../../editCar.html?id=' + currentBrandCars[i].id + '">' +
            '<img src="' + base_url_for_pics + currentBrandCars[i].id + '">' +
            '</a>' +
            '<a href="../../editCar.html?id=' + currentBrandCars[i].id + '">' +
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
    $(function () {
        $('#dg-container').gallery({
            autoplay: true
        });
    });

});

$(document).ready(function () {
    console.log("doc ready");

    $.when(getCars()).done(function () {

        filterCarsByBrand(cars[Math.floor(Math.random() * cars.length) + 1  ].brand);
        populateCarousel();
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