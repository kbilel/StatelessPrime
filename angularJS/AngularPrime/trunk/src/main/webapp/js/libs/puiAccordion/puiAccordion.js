/*globals $ */

/**
 * PrimeUI Accordion widget
 */
$(function() {
    "use strict"; // Added for AngularPrime

    $.widget("primeui.puiaccordion", {

        options: {
            activeIndex: 0,
            multiple: false
        },

        _create: function() {
            if(this.options.multiple) {
                this.options.activeIndex = [];
            }

            var $this = this;
            this.element.addClass('pui-accordion ui-widget ui-helper-reset');

            this.element.children('h3').addClass('pui-accordion-header ui-helper-reset ui-state-default').each(function(i) {
                var header = $(this),
                    title = header.html(),
                    headerClass = (i == $this.options.activeIndex) ? 'ui-state-active ui-corner-top' : 'ui-corner-all',
                    iconClass = (i == $this.options.activeIndex) ? 'ui-icon ui-icon-triangle-1-s' : 'ui-icon ui-icon-triangle-1-e';

                header.addClass(headerClass).html('<span class="' + iconClass + '"></span><a href="#">' + title + '</a>');
            });

            this.element.children('div').each(function(i) {
                var content = $(this);
                content.addClass('pui-accordion-content ui-helper-reset ui-widget-content');

                if(i != $this.options.activeIndex) {
                    content.addClass('ui-helper-hidden');
                }
            });

            this.headers = this.element.children('.pui-accordion-header');
            this.panels = this.element.children('.pui-accordion-content');
            this.headers.children('a').disableSelection();

            this._bindEvents();
        },

        _bindEvents: function() {
            var $this = this;

            this.headers.mouseover(function() {
                var element = $(this);
                if(!element.hasClass('ui-state-active')&&!element.hasClass('ui-state-disabled')) {
                    element.addClass('ui-state-hover');
                }
            }).mouseout(function() {
                    var element = $(this);
                    if(!element.hasClass('ui-state-active')&&!element.hasClass('ui-state-disabled')) {
                        element.removeClass('ui-state-hover');
                    }
                }).click(function(e) {
                    var element = $(this);
                    if(!element.hasClass('ui-state-disabled')) {
                        var tabIndex = element.index() / 2;

                        if(element.hasClass('ui-state-active')) {
                            $this.unselect(tabIndex);
                        }
                        else {
                            $this.select(tabIndex);
                        }
                    }

                    e.preventDefault();
                });
        },

        /**
         *  Activates a tab with given index
         */
        select: function(index) {
            var panel = this.panels.eq(index);

            //this._trigger('change', panel);

            //update state
            if(this.options.multiple)
                this._addToSelection(index);
            else
                this.options.activeIndex = index;

            this._trigger('change', null, {'index':index}); // AngularPrime Must be after the setting of the activeIndex

            this._show(panel);
        },

        /**
         *  Deactivates a tab with given index
         */
        unselect: function(index) {
            var panel = this.panels.eq(index),
                header = panel.prev();

            header.attr('aria-expanded', false).children('.ui-icon').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
            header.removeClass('ui-state-active ui-corner-top').addClass('ui-corner-all');
            panel.attr('aria-hidden', true).slideUp();

            this._removeFromSelection(index);
        },

        _show: function(panel) {
            //deactivate current
            if(!this.options.multiple) {
                var oldHeader = this.headers.filter('.ui-state-active');
                oldHeader.children('.ui-icon').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
                oldHeader.attr('aria-expanded', false).removeClass('ui-state-active ui-corner-top').addClass('ui-corner-all').next().attr('aria-hidden', true).slideUp();
            }

            //activate selected
            var newHeader = panel.prev();
            newHeader.attr('aria-expanded', true).addClass('ui-state-active ui-corner-top').removeClass('ui-state-hover ui-corner-all')
                .children('.ui-icon').removeClass('ui-icon-triangle-1-e').addClass('ui-icon-triangle-1-s');

            panel.attr('aria-hidden', false).slideDown('normal');
        },

        _addToSelection: function(nodeId) {
            this.options.activeIndex.push(nodeId);
        },

        _removeFromSelection: function(index) {
            this.options.activeIndex = $.grep(this.options.activeIndex, function(r) {
                return r != index;
            });
        },

        // Added for AngularPrime
        getActiveIndex : function() {
            return this.options.activeIndex;
        }

    });
});
;/*globals angular $ */

(function () {
    "use strict";

    angular.module('angular.prime').directive('puiAccordion', ['$http', '$templateCache', '$compile', '$log',
                                                  function ($http, $templateCache, $compile, $log) {
    return {
        restrict: 'A',
        compile: function (element, attrs) {

            return function postLink (scope, element, attrs) {

                var options = scope.$eval(attrs.puiAccordion) || {} ,
                    dynamicPanels = angular.isArray(options) || angular.isArray(options.urls) ,
                    content = [] ,
                    urls = [] ,
                    remaining ,
                    initialCall = true;

                function renderAccordion(panels) {
                    var htmlContent = '';
                    angular.forEach(panels, function(panelContent) {
                       htmlContent = htmlContent + panelContent;
                    });
                    element.html(htmlContent);
                    $compile(element.contents())(scope);
                    $(function () {
                        if (!initialCall) {
                            element.puiaccordion('destroy', {});
                        }
                        element.puiaccordion({
                            multiple: options.multiple, activeIndex: options.activeIndex
                        });
                        initialCall = false;

                    });
                }

                function loadHtmlContents(idx, url) {
                    $http.get(url, {cache: $templateCache}).success(function (response) {
                        content[idx] = response;
                        remaining--;
                        if (remaining === 0) {
                            renderAccordion(content);
                        }
                    }).error(function () {
                            $log.error('Error loading included file ' + url + ' for panel of accordion');
                        });

                }

                function loadAndRenderAccordion() {
                    remaining = urls.length;
                    for (var i = 0; i < urls.length; i++) {
                        loadHtmlContents(i, urls[i]);
                    }
                }

                if (dynamicPanels) {

                    if (angular.isArray(options)) {
                        scope.$watch(attrs.puiAccordion, function(x) {
                            urls = x;
                            loadAndRenderAccordion();
                        }, true);

                    } else {
                        scope.$watch(attrs.puiAccordion+'.urls', function(x) {
                            urls = x;
                            loadAndRenderAccordion();
                        }, true);
                    }

                    loadAndRenderAccordion();


                } else {
                    var scopedOptions = attrs.puiAccordion && attrs.puiAccordion.trim().charAt(0) !== '{';

                    options.activeIndex = options.activeIndex || 0;
                    $(function () {
                        element.puiaccordion({
                            multiple: options.multiple, activeIndex: options.activeIndex
                        });

                    });

                    if (scopedOptions || options.callback) {
                        // Listen for change events to enable binding
                        element.bind('puiaccordionchange', function (eventData, idx) {
                            var index = idx.index;
                            if (scopedOptions) {
                                scope.safeApply(read(index));
                            }
                            if (options.callback) {
                                options.callback(index);
                            }

                        });
                    }
                    if (scopedOptions) {
                        read(undefined); // initialize

                        scope.$watch(attrs.puiAccordion + '.activeIndex', function (value) {
                            var index = element.puiaccordion('getActiveIndex');
                            // Only select the panel if not already selected (otherwise additional collapse/expand)
                            if (value !== index) {
                                element.puiaccordion('select', value);
                            }


                        });
                    }


                }
                // Write data to the model
                function read (index) {
                    var idx = (index !== undefined) ? index : element.puiaccordion('getActiveIndex');
                    scope[attrs.puiAccordion].activeIndex = idx;
                }
            };
        }};
}]);

}());
