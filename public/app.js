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

    //create refs
    const dbRefObject = firebase.database().ref().child('object');

    //sync object changes
    dbRefObject.on('value', snap => console.log(snap.val()));


    const txtUser = document.getElementById('email');
    const txtPass = document.getElementById('pass');
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.addEventListener('click', e=>{
        const email = txtUser.value;
        const pass = txtPass.value;
        const auth = firebase.auth();

        const promise = auth.signInWithEmailAndPassword(email,pass);
        promise.catch(e => console.log(e.message));


    });

}());


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