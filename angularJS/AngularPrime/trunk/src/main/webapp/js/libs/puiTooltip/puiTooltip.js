/*globals angular $ */

(function () {
    "use strict";

angular.module('angular.prime').directive('puiTooltip', ['$interpolate', function ($interpolate) {
    return {
        restrict: 'A',
        compile: function (element, attrs) {

            return function postLink (scope, element, attrs) {

                var titleAttr = attrs.title;

                var options = scope.$eval(attrs.puiTooltip) || {};
                options.my = options.my || 'left top';
                options.at = options.at || 'right bottom';
                options.content = options.content || titleAttr;
                options.showEvent = options.showEvent || 'mouseover';
                options.hideEvent = options.hideEvent || 'mouseout';
                options.showEffect = options.showEffect || 'fade';
                options.showEffectSpeed = options.showEffectSpeed || 'normal';
                options.hideEffectSpeed = options.hideEffectSpeed || 'normal';
                options.showDelay = options.showDelay || 150;

                var tooltipWatches = [];

                if (options.content && options.content !== '') {
                    var parsedExpression = $interpolate(options.content);
                    options.content = scope.$eval(parsedExpression);
                    angular.forEach(parsedExpression.parts, function(part) {
                        if (angular.isFunction(part)) {
                            tooltipWatches.push(part.exp);
                        }
                    }, tooltipWatches);

                    $(function () {
                        element.puitooltip({
                            content: options.content,
                            showEvent: options.showEvent,
                            hideEvent: options.hideEvent,
                            showEffect: options.showEffect,
                            hideEffect: options.hideEffect,
                            showEffectSpeed: options.showEffectSpeed,
                            hideEffectSpeed: options.hideEffectSpeed,
                            my: options.my,
                            at: options.at,
                            showDelay: options.showDelay
                        });
                    });

                    angular.forEach(tooltipWatches, function(watchValue) {
                        scope.$watch(watchValue, function (value) {
                            $(function () {
                                element.puitooltip('setTooltipContent', scope.$eval(parsedExpression));
                            });
                        });
                    });

                }
            };

        }
    };
}]);

}());
;/*globals $ window document PUI*/

/**
 * PrimeFaces Tooltip Widget
 */
$(function() {
    "use strict"; // Added for AnfularPrime

    $.widget("primeui.puitooltip", {

        options: {
            showEvent: 'mouseover',
            hideEvent: 'mouseout',
            showEffect: 'fade',
            hideEffect: null,
            showEffectSpeed: 'normal',
            hideEffectSpeed: 'normal',
            my: 'left top',
            at: 'right bottom',
            showDelay: 150
        },

        _create: function() {
            this.options.showEvent = this.options.showEvent + '.puitooltip';
            this.options.hideEvent = this.options.hideEvent + '.puitooltip';

            if(this.element.get(0) === document) {
                this._bindGlobal();
            }
            else {
                this._bindTarget();
            }
        },

        _bindGlobal: function() {
            this.container = $('<div class="pui-tooltip pui-tooltip-global ui-widget ui-widget-content ui-corner-all pui-shadow" />').appendTo(document.body);
            this.globalSelector = 'a,:input,:button,img';
            var $this = this;

            $(document).off(this.options.showEvent + ' ' + this.options.hideEvent, this.globalSelector)
                .on(this.options.showEvent, this.globalSelector, null, function() {
                    var target = $(this),
                        title = target.attr('title');

                    if(title) {
                        $this.container.text(title);
                        $this.globalTitle = title;
                        $this.target = target;
                        target.attr('title', '');
                        $this.show();
                    }
                })
                .on(this.options.hideEvent, this.globalSelector, null, function() {
                    var target = $(this);

                    if($this.globalTitle) {
                        $this.container.hide();
                        target.attr('title', $this.globalTitle);
                        $this.globalTitle = null;
                        $this.target = null;
                    }
                });

            var resizeNS = 'resize.puitooltip';
            $(window).unbind(resizeNS).bind(resizeNS, function() {
                if($this.container.is(':visible')) {
                    $this._align();
                }
            });
        },

        _bindTarget: function() {
            this.container = $('<div class="pui-tooltip ui-widget ui-widget-content ui-corner-all pui-shadow" />').appendTo(document.body);

            var $this = this;
            this.element.off(this.options.showEvent + ' ' + this.options.hideEvent)
                .on(this.options.showEvent, function() {
                    $this.show();
                })
                .on(this.options.hideEvent, function() {
                    $this.hide();
                });

            this.container.html(this.options.content);

            this.element.removeAttr('title');
            this.target = this.element;

            var resizeNS = 'resize.' + this.element.attr('id');
            $(window).unbind(resizeNS).bind(resizeNS, function() {
                if($this.container.is(':visible')) {
                    $this._align();
                }
            });
        },

        _align: function() {
            this.container.css({
                left:'',
                top:'',
                'z-index': ++PUI.zindex
            })
                .position({
                    my: this.options.my,
                    at: this.options.at,
                    of: this.target
                });
        },

        show: function() {
            var $this = this;

            this.timeout = window.setTimeout(function() {
                $this._align();
                $this.container.show($this.options.showEffect, {}, $this.options.showEffectSpeed);
            }, this.options.showDelay);
        },

        hide: function() {
            window.learTimeout(this.timeout);

            this.container.hide(this.options.hideEffect, {}, this.options.hideEffectSpeed, function() {
                $(this).css('z-index', '');
            });
        },

        // Added for AngularPrime
        setTooltipContent: function(tooltipContent) {
            this.container.html(tooltipContent);
        }
    });
});