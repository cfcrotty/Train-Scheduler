

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

//on click of submit
$("#submit").on("click", function (event) {
    event.preventDefault();
    trainName = $("#trainName").val().trim();
    destination = $("#destination").val().trim();
    firstTrainTime = $("#firstTrainTime").val().trim();
    frequency = $("#frequency").val().trim();
    if (frequency && trainName && destination && firstTrainTime) {
        database.ref("/trains").push({
            trainName: trainName,
            destination: destination,
            firstTrainTime: firstTrainTime,
            frequency: frequency
        });
        $("#trainName, #destination, #firstTrainTime, #frequency").val("");
        location.href = "index.html";
    }
});

//on change in firebase
database.ref("/trains").on("child_added", function (childSnapshot) {
    trainName = childSnapshot.val().trainName;
    destination = childSnapshot.val().destination;
    firstTrainTime = childSnapshot.val().firstTrainTime;
    frequency = parseInt(childSnapshot.val().frequency);
    snapID = childSnapshot.key;
    var date1 = moment().format("YYYY-MM-DD "+firstTrainTime+":00");
    var results = addTrainTime(date1,frequency,snapID,idxTimer1);
    //console.log(results);
    $("tbody").append(`<tr id="tr${snapID}"><td id="name${snapID}">${childSnapshot.val().trainName}</td><td id="destination${snapID}">${childSnapshot.val().destination}</td><td id="frequency${snapID}">${childSnapshot.val().frequency}</td><td id="nextArrival${snapID}">${results[1]}</td><td id="minutesAway${snapID}">${results[0]}</td></tr>`);

    var arrayVAr = [];
    var changeNext = "";
    clearTimeout(arrayVAr["setTimeoutVal"+snapID]);
    clearInterval(arrayVAr["setIntervalVal"+snapID]);
    clearInterval(arrayVAr["setIntervalVal1"+snapID]);
    //if (frequency==1) frequency=3;
    arrayVAr["setTimeoutVal"+snapID] = setTimeout(function(){
        results[0]--;
        $("#minutesAway"+snapID).text(results[0]--);
        arrayVAr["setIntervalVal"+snapID] = setInterval(function(){
            //toAdd--;
            if (results[0]<=0) {results[0]=frequency;}
            $("#minutesAway"+snapID).text(results[0]--);
        },60000);
        
    },results[2]);
    arrayVAr["setTimeoutVal"+snapID] = setTimeout(function(){
        arrayVAr["setIntervalVal1"+snapID] = setInterval(function(){
            changeNext = moment(results[3]).add(frequency, 'minutes');
            $("#nextArrival"+snapID).text(moment(changeNext).format("HH:mm"));
        },(frequency)*60000);
    },results[2]);

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

$(document).ready(function () {
    intervalIdAnimate = setInterval(showHideImages, 1);
});

//const start = moment('2019-03-29 20:30');
//const remainder = 30 - (start.minute() % 30);
//const dateTime = moment(start).add(remainder, "minutes").format("DD.MM.YYYY, h:mm:ss a");

//var tomorrow = moment('2019-03-29 20:30').add(1, 'days');
//var duration = moment.duration(moment(tomorrow.diff(start)));

var firstTrainTime1 = "16:00";
var frequency1 = "30";
var theDate1 = moment().format("YYYY-MM-DD "+firstTrainTime1+":00");
//addTrainTime(theDate1,frequency1,0);

//function to get next arrival and minutes away
function addTrainTime(theDate,freq,trainID,idxTimer) {
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

    if (freq==0) newFreq=1;
    else newFreq=freq-1; 
    if (diffTime<0) {
        modTime = (diffTime*-1)%freq;
        divTime = Math.floor((diffTime*-1)/freq)+1;
        nextArrivalTime=moment(trainTime).add(divTime * freq, 'minutes');
        toAdd = freq-modTime;
        console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm:ss")+" minutesAway="+toAdd);
    } else if (diffTime==0) {
        modTime = diffTime%freq;
        nextArrivalTime = moment(trainTime).add(freq, 'minutes');
        toAdd = freq-modTime;
        console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm")+" minutesAway="+toAdd);
        
    } else if (diffTime>0) {
        modTime = diffTime;
        nextArrivalTime = trainTime;
        toAdd = modTime;
        console.log("nextArrivalTime="+moment(nextArrivalTime).format("YYYY-MM-DD HH:mm")+" minutesAway="+toAdd);
    }
    dateNowSec = moment().add(1,"minutes").format("YYYY-MM-DD HH:mm");
    setTimeouTime = (moment(dateNowSec).diff(moment(), "seconds"))*1000;
    var changeNext = nextArrivalTime;
    var arrayVAr = [];
    let setTimeoutVal = 0;
    let setIntervalVal = 0;
    let setIntervalVal1 = 0;

    var toDisplay = "";
    var toAdd1 = toAdd;
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
   idxTimer++;
    res = [toAdd,moment(nextArrivalTime).format("HH:mm"),setTimeouTime,nextArrivalTime,arrayVAr];
    
    return res;
}





//factors affecting insolation: angle of the sun, distance between the sun & earth, daylight hours, 
//, cloud cover, intensity(season)
//formula of best time and angle in the year? google