const admin = document.getElementById('admin');
const score = document.getElementById('userscore');
const pointsto = document.getElementById('pointstonext');
const datetime = document.getElementById('datetime');
const form = document.getElementById("form");
const checkbox = document.querySelector('input[name=theme]');
var minPercent = 0;
var maxPercent = 1;
var minDate = 0;
var maxDate = 1;
var pts = [];
var datapts = [];
var jppts = [];
var jpdatapts = [];
var data = [];
var tickcount = 0;
var minval = 0;
var tickspace = 0;

(function () {
    // do theme
    if (localStorage.getItem("theme") == "dark") {
        checkbox.checked = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }

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

    db.ref('/info/minPercent').once('value').then((snapshot) => {
        minPercent = snapshot.node_.value_;
    });
    db.ref('/info/maxPercent').once('value').then((snapshot) => {
        maxPercent = snapshot.node_.value_;
    });
    db.ref('/info/minDate').once('value').then((snapshot) => {
        minDate = snapshot.node_.value_;
        datetime.min = (new Date(minDate)).toISOString();
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
        document.getElementById("datetimeADMIN").value = (new Date(minDate - tzoffset)).toISOString().slice(0, -1);
    });
    db.ref('/info/maxDate').once('value').then((snapshot) => {
        maxDate = snapshot.node_.value_;
        datetime.max = (new Date(maxDate)).toISOString();
        let x = new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0];
        datetime.value = x.substring(0, x.length - 3);
    });
    db.ref('/info/name').once('value').then((snapshot) => {
        document.getElementById('curr').innerHTML = "Current Ranking: " + snapshot.node_.value_;
        document.getElementById("title").value = snapshot.node_.value_;
    });
    db.ref('/info/minVal').once('value').then((snapshot) => {
        minval = snapshot.node_.value_;
        document.getElementById('min').value = minval;
    });
    db.ref('/info/tickCount').once('value').then((snapshot) => {
        tickcount = snapshot.node_.value_;
        document.getElementById('tick').value = tickcount;
    });
    db.ref('/info/tickSpace').once('value').then((snapshot) => {
        tickspace = snapshot.node_.value_;
        document.getElementById('tickspace').value = tickspace;
        value();
    });
    db.ref('/info/guide').once('value').then((snapshot) => {
        let guidelink = snapshot.node_.value_;
        document.getElementById('guide').href = guidelink;
        document.getElementById('guide').target = "_blank";
        document.getElementById("guideval").value = guidelink;
    });
    db.ref('/info/note').once('value').then((snapshot) => {
        let note = snapshot.node_.value_;
        if (!note) {
            note = "";
        }
        document.getElementById("note").innerHTML = note;
        document.getElementById("noteInput").value = note;
    })
    db.ref('jpcrowndata/0/').once('value', function (snap) {
        document.getElementById("jpscore").value = snap.val();
    })



    document.getElementById('loginBtn').addEventListener('click', e => {
        const email = document.getElementById('user').value;
        const pass = document.getElementById('pass').value;
        const auth = firebase.auth();

        auth.signInWithEmailAndPassword(email, pass)
            .then((user) => {
                document.getElementById('loginStatus').innerHTML = "";
            })
            .catch((error) => {
                document.getElementById('loginStatus').innerHTML = "There was an error when logging in. " + error.message;
            })
    });

    document.getElementById('logoutBtn').addEventListener('click', e => {
        firebase.auth().signOut();
        document.getElementById('enterinfo').innerHTML = "Enter information above then <a onclick=\"createAcc()\"><u>click here to create an account.</u></a>";
        document.getElementById('loginStatus').innerHTML = "";
        document.getElementById('forgot').innerHTML = `<p id="forgot" style="margin-bottom:0px;margin-top:0px;display:inline-block;">Forgot your password? Enter your email then <a onclick="sendPWReset()"><u>click here</u></a> to send a password reset email.</p>`;
    });

    // logging in/out
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            document.getElementById('user').value = "";
            document.getElementById('pass').value = "";
            document.getElementById('user').style.display = "none";
            document.getElementById('pass').style.display = "none";
            document.getElementById('loginBtn').style.display = "none";
            document.getElementById('logoutBtn').style.display = "block";
            document.getElementById('enterinfo').innerHTML = "";
            document.getElementById('forgot').innerHTML = "";
            document.getElementById('infoLogin').innerHTML = "You are logged in as " + user.email.substring(0, user.email.indexOf("@"));
            db.ref('/verified/' + firebase.auth().currentUser.uid).once('value').then((snapshot) => {
                if (snapshot.node_.value_) {
                    form.style.display = "block";
                    document.getElementById("need").style.display = "none";
                } else {
                    document.getElementById('loginStatus').innerHTML = "Please DM me on discord @flfff indicating you've created an account. ";
                }
            });
            db.ref('/admins/' + firebase.auth().currentUser.uid).once('value').then((snapshot) => {
                if (snapshot.node_.value_) {
                    admin.style.display = "block";
                    // jp data 86400000

                    let counter = 0;
                    let nacrown = db.ref('nacrowndata');
                    nacrown.once('value', function (snapshot) {
                        let entire = snapshot.val();
                        let entirelist = Object.entries(entire);
                        entirelist.shift();
                        entirelist.sort((a,b) => {
                            return a[1].date - b[1].date;
                        })
                        //console.log(entirelist);

                        entirelist.forEach(function(v){
                            let k = v[0];
                            let val = v[1];
                            //round to nearest minute
                            val.date = Math.round(val.date / 1000 / 60) * 60 * 1000
                            let row = document.createElement("tr");
                            let cell1 = document.createElement("td");
                            //console.log(val);
                            //<input id="datetime" type="datetime-local" class="time">
                            let cell1date = document.createElement("input");
                            cell1date.type = "datetime-local";
                            cell1date.classList.add("time");
                            cell1date.id = "natime" + counter;
                            datetime.min = (new Date(val.date)).toISOString();
                            let tzoffset = (new Date()).getTimezoneOffset() * 60000;
                            cell1date.value = (new Date(val.date - tzoffset)).toISOString().slice(0, -1);

                            let cell2 = document.createElement("td");
                            let input = document.createElement("input");
                            input.id = 'naedit' + counter;
                            input.classList.add("score");
                            input.addEventListener("click", e => {
                                input.select();
                            });
                            let cell2Text = document.createTextNode("");
                            input.appendChild(cell2Text);
                            input.value = val.score;
                            input.type = "number";
                            input.min = 1;
                            input.max = 999999;
                            
                            let label = document.createElement("p");
                            label.classList.add("underlabel")
                            label.textContent = k;
                            label.id = "nalabel" + counter;
                            let label2 = document.createElement("p");
                            label2.classList.add("underlabel");
                            label2.innerHTML = "&nbsp;";
                            cell1.appendChild(label);
                            cell1.appendChild(cell1date);
                            cell2.appendChild(label2);
                            cell2.appendChild(input);
                            row.appendChild(cell1);
                            row.appendChild(cell2);
                            counter++;
                            document.getElementById('natable').appendChild(row);
                        })
                    })


                    /*let counter = 0;
                    document.getElementById('jptable').innerHTML = "";
                    jpcrown.on('value', function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {
                            var row = document.createElement("tr");
                            var cell1 = document.createElement("td");
                            var cell1Text = document.createTextNode(new Date(minDate + counter * 86400000 / 2).toString().substring(0, 21));
                            var cell2 = document.createElement("td");
                            var input = document.createElement("input");
                            input.id = 'jpedit' + counter;
                            input.className = "jpedit";
                            input.addEventListener("click", e => {
                                input.select();
                            });
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
                            document.getElementById('jptable').appendChild(row);
                        })
                    });*/
                }
            });
        } else {
            document.getElementById('loginBtn').style.display = "block";
            document.getElementById('logoutBtn').style.display = "none";
            document.getElementById('user').style.display = "block";
            document.getElementById('pass').style.display = "block";
            document.getElementById('infoLogin').innerHTML = "";
            admin.style.display = "none";
            form.style.display = "none";
            document.getElementById("need").style.display = "block";
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

function createAcc() {
    const email = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((user) => {
            //signed in
        })
        .catch((error) => {
            document.getElementById('loginStatus').innerHTML = "There was an error when creating your account. " + error.message;
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
    datapts.sort(function (a, b) {
        return new Date(b.x) - new Date(a.x);
    });
    data = [{
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
    var chart = new Chart(ctx).Scatter(data, {
        emptyDataMessage: "Chart has no data...yet",
        bezierCurve: true,
        scaleShowLabels: true,
        scaleShowHorizontalLines: true,
        scaleShowVerticalLines: true,
        scaleGridLineWidth: 2,
        scaleOverride: true,
        scaleLabel: function (label) {
            return label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        scaleSteps: tickcount,
        scaleStepWidth: tickspace,
        scaleStartValue: minval,
        scaleType: "date",
        useUtc: false,
        scaleDateTimeFormat: "mmm d | H:MM",
        xScaleOverride: true,
        xScaleSteps: 7,
        xScaleStartValue: minDate,
        xScaleStepWidth: (maxDate - minDate) / 7,
        scaleTimeFormat: "mmm d",
        responsive: true,
        maintainAspectRatio: false,
        legendTemplate: "<%for(var i=0;i<datasets.length;i++){%>" + "&nbsp&nbsp" + "<span class=\"<%=name.toLowerCase()%>-legend-marker\" style=\"background-color:<%=datasets[i].strokeColor%>\"></span>" + "&nbsp" + "<%=datasets[i].label%><%}%>",
    });
    var legend = chart.generateLegend();
    document.getElementById("chart-legend").innerHTML = legend;
}
/*
        
*/

document.getElementById('pass').addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById('loginBtn').click();
    }
});

document.getElementById('user').addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById('loginBtn').click();
    }
});

document.getElementById('submitdata').addEventListener('click', e => {
    var enteredDate = (new Date(datetime.value)).getTime();
    /*var d = new Date();
    var localOffset = d.getTimezoneOffset() * 60000;
    var pst = (enteredDate + localOffset) + (3600000 * -8);*/
    if (score.value.length != 0 && score.checkValidity()) {
        if (pointsto.value.length != 0 && pointsto.checkValidity()) {
            if (enteredDate <= maxDate && enteredDate >= minDate) {
                const db = firebase.database().ref("/nacrowndata/");
                db.push().set({
                    date: enteredDate,
                    score: (parseInt(score.value) + parseInt(pointsto.value)),
                })
                score.value = "";
                pointsto.value = "";
                window.location.reload();
                // Checksum changed
                /*if (((parseInt(score.value) + parseInt(pointsto.value))
                        .toString()
                        .substring(0, ((parseInt(score.value) + parseInt(pointsto.value)).toString().length - 1))
                        .split('').map(Number)
                        .reduce((a, b) => a + b) * 2 % 10 == ((parseInt(score.value) + parseInt(pointsto.value)) % 10))) {
                    const db = firebase.database().ref("/nacrowndata/");
                    db.push().set({
                        date: enteredDate,
                        score: (parseInt(score.value) + parseInt(pointsto.value)),
                    })
                    score.value = "";
                    pointsto.value = "";
                    window.location.reload();
                } else {
                    document.getElementById('submitvalid').innerHTML = "The cutoff is incorrect as the checksum is invalid.";
                }*/
            } else {
                document.getElementById('submitvalid').innerHTML = "The inputted date is invalid.";
            }
        } else {
            document.getElementById('submitvalid').innerHTML = "The inputted points to next bracket score is invalid.";
        }
    } else {
        document.getElementById('submitvalid').innerHTML = "The inputted score is invalid.";
    }
});


document.getElementById('export').addEventListener('click', e => {
    var link = document.createElement('a');
    let canvas = document.getElementById("chart");
    let context = canvas.getContext("2d");
    // set background of canvas to white
    let w = canvas.width;
    let h = canvas.height;
    let data = context.getImageData(0, 0, w, h);
    let compositeOperation = context.globalCompositeOperation;
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = "white";
    context.fillRect(0, 0, w, h);
    let imageData = canvas.toDataURL();
    context.clearRect(0, 0, w, h);
    context.putImageData(data, 0, 0);
    context.globalCompositeOperation = compositeOperation;

    link.download = document.getElementById('curr').innerHTML.substring(17) + Date.now() + '.png';
    link.href = imageData;
    link.click();
})


document.getElementById('updateAll').addEventListener('click', e => {
    const db = firebase.database();
    var guide = document.getElementById('guideval').value;
    db.ref('/info/guide').set(guide);

    var minval = document.getElementById('min').value;
    var tick = document.getElementById('tick').value;
    var tickspace = document.getElementById('tickspace').value;
    db.ref('/info/minVal').set(parseInt(minval));
    db.ref('/info/tickCount').set(parseInt(tick));
    db.ref('/info/tickSpace').set(parseInt(tickspace));

    db.ref('/info/note').set(document.getElementById("noteInput").value)

    var enteredDate = (new Date(document.getElementById('datetimeADMIN').value)).getTime();
    db.ref('/info/minDate').set(enteredDate);
    db.ref('/info/maxDate').set(enteredDate + (86400000 * 7));

    db.ref('/info/name').set(document.getElementById('title').value);

    for (let i = 0; i < 15; i++) {
        db.ref('/jpcrowndata/' + i).set(document.getElementById('jpscore').value);
    }

    let natable = document.getElementById("natable");
    for(let i = 0; i < natable.rows.length-1; i++) {
        let time = (new Date(document.getElementById('natime' + i).value)).getTime();
        let score = document.getElementById("naedit" + i).value;
        let label = document.getElementById("nalabel" + i).textContent;
        //console.log(label, time, score);
        if(score == 0) {
            db.ref('/nacrowndata/' + label).remove();
        } else {
            db.ref('/nacrowndata/' + label + "/date").set(time);
            db.ref('/nacrowndata/' + label + "/score").set(score);
        }
    }

    window.location.reload();
});

document.getElementById("endrank").addEventListener("click", e => {
    const db = firebase.database();
    let nadata = [];
    let jpdata = [];
    data[0].data.forEach(function (ele) {
        nadata.push({
            x: new Date(ele.x).getTime(),
            y: ele.y
        });
    });
    data[1].data.forEach(function (ele) {
        jpdata.push({
            x: new Date(ele.x).getTime(),
            y: ele.y
        });
    });
    let newdata = [{
        label: 'NA Crown',
        strokeColor: '#A31515',
        data: nadata
    },
    {
        label: 'JP Crown  ',
        strokeColor: '#007acc',
        data: jpdata
    }
    ];
    let past = {
        data: newdata,
        name: document.getElementById('curr').innerHTML.substring(17),
        minDate: minDate,
        maxDate: maxDate,
        minVal: minval,
        tickCount: tickcount,
        tickSpace: tickspace
    }
    let pastid = genUUID();
    db.ref('/past/' + pastid).set(past);
    window.location.reload();
});

function genUUID() {
    return '' + Math.random().toString(36).substring(2, 10);
};

document.getElementById("delete").addEventListener("click", e => {
    let r = confirm("Are you sure you want to delete all NA data?");
    if (r) {
        let db = firebase.database();
        db.ref('/nacrowndata/').remove();
        db.ref('/nacrowndata/').set({
            0: 0
        });
        window.location.reload();
    }
});

document.getElementById("pointstonext").addEventListener("keypress", function (e) {
    if (e.key == "Enter") {
        document.getElementById('submitdata').click();
    }
});

function value() {
    var minval = parseInt(document.getElementById('min').value) || 0;
    var tick = parseInt(document.getElementById('tick').value) || 0;
    var tickspace = parseInt(document.getElementById('tickspace').value) || 0;
    document.getElementById("calcmax").innerHTML = "Calculated max value: " + (minval + (tick * tickspace)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
}

document.getElementById("min").addEventListener("input", e => {
    value();
});
document.getElementById("tick").addEventListener("input", e => {
    value();
});
document.getElementById("tickspace").addEventListener("input", e => {
    value();
});

// document.getElementById("propBtn").addEventListener("click", e => {
//     for (let i = 0; i <= 14; i++) {
//         document.getElementById(`jpedit${i}`).value = document.getElementById("prop").value;
//     }
// })

checkbox.addEventListener('change', function () {
    if (this.checked) {
        trans()
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem("theme", "dark");
    } else {
        trans()
        document.documentElement.setAttribute('data-theme', 'light')
        localStorage.setItem("theme", "light");
    }
})

let trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition')
    }, 500)
}