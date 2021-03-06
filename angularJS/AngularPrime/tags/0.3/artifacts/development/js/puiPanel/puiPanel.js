"use strict";

/*globals angular $ */

angular.module('angular.prime').directive('puiPanel', ['$interpolate', function ($interpolate) {
    return {
        restrict: 'A',
        compile: function (element, attrs) {
            return function postLink (scope, element, attrs) {
                var options = scope.$eval(attrs.puiPanel) || {};

                var withinPuiAccordion = false;
                var withinPuiTabview = false;

                $(function () {
                    withinPuiAccordion = element.parent().attr('pui-accordion') != undefined;
                    withinPuiTabview = element.parent().attr('pui-tabview') != undefined;
                });

                if (withinPuiAccordion) {
                    element.replaceWith('<h3>'+element.attr('title')+'</h3><div>'+element.html()+'</div>');
                }

                if (withinPuiTabview) {
                    var id = element.attr('id');
                    element.replaceWith('<li><a href="#"'+id+'">'+element.attr('title')+'</a></li><div id="'+id+'">'+element.html()+'</div>');
                }
                if (!withinPuiAccordion && !withinPuiTabview) {
                    var titleWatches = [];
                    if (element.attr('title')) {
                        var parsedExpression = $interpolate(element.attr('title'));
                        element.attr('title', scope.$eval(parsedExpression));
                        angular.forEach(parsedExpression.parts, function (part) {
                            if (angular.isFunction(part)) {
                                titleWatches.push(part.exp);
                            }
                        }, titleWatches)
                    }

                    $(function () {
                        element.puipanel({
                            toggleable: options.collapsed !== undefined, closable: options.closable || false, toggleOrientation: options.toggleOrientation || 'vertical', toggleDuration: options.toggleDuration || 'normal', closeDuration: options.closeDuration || 'normal'
                        });
                    });
                    if (options.collapsed !== undefined && attrs.puiPanel.trim().charAt(0) !== '{') {
                        scope.$watch(attrs.puiPanel + '.collapsed', function (value) {
                            $(function () {
                                if (value === false) {
                                    element.puipanel('expand');
                                }
                                if (value === true) {
                                    element.puipanel('collapse');
                                }
                            });

                        });
                    }

                    angular.forEach(titleWatches, function (watchValue) {
                        scope.$watch(watchValue, function (value) {
                            $(function () {
                                element.puipanel('setTitle', scope.$eval(parsedExpression));
                            });
                        });
                    });
                }

            }

        }
    }
}]);;"use strict";
/*globals $ */

/**
 * PrimeUI Panel Widget
 */
$(function() {

    $.widget("primeui.puipanel", {

        options: {
            toggleable: false,
            toggleDuration: 'normal',
            toggleOrientation : 'vertical',
            collapsed: false,
            closable: false,
            closeDuration: 'normal'
        },

        _create: function() {
            this.element.addClass('pui-panel ui-widget ui-widget-content ui-corner-all')
                .contents().wrapAll('<div class="pui-panel-content ui-widget-content" />');

            var title = this.element.attr('title');
            if(title) {
                this.element.prepend('<div class="pui-panel-titlebar ui-widget-header ui-helper-clearfix ui-corner-all"><span class="ui-panel-title">'
                        + title + "</span></div>")
                    .removeAttr('title');
            }

            this.header = this.element.children('div.pui-panel-titlebar');
            this.title = this.header.children('span.ui-panel-title');
            this.content = this.element.children('div.pui-panel-content');

            var $this = this;

            if(this.options.closable) {
                this.closer = $('<a class="pui-panel-titlebar-icon ui-corner-all ui-state-default" href="#"><span class="ui-icon ui-icon-closethick"></span></a>')
                    .appendTo(this.header)
                    .on('click.puipanel', function(e) {
                        $this.close();
                        e.preventDefault();
                    });
            }

            if(this.options.toggleable) {
                var icon = this.options.collapsed ? 'ui-icon-plusthick' : 'ui-icon-minusthick';

                this.toggler = $('<a class="pui-panel-titlebar-icon ui-corner-all ui-state-default" href="#"><span class="ui-icon ' + icon + '"></span></a>')
                    .appendTo(this.header)
                    .on('click.puipanel', function(e) {
                        $this.toggle();
                        e.preventDefault();
                    });

                if(this.options.collapsed) {
                    this.content.hide();
                }
            }

            this._bindEvents();
        },

        _bindEvents: function() {
            this.header.find('a.pui-panel-titlebar-icon').on('hover.puipanel', function() {$(this).toggleClass('ui-state-hover');});
        },

        close: function() {
            var $this = this;

            this._trigger('beforeClose', null);

            this.element.fadeOut(this.options.closeDuration,
                function() {
                    $this._trigger('afterClose', null);
                }
            );
        },

        toggle: function() {
            if(this.options.collapsed) {
                this.expand();
            }
            else {
                this.collapse();
            }
        },

        expand: function() {
            this.toggler.children('span.ui-icon').removeClass('ui-icon-plusthick').addClass('ui-icon-minusthick');

            if(this.options.toggleOrientation === 'vertical') {
                this._slideDown();
            }
            else if(this.options.toggleOrientation === 'horizontal') {
                this._slideRight();
            }
        },

        collapse: function() {
            this.toggler.children('span.ui-icon').removeClass('ui-icon-minusthick').addClass('ui-icon-plusthick');

            if(this.options.toggleOrientation === 'vertical') {
                this._slideUp();
            }
            else if(this.options.toggleOrientation === 'horizontal') {
                this._slideLeft();
            }
        },

        _slideUp: function() {
            var $this = this;

            this._trigger('beforeCollapse');

            this.content.slideUp(this.options.toggleDuration, 'easeInOutCirc', function() {
                $this._trigger('afterCollapse');
                $this.options.collapsed = !$this.options.collapsed;
            });
        },

        _slideDown: function() {
            var $this = this;

            this._trigger('beforeExpand');

            this.content.slideDown(this.options.toggleDuration, 'easeInOutCirc', function() {
                $this._trigger('afterExpand');
                $this.options.collapsed = !$this.options.collapsed;
            });
        },

        _slideLeft: function() {
            var $this = this;

            this.originalWidth = this.element.width();

            this.title.hide();
            this.toggler.hide();
            this.content.hide();

            this.element.animate({
                width: '42px'
            }, this.options.toggleSpeed, 'easeInOutCirc', function() {
                $this.toggler.show();
                $this.element.addClass('pui-panel-collapsed-h');
                $this.options.collapsed = !$this.options.collapsed;
            });
        },

        _slideRight: function() {
            var $this = this,
                expandWidth = this.originalWidth||'100%';

            this.toggler.hide();

            this.element.animate({
                width: expandWidth
            }, this.options.toggleSpeed, 'easeInOutCirc', function() {
                $this.element.removeClass('pui-panel-collapsed-h');
                $this.title.show();
                $this.toggler.show();
                $this.options.collapsed = !$this.options.collapsed;

                $this.content.css({
                    'visibility': 'visible'
                    ,'display': 'block'
                    ,'height': 'auto'
                });
            });
        },

        // Added for AngularPrime
        setTitle: function(title) {
            this.element.find('.ui-panel-title').html(title);
        }
    });
});