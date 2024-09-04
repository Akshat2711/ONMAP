// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, update, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

var groupname = (localStorage.getItem("groupname")).replace(/"/g, '');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwjqkmxK-ufj2rAqUZfeFZ6YflV-alQZE",
    authDomain: "onmap-28c85.firebaseapp.com",
    projectId: "onmap-28c85",
    storageBucket: "onmap-28c85.appspot.com",
    messagingSenderId: "710152744891",
    appId: "1:710152744891:web:3fa6ed5a675cc4ea159e9e",
    measurementId: "G-VNZJK1HHXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

var user = (localStorage.getItem("username") || '').replace(/"/g, ''); // Fallback to empty if null

function initMap(latitude, longitude) {
    const map = L.map('map').setView([latitude, longitude], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const dbRef = ref(db, `groups/${groupname}/members/`);

    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const members = snapshot.val();
            console.log("Members data:", members);
            for (const [key, value] of Object.entries(members)) {
                var getref = ref(db, `usersinf/` + value);
                get(getref).then((snapshot) => {
                    if (snapshot.exists()) {
                        if (value === user) {
                            L.marker([snapshot.val().latitude, snapshot.val().longitude]).addTo(map)
                              .bindPopup('You are here')
                              .openPopup();
                        } else {
                            L.marker([snapshot.val().latitude, snapshot.val().longitude]).addTo(map)
                              .bindPopup(value + " is here")
                              .openPopup();
                        }
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        } else {
            console.log("No members found for the group:", groupname);
        }
    }).catch((error) => {
        console.error("Error fetching members:", error);
    });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude1 = position.coords.latitude;
            const longitude1 = position.coords.longitude;

            console.log("User:", user); // Verify the user value

            if (user) {
                const groupRef = ref(db, 'usersinf/' + user);
                update(groupRef, {
                    longitude: longitude1,
                    latitude: latitude1
                })
                .then(() => {
                    console.log("Location updated successfully.");
                })
                .catch((error) => {
                    console.error("Error updating location:", error);
                });
            } else {
                console.error("No user found in localStorage.");
            }

            initMap(latitude1, longitude1);
        }, showError_location);
    } else {
        document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showError_location(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("location").innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("location").innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            document.getElementById("location").innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("location").innerHTML = "An unknown error occurred.";
            break;
    }
}

// Initialize battery and location info on page load
function getBatteryInfo() {
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            updateBatteryStatus(battery);
            battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
            battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
            battery.addEventListener('chargingtimechange', () => updateBatteryStatus(battery));
            battery.addEventListener('dischargingtimechange', () => updateBatteryStatus(battery));
        }).catch(error => {
            console.error("Error accessing battery information:", error);
            showFallbackBatteryStatus();
        });
    } else {
        console.log("Battery Status API is not supported.");
        showFallbackBatteryStatus();
    }
}

function updateBatteryStatus(battery) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const dateString = now.toLocaleDateString(undefined, options);
    const timeString = now.toLocaleTimeString(undefined, timeOptions);

    const level = Math.round(battery.level * 100);
    const fillElement = document.querySelector('.battery-bar .fill');

    document.getElementById('level').innerHTML = "Battery Level: " + level + "%";
    fillElement.style.width = level + '%';
    fillElement.style.backgroundColor = battery.charging ? '#22e0a7' : 'red';

    const userRef = ref(db, 'usersinf/' + user);
    update(userRef, {
        battery: level,
        charging: battery.charging ? "yes" : "no",
        lastdate: dateString,
        lasttime: timeString
    });

    const dbRef = ref(db, `groups/${groupname}/members/`);
    get(dbRef).then(snapshot => {
        if (snapshot.exists()) {
            const members = snapshot.val();
            let battery_others = "";

            let counter = 0;
            for (const [key, value] of Object.entries(members)) {
                if (value !== user) {
                    const getref = ref(db, `usersinf/${value}`);
                    get(getref).then(snapshot => {
                        if (snapshot.exists()) {
                            const memberBatteryLevel = snapshot.val().battery;
                            const memberCharging = snapshot.val().charging === "yes";
                            const fillColor = memberCharging ? '#22e0a7' : 'red';

                            battery_others += `
                                <h2>${value}'s Device Battery</h2>
                                <div class="battery-info">
                                    <span class="text">Battery Level: ${memberBatteryLevel}%</span>
                                </div>
                                <span class="text"><br>Updated on:<br>${snapshot.val().lastdate}<br>${snapshot.val().lasttime}</span>
                                <div class="battery-bar" id="battery-bar-${counter}">
                                    <div class="fill" style="width: ${memberBatteryLevel}%; background-color: ${fillColor};"></div>
                                </div>
                            `;
                            counter++;
                            document.getElementById("add_battery").innerHTML = battery_others;
                        } else {
                            console.log("No data available for member:", value);
                        }
                    }).catch(error => {
                        console.error("Error fetching member data:", error);
                    });
                }
            }
        } else {
            console.log("No members found for the group:", groupname);
        }
    }).catch(error => {
        console.error("Error fetching members:", error);
    });
}

function showFallbackBatteryStatus() {
    document.querySelector('.battery-status').innerHTML = "Battery Status API is not supported by your browser.";
}

let currentSpeed = null;

function updateSpeed() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const speed = position.coords.speed;
            const speedKmh = speed ? (speed * 3.6).toFixed(2) : "0.00";

            if (speedKmh !== currentSpeed) {
                currentSpeed = speedKmh;

                const groupRef = ref(db, 'usersinf/' + user);
                update(groupRef, { speed: speedKmh });

                let speed_all = "";
                const dbRef = ref(db, `groups/${groupname}/members/`);

                get(dbRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        const members = snapshot.val();

                        for (const [key, value] of Object.entries(members)) {
                            const getref = ref(db, `usersinf/` + value);
                            get(getref).then((snapshot) => {
                                if (snapshot.exists()) {
                                    if (value === user) {
                                        speed_all += `
                                            <div class="menu-item">
                                                <img src="reference_item/user.png" alt="Placeholder image of family member 1">
                                                <div class="menu-item-info">
                                                    <h2>${user}</h2>
                                                    <p>Me</p>
                                                </div>
                                                <span class="menu-item-speed">${speedKmh}Kmph</span>
                                            </div>`;
                                    } else {
                                        speed_all += `
                                            <div class="menu-item">
                                                <img src="reference_item/user.png" alt="Placeholder image of family member 1">
                                                <div class="menu-item-info">
                                                    <h2>${value}</h2>
                                                </div>
                                                <span class="menu-item-speed">${snapshot.val().speed}Kmph</span>
                                            </div>`;
                                    }
                                    document.getElementById('name_speed').innerHTML = speed_all;
                                } else {
                                    console.log("No data available");
                                }
                            }).catch((error) => {
                                console.error(error);
                            });
                        }
                    } else {
                        console.log("No members found for the group:", groupname);
                    }
                }).catch((error) => {
                    console.error("Error fetching members:", error);
                });
            }
        }, showError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    } else {
        document.getElementById('name_speed').innerHTML = `<div class="menu-item">
            <img src="https://www.ancodeai.com/placeholder.svg" alt="Placeholder image of family member 1">
            <div class="menu-item-info">
                <h2>My Device</h2>
                <p>Me</p>
            </div>
            <span class="menu-item-speed">Error</span>
        </div>`;
    }
}

function showError(error) {
    const errorMessage = `<div class="menu-item">
        <img src="https://www.ancodeai.com/placeholder.svg" alt="Placeholder image of family member 1">
        <div class="menu-item-info">
            <h2>My Device</h2>
            <p>Me</p>
        </div>
        <span class="menu-item-speed">Error</span>
    </div>`;
    document.getElementById('name_speed').innerHTML = errorMessage;
}

window.add_member = function() {
    window.location.href = "groupview.html";
}

getBatteryInfo();
getLocation();

setInterval(updateSpeed, 20000); 
