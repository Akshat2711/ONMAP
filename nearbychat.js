// Firebase Initialization
//api key recharge req


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getDatabase, ref, child, get, set, serverTimestamp, query, orderByChild, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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
var user = (localStorage.getItem("username") || '').replace(/"/g, '');

// Global variable for nearby users
let nearby_user = [];



//chatgpt
async function getAIResponse(prompt) {
    const apiKey = ""; 
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo", // Or another correct model name
            messages: [
                { role: "user", content: prompt }
            ],
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim(); 
}





// Add Data Function
async function AddData() {
    let chatMsg = document.getElementById("Fnamemsg").value;
    
    // Sanitize and validate chatMsg
    chatMsg = sanitizeChatMsg(chatMsg);

    if (!validateChatMsg(chatMsg)) {
        alert("Invalid message");
        return;
    }

    let username = 'chat';
    let userNo = 0;
    var students = [];
    const dbRef = ref(db);

    get(child(dbRef, 'groups/' + "/localchats/"))
        .then((snapshot) => {
            snapshot.forEach(childSnapshot => {
                students.push(childSnapshot.val());
            });

            for (var i = 0; i < students.length; i++) {
                for (var j = 0; j < students.length; j++) {
                    if (students[j]["chatno"] === username) {
                        username = 'chat' + "{" + String(userNo) + "}";
                        userNo++;
                    }
                }
            }

            if (chatMsg.includes("@ai")) {
                // Call AI and add response to chat
                getAIResponse(chatMsg.replace("@ai", "")).then(aiResponse => {
                    finalAdd(username,sanitizeChatMsg("YOUR PROMPT:\n"+chatMsg+"\n\n\nANSWER BY AI:\n"+aiResponse));
                }).catch(error => {
                    console.error("Error fetching AI response: ", error);
                    finalAdd(username, "AI:Error processing your request 😥😥");
                });
            } else {
                finalAdd(username, chatMsg);
            }
        });
}


// Function to sanitize chatMsg
function sanitizeChatMsg(chatMsg) {
    // Example: replace special characters or escape HTML
    return chatMsg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Function to validate chatMsg
function validateChatMsg(chatMsg) {
    // Example: check if message is not empty
    return chatMsg.trim().length > 0;
}







// Final Add Function
function finalAdd(username, chatMsg) {
    set(ref(db, 'groups/' + "/localchats/" + username), {
        msgfrom: user,
        msg: chatMsg,
        chatno: username,
        timestamp: serverTimestamp()
    })
        .then(() => {
            console.log("Data added successfully");
        })
        .catch((error) => {
            alert("Unsuccessful");
            console.log("Error: ", error);
        });

    // Scroll to bottom after adding data
    setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, 100); // Timeout to allow for content update before scrolling
    location.reload();
}

// Retrieve Data Function
function retrieveData() {
    const dbRef = ref(db, 'groups/' + "/localchats/");
    const messagesQuery = query(dbRef, orderByChild('timestamp'));

    get(messagesQuery).then((snapshot) => {
        let students = [];
        snapshot.forEach((childSnapshot) => {
            students.push(childSnapshot.val());
        });

        let allData = "";

        students.forEach(student => {
            if (nearby_user.includes(student.msgfrom)) {
                if (student.msgfrom === user) {
                    allData += `<div class="container"><div class="upper-text">${student.msgfrom}</div><div class="message-container"><div class="character-picture"></div><div class="message">${student.msg}</div></div></div><br><br><br>`;
                } else {
                    allData += `<div class="container"><div class="upper-text">${student.msgfrom}</div><div class="message-container"><div class="character-picture"></div><div class="message" id="sender">${student.msg}</div></div></div><br><br><br>`;
                }
            }
        });

        const displayMenu = document.getElementById("display");
        displayMenu.innerHTML = allData;

        // Scroll to bottom after setting the innerHTML
        setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
        }, 100); // Timeout to allow for content rendering before scrolling
    }).catch(error => {
        console.error("Error fetching data:", error);
    });
}

// Finds the current location
let latitude1, longitude1;
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            latitude1 = position.coords.latitude;
            longitude1 = position.coords.longitude;
            console.log(latitude1, longitude1);
            const groupRef = ref(db, 'usersinf/' + user);
            update(groupRef, { longitude: longitude1, latitude: latitude1 })

            findNearbyUsers();
        });
    }
}

function findNearbyUsers() {
    let usercheck = [];
    const dbRef = ref(db);
    get(child(dbRef, 'usersinf'))
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    usercheck.push(childSnapshot.val());
                });

                for (var i = 0; i < usercheck.length; i++) {
                    if (haversineDistance(latitude1, longitude1, usercheck[i]['latitude'], usercheck[i]['longitude']) < 10) {
                        nearby_user.push(usercheck[i]['user']);
                    }
                }

                // Clear the allowed_list before appending
                const allowedList = document.getElementById("allowed_list");
                allowedList.innerHTML = '';

                // Append each nearby user to the allowed_list
                for (var i = 0; i < nearby_user.length; i++) {
                    const listItem = document.createElement("li");
                    listItem.textContent = nearby_user[i];
                    allowedList.appendChild(listItem);
                }

                console.log(nearby_user);
                retrieveData();
            }
        })
        .catch((error) => {
            console.error("Error finding nearby users: ", error);
        });
}


function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

//enter key to submit
document.getElementById("Fnamemsg").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        AddData(); 
    }
});

document.getElementById('AddBtn').addEventListener('click', AddData);
getLocation();
