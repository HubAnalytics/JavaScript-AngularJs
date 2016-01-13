// JavaScript source code
// AngularJS support
(function (analyticsInstance) {
    var global = this;
    if (global.angular) {
        var microserviceAnalyticsModule = global.angular.module('microserviceAnalytics', []);
        microserviceAnalyticsModule.provider("$exceptionHandler", {
            $get: function (accidentalFishExceptionLoggingService) {
                return accidentalFishExceptionLoggingService;
            }
        });
        microserviceAnalyticsModule.factory("accidentalFishExceptionLoggingService", ['$log', '$window', function ($log) {
            function error(exception, cause) {
                $log.error.apply($log, arguments);
                analyticsInstance.handleJavaScriptError(exception, cause);
            }

            return error;
        }]);
        microserviceAnalyticsModule.directive('microserviceAnalytics', [function() {
            var definition = {
                restrict: 'E',
                replace: false,
                scope: {
                    propertyId: '@',
                    propertyKey: '@',
                    interval: '@',
                    collectionEndpoint: '@',
                    correlationIdPrefix: '@',
                    autoStartJourneys: '@',
                    httpBlacklist: '@',
                    httpWhitelist: '@'
                }
            };
            
            function init() {
                analyticsInstance.configure()
            };
            
            definition.link = function(scope, element, attrs) {
                scope.$watch('propertyId', function() {
                    analyticsInstance.configure(scope);
                });
            };
            
            return definition;
        }]);
    }
}).call(this, this.microserviceAnalytics);
