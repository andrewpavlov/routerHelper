/**
 * @ngdoc service
 * @name router.helper
 * @description
 * Router helper
 */
(function(angular) {
    'use strict';

    angular
        .module('router.helper', [
            'ui.router'
        ])
        .provider('routerHelper', routerHelperProvider);

    routerHelperProvider.$inject = [
        '$locationProvider',
        '$stateProvider',
        '$urlRouterProvider',
        '$urlMatcherFactoryProvider'
    ];

    function routerHelperProvider($locationProvider,
        $stateProvider, $urlRouterProvider, $urlMatcherFactory) {

        this.$get = routerHelper;

        $locationProvider.hashPrefix('');
        //$locationProvider.html5Mode(true);

        routerHelper.$inject = [
            '$state',
            '$rootScope'
        ];

        function routerHelper($state, $rootScope) {
            var exports = {
                configureStates: configureStates,
                trailingSlash: trailingSlash
            };

            var _hasOtherwise = false,
                _redirectTo = false,
                _trailingSlash = false;

            return exports;

            //////////////////////

            /**
             * @ngdoc method
             * @name router.helper#configureStates
             * @methodOf router.helper
             * @description
             * Configures state for module
             * <pre>
             *     angular
             *     .module('app', [])
             *     .run(function appRun(routerHelper) {
             *          routerHelper.configureStates(getStates(), '/');
             *     });
             * </pre>
             */
            function configureStates(states, otherwisePath) {
                states.forEach(function(state) {
                    $stateProvider.state(state.state, state.config);
                });
                otherwise(otherwisePath);
                redirects();
            }

            /**
             * @ngdoc method
             * @name router.helper#otherwise
             * @methodOf router.helper
             * @description
             * Sets `otherwise` state if not set
             */
            function otherwise(path) {
                if (path && !_hasOtherwise) {
                    _hasOtherwise = true;
                    $urlRouterProvider.otherwise(path);
                }
            }

            /**
             * @ngdoc method
             * @name router.helper#redirects
             * @methodOf router.helper
             * @description
             * Redirect functionality support
             */
            function redirects() {
                if (!_redirectTo) {
                    _redirectTo = true;
                    $rootScope.$on('$stateChangeStart', function(evt, to, params) {
                        if (to.redirectTo) {
                            evt.preventDefault();
                            var _s;
                            if (typeof to.redirectTo === 'function') {
                                _s = to.redirectTo(evt, to, params);
                            } else {
                                _s = to.redirectTo;
                            }
                            if (typeof to.redirectTo === 'string') {
                                _s = {
                                    state: to.redirectTo
                                }
                            }
                            $state.go(_s.state, _s.params || params, _s.options || {
                                location: 'replace'
                            });
                        } else if (to.url.match(/^((ftp|https?):)?\/\//i)) {
                            evt.preventDefault();
-                           window.location = to.url;
-                       }
                    });
                }
            }

            /**
             * @ngdoc method
             * @name router.helper#getUrlRouterProvider
             * @methodOf router.helper
             * @description
             * Helper function. Returns $urlRouterProvider
             */
            function getUrlRouterProvider() {
                return $urlRouterProvider;
            }

            /**
             * @ngdoc method
             * @name router.helper#trailingSlash
             * @methodOf router.helper
             * @description
             * Adds slash to the end of path if does not exist
             * <pre>
             *     angular
             *     .module('app', [{
             *         state: 'foo',
             *         config: {
             *             url: '/foo',
             *             ....
             *         }
             *     }])
             *     .run(function appRun(routerHelper) {
             *          routerHelper.trailingSlash();
             *          routerHelper.configureStates(getStates(), '/');
             *     });
             *     .../#/foo -> .../#/foo/
             * </pre>
             */
            function trailingSlash() {
                if (!_trailingSlash) {
                    $urlMatcherFactory.strictMode(false);

                    var router = getUrlRouterProvider();
                    router.rule(function($injector, $location) {
                        var path = $location.url();

                        // check to see if the path already has a slash where it should be
                        if (path[path.length - 1] === '/' || path.indexOf('/?') > -1 || path.match(/#[^\/]+$/)) {
                            return;
                        }

                        if (path.indexOf('?') > -1) {
                            return path.replace('?', '/?');
                        }

                        return path + '/';
                    });
                    _trailingSlash = true;
                }
            }
        }
    }
})(window.angular);
