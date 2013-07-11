"use strict";

/*globals angular */

angular.module('angular.prime.config', []).value('angular.prime.config',
    {
        labelPrefix : 'lbl'
    }
);

angular.module('angular.prime', ['angular.prime.config']).run(['$rootScope', function ($rootScope) {

    $rootScope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

}]);

