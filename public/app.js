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
const jpBtn = document.getElementById('updateJP');
const exportBtn = document.getElementById('export');
const updTitle = document.getElementById("updatetitle");
const form = document.getElementById("form");
const need = document.getElementById("need");
const datetimeAdmin = document.getElementById('updateDate');
const datetimeval = document.getElementById('datetimeADMIN');
const updGraph = document.getElementById('editgraph');
const guide = document.getElementById('guide');
const guidelink = document.getElementById('guidelink');
var minPercent = 0;
var maxPercent = 1;
var minDate = 0;
var maxDate = 1;
var pts = [];
var datapts = [];
var jppts = [];
var jpdatapts = [];
var data = [];
var tickcount=0;
var minval=0;

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
    db.ref('/info/minVal').once('value').then((snapshot) => {
        minval = snapshot.node_.value_;
        document.getElementById('min').value = minval;
    });
    db.ref('/info/tickCount').once('value').then((snapshot) => {
        tickcount = snapshot.node_.value_;
        document.getElementById('tick').value = tickcount;
    });
    db.ref('/info/guide').once('value').then((snapshot) => {
        guide.href = snapshot.node_.value_;
        guide.target = "_blank";
    });


    loginBtn.addEventListener('click', e => {
        const email = txtUser.value;
        const pass = txtPass.value;
        const auth = firebase.auth();

        auth.signInWithEmailAndPassword(email, pass)
        .then((user) => {
            document.getElementById('loginStatus').innerHTML ="";
        })
        .catch((error) => {
            document.getElementById('loginStatus').innerHTML = "There was an error when logging in. "+error.message;
        })
    });

    logoutBtn.addEventListener('click', e => {
        firebase.auth().signOut();
        document.getElementById('enterinfo').innerHTML = "Enter information above then <a onclick=\"createAcc()\"><u>click here to create an account.</u></a>";
        document.getElementById('loginStatus').innerHTML = "";
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
            document.getElementById('enterinfo').innerHTML = "";
            infoLogin.innerHTML = "You are logged in as " + user.email.substring(0, user.email.indexOf("@"));
            db.ref('/verified/'+firebase.auth().currentUser.uid).once('value').then((snapshot) => {
                if (snapshot.node_.value_) {
                    form.style.display = "block";
                    need.style.display = "none";
                }
                else{
                    document.getElementById('loginStatus').innerHTML = "Please wait for me to verify your email. You should DM me on discord @fluff#2368 to speed up the process in case I don't check. ";
                }
            });
            
            db.ref('/admins/' + firebase.auth().currentUser.uid).once('value').then((snapshot) => {
                if (snapshot.node_.value_) {
                    admin.style.display = "block";
                    // jp data 86400000
                    var jpcrown = db.ref('jpcrowndata');
                    let counter = 0;
                    jpcrown.on('value', function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {
                            var row = document.createElement("tr");
                            var cell1 = document.createElement("td");
                            var cell1Text = document.createTextNode(new Date(minDate + counter * 86400000 / 2).toString().substring(0, 21));
                            var cell2 = document.createElement("td");
                            var input = document.createElement("input");
                            input.id = 'jpedit' + counter;
                            input.className = "jpedit";
                            var cell2Text = document.createTextNode("");
                            input.appendChild(cell2Text);
                            input.value = childSnapshot.val();
                            input.type = "number";
                            input.min = 0;
                            input.max = 999999;
                            cell1.appendChild(cell1Text);
                            cell2.appendChild(input);
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
            form.style.display = "none";
            need.style.display = "block";
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

function createAcc(){
    const email = txtUser.value;
    const pass = txtPass.value;
    firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then((user) =>{
        //signed in
    })
    .catch((error) => {
        document.getElementById('loginStatus').innerHTML ="There was an error when creating your account. "+error.message;
    })
}

function formatPts() {
    pts.forEach(element => {
        datapts.push({
            x: new Date(element.date),
            y: element.score
        })
    });
    let count = 0;
    jppts.forEach(element => {
        jpdatapts.push({
            x: new Date(minDate + count * 86400000 / 2),
            y: element
        })
        count++;
    });
    datapts.shift();
    datapts.sort(function(a,b){
        return new Date(b.x)-new Date(a.x);
    });
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
            scaleShowVerticalLines: true,
            scaleGridLineWidth: 1,
            scaleOverride: true,
            scaleLabel: function(label){return label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");},
            scaleSteps: tickcount,
            scaleStepWidth: 500,
            scaleStartValue: minval,
            scaleType: "date",
            useUtc: false,
            scaleDateTimeFormat: "mmm d | H:MM",
            xScaleOverride: true,
            xScaleSteps: 7,
            xScaleStartValue: minDate,
            xScaleStepWidth: (maxDate - minDate) / 7,
            scaleTimeFormat: "mmm d",
            legendTemplate: "<%for(var i=0;i<datasets.length;i++){%>"+"&nbsp&nbsp"+"<span class=\"<%=name.toLowerCase()%>-legend-marker\" style=\"background-color:<%=datasets[i].strokeColor%>\"></span>"+"&nbsp"+"<%=datasets[i].label%><%}%>"
        });
        var legend = chart.generateLegend();
        document.getElementById("chart-legend").innerHTML = legend;
}
/*
        
*/

txtPass.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        loginBtn.click();
    }
});

txtUser.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        loginBtn.click();
    }
});

submitdata.addEventListener('click', e => {
    var enteredDate = (new Date(datetime.value)).getTime();
    /*var d = new Date();
    var localOffset = d.getTimezoneOffset() * 60000;
    var pst = (enteredDate + localOffset) + (3600000 * -8);*/
    if (score.value.length != 0 && score.checkValidity() && pointsto.value.length != 0 && pointsto.checkValidity() && percent.checkValidity() && percent.value.length != 0 && enteredDate <= maxDate && enteredDate >= minDate) {
        const db = firebase.database().ref("/nacrowndata/");
        db.push().set({
            date: enteredDate,
            score: (parseInt(score.value) + parseInt(pointsto.value)),
        })
        score.value = "";
        pointsto.value = "";
        percent.value = "";
        window.location.reload();
    }
});

jpBtn.addEventListener('click', e => {
    const db = firebase.database();
    for (let i = 0; i < 15; i++) {
        db.ref('/jpcrowndata/' + i).set(document.getElementById('jpedit' + i).value);
    }
    window.location.reload();
});

exportBtn.addEventListener('click', e=>{
    var link = document.createElement('a');
    link.download = ranking.innerHTML.substring(17)+'.png';
    link.href = document.getElementById('chart').toDataURL()
    link.click();
})

updTitle.addEventListener('click', e=>{
    const db = firebase.database();
    db.ref('/info/name').set(document.getElementById('title').value);
    window.location.reload();
})

datetimeAdmin.addEventListener('click', e=> {
    const db = firebase.database();
    var enteredDate = (new Date(datetimeval.value)).getTime();
    db.ref('/info/minDate').set(enteredDate);
    db.ref('/info/maxDate').set(enteredDate+(86400000*7));
    window.location.reload();
});

updGraph.addEventListener('click', e=>{
    const db = firebase.database();
    var minval = document.getElementById('min').value;
    var tick = document.getElementById('tick').value;
    db.ref('/info/minVal').set(parseInt(minval));
    db.ref('/info/tickCount').set(parseInt(tick));
    window.location.reload();
});

guidelink.addEventListener('click', e => {
    const db = firebase.database();
    var guide = document.getElementById('guideval').value;
    db.ref('/info/guide').set(guide);
    window.location.reload();
});