//ai integration pending in this chat???



// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getDatabase, ref, child, get, set, serverTimestamp, query, orderByChild } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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
var groupname = (localStorage.getItem("groupname")).replace(/"/g, '');
var user= (localStorage.getItem("username") || '').replace(/"/g, '');


// Add Data Function
function AddData() {
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
    get(child(dbRef, 'groups/'+groupname+"/chats/"))
        .then((snapshot) => {
            snapshot.forEach(childSnapshot => {
                students.push(childSnapshot.val());
            });
            console.log(students);
            for (var i = 0; i < students.length; i++) {
                for (var j = 0; j < students.length; j++) {
                    if (students[j]["chatno"] === username) {
                        username = 'chat' + "{" + String(userNo) + "}";
                        console.log(username);
                        userNo++;
                    }
                }
            }
            finalAdd(username, chatMsg);
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
    set(ref(db,'groups/'+groupname+"/chats/"+username ), {
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
    const dbRef = ref(db, 'groups/'+groupname+"/chats/");
    const messagesQuery = query(dbRef, orderByChild('timestamp'));

    get(messagesQuery).then((snapshot) => {
        let students = [];
        snapshot.forEach((childSnapshot) => {
            students.push(childSnapshot.val());
        });

        let allData = "";
        console.log(students);
        students.forEach(student => {

           if (student.msgfrom===user) {
                allData += `<div class="container"><div class="upper-text">${student.msgfrom}</div><div class="message-container"><div class="character-picture"></div><div class="message">${student.msg}</div></div></div><br><br><br>`;
            } else{
                allData += `<div class="container"><div class="upper-text">${student.msgfrom}</div><div class="message-container"><div class="character-picture"></div><div class="message" id="sender">${student.msg}</div></div></div><br><br><br>`;
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


//enter key to submit
document.getElementById("Fnamemsg").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        AddData(); 
    }
});

retrieveData();

document.getElementById('AddBtn').addEventListener('click', AddData);
