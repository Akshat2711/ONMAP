import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";


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
//extratowrite 
import {getDatabase,ref,child,get,set,update,remove} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js"
const db=getDatabase();
///////////////////////////////DATABASE ABOVE CONNECTION OBJ//////////////////////////////////////////////////////////////////////////////////////////////////////////


var generatedotp;
var username=document.getElementById("name").value;
var userpass=document.getElementById("pass").value;






function submitform()
{
var username=document.getElementById("name").value;
username=username.replace(/"/g, '');
var userpass=document.getElementById("pass").value;



const dbRef=ref(db);
  set(ref(db,'usersinf/'+username),{
    user:username,pass:userpass,longitude:" ",latitude:" ",battery:" ",speed:" ",charging:""}
).then(()=>{
    console.log("database updated succesfully!");
    window.location.href="index.html";
}).catch((error)=>{
    alert("unsuccesfull");
    console.log("error unable to add data to database!");
})










}







submit.addEventListener("click",submitform);
