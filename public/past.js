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
});

$(async function () {
    loadPast();
});

async function loadPast() {
    let pastchart = await getChart();
    const allpast = document.getElementById("allpast");
    let i = 0;
    pastchart.forEach(function (item) {
        let canv = document.createElement("canvas");
        let ctx = canv.getContext('2d');
        canv.height = "400";
        canv.width = document.getElementById("top").offsetWidth * 0.9;
        let data = item.data;
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
            scaleSteps: item.tickCount,
            scaleStepWidth: item.tickSpace,
            scaleStartValue: item.minVal,
            scaleType: "date",
            useUtc: false,
            scaleDateTimeFormat: "mmm d | H:MM",
            xScaleOverride: true,
            xScaleSteps: 7,
            xScaleStartValue: item.minDate,
            xScaleStepWidth: (item.maxDate - item.minDate) / 7,
            scaleTimeFormat: "mmm d",
            legendTemplate: "<%for(var i=0;i<datasets.length;i++){%>" + "&nbsp&nbsp" + "<span class=\"<%=name.toLowerCase()%>-legend-marker\" style=\"background-color:<%=datasets[i].strokeColor%>\"></span>" + "&nbsp" + "<%=datasets[i].label%><%}%>"
        });
        var legend = chart.generateLegend();
        document.getElementById("chart-legend").innerHTML = legend;
        let br = document.createElement("br");
        let title = document.createElement("h4");
        let hr = document.createElement("hr");
        title.innerHTML = item.name;
        allpast.appendChild(title);
        allpast.appendChild(canv);
        if (pastchart.length-1 != i) {
            hr.style.marginTop = "20px";
            allpast.appendChild(hr);
            allpast.appendChild(br);
        }
        i++;
    });
}

async function getChart() {
    const db = firebase.database().ref("/past/");
    let snap = await db.once("value");
    let charts = [];
    let value = snap.val();
    for (const item in value) {
        charts.push(value[item]);
    }
    charts.sort((a, b) => (a.minDate > b.minDate) ? 1 : -1);
    charts = charts.reverse();
    return charts;
}