/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
let watchIDElement;
let nombreRutaDB = "";
let opcionesRuta = []
let watchID;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    let socket = io("https://socket-maptracker.onrender.com/")
    //let socket = io("ws://socket-maptracker.onrender.com/")

    window.socket = socket

    /* WonderPush.setLogging(true, function () {
        console.log("Success");
    }); */

   /*  WonderPush.setLogging(true) */

    //CONFIGURANDO LA NOTIFICACION PUSH.
    // Prompt user for push subscription
    WonderPush.subscribeToNotifications();

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById("getPosition").addEventListener("click", getPosition);
    document.getElementById("watchPosition").addEventListener("click", watchPosition);
    /*  document.getElementById("networkInfo").addEventListener("click", networkInfo);
     document.addEventListener("offline", onOffline, false);
     document.addEventListener("online", onOnline, false);
     document.addEventListener("stopwatchPosition", stopWatch, false);
     document.getElementById("getAcceleration").addEventListener("click", getAcceleration);
     document.getElementById("watchAcceleration").addEventListener(
         "click", watchAcceleration); */
    document.getElementById("GuardarRuta").addEventListener(
        "click", GuardarNombreRuta);

    cordovaFetch('https://amigaapp-f2f93-default-rtdb.firebaseio.com/dbrutas.json')
        .then(response => response.json())
        .then(json => {


            Object.keys(json).forEach(element => {
                opcionesRuta.push(element)

            });

        })
        .catch(err => console.log(err))
        .finally(() => {
            let selectRutas = document.getElementById('selectRutas');
            console.log(opcionesRuta)
            opcionesRuta.forEach(opcion => {
                console.log("opcion", opcion)
                let Op = document.createElement('option')
                Op.value = opcion
                Op.text = opcion
                selectRutas.add(Op)
            });

        })

    document.getElementById('selectRutas').addEventListener('change', (event) => {
        console.log(event.target.value);
        nombreRutaDB = event.target.value
        alert(nombreRutaDB)
    });

}

function GuardarNombreRuta() {
    //+ new Date().toLocaleString().replace(",","-").replace(" ","")
    nombreRutaDB = document.getElementById("nombreruta").value
    alert(nombreRutaDB)
}

function getPosition() {
    var options = {
        enableHighAccuracy: true,
        maximumAge: 3600000
    }
    watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    function onSuccess(position) {
        alert('Latitude: ' + position.coords.latitude + '\n' +
            'Longitude: ' + position.coords.longitude + '\n' +
            'Altitude: ' + position.coords.altitude + '\n' +
            'Accuracy: ' + position.coords.accuracy + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
            'Heading: ' + position.coords.heading + '\n' +
            'Speed: ' + position.coords.speed + '\n' +
            'Timestamp: ' + position.timestamp + '\n');
    };

    function onError(error) {
        alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    }
}

function stopWatch() {
    navigator.geolocation.clearWatch(watchID);
}

function watchPosition() {
    //document.getElementById('stopwatchPosition').classList.remove('disabled')
    if (nombreRutaDB === "") {
        alert("Ingrese el nombre de la ruta a evaluar")
    }
    else {
        var options = {
            maximumAge: 3600000,
            timeout: 3000,
            enableHighAccuracy: true,
        }
        watchIDElement = navigator.geolocation.watchPosition(onSuccess, onError, options);

        function onSuccess(position) {
            document.getElementById('info').innerHTML =
                'Latitude: ' + position.coords.latitude + '\n' +
                'Longitude: ' + position.coords.longitude + '\n' +
                'Altitude: ' + position.coords.altitude + '\n' +
                'Accuracy: ' + position.coords.accuracy + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                'Heading: ' + position.coords.heading + '\n' +
                'Speed: ' + position.coords.speed + '\n' +
                'Timestamp: ' + position.timestamp + '\n';

            let _datos = {
                'Fecha': new Date().toLocaleString().replace(",", "-").replace(" ", ""),
                'Latitude': position.coords.latitude,
                'Longitude': position.coords.longitude,
                'Heading': position.coords.heading,
                'Speed': position.coords.speed
            }

            window.socket.emit('geo_posicion', _datos);
            console.log("enviando datos....")

            /* fetch(`https://amigaapp-f2f93-default-rtdb.firebaseio.com/dbrutas/${nombreRutaDB}.json`, {
                method: 'PATH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_datos)
            })
                .then(json => console.log(json))
                .catch(err => console.log(err))
                .finally(() => {
                    console.log('finish')
                }) */

            /* fetch('https://amigaapp-f2f93-default-rtdb.firebaseio.com/Prueba.json', {
                method: "POST",
                body: JSON.stringify(_datos),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            })
                .then(response => response.json())
                .then(json => console.log(json))
                .catch(err => console.log(err))
                .finally(() => {
                    console.log('finish')
                }) */
        }

        function onError(error) {
            alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        }
    }
}

function networkInfo() {
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.CELL] = 'Cell generic connection';
    states[Connection.NONE] = 'No network connection';
    alert('Connection type: ' + states[networkState]);
}

function onOffline() {
    alert('You are now offline!');
}

function onOnline() {
    alert('You are now online!');
}

function getAcceleration() {
    navigator.accelerometer.getCurrentAcceleration(
        accelerometerSuccess, accelerometerError);

    function accelerometerSuccess(acceleration) {
        alert('Acceleration X: ' + acceleration.x + '\n' +
            'Acceleration Y: ' + acceleration.y + '\n' +
            'Acceleration Z: ' + acceleration.z + '\n' +
            'Timestamp: ' + acceleration.timestamp + '\n');
    };

    function accelerometerError() {
        alert('onError!');
    };
}

function watchAcceleration() {
    var accelerometerOptions = {
        frequency: 3000
    }
    var watchID = navigator.accelerometer.watchAcceleration(
        accelerometerSuccess, accelerometerError, accelerometerOptions);

    function accelerometerSuccess(acceleration) {
        alert('Acceleration X: ' + acceleration.x + '\n' +
            'Acceleration Y: ' + acceleration.y + '\n' +
            'Acceleration Z: ' + acceleration.z + '\n' +
            'Timestamp: ' + acceleration.timestamp + '\n');

        setTimeout(function () {
            navigator.accelerometer.clearWatch(watchID);
        }, 10000);
    };

    function accelerometerError() {
        alert('onError!');
    };

}

