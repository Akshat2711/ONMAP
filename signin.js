import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

// Initialize database
const db = getDatabase();

function signinaccount() {
    var username = document.getElementById("name").value;
    var userpass = document.getElementById("pass").value;

    let usercheck = [];
    const dbRef = ref(db);
    
    get(child(dbRef, 'usersinf'))
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    usercheck.push(childSnapshot.val());
                });

                let userFound = false;

                for (var i = 0; i < usercheck.length; i++) {
                    if (usercheck[i]['user'] === username && usercheck[i]['pass'] === userpass) {
                        var localuserstorage = usercheck[i]["user"];
                        localStorage.setItem("username", JSON.stringify(localuserstorage));
                        
                        window.location.href = "mainmenu.html";
                        userFound = true;
                        break; // Stop loop once user is found
                    }
                }

                if (!userFound) {
                    alert("No User Found!");
                }
            } else {
                alert("No User Data Found in the Database!");
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
            alert("An error occurred while checking user credentials.");
        });
}


document.getElementById("signin").addEventListener("click", signinaccount);
