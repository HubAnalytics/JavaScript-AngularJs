// JavaScript source code
// AngularJS support
(function (analyticsInstance) {
    var global = this;
    if (global.angular) {
        var hubAnalyticsModule = global.angular.module('hubAnalytics', []);
        hubAnalyticsModule.provider("$exceptionHandler", {
            $get: function (accidentalFishExceptionLoggingService) {
                return accidentalFishExceptionLoggingService;
            }
        });
        hubAnalyticsModule.factory("accidentalFishExceptionLoggingService", ['$log', '$window', function ($log) {
            function error(exception, cause) {
                $log.error.apply($log, arguments);
                analyticsInstance.handleJavaScriptError(exception, cause);
            }

            return error;
        }]);
        hubAnalyticsModule.directive('hubAnalytics', ['$rootScope', '$location', function($rootScope, $location) {
            var definition = {
                restrict: 'E',
                replace: false,
                scope: {
                    propertyId: '@',
                    propertyKey: '@',
                    uploadIntervalMs: '=',
                    correlationEnabled: '=',
                    collectionEndpoint: '@',
                    correlationIdKey: '@',
                    correlationIdPrefix: '@',
                    autoStartJourneys: '=',
                    httpBlacklist: '@',
                    httpWhitelist: '@',
                    userIdProvider: '&?',
                    userIdKey: '@',
                    sessionIdProvider: '&?',
                    sessionIdKey: '@',
                    useTrackingLocalStorage: '&?',
                    useTrackingCookies: '&?'
                }
            };
            
            definition.link = function(scope, element, attrs) {
                var headCorrelationId = null;
                scope.$watch('propertyId', function() {
                    // angular apps favour local storage and disable cookie scans
                    if (scope.useTrackingCookies === undefined) {
                        scope.useTrackingCookies = false;
                    }
                    scope.corePageViewReportingEnabled = false;
                    analyticsInstance.configure(scope);
                    analyticsInstance.getContextualCorrelationId = function() {
                        return headCorrelationId;
                    }
                    $rootScope.$on('$viewContentLoaded', function(ev, route) {
                        var page = $location.absUrl();
                        setTimeout(function() { headCorrelationId = null }, 1);
                    });
                    $rootScope.$on('$routeChangeSuccess', function(ev, route) {
                        headCorrelationId = analyticsInstance.createCorrelationId();
                        var page = $location.absUrl();
                        var additionalData = {
                            Controller: route.$$route ? route.$$route.controller : undefined,
                            Action: route.$$route ? route.$$route.templateUrl : undefined
                        }
                        analyticsInstance.pageView(page, additionalData);                                                
                    });                                    
                });
            };
            
            return definition;
        }]);
    }
}).call(this, this.hubAnalytics);
