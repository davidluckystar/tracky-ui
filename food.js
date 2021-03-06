var app = angular.module('app', ['nvd3', 'ngMaterial', 'ngCookies', 'googlechart']);

app.controller('ctrl', function($scope, $http,$rootScope, $mdToast, $cookies) {
    $scope.personNames = ['alex', 'kristino4ka'];
    $scope.endpoints = ['http://localhost:8080', 'http://91.240.84.2:8080', 'http://192.168.10.22:8080', 'http://192.168.10.21:8080'];
    // $scope.endpoint = 'http://localhost:8080';
    $scope.foodperson = 'kristino4ka';

    var person = $cookies.get('person');
    if (person) {
      $scope.foodperson = person;
    }
    $scope.changePerson = function() {
      $cookies.put('person', $scope.foodperson, {
        expires: new Date(11111111111111) // somewhere around 2322
      });
      $scope.refreshChart();
    }

    $scope.createNewFoody = function() {
      var food = $scope.selectedFood ? $scope.selectedFood.value2 : $scope.searchFood; // save foody in russian :) cooked sausage doctor
      var foody = {
        "name": food,
        "person": $scope.foodperson,
        "weight": $scope.foodweight
      };
      if ($scope.fooddate) {
        foody.date = $scope.fooddate;
      };
      $scope.saveFoody(foody, function(res) {
        var savedFoodyId = res.data.data;
        foody.id = savedFoodyId;
        $scope.foodies.push(foody);
        $scope.showToast('Запись сохранена');
      });
    }

    $scope.saveFoody = function(foody, successFn) {
      var prefix = $scope.endpoint ? $scope.endpoint : '';
      if (!successFn) {
        successFn = function() {
          $scope.showToast('Фуди сохранен');
        }
      }
      // format the date
      foody.date = moment(foody.date).hours(12).toDate();
      $http.post(prefix + '/foody', foody).then(successFn);
    }

    $scope.deleteFoody = function(foody) {
      var prefix = $scope.endpoint ? $scope.endpoint : '';
      $http.delete(prefix + '/foody?id=' + foody.id).then(function(res) {
        var idx = $scope.foodies.indexOf(foody);
        $scope.foodies.splice(idx, 1);
        $scope.showToast('Фуди удален');
      });
    }

    $scope.createNewProduct = function() {
      var newProduct = {
        "name": $scope.npName,
        "runame": $scope.npRuname,
        "calories": $scope.npCalories,
        "protein": $scope.npProtein,
        "fat": $scope.npFat,
        "carbs": $scope.npCarbs,
      }
      $scope.saveProduct(newProduct, function(res) {
        var savedProductId = res.data.data;
        newProduct.id = savedProductId;
        $scope.products.push({
          value1: newProduct.name.toLowerCase(),
          value2: newProduct.runame.toLowerCase(),
          p: newProduct
        });
        $scope.showToast('Продукт добавлен');
      });
    }

    $scope.saveProduct = function(p, successFn) {
      var prefix = $scope.endpoint ? $scope.endpoint : '';
      if (!successFn) {
        successFn = function() {
          $scope.showToast('Продукт сохранен');
        }
      }
      $http.post(prefix + '/product', p).then(successFn);
    }

    $scope.deleteProduct = function(p) {
      var prefix = $scope.endpoint ? $scope.endpoint : '';
      $http.delete(prefix + '/product?id=' + p.id).then(function(res) {
        var success = res.data.success;
        if (success) {
          var idx = $scope.products.indexOf(p);
          $scope.products.splice(idx, 1);
          $scope.showToast('Продукт удален');
        } else {
          $scope.showToast('Ошибка при удалении');
        }
      });
    }

    // load products
    var prefix = $scope.endpoint ? $scope.endpoint : '';
    $http.get(prefix + '/allProducts').then(function(res) {
      var products = [];
      for (var i in res.data) {
        var p = res.data[i];
        products.push({
          value1: p.name.toLowerCase(),
          value2: p.runame.toLowerCase(),
          p: p
        });
      }
      $scope.products = products;
    });
    // load foodies
    var prefix = $scope.endpoint ? $scope.endpoint : '';
    $http.get(prefix + '/foodies').then(function(res) {
      // replace timestamp with date
      var foodies = [];
      for (var i in res.data) {
        var f = res.data[i];
        f.date = new Date(f.date);
        foodies.push(f);
      }
      $scope.foodies = foodies;
    });

    // cache control
    $scope.deleteProductCache = function() {
      var prefix = $scope.endpoint ? $scope.endpoint : '';
      $http.post(prefix + '/dropProductCache', function(res) {
        $scope.showToast('Кэш продуктов очищен');
      });
    }
    $scope.deleteFoodyCache = function() {
      var prefix = $scope.endpoint ? $scope.endpoint : '';
      $http.post(prefix + '/dropProductCache', function(res) {
        $scope.showToast('Кэш фуди очищен');
      });
    }

    // charts
    $scope.chartDatePeriods = [
      {id: 'today', desc: 'Today'},
      {id: 'yesterday', desc: 'Yesterday'},
      {id: 'week', desc: 'This week'},
      {id: 'lastweek', desc: 'Last week'},
      {id: 'month', desc: 'This month'},
      {id: 'lastmonth', desc: 'Last month'},
      {id: 'year', desc: 'This year'},
      {id: 'lastyear', desc: 'Last year'}
    ]
    $scope.pieOptions = {
      chart: {
        type: 'pieChart',
        height: 450,
        width: 450,
        x: function(d){return d.x;},
        y: function(d){return d.y;},
        showLabels: true,
        duration: 500,
        labelThreshold: 0.01,
        labelSunbeamLayout: true,
        legend: {
          margin: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 0
          }
        }
      }
    };

    // $scope.barChartOptions = {
    //     chart: {
    //         type: 'historicalBarChart',
    //         height: 400,
    //         width: 400,
    //         margin : {
    //             top: 20,
    //             right: 20,
    //             bottom: 65,
    //             left: 65
    //         },
    //         x: function(d){return d[0];},
    //         y: function(d){return d[1];},
    //         // clipEdge: true,
    //         duration: 500,
    //         xAxis: {
    //             axisLabel: 'Date',
    //             showMaxMin: false,
    //             // rotateLabels: 30,
    //             tickFormat: function(d){
    //                 // return d3.format(',f')(d);
    //                 // return new Date(d);
    //                 return d3.time.format("%d-%m")(new Date(d));
    //             },
    //         },
    //         yAxis: {
    //             axisLabel: 'Calories',
    //             axisLabelDistance: -20,
    //             tickFormat: function(d){
    //                 return d3.format(',.1f')(d);
    //             },
    //         },
    //         tooltip: {
    //           // headerEnabled: true,
    //           // headerFormatter: function(d,q,e) {
    //           //   return 'asdf';
    //           // },
    //           valueFormatter: function (d, i) {
    //             return d3.format(',.1f')(d) + ' calories';
    //           },
    //           keyFormatter: function(d) {
    //             return d3.time.format("%d-%m")(new Date(d));
    //           }
    //         },
    //         bars: {
    //           dispatch: {
    //             elementClick: function(t,u) {
    //               $scope.refreshChart(moment(t.data[0]).hours(12).toDate());
    //             }
    //           }
    //         }
    //         // zoom: {
    //         //     enabled: true,
    //         //     scaleExtent: [1, 10],
    //         //     useFixedDomain: false,
    //         //     useNiceScale: false,
    //         //     horizontalOff: false,
    //         //     verticalOff: true,
    //         //     unzoomEventType: 'dblclick.zoom'
    //         // }
    //     }
    // };

    $scope.refreshChart = function(date) {
      var prefix = $scope.endpoint ? $scope.endpoint : '';
      var specificPeriodParam = $scope.pieDate ? '&specificPeriod=' + $scope.pieDate.id : '';
      var dateParam = date ? '&date=' + moment(date).format('MM.DD.YYYY') : '';
      if (date) {
        $scope.pieChartForDate = new Date(date);
      } else if ($scope.pieDate) {
        $scope.pieChartForDate = $scope.pieDate.desc;
      }

      $http.get(prefix + '/caloriesChart?personName=' + $scope.foodperson + dateParam + specificPeriodParam).then(function(res) {
        $scope.pieData = res.data;
      });
      // $http.get(prefix + '/barChart?personName=' + $scope.foodperson).then(function(res) {
      //   $scope.barData = [{
      //     key: "Calories distribution",
      //     bar: true,
      //     values: res.data
      //   }];
      // });
    }

    $scope.pieDate = {id: 'today', desc: 'Today'};
    $scope.refreshChart();

    $scope.searchProducts = function(query) {
      var results = query ? $scope.products.filter(createFilterFor(query)) : $scope.products;
      return results;
    }
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value1.indexOf(lowercaseQuery) !== -1 || state.value2.indexOf(lowercaseQuery) !== -1);
      };
    }

    $scope.getToastPosition = function() {
      return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };

    function sanitizePosition() {
      var current = $scope.toastPosition;

      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;

      last = angular.extend({},current);
    }

    $scope.showToast = function(text) {
      // $mdToast.show(
      //   $mdToast.simple()
      //     .textContent(text)
      //     .position({top: true, right: true})
      //     .hideDelay(3000)
      // );
      $mdToast.show({
        template: '<md-toast>' + text + '</md-toast>',
        hideDelay: 2000,
        position: 'bottom left'
      });
    }

    // paging
    $scope.productsCurrentPage = 0;
    $scope.foodiesCurrentPage = 0;
    $scope.pageSize = 10;
    $scope.numberOfPages = function(collection) {
      if (collection) {
        return Math.ceil(collection.length/$scope.pageSize);
      }
      return 1;
    }

    $rootScope.showWeeklyCalories = true;
    $scope.weeklyCaloriesChart = {
      type: 'ColumnChart',
      options: {
          title: "Калории в неделю",
          // isStacked: true,
          fill: 20,
          legend: { position: 'top', maxLines: 1 },
          // displayExactValues: true,
          vAxis: {
            title: "Калории",
            gridlines: {count: 4},
            // minValue: 0,
            // ticks: [0, .3, .6, .9, 1]
          },
          hAxis: {
              title: "День"
          }
      },
      // formatters: {
      //     date: [{
              // formatType: 'short',
      //         colIndex: 1,
      //         pattern: "HH:mm:ss dd:MM:yy"
      //     }]
      // }
    };
    $scope.weeklyWeightChart = {
      type: 'ColumnChart',
      displayed: false,
      options: {
          title: "Вес в неделю",
          isStacked: true,
          fill: 20,
          legend: { position: 'top', maxLines: 1 },
          // displayExactValues: true,
          vAxis: {
            title: "Вес",
            gridlines: {count: 4},
            // minValue: 0,
            // ticks: [0, .3, .6, .9, 1]
          },
          hAxis: {
              title: "День"
          }
      }
    };

    $scope.refreshWeekChart = function(week) {
      $http.get('chart/weekly?personName=' + $scope.foodperson + '&weekNumber=' + week).then(function(res) {
        var weekData = res.data;
        var rows = [];
        var data = {
          cols: [
            {id: "dayOfWeek", label: "День", type: "date"},
            {id: "calories", label: "Калории", type: "number"}
          ],
          rows: rows
        };
        angular.forEach(weekData, function(dd) {
          var row = {
            c: [
              {v: new Date(dd.date)},
              {v: dd.calories}
            ]
          }
          rows.push(row);
        })
        $scope.weeklyCaloriesChart.data = data;

        rows = [];
        data = {
          cols: [
            {id: "dayOfWeek", label: "День", type: "string"},
            {id: "protein", label: "Белки", type: "number"},
            {id: "fat", label: "Жиры", type: "number"},
            {id: "carbs", label: "Углеводы", type: "number"},
            {id: "total", label: "Остальное", type: "number"},
          ],
          rows: rows
        };
        angular.forEach(weekData, function(dd) {
          var row = {
            c: [
              {v: dd.dateLabel},
              {v: dd.weight.protein},
              {v: dd.weight.fat},
              {v: dd.weight.carbs},
              {v: dd.weight.total-dd.weight.protein-dd.weight.fat-dd.weight.carbs},
            ]
          }
          rows.push(row);
        })
        $scope.weeklyWeightChart.data = data;
      });
    }

    $scope.currentWeek = moment().week() - 2;
    $scope.refreshWeekChart($scope.currentWeek);

    $scope.refreshDayChart = function(selectedItem) {
      var date = $scope.weeklyCaloriesChart.data.rows[selectedItem.row].c[0].v;
      $scope.refreshChart(date);
      // console.log($scope.weeklyCaloriesChart.view);
    }

    $scope.prevWeekChart = function() {
      $scope.currentWeek  = $scope.currentWeek - 1;
      $scope.refreshWeekChart($scope.currentWeek);
    }
    $scope.nextWeekChart = function() {
      $scope.currentWeek  = $scope.currentWeek + 1;
      $scope.refreshWeekChart($scope.currentWeek);
    }

});

app.filter('startFrom', function() {
    return function(input, start) {
      if (input) {
        start = +start; //parse to int
        return input.slice(start);
      }
    }
});

app.directive('foodyApp', function() {
  return {
    templateUrl: 'food.html'
  }
});
