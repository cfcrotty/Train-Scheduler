//animation
var widthScreen = 0;
var heightScreen = 0;
var back = false;
var back1 = false;
var pxl = 50;
var pxl1 = 20;
theWidth = $(window).width() - 100;
theHeight = $(window).height() - 200;
var animateImage = $(".animateImage");
var animateImage1 = $(".animateImage1");

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCLIkEEB-mnyQVoTRoIO_KOGLhyDJIH71k",
    authDomain: "carafelise-3644c.firebaseapp.com",
    databaseURL: "https://carafelise-3644c.firebaseio.com",
    projectId: "carafelise-3644c",
    storageBucket: "carafelise-3644c.appspot.com",
    messagingSenderId: "297122029965"
};
firebase.initializeApp(config);

var database = firebase.database();
var trainName = "";
var destination = "";
var firstTrainTime = "";
var frequency = "";
var snapID = "";

var idxTimer1 = 0;
var formats = ["HH:mm"];
var isValidTime = false;

var totalTrains = 0;

//on click of submit
$("#submit").on("click", function (event) {
    event.preventDefault();
    audioToPlay = "assets/audio/train.mp3";
    var audio = new Audio(audioToPlay);
    audio.play();
    trainName = $("#trainName").val().trim();
    destination = $("#destination").val().trim();
    firstTrainTime = $("#firstTrainTime").val().trim();
    frequency = $("#frequency").val().trim();
    isValidTime = moment(firstTrainTime, formats, true).isValid();
    if (frequency && trainName && destination && firstTrainTime && isValidTime) {
        database.ref("/trains").push({
            trainName: trainName,
            destination: destination,
            firstTrainTime: firstTrainTime,
            frequency: frequency
        });
        $("#trainName, #destination, #firstTrainTime, #frequency").val("");
        $("#message").empty();
        location.href = "index.html";
    } else {
        if (!trainName || !destination || !firstTrainTime || !frequency) { $("#message").html("<p style='color:red;'>Please fill up all fields.</p>"); }
        else if (!isValidTime) { $("#message").html("<p style='color:red;'>Please correct and follow the format (HH:mm) for First Train Time.</p>"); }
    }
});

database.ref("/trains").on("value", function (snapshot) {
    totalTrains = snapshot.numChildren();
});

var objResults = {};
var objIdx = 0;

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
// Get the size of an object
//var size = Object.size(myArray);

function runSetInterval(sec) {
    let nextArrival = 0;
    dateNowSec1 = moment().add(1, "minutes").format("YYYY-MM-DD HH:mm");
    setTimeouTime1 = (moment(dateNowSec1).diff(moment(), "seconds")) * 1000;
    setTimeout(function () {
        for (var i = 0; i < Object.size(objResults); i++) {
            objResults[i].res1--;
            $("#minutesAway" + objResults[i].snapID).text(objResults[i].res1--);
        }
        setInterval(function () {
            for (var i = 0; i < Object.size(objResults); i++) {
                objResults[i].res1--;
                if (objResults[i].res1 <= 0) { objResults[i].res1 = objResults[i].frequency; }
                $("#minutesAway" + objResults[i].snapID).text(objResults[i].res1);
                if (objResults[i].res2==moment().format("HH:mm")) {
                    nextArrival = computeNextArrival(objResults[i].firstTrainTime,objResults[i].frequency);
                    changeNext = moment(nextArrival).add(objResults[i].frequency, 'minutes');
                    $("#nextArrival"+objResults[i].snapID).text(moment(changeNext).format("HH:mm"));
                }
            }
        }, 60000);
    }, setTimeouTime1);
}



//on change in firebase
database.ref("/trains").on("child_added", function (childSnapshot) {
    trainName = childSnapshot.val().trainName;
    destination = childSnapshot.val().destination;
    firstTrainTime = childSnapshot.val().firstTrainTime;
    frequency = parseInt(childSnapshot.val().frequency);
    snapID = childSnapshot.key;
    var date1 = moment().format("YYYY-MM-DD " + firstTrainTime + ":00");
    var results = addTrainTime(date1, frequency, snapID, idxTimer1);
    //console.log(results);
    $("tbody").append(`<tr id="tr${snapID}"><td id="name${snapID}">${childSnapshot.val().trainName}</td><td id="destination${snapID}">${childSnapshot.val().destination}</td><td id="frequency${snapID}">${childSnapshot.val().frequency}</td><td id="nextArrival${snapID}">${results[1]}</td><td id="minutesAway${snapID}">${results[0]}</td></tr>`);

   
    objResults[objIdx] = {
        snapID: snapID,
        trainName: trainName,
        destination: destination,
        firstTrainTime: firstTrainTime,
        frequency: frequency,
        res1: results[0],
        res2: results[1]
    };

    if (totalTrains == objIdx) runSetInterval();
    objIdx++;
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//function for animation of image
function showHideImages() {
    if (!back1 && theHeight <= heightScreen) {
        back1 = true;
    } else if (heightScreen <= 0) {
        back1 = false;
    }
    if (!back && theWidth <= widthScreen) {
        back = true;
    } else if (widthScreen <= 0) {
        back = false;
    }
    if ($(window).width() < widthScreen || back) {
        widthScreen -= pxl;
        animateImage.animate({ left: "-=" + pxl + "px" }, "normal");
        animateImage1.animate({ left: "+=" + pxl + "px" }, "normal");

    } else if (theWidth > widthScreen || !back) {
        widthScreen += pxl;
        animateImage.animate({ left: "+=" + pxl + "px" }, "normal");
        animateImage1.animate({ left: "-=" + pxl + "px" }, "normal");

    }
}
// END - Animation

//run animation on page load
$(document).ready(function () {
    intervalIdAnimate = setInterval(showHideImages, 1);
});

//function to get next arrival and minutes away
function addTrainTime(theDate, freq, trainID, idxTimer) {
    var res = [];
    var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    var trainTime = moment(theDate);
    //1. use diff to compare time now vs start time //use convertedDate.toNow() & convertedDate.diff(moment(), "minutes")
    var diffTime = trainTime.diff(moment(dateNow), "minutes");
    var setTimeouTime = 0;
    var nextArrivalTime = 0;
    var minutesAway = 0;
    var newTrainTime = 0;
    var modTime = 0;
    var divTime = 0;
    var toAdd = 0;
    var newFreq = 0;

    if (freq == 0) newFreq = 1;
    else newFreq = freq - 1;
    if (diffTime < 0) {
        modTime = (diffTime * -1) % freq;
        divTime = Math.floor((diffTime * -1) / freq) + 1;
        nextArrivalTime = moment(trainTime).add(divTime * freq, 'minutes');
        toAdd = freq - modTime;
        //console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm:ss")+" minutesAway="+toAdd);
    } else if (diffTime == 0) {
        modTime = diffTime % freq;
        nextArrivalTime = moment(trainTime).add(freq, 'minutes');
        toAdd = freq - modTime;
        //console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm")+" minutesAway="+toAdd);

    } else if (diffTime > 0) {
        modTime = diffTime;
        nextArrivalTime = trainTime;
        toAdd = modTime;
        //console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm")+" minutesAway="+toAdd);
    }
    dateNowSec = moment().add(1, "minutes").format("YYYY-MM-DD HH:mm");
    setTimeouTime = (moment(dateNowSec).diff(moment(), "seconds")) * 1000;
    var changeNext = nextArrivalTime;
    var arrayVAr = [];
    let setTimeoutVal = 0;
    let setIntervalVal = 0;
    let setIntervalVal1 = 0;

    var toDisplay = "";
    var toAdd1 = toAdd;
    
    idxTimer++;
    res = [toAdd, moment(nextArrivalTime).format("HH:mm"), setTimeouTime, nextArrivalTime, arrayVAr];

    return res;
}

function computeNextArrival(theDate, freq) {
    let date1 = moment().format("YYYY-MM-DD " + theDate + ":00");
    let dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    let trainTime = moment(theDate);
    let diffTime = trainTime.diff(moment(dateNow), "minutes");
    let nextArrivalTime = 0;
    let modTime = 0;
    let divTime = 0;
    let toAdd = 0;

    if (diffTime < 0) {
        modTime = (diffTime * -1) % freq;
        divTime = Math.floor((diffTime * -1) / freq) + 1;
        nextArrivalTime = moment(trainTime).add(divTime * freq, 'minutes');
        toAdd = freq - modTime;
        //console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm:ss")+" minutesAway="+toAdd);
    } else if (diffTime == 0) {
        modTime = diffTime % freq;
        nextArrivalTime = moment(trainTime).add(freq, 'minutes');
        toAdd = freq - modTime;
        //console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm")+" minutesAway="+toAdd);

    } else if (diffTime > 0) {
        modTime = diffTime;
        nextArrivalTime = trainTime;
        toAdd = modTime;
        //console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm")+" minutesAway="+toAdd);
    }
    return nextArrivalTime;
}


/*
    //clearTimeout(arrayVAr["setTimeout"+trainID]);
    //clearInterval(arrayVAr["setIntervalVal"+trainID]);
    //clearInterval(arrayVAr["setIntervalVal1"+trainID]);
    clearTimeout(setTimeoutVal);
    clearInterval(setIntervalVal);
    clearInterval(setIntervalVal1);
    setTimeoutVal = setTimeout(function(){
        toAdd1--;
        $("#minutesAway"+trainID).text(toAdd1--);
        setIntervalVal = setInterval(function(){
            //toAdd1--;
            if (toAdd1<0) {toAdd1=freq;}
            $("#minutesAway"+trainID).text(toAdd1--);
        },60000);
        setIntervalVal1 = setInterval(function(){
            changeNext = moment(changeNext).add(freq, 'minutes');
            $("#nextArrival"+trainID).text(moment(changeNext).format("HH:mm"));
        },(freq)*60000);
    },setTimeouTime);
 

    
    arrayVAr["setTimeoutVal"+trainID] = setTimeout(function(){
        toAdd--;
        $("#minutesAway"+trainID).text(toAdd--);
        arrayVAr["setIntervalVal"+trainID] = setInterval(function(){
            //toAdd--;
            if (toAdd<0) {toAdd=freq;}
            $("#minutesAway"+trainID).text(toAdd--);
        },60000);
        arrayVAr["setIntervalVal1"+trainID] = setInterval(function(){
            changeNext = moment(changeNext).add(freq, 'minutes');
            $("#nextArrival"+trainID).text(moment(changeNext).format("HH:mm"));
        },(freq-1)*60000);
    },setTimeouTime);
    */
//factors affecting insolation: angle of the sun, distance between the sun & earth, daylight hours, 
//, cloud cover, intensity(season)
//formula of best time and angle in the year? google