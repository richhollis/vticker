
/*
  Vertical News Ticker 1.21

  Original by: Tadas Juozapaitis ( kasp3rito [eta] gmail (dot) com )
               https://github.com/kasp3r/vTicker

  Forked/Modified by: Richard Hollis @richhollis - richhollis.co.uk
 */
(function($) {
  var defaults, internal, methods;
  defaults = {
    speed: 700,
    pause: 4000,
    showItems: 1,
    mousePause: true,
    height: 0,
    animate: true,
    margin: 0,
    padding: 0,
    startPaused: false,
    autoAppend: true
  };
  internal = {
    moveUp: function(state, attribs) {
      return internal.showNextItem(state, attribs, 'up');
    },
    moveDown: function(state, attribs) {
      return internal.showNextItem(state, attribs, 'down');
    },
    nextItemState: function(state, dir) {
      var height, obj;
      obj = state.element.children('ul');
      height = state.itemHeight;
      if (state.options.height > 0) {
        height = obj.children('li:first').height();
      }
      height += state.options.margin + state.options.padding * 2;
      return {
        height: height,
        options: state.options,
        el: state.element,
        obj: obj,
        selector: dir === 'up' ? 'li:first' : 'li:last',
        dir: dir
      };
    },
    showNextItem: function(state, attribs, dir) {
      var clone, nis;
      nis = internal.nextItemState(state, dir);
      nis.el.trigger('vticker.beforeTick');
      clone = nis.obj.children(nis.selector).clone(true);
      if (nis.dir === 'down') {
        nis.obj.css('top', '-' + nis.height + 'px').prepend(clone);
      }
      if (attribs && attribs.animate) {
        if (!state.animating) {
          internal.animateNextItem(nis, state);
        }
      } else {
        internal.nonAnimatedNextItem(nis);
      }
      if (nis.dir === 'up' && state.options.autoAppend) {
        clone.appendTo(nis.obj);
      }
      return nis.el.trigger('vticker.afterTick');
    },
    animateNextItem: function(nis, state) {
      var opts;
      state.animating = true;
      opts = nis.dir === 'up' ? {
        top: '-=' + nis.height + 'px'
      } : {
        top: 0
      };
      return nis.obj.animate(opts, state.options.speed, function() {
        $(nis.obj).children(nis.selector).remove();
        $(nis.obj).css('top', '0px');
        return state.animating = false;
      });
    },
    nonAnimatedNextItem: function(nis) {
      nis.obj.children(nis.selector).remove();
      return nis.obj.css('top', '0px');
    },
    nextUsePause: function() {
      var options, state;
      state = $(this).data('state');
      options = state.options;
      if (state.isPaused || internal.hasSingleItem(state)) {
        return;
      }
      return methods.next.call(this, {
        animate: options.animate
      });
    },
    startInterval: function() {
      var options, state;
      state = $(this).data('state');
      options = state.options;
      return state.intervalId = setInterval((function(_this) {
        return function() {
          return internal.nextUsePause.call(_this);
        };
      })(this), options.pause);
    },
    stopInterval: function() {
      var state;
      if (!(state = $(this).data('state'))) {
        return;
      }
      if (state.intervalId) {
        clearInterval(state.intervalId);
      }
      return state.intervalId = void 0;
    },
    restartInterval: function() {
      internal.stopInterval.call(this);
      return internal.startInterval.call(this);
    },
    getState: function(from, elem) {
      var state;
      if (!(state = $(elem).data('state'))) {
        throw new Error("vTicker: No state available from " + from);
      }
      return state;
    },
    isAnimatingOrSingleItem: function(state) {
      return state.animating || this.hasSingleItem(state);
    },
    hasMultipleItems: function(state) {
      return state.itemCount > 1;
    },
    hasSingleItem: function(state) {
      return !internal.hasMultipleItems(state);
    },
    bindMousePausing: (function(_this) {
      return function(el, state) {
        return el.bind('mouseenter', function() {
          if (state.isPaused) {
            return;
          }
          state.pausedByCode = true;
          internal.stopInterval.call(this);
          return methods.pause.call(this, true);
        }).bind('mouseleave', function() {
          if (state.isPaused && !state.pausedByCode) {
            return;
          }
          state.pausedByCode = false;
          methods.pause.call(this, false);
          return internal.startInterval.call(this);
        });
      };
    })(this),
    setItemLayout: function(el, state, options) {
      var box;
      el.css({
        overflow: 'hidden',
        position: 'relative'
      }).children('ul').css({
        position: 'absolute',
        margin: 0,
        padding: 0
      }).children('li').css({
        margin: options.margin,
        padding: options.padding
      });
      if (isNaN(options.height) || options.height === 0) {
        el.children('ul').children('li').each(function() {
          if ($(this).height() > state.itemHeight) {
            return state.itemHeight = $(this).height();
          }
        });
        el.children('ul').children('li').each(function() {
          return $(this).height(state.itemHeight);
        });
        box = options.margin + options.padding * 2;
        return el.height((state.itemHeight + box) * options.showItems + options.margin);
      } else {
        return el.height(options.height);
      }
    },
    defaultStateAttribs: function(el, options) {
      return {
        itemCount: el.children('ul').children('li').length,
        itemHeight: 0,
        itemMargin: 0,
        element: el,
        animating: false,
        options: options,
        isPaused: options.startPaused,
        pausedByCode: false
      };
    }
  };
  methods = {
    init: function(options) {
      var clonedDefaults, el, state;
      if (state = $(this).data('state')) {
        methods.stop.call(this);
      }
      state = null;
      clonedDefaults = jQuery.extend({}, defaults);
      options = $.extend(clonedDefaults, options);
      el = $(this);
      state = internal.defaultStateAttribs(el, options);
      $(this).data('state', state);
      internal.setItemLayout(el, state, options);
      if (!options.startPaused) {
        internal.startInterval.call(this);
      }
      if (options.mousePause) {
        return internal.bindMousePausing(el, state);
      }
    },
    pause: function(pauseState) {
      var el, state;
      state = internal.getState('pause', this);
      if (!internal.hasMultipleItems(state)) {
        return false;
      }
      state.isPaused = pauseState;
      el = state.element;
      if (pauseState) {
        $(this).addClass('paused');
        return el.trigger('vticker.pause');
      } else {
        $(this).removeClass('paused');
        return el.trigger('vticker.resume');
      }
    },
    next: function(attribs) {
      var state;
      state = internal.getState('next', this);
      if (internal.isAnimatingOrSingleItem(state)) {
        return false;
      }
      internal.restartInterval.call(this);
      return internal.moveUp(state, attribs);
    },
    prev: function(attribs) {
      var state;
      state = internal.getState('prev', this);
      if (internal.isAnimatingOrSingleItem(state)) {
        return false;
      }
      internal.restartInterval.call(this);
      return internal.moveDown(state, attribs);
    },
    stop: function() {
      var state;
      state = internal.getState('stop', this);
      return internal.stopInterval.call(this);
    },
    remove: function() {
      var el, state;
      state = internal.getState('remove', this);
      internal.stopInterval.call(this);
      el = state.element;
      el.unbind();
      return el.remove();
    }
  };
  return $.fn.vTicker = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    }
    return $.error('Method ' + method + ' does not exist on jQuery.vTicker');
  };
})(jQuery);
