const ranking = document.getElementById('curr');
const txtUser = document.getElementById('user');
const txtPass = document.getElementById('pass');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const infoLogin = document.getElementById('infoLogin');
const admin = document.getElementById('admin');
const score = document.getElementById('userscore');
const pointsto = document.getElementById('pointstonext');
const datetime = document.getElementById('datetime');
const percent = document.getElementById('percent');
const submitdata = document.getElementById('submitdata');
const jptable = document.getElementById('jptable');
const jpBtn = document.getElementById('updateJP')
var minPercent = 0;
var maxPercent = 1;
var minDate = 0;
var maxDate = 1;
var pts = [];
var datapts = [];
var jppts = [];
var jpdatapts = [];
var data = [];

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

    const db = firebase.database();

    //sync object changes
    //db.on('value', snap => snap.val());

    db.ref('/info/minPercent').once('value').then((snapshot) => {
        document.getElementById('percent').min = snapshot.node_.value_;
        minPercent = snapshot.node_.value_;
    });
    db.ref('/info/maxPercent').once('value').then((snapshot) => {
        document.getElementById('percent').max = snapshot.node_.value_;
        maxPercent = snapshot.node_.value_;
        document.getElementById("percentlabel").innerHTML = "Percent (Enter a number from " + minPercent + ".0 to " + maxPercent + ".0)";
    });
    db.ref('/info/minDate').once('value').then((snapshot) => {
        minDate = snapshot.node_.value_;
        datetime.min = (new Date(minDate)).toISOString();
    });
    db.ref('/info/maxDate').once('value').then((snapshot) => {
        maxDate = snapshot.node_.value_;
        datetime.max = (new Date(maxDate)).toISOString();
        let x = new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0];
        datetime.value = x.substring(0, x.length - 3);
    });
    db.ref('/info/name').once('value').then((snapshot) => {
        ranking.innerHTML = "Current Ranking: " + snapshot.node_.value_;
    });


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

    // logging in/out
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            txtUser.value = "";
            txtPass.value = "";
            txtUser.style.display = "none";
            txtPass.style.display = "none";
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
            infoLogin.innerHTML = "You are logged in as " + user.email.substring(0, user.email.indexOf("@"));
            db.ref('/admins/' + firebase.auth().currentUser.uid).once('value').then((snapshot) => {
                if (snapshot.node_.value_) {
                    admin.style.display = "block";
                    // jp data 86400000
                    var jpcrown = db.ref('jpcrowndata');
                    let counter=0;
                    jpcrown.on('value', function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {
                            var row = document.createElement("tr");
                            var cell1 = document.createElement("td");
                            var cell1Text = document.createTextNode(new Date(minDate+ counter*86400000/2).toString().substring(0,21));
                            var cell2 = document.createElement("td");
                            var cell2Text = document.createTextNode(childSnapshot.val().score);
                            cell1.appendChild(cell1Text);
                            cell2.appendChild(cell2Text);
                            row.appendChild(cell1);
                            row.appendChild(cell2);
                            counter++;
                            jptable.appendChild(row);
                        })
                    });
                }
            });
        } else {
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            txtUser.style.display = "block";
            txtPass.style.display = "block";
            infoLogin.innerHTML = "";
            admin.style.display = "none";
        }
    });

    // get data from firebase
    var nacrown = db.ref('nacrowndata');
    nacrown.on('value', function (snapshot) {
        pts = [];
        datapts = [];
        data = [];
        snapshot.forEach(function (childSnapshot) {
            pts.push(childSnapshot.val());
        })
    });

    var jpcrown = db.ref('jpcrowndata');
    jpcrown.on('value', function (snapshot) {
        jppts = [];
        jpdatapts = [];
        snapshot.forEach(function (childSnapshot) {
            jppts.push(childSnapshot.val());
        })
        formatPts();
    })
}());

function formatPts() {
    pts.forEach(element => {
        datapts.push({
            x: new Date(element.date),
            y: element.score
        })
    });
    jppts.forEach(element => {
        jpdatapts.push({
            x: new Date(element.date),
            y: element.score
        })
    });
    datapts.shift();
    data = [
        {
            label: 'NA Crown',
            strokeColor: '#A31515',
            data: datapts
        },
        {
            label: 'JP Crown',
            strokeColor: '#007acc',
            data: jpdatapts
        }
    ];
    var ctx = document.getElementById('chart').getContext('2d');
    var chart = new Chart(ctx).Scatter(data,
        {
            emptyDataMessage: "Chart has no data...yet",
            bezierCurve: true,
            scaleShowLabels: true,
            scaleShowHorizontalLines: true,
            scaleShowVerticalLines: false,
            scaleOverride: true,
            scaleLabel: "<%=value%>",
            scaleSteps: 4,
            scaleStepWidth: 500,
            scaleStartValue: 225000,
            scaleType: "date",
            useUtc: false,
            scaleDateTimeFormat: "mmm d | hh:mm",
            xScaleOverride: true,
            xScaleSteps: 14,
            xScaleStartValue: minDate,
            xScaleStepWidth: (maxDate - minDate) / 14,
        });
}
/*
        
*/

txtPass.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        loginBtn.click();
    }
});

submitdata.addEventListener('click', e => {
    var enteredDate = (new Date(datetime.value)).getTime();
    var d = new Date();
    var localOffset = d.getTimezoneOffset() * 60000;
    var pst = (enteredDate + localOffset) + (3600000 * -8);
    if (score.value.length != 0 && score.checkValidity() && pointsto.value.length != 0 && pointsto.checkValidity() && percent.checkValidity() && percent.value.length != 0 && pst <= maxDate && pst >= minDate) {
        const db = firebase.database().ref("/nacrowndata/");
        db.push().set({
            date: pst,
            score: (parseInt(score.value) + parseInt(pointsto.value)),
        })
        document.getElementById('submitvalid').innerHTML = "Data successfully added."
        score.value = "";
        pointsto.value = "";
        percent.value = "";
    }
});