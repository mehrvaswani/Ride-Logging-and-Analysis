/* This JS file defines and holds all the functionality for users to log a ride, 
summarise their rides and add a goal visually. 
variables and functions for user interaction. They are organised in more
or less step-by-step manner*/

/* stores primary API url and deckID obtained from APIs as global variables
for easy reuse and recall across functions. 
Credit to Chase Roberts (@crobertsbmw) for this API.*/

var rideID;

main();

function main() {

    //declare all variables
    let rName,
        rDate,
        rRoute,
        rDistance,
        rTime,
        rCycle,
        rSpeed,
        calendar,
        arr = [],
        rides = [],
        fVal,
        x = [],
        y = [],
        distanceGoal,
        timeGoal,
        countGoal,
        speedGoal,
        dGoal = [],
        tGoal = [],
        cGoal = [],
        sGoal = [],
        goalVal = [],
        goalValue,
        goalPeriod,
        filteredRides = [];

    //load all functions that need to be loaded first
    addListeners();
    initCalendar();
    renderRows(rides);
    load();

    //set up all listeners for buttons and assign functions
    function addListeners() {
        document.getElementById('addEntry').addEventListener('click', isEmpty);
        document.getElementById('closeModal').addEventListener('click', close);
        document.getElementById('deleteEntry').addEventListener('click', deleteEntry);
        document.getElementById("calendarView").addEventListener('click', calendarView);
        document.getElementById("summary").addEventListener('click', summary);
    }

    //initialize calendar and create new calendar object
    function initCalendar() {
        var calendarEl = document.getElementById('calendar');

        //set up calendar configurations
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialDate: new Date(),
            initialView: 'dayGridMonth',
            contentHeight: 400,
            editable: true,
            customButtons: {
                addRide: {
                    text: 'Log a Ride',
                    click: renderEntry,
                }
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'addRide dayGridMonth,timeGridWeek'
            },
            //set up separate array to track calendar events on the front end (Front-End)
            events: arr,
            //if an event in the calendar is clicked, get the event ID and triggar a modal pop up
            //deleteEntry is just to keep track of the event ID incase of a delete to remove from the front end
            eventClick: function (info) {
                var eventObj = info.event;
                if (eventObj.id) {
                    renderRow(eventObj.id);
                    deleteEntry(eventObj.id);
                }
            },
            eventBackgroundColor: "#cfbf8f",
            eventBorderColor: "#3e7786",
        });

        calendar.render();
    }

    //Front end display for the pop up. All values are reset and the count increments with every entry added.
    function renderEntry() {
        var btn = document.getElementById('addEntry');
        btn.style.display = "block";
        const modal = document.getElementById('myModal')
        modal.style.display = "block";
        rideID++;
        resetValues();
    }

    //On 'save', checks if all input values are empty or not. Only trigger an entry add if inputs have values. 
    function isEmpty() {
        $('.form-row input').each(function () {
            if (!$(this).val()) {
                $(this).addClass("error");
                empty = true;
                // $('.form-row input').css('border-color', 'red');
            } else {
                $(this).removeClass("error");
                addEntry();
            }
        });
    }

    //get values from input fields and stores them in back-end and display in front-end
    function addEntry() {
        rName = document.getElementById("rideName").value;
        rDate = document.getElementById("date").value;
        rRoute = document.getElementById("route").value;
        rDistance = document.getElementById("distance").value;
        rTime = document.getElementById("time").value;
        rCycle = document.getElementById("cycle").value;
        rSpeed = (rDistance / rTime).toFixed(2);
        //calculate speed based on distance and time then display.
        document.getElementById("speed").innerHTML = `<p style="margin: 3px 3px 3px 3px">${rSpeed} KM/min</p>`
        rideID = _uuid();

        //checks if the entry exists in the array.
        var isAlreadyExistingRide = rides.filter(item => item.id == rideID)[0];

        //checks if an entry with the same name exists in the array
        var isExistingName = rides.filter(item => item.name == rName)[0];

        //if the entry exists already, user is trying to update the information.
        if (isAlreadyExistingRide) {
            //create temp array to push objects from original array
            var newRides = [];
            for (const ride of rides) {
                if (ride.id == rideID) {
                    //if ride exists using ride.ID then update in array and in database
                    newRides.push(
                        {
                            id: rideID,
                            name: rName,
                            date: rDate,
                            route: rRoute,
                            distance: rDistance,
                            time: rTime,
                            type: rCycle,
                            speed: rSpeed,
                        });

                    //api call.

                    //validation to make sure id is not null
                    if (ride.id != "" || ride.id != null) {
                        //remove unedited event from calendar
                        var event = calendar.getEventById(ride.id);
                        event.remove();
                        //add edited event to calendaar
                        addEvent({
                            id: rideID,
                            title: rName,
                            start: rDate,
                        });
                    }

                    //if no match in the array, keep iterating
                } else {
                    newRides.push(ride);
                }
            } rides = newRides;
        } else {
            //if entry is new, check if there is an entry with the same name as the new entry
            if (!isExistingName) {
                rides.push({
                    id: rideID,
                    name: rName,
                    date: rDate,
                    route: rRoute,
                    distance: rDistance,
                    time: rTime,
                    type: rCycle,
                    speed: rSpeed,
                });

                addEvent({
                    id: rideID,
                    title: rName,
                    start: rDate,
                });
            } else {
                //
            }
        }

        //stores full array in local storage.
        save();

        const modal = document.getElementById('myModal')
        modal.style.display = "none";

        // resetValues();
    }
    let dummyarray = ({ userName: "Jakob12", rideID: 1, name: "Mountain", date: 02 - 02 - 2022, time: 4, distance: 55 });

    async function logRide() {
        userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
        let userKey = userInfo.userKey
        console.log("userKey", userKey)
        let response = await fetch(`/logRide`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, Authorization: "Basic " + userKey, body: JSON.stringify(dummyarray) })
            .then(response => response.text())
            .then(rides => console.log("client.js message", rides));
    }

    async function getRides() {
        userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
        let userKey = userInfo.userKey
        let USERNAME = dummyarray.userName
        console.log("userKey", userKey)
        console.log("userName", USERNAME)
        let response = await fetch(`/getRides/${USERNAME}`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, Authorization: "Basic " + userKey })
            .then(response => response.text())
            .then(rides => console.log("client.js message", rides))
    }

    function resetValues() {
        document.getElementById("rideName").value = "";
        document.getElementById("date").value = "";
        document.getElementById("route").value = "";
        document.getElementById("distance").value = "";
        document.getElementById("time").value = "";
        document.getElementById("cycle").value = "";
        document.getElementById("speed").innerHTML = `<p style="margin: 3px 3px 3px 3px"></p>`;
    }

    function save() {
        let stringified = JSON.stringify(rides);
        localStorage.setItem("rides", stringified);

    }

    //on window load, get rides array from local storage and render them on the front end
    function load() {
        let retrieved = localStorage.getItem("rides");
        rides = JSON.parse(retrieved);

        if (rides == null) {
            rides = [];
        } else {
            renderRows(rides);
        }
    }

    //add event to calendar
    function addEvent(event) {
        calendar.addEvent(event);
    }

    //close the modal
    function close() {
        const modal = document.getElementById('myModal')
        modal.style.display = "none";
    }

    function _uuid() {
        var d = Date.now();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    //on page load when the array is retrieved from storage, render all of them to the calendar
    function renderRows(rides) {
        for (const a of rides) {
            addEvent({
                id: a.id,
                title: a.name,
                start: a.date,
            });
        }
    }

    //when event on calendar is clicked, identify which event is clicked and display pop up with associated object values
    function renderRow(id) {
        for (const ride of rides) {
            if (ride.id == id) {
                const modal = document.getElementById('myModal')
                modal.style.display = "block";

                var btn = document.getElementById('addEntry');
                btn.style.display = "none";

                document.getElementById("rideName").value = ride.name;
                document.getElementById("date").value = ride.date;
                document.getElementById("route").value = ride.route;
                document.getElementById("distance").value = ride.distance;
                document.getElementById("time").value = ride.time;
                document.getElementById("cycle").value = ride.type;
                document.getElementById("speed").innerHTML = `<p style="margin: 3px 3px 3px 3px">${ride.speed} KM/min</p>`;
            }
        }
    }

    //detect when event is deleted, remove from array and update local storage. remove from calendar.
    function deleteEntry(id) {
        document.getElementById('deleteEntry').addEventListener('click', function () {
            for (let i = 0; i < rides.length; i++) {
                if (rides[i].id == id) {
                    rides.splice(i, 1);
                    var event = calendar.getEventById(id);
                    event.remove();
                }
            }
            save();
            const modal = document.getElementById('myModal')
            modal.style.display = "none";
        });
    }
    //toggle between different tabs
    function calendarView() {
        var calendar = document.getElementById("calendar");
        calendar.style.display = "block";
        var summary = document.getElementById("summaryVis");
        summary.style.display = "none";
    }

    function summary() {
        var calendar = document.getElementById("calendar");
        calendar.style.display = "none";
        summaryVis();
    }

    function summaryVis() {
        var summary = document.getElementById("summaryVis");
        summary.style.display = "block";

        document.getElementById("filter").addEventListener("change", function () {
            fVal = document.getElementById("filter").value;
        });

        document.getElementById("submit").addEventListener("click", function () {
            x = [];
            y = [];
            if (fVal === 'Total Distance') {
                for (let i = 0; i < rides.length; i++) {
                    y.push(rides[i].distance);
                    x.push(rides[i].date);

                    if (rides[i].distanceGoal != "") {
                        dGoal.push(rides[i].distanceGoal)
                    } else {
                        rides[i].distanceGoal === "";
                    }
                }

                if (rides.some(e => e.distanceGoal === "")) {
                    plotVis(x, y, 'Total Distance', 'Distance (KM)');
                    renderGoal();
                } else {
                    plotExistingGoals(x, y, dGoal, 'Total Distance', 'Distance (KM)')
                    renderGoal();
                }

                x = [];
                y = [];

            } else if (fVal === 'Total Minutes') {
                for (let i = 0; i < rides.length; i++) {
                    y.push(rides[i].time);
                    x.push(rides[i].date);

                    if (rides[i].timeGoal != "") {
                        tGoal.push(rides[i].timeGoal)
                    } else {
                        rides[i].timeGoal === "";
                    }
                }

                if (rides.some(e => e.timeGoal === "")) {
                    plotVis(x, y, 'Total Time Cycling', 'Minutes');
                    renderGoal();
                } else {
                    plotExistingGoals(x, y, tGoal, 'Total Time Cycling', 'Minutes')
                    renderGoal();
                }

                x = [];
                y = [];

            } else if (fVal === 'Total Logs') {

                for (let i = 0; i < rides.length; i++) {
                    x.push(rides[i].date);
                }
                const count = x.filter((x, i, a) => a.indexOf(x) == i)
                var counter;

                for (let i = 0; i < rides.length; i++) {
                    counter = rides.filter((v) => (v.date === count[i])).length;
                    y.push(counter);

                    if (rides[i].countGoal != "") {
                        cGoal.push(rides[i].countGoal)
                    } else {
                        rides[i].countGoal === "";
                    }
                }

                if (rides.some(e => e.countGoal === "")) {
                    plotLogsVis(x, y, 'Total Training Logged', 'Count');
                    renderGoal();
                } else {
                    plotExistingGoals(x, y, cGoal, 'Total Training Logged', 'Count')
                    renderGoal();
                }

                x = [];
                y = [];

            } else if (fVal === 'Average Speed') {
                for (let i = 0; i < rides.length; i++) {
                    y.push(rides[i].speed);
                    x.push(rides[i].date);

                    if (rides[i].speedGoal != "") {
                        sGoal.push(rides[i].speedGoal)
                    } else {
                        rides[i].speedGoal === "";
                    }
                }

                if (rides.some(e => e.speedGoal === "")) {
                    plotVis(x, y, 'Average Speed', 'Speed (KM/Min)');
                    renderGoal();
                } else {
                    plotExistingGoals(x, y, sGoal, 'Average Speed', 'Speed (KM/Min)')
                    renderGoal();
                }

                x = [];
                y = [];
            }
        });

    };

    function resetPlot() {
        var data = [];
        Plotly.newPlot('tester', data);
    }

    function plotVis(xValues, yValues, setTitle, ylabel) {

        var config = {
            displaylogo: false,
        };

        var data = [{
            type: 'bar',
            x: xValues,
            y: yValues,
            mode: 'markers',
            marker: {
                color: 'rgba(255,153,51,0.7)',
                width: 1
            },
            transforms: [{
                type: 'aggregate',
                groups: xValues,
                aggregations: [
                    { target: 'y', func: 'sum', enabled: true }
                ]
            }]

        }];

        var layout = {
            clearable: true,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            title: setTitle,
            xaxis: {
                autorange: true,
                range: ['2022-01-01', '2022-12-31'],
                rangeselector: {
                    buttons: [
                        {
                            count: 1,
                            label: 'Month by Month',
                            step: 'year',
                            stepmode: 'backward'
                        }, {
                            count: 1,
                            label: 'Week by Week',
                            step: 'month',
                            stepmode: 'backward'
                        },
                        {
                            count: 7,
                            label: 'Day by Day',
                            step: 'day',
                            stepmode: 'backward'
                        },
                        { step: 'all' }
                    ]
                },
                rangeslider: {
                    range: ['2022-01-01', '2022-12-31'],
                    pad: { t: 10 },
                },
                type: 'date',
                title: 'Filter Date Range'
            },
            yaxis: {
                title: ylabel,
                autorange: true,
                type: 'linear'
            }

        };

        Plotly.newPlot('tester', data, layout, config);
    }

    function plotLogsVis(xValues, yValues, setTitle, ylabel) {

        var config = {
            displaylogo: false,
        };

        var data = [{
            type: 'bar',
            x: xValues,
            y: yValues,
            mode: 'markers',
            marker: {
                color: 'rgba(255,153,51,0.6)',
                width: 1
            },
            transforms: [{
                type: 'aggregate',
                groups: xValues,
                aggregations: [
                    { target: 'y', func: 'count', enabled: true }
                ]
            }]

        }];

        var layout = {
            title: setTitle,
            xaxis: {
                autorange: false,
                range: ['2022-01-01', '2022-12-31'],
                rangeselector: {
                    buttons: [
                        {
                            count: 1,
                            label: 'Month by Month',
                            step: 'year',
                            stepmode: 'backward'
                        }, {
                            count: 1,
                            label: 'Week by Week',
                            step: 'month',
                            stepmode: 'backward'
                        },
                        {
                            count: 7,
                            label: 'Day by Day',
                            step: 'day',
                            stepmode: 'backward'
                        },
                        { step: 'all' }
                    ]
                },
                rangeslider: {
                    range: ['2022-01-01', '2022-12-31'],
                    pad: { t: 10 },
                },
                type: 'date',
                autorange: true,
                title: 'Filter Date Range'
            },
            yaxis: {
                title: ylabel,
                autorange: true,
                dtick: 1,
                type: 'linear'
            }

        };

        Plotly.newPlot('tester', data, layout, config);
    }




}
