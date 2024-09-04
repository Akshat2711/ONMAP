import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Get group name from localStorage and remove quotes
var groupname = (localStorage.getItem("groupname") || "").replace(/"/g, '');

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
const db = getDatabase(app);

const dbRef = ref(db, `groups/${groupname}/members/`);
var all_members = "";

// Fetch members from Firebase
get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
        const members = snapshot.val();
        all_members = ""; // Clear any previous HTML content
        
        // Loop through members if it's an object or array
        if (Array.isArray(members)) {
            members.forEach(member => {
                all_members += generateMemberHTML(member);
            });
        } else if (typeof members === 'object') {
            Object.values(members).forEach(member => {
                all_members += generateMemberHTML(member);
            });
        }

        // Update the HTML content
        document.getElementById("members").innerHTML = all_members;
    } else {
        console.log("No members found in the group.");
        document.getElementById("members").innerHTML = "<p>No members found.</p>";
    }
}).catch((error) => {
    console.error("Error fetching members:", error);
});

// Function to generate HTML for a member
function generateMemberHTML(member) {
    return `
        <li class="flex items-center justify-between py-2 border-b">
            <span class="text-white"><br>${member}</br></span>
            <button onclick="remove_member('${member}')">
                <i class="fas fa-times text-red-500 cursor-pointer"></i>
            </button>
        </li>`;
}

// Function to add a new member
window.add = function() {
    var entry_data = document.getElementById("new-member").value.trim();
    let baseUsername = "member";
    let member_no = 1;
    let all_person = [];

    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const members = snapshot.val();
            console.log("Members data:", members);

            // Collect all usernames into the all_person array
            for (const [key, value] of Object.entries(members)) {
                all_person.push(key);
            }

            // Generate a unique username
            let username = baseUsername;
            while (all_person.includes(username)) {
                username = baseUsername + member_no;
                member_no++;
            }
            
            final_add(username, entry_data);
        }
    }).catch((error) => {
        console.error("Error fetching data for unique username:", error);
    });
};

// Function to add a member to Firebase
function final_add(username, entry_data) {
    let allFolders = [];

    // Reference to the 'userinf' path
    const userinfRef = ref(db, 'usersinf');

    // Read data from 'userinf' and extract keys
    get(userinfRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Data at 'userinf':", data);

            // Extract folder names (keys) and add them to allFolders array
            allFolders = Object.keys(data);
        } else {
            console.log("No data available at 'userinf'.");
        }

        // Proceed with updating the group after reading 'userinf'
        const groupRef = ref(db, `groups/${groupname}/members`);

        if (allFolders.includes(entry_data)) {
            const updates = {};
            updates[username] = entry_data; // Use computed property name

            update(groupRef, updates)
                .then(() => {
                    alert("Member added!");
                    // Optionally refresh the members list
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error adding member:", error);
                });
        } else {
            alert("No user found!");
        }
    }).catch((error) => {
        console.error("Error fetching data from 'userinf':", error);
    });
}

// Function to remove a member
window.remove_member = function(member) {
    const dbRef = ref(db, `groups/${groupname}/members/`);

    if (confirm("Press OK to confirm deletion")) {
        get(dbRef).then((snapshot) => {
            if (snapshot.exists()) {
                const members = snapshot.val();
                for (const [key, value] of Object.entries(members)) {
                    if (value === member) {
                        const dataRef = ref(db, `groups/${groupname}/members/${key}`);
                        remove(dataRef)
                            .then(() => {
                                alert("Member removed!");
                                window.location.reload(); // Refresh the members list
                            })
                            .catch((error) => {
                                console.error("Error removing member:", error);
                            });
                    }
                }
            }
        }).catch((error) => {
            console.error("Error fetching members:", error);
        });
    } else {
        alert("Member not removed!");
    }
};
