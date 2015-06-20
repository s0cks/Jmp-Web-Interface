var eb = null;
var messages = [];
var chart = null;
var updateCount = 0;
var lastSpy = [
    {
        value: 100,
        color: "#8B8989",
        "label": "Total RAM"
    },
    {
        value: 0,
        color: "#000000",
        "label": "Used RAM"
    }
];
var app = angular.module("jmp", ['ngRoute']);

eb = new vertx.EventBus("http://localhost:8080/eventbus");
eb.onopen = function(){
    console.log("Connected");
    eb.registerHandler("events", function(msg, rep){
        messages.push(msg);
    });
    eb.registerHandler("stats:mem", function(msg, rep){
        change(msg);
    });
};
eb.onclose = function(){
    console.log("Disconnected");
};

app.controller("jmpController", function($scope){
    $scope.data = messages;
    setInterval(function(){
        $scope.data = messages;
        $scope.$apply();
    }, 1000);
});

app.controller("statsController", function($scope){
    var ctx = $("#memChart").get(0).getContext("2d");
    chart = new Chart(ctx).Doughnut(lastSpy, {animation: false});
});

app.config(['$routeProvider', function($routeProvider){
    $routeProvider.when("/", {
        templateUrl: 'dash.html',
        controller: 'jmpController'
    }).when("/stats", {
        templateUrl: 'stats.html',
        controller: 'jmpController'
    }).when("/activity", {
        templateUrl: "activity.html",
        controller: "jmpController"
    }).otherwise({
        redirectTo: '/'
    });
}]);

function change(msg){
    lastSpy = [
        {
            value: msg.data.maxRam,
            color: "#8B8989",
            "label": "Total RAM"
        },
        {
            value: msg.data.usedRam,
            color: "#000000",
            "label": "Used RAM"
        }
    ];

    if(chart){
        while(chart.segments.length){
            chart.removeData();
        }

        lastSpy.forEach(function(seg, i){
            chart.addData(seg, i);
        });

        chart.update();
    }

    $("#maxRam").text(lastSpy[0].value + "b");
    $("#usedRam").text(lastSpy[1].value + "b");
}