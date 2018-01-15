/**
 * Created by nathangodinho on 15/01/2018.
 */
"use strict";

(function () {
    var calculateAge = function (birthday) {
        return new Date().getFullYear() - Number(birthday);
    };

    var setAgeIntoHTML = function (id, birthday) {
        var span = document.getElementById(id);


        span.innerText = calculateAge(birthday);
    };

    setAgeIntoHTML('bruthan-age', 1999);
})();