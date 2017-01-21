/**
 * Created by Ricardo on 26/11/2016.
 */
module.exports = {
    findCars: function findCar(queue, carId) {

        var result = -1;

        for (var i = 0; i < queue.length; i++) {
            if (queue[i].id == carId) {
                result = i;
                break;
            }
        }
        return result;
    },
    carIsGood: function carIsGood(car) {

        var result = true;

        if (car.model == null || car.model == "") {
            result = false;
        }
        else if (car.brand == null || car.brand == "") {
            result = false;
        }
        else if (car.scale == null || car.scale == "") {
            result = false;
        }
        else if (car.replica_brand == null || car.replica_brand == "") {
            result = false;
        }

        return result;
    },
    getUserByToken: function getUserByToken(users, token) {

        var result = -1;

        for (var i = 0; i < users.length; i++) {
            //console.log('user: ' + users[i].token)
            if (users[i].token == token) {
                result = i;
                break;
            }
        }
        return result;
    },
    carExists: function carExists(cars, car) {

        var result = false;

        for (var i = 0; i < cars.length; i++) {
            if (cars[i].model == car.model && cars[i].brand == car.brand && cars[i].scale == car.scale && cars[i].replica_brand == car.replica_brand) {
                result = true;
                break;
            }
        }
        return result;
    },
    findUser: function findUser(queue, userPass, userName) {

        var result = -1;

        for (var i = 0; i < queue.length; i++) {
            if (queue[i].alias == userName && queue[i].pass == userPass) {
                result = i;
                break;
            }
        }
        return result;
    }
}