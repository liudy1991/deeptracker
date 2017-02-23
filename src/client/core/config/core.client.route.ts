'use strict';

namespace application {
  class Config {
    public static $inject = [
      '$stateProvider',
      '$urlRouterProvider'
    ];

    constructor($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.rule(function ($injector, $location) {
        let path = $location.path();
        let hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

        if (hasTrailingSlash) {
          // if last character is a slash, return the same url without the slash
          let newPath = path.substr(0, path.length - 1);
          $location.replace().path(newPath);
        }
      });

      // redirect to / when route not found
      $urlRouterProvider.otherwise('/home');

      $stateProvider
        .state('home', {
          url: '/home',
          views: {
            '': {
              templateUrl: 'src/client/core/views/home.client.view.html',
              controller: 'HomeController',
            },
            'header@home': {
              templateUrl: 'src/client/core/views/header.client.view.html'
            },
            'dashboard@home': {
              templateUrl: 'src/client/core/views/dashboard.client.view.html',
              controller: 'DashboardController'
            },
            'content@home': {
              templateUrl: 'src/client/core/views/content.client.view.html'
            },
            'footer@home': {
              templateUrl: 'src/client/core/views/footer.client.view.html'
            }
          }
        });
    }
  }

  angular
    .module('core')
    .config(Config);
}
