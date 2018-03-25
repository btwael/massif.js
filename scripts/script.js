var application = angular.module("MassifVisualizer", []);

function rightUnit(base, bytes) {
    var units = ["", "K", "M", "G"]
    var i = 0
    while(bytes > Math.pow(base, i + 1) && i < 3) {
        i++;
    }
    return [Math.pow(base, i), units[i]];
};

application.controller("MassifVisualizeController", [function() {
    // init
    var scope = this;
    scope.source = "";
    // events
    scope.process = function() {
        var parsed = Massifjs.parse(scope.source);
        var data = {
            labels: [],
            datasets: [
                {
                    data: [],
                    borderWidth: 1
                }
            ]
        }
        var largestTime;
        var largestMemory;
        parsed.snapshots.forEach(function(snapshot) {
            data.labels.push(largestTime = snapshot.time);
            data.datasets[0].data.push(largestMemory = (snapshot.mem_heap_B + snapshot.mem_heap_extra_B + snapshot.mem_stacks_B));
        });
        var munit = rightUnit(1024, largestMemory);
        data.datasets[0].label = parsed.cmd;
        data.datasets[0].data.forEach(function(bytes, i) {
            data.datasets[0].data[i] = (data.datasets[0].data[i] / munit[0]).toFixed(3);
        });
        var mtime = rightUnit(1000, largestTime);
        data.labels.forEach(function(time, i) {
            data.labels[i] = (data.labels[i] / mtime[0]).toFixed(0);
        });
        console.log(data.datasets[0].data[data.datasets[0].data.length - 1]);
        document.getElementById("chart").remove(); // this is my <canvas> element
        document.getElementById("chart-container").innerHTML += '<canvas class="col-12" id="chart"></canvas>';
        var chart = document.getElementById("chart").getContext('2d');
        new Chart(chart, {
            type: 'line',
            data: data,
            options: {
                scales: {
                    xAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Time (" + (munit[1] == "K" ? "10^3 " : munit[1] == "M" ? "10^6 " : munit[1] == "G" ? "10^9 " : "") + "instructions)"
                            },
                        }
                    ],
                    yAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Memory consumption (" + munit[1] + "B)"
                            },
                            ticks: {
                                stepSize: parsed.snapshots.length,
                                callback: function(value) {
                                    return value + " " + munit[1] + "B";
                                }
                            }
                        }
                    ]
                }
            }
        });
    };
}]);
