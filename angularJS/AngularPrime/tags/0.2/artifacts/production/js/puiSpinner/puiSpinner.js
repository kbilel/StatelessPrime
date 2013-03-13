angular.module("angular.prime").directive("puiSpinner",function(){return{restrict:"A",require:"?ngModel",link:function(a,b,c,d){d&&$(function(){var e=a.$eval(c.puiSpinner)||{};b.puispinner({step:e.step,prefix:e.prefix,suffix:e.suffix,min:e.min,max:e.max});var f={read:function(){$(function(){a.safeApply(function(){d.$setViewValue(b.val())})})}};b.bind("puispinnerchange",function(){f.read()});c.ngDisabled&&a.$watch(c.ngDisabled,function(a){!1===a?b.puispinner("enable"):b.puispinner("disable")})})}}});$(function(){$.widget("primeui.puispinner",{options:{step:1},_create:function(){var a=this.element,b=a.prop("disabled");a.puiinputtext().addClass("pui-spinner-input").wrap('<span class="pui-spinner ui-widget ui-corner-all" />');this.wrapper=a.parent();this.wrapper.append('<a class="pui-spinner-button pui-spinner-up ui-corner-tr ui-button ui-widget ui-state-default ui-button-text-only"><span class="ui-button-text"><span class="ui-icon ui-icon-triangle-1-n"></span></span></a><a class="pui-spinner-button pui-spinner-down ui-corner-br ui-button ui-widget ui-state-default ui-button-text-only"><span class="ui-button-text"><span class="ui-icon ui-icon-triangle-1-s"></span></span></a>');
this.upButton=this.wrapper.children("a.pui-spinner-up");this.downButton=this.wrapper.children("a.pui-spinner-down");this._initValue();!b&&!a.prop("readonly")&&this._bindEvents();b&&this.wrapper.addClass("ui-state-disabled");a.attr({role:"spinner","aria-multiline":!1,"aria-valuenow":this.value});void 0!=this.options.min&&a.attr("aria-valuemin",this.options.min);void 0!=this.options.max&&a.attr("aria-valuemax",this.options.max);a.prop("disabled")&&a.attr("aria-disabled",!0);a.prop("readonly")&&a.attr("aria-readonly",
!0)},_bindEvents:function(){var a=this;this.wrapper.children(".pui-spinner-button").mouseover(function(){$(this).addClass("ui-state-hover")}).mouseout(function(){$(this).removeClass("ui-state-hover ui-state-active");a.timer&&clearInterval(a.timer)}).mouseup(function(){clearInterval(a.timer);$(this).removeClass("ui-state-active").addClass("ui-state-hover")}).mousedown(function(b){var c=$(this),d=c.hasClass("pui-spinner-up")?1:-1;c.removeClass("ui-state-hover").addClass("ui-state-active");a.element.is(":not(:focus)")&&
a.element.focus();a._repeat(null,d);b.preventDefault()});this.element.keydown(function(b){var c=$.ui.keyCode;switch(b.which){case c.UP:a._spin(a.options.step);break;case c.DOWN:a._spin(-1*a.options.step)}}).keyup(function(){a._updateValue()}).blur(function(){a._format()}).focus(function(){a.element.val(a.value)});this.element.bind("mousewheel",function(b,c){if(a.element.is(":focus"))return 0<c?a._spin(a.options.step):a._spin(-1*a.options.step),!1})},_repeat:function(a,b){var c=this,d=a||500;clearTimeout(this.timer);
this.timer=setTimeout(function(){c._repeat(40,b)},d);this._spin(this.options.step*b)},_spin:function(a){a=this.value+a;void 0!=this.options.min&&a<this.options.min&&(a=this.options.min);void 0!=this.options.max&&a>this.options.max&&(a=this.options.max);this.element.val(a).attr("aria-valuenow",a);this.value=a;this.element.trigger("change")},_updateValue:function(){var a=this.element.val();""==a?this.value=void 0!=this.options.min?this.options.min:0:(a=this.options.step?parseFloat(a):parseInt(a),isNaN(a)||
(this.value=a))},_initValue:function(){var a=this.element.val();""==a?this.value=void 0!=this.options.min?this.options.min:0:(this.options.prefix&&(a=a.split(this.options.prefix)[1]),this.options.suffix&&(a=a.split(this.options.suffix)[0]),this.value=this.options.step?parseFloat(a):parseInt(a))},_format:function(){var a=this.value;this.options.prefix&&(a=this.options.prefix+a);this.options.suffix&&(a+=this.options.suffix);this.element.val(a);this.element.trigger("change")},_unbindEvents:function(){this.wrapper.children(".pui-spinner-button").off();
this.element.off()},enable:function(){this.wrapper.removeClass("ui-state-disabled");this._bindEvents()},disable:function(){this.wrapper.addClass("ui-state-disabled");this._unbindEvents()}})});