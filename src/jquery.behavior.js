/*
 * jQuery Behavior Plugin: Define rich behaviors that include both event 
 * handlers and (un)transformations on DOM elements.
 * 
 * Copyright (c) 2011 Florian Schäfer (florian.schaefer@gmail.com)
 * Dual licensed under the MIT (MIT_LICENSE.txt)
 * and GPL Version 2 (GPL_LICENSE.txt) licenses.
 *
 * Version: 1.3
 * Requires: jQuery 1.4.2+ and Live Query 1.1+.
 * 
 */
(function ($, attr) {

    // jQuery supports getData, setData and changeData,
    // support getAttr, setAttr, changeAttr too.
    $.attr = function (elem, name, value) {
        var current = attr(elem, name),
            // read current value.
            retval = current;

        if (!value) {
            // we are getting a value.
            $.event.trigger('getAttr', {
                attribute: name,
                from: current,
                to: value
            }, elem);
        } else { // writing
            // we are setting a value.
            $.event.trigger('setAttr', {
                attribute: name,
                from: current,
                to: value
            }, elem);

            retval = attr.apply(this, arguments); // call original.
            // value or type changed.
            if (current !== value) {
                $.event.trigger('changeAttr', {
                    attribute: name,
                    from: current,
                    to: value
                }, elem);
            }
        }
        return retval; // return original 
    };

})(jQuery, jQuery.attr);

(function ($, undefined) {

    if (!$.livequery) {
        throw "jquery.behavior.js: jQuery Plugin: Live Query not loaded.";
    }

    $.behavior = function (metabehaviors, context) {

        context = context || window.document;

        // Handle $.behavior(function () {}).
        if ($.isFunction(metabehaviors)) {
            metabehaviors = metabehaviors();
        }

        // Handle $.behavior(""), $.behavior(null), or $.behavior(undefined).
        if (!metabehaviors) {
            return this;
        }

        // Handle $.behavior([{ ... }, { ... }, ... ], [context]).
        if ($.isArray(metabehaviors)) {
            return $.each(metabehaviors, function () {
                $.behavior(this, context);
            });
        }

        // Handle $.behavior({ ... }, [context]).
        return $.each(metabehaviors, function (selector, metabehavior) {

            metabehavior = $.extend({
                transform: $.noop,
                untransform: $.noop
            }, metabehavior);

            // Cache element.
            var $elementInContext = $(selector, context),
                $context = $(context);

            // Transform DOM element.
            $elementInContext.livequery(metabehavior.transform, metabehavior.untransform);

            // Bind all events.
            for (var event in metabehavior) {

                if (metabehavior.hasOwnProperty(event)) {

                    switch (event) {
                    case 'transform':
                    case 'untransform':
                    case 'options':
                        // Don't handle these here.
                        continue;

                    case 'blur':
                    case 'focus':
                    case 'focusin':
                    case 'focusout':
                    case 'load':
                    case 'resize':
                    case 'scroll':
                    case 'unload':
                    case 'click':
                    case 'dblclick':
                    case 'mousedown':
                    case 'mouseup':
                    case 'mousemove':
                    case 'mouseover':
                    case 'mouseout':
                    case 'mouseenter':
                    case 'mouseleave':
                    case 'change':
                    case 'select':
                    case 'submit':
                    case 'keydown':
                    case 'keypress':
                    case 'keyup':
                    case 'error':
                        if ($.fn.on) {
                            $context.on(event, selector, metabehavior[event]);
                        } else {
                            $context.delegate(selector, event, metabehavior[event]);
                        }
                        break;

                    default:
                        $elementInContext.livequery(event, metabehavior[event]);
                        break;
                    }

                }

            }

        });
    };

    $.fn.behavior = function (metabehaviors) {
        return this.each(function () {
            $.behavior(metabehaviors, this);
        });
    };

})(jQuery);
