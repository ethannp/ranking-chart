const txtUser = document.getElementById('user');
const txtPass = document.getElementById('pass');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const infoLogin = document.getElementById('infoLogin');
const admin = document.getElementById('admin');

(function () {
    var firebaseConfig = {
        apiKey: "AIzaSyC4zbil44wr1l7QjJ8EbKwbTi4h3jxDycc",
        authDomain: "ranking-chart.firebaseapp.com",
        databaseURL: "https://ranking-chart-default-rtdb.firebaseio.com",
        projectId: "ranking-chart",
        storageBucket: "ranking-chart.appspot.com",
        messagingSenderId: "649390732902",
        appId: "1:649390732902:web:93430fc6aa6bd63f499fa7",
        measurementId: "G-28E2XFZ5CQ"
    };
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const db= firebase.database();

    //sync object changes
    //dbAdmin.on('value', snap => snap.val());

    loginBtn.addEventListener('click', e => {
        const email = txtUser.value;
        const pass = txtPass.value;
        const auth = firebase.auth();

        const promise = auth.signInWithEmailAndPassword(email, pass);
        promise.catch(e => e); //console.log(e.message)
    });

    logoutBtn.addEventListener('click', e => {
        firebase.auth().signOut();
    });

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            txtUser.value = "";
            txtPass.value = "";
            txtUser.style.display = "none";
            txtPass.style.display = "none";
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
            infoLogin.innerHTML="You are logged in as " + user.email.substring(0,user.email.indexOf("@"));
            var dbAdmin = db.ref('/admins/'+firebase.auth().currentUser.uid).once('value').then((snapshot) =>{
                if(snapshot.node_.value_ == "admin"){
                    var h=document.createElement("H1");
                    var t=document.createTextNode("Admin Panel")
                    h.appendChild(t);
                    admin.appendChild(h);
                    admin.style.display = "block";
                }
            });
        } else {
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            txtUser.style.display = "block";
            txtPass.style.display = "block";
            infoLogin.innerHTML="";
            admin.style.display = "none";
        }
    });

}());

txtPass.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      loginBtn.click();
    }
  });


var data = [
    {
        label: 'NA Score',
        strokeColor: '#ff6384',
        data: [
            {
                x: new Date('2011-04-11T11:45:00'),
                y: 25
            },
            {
                x: new Date('2011-04-11T12:51:00'),
                y: 28
            },
            {
                x: new Date('2011-04-11T14:10:00'),
                y: 22
            },
            {
                x: new Date('2011-04-11T15:15:00'),
                y: 18
            },
            {
                x: new Date('2011-04-11T17:00:00'),
                y: 25
            },
            {
                x: new Date('2011-04-11T21:00:00'),
                y: 24
            },
            {
                x: new Date('2011-04-12T13:00:00'),
                y: 24
            }
        ]
    }];

var ctx = document.getElementById('chart').getContext('2d');

var chart = new Chart(ctx).Scatter(data, {
    bezierCurve: true,
    scaleShowHorizontalLines: true,
    scaleShowLabels: true,
    scaleType: "date",
    scaleLabel: "<%=value%>"
});