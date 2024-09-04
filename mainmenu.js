// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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
var user = (localStorage.getItem("username")).replace(/"/g, '');
console.log(user);
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// Function to create a group
function creategroup() {
    let group_name = document.getElementById("add_field").value;
    console.log(group_name);
    if (group_name) {
        set(ref(db, 'groups/' + group_name + "/members"), { member1: user })
            .then(() => {
                console.log("Group Created");
            })
            .catch((error) => {
                alert("Error some issue");
                console.log("Error: ", error);
            });

        set(ref(db, 'groups/' + group_name + "/chats/chat/"), {
            msgfrom: user,
            msg: "group created!",
            timestamp: serverTimestamp()
        })
            .then(() => {
                console.log("Chat initialized in the group");
            })
            .catch((error) => {
                alert("Error some issue");
                console.log("Error: ", error);
            });
    } else {
        alert("Group name cannot be empty");
    }
}

// Function to retrieve and display data
function retrieveData() {
    const dbRef = ref(db, 'groups');
    get(dbRef).then((snapshot) => {
        let folderNames = [];
        let allData = "";
        snapshot.forEach((childSnapshot) => {
            const groupName = childSnapshot.key;
            const membersRef = ref(db, `groups/${groupName}/members`);
            get(membersRef).then((membersSnapshot) => {
                if (membersSnapshot.exists()) {
                    const members = membersSnapshot.val();
                    const membersList = Object.values(members);
                    if (membersList.includes(user)) {
                        folderNames.push(groupName);
                        allData += `<button onclick="next_grp_btn('${groupName}')" class="group-link">
                            <h5>${groupName}</h5>
                            <p>Description for ${groupName}.</p>
                        </button>`;
                    }
                } else {
                    console.log("No members found for " + groupName);
                }

                const displayMenu = document.getElementById("display");
                displayMenu.innerHTML = allData;

                // Scroll to bottom after setting the innerHTML
                setTimeout(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                }, 100); // Timeout to allow for content rendering before scrolling
            }).catch((error) => {
                console.error("Error fetching members for " + groupName + ":", error);
            });
        });
    }).catch(error => {
        console.error("Error fetching data:", error);
    });
}

// Function to handle button click
window.next_grp_btn = function (groupName) {
    console.log("Group clicked:", groupName);
    localStorage.setItem("groupname",JSON.stringify(groupName));
    // Use `groupName` to handle navigation or logic as needed
    window.location.href = `main.html`;
};

// Initialize data retrieval and event listener
retrieveData();
document.getElementById('create_grp_btn').addEventListener('click', creategroup);
