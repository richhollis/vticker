
/*
  Vertical News Ticker 1.2

  Original by: Tadas Juozapaitis ( kasp3rito [eta] gmail (dot) com )
               http://www.jugbit.com/jquery-vticker-vertical-news-ticker/

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
    startPaused: false
  };
  internal = {
    moveUp: function(state, attribs) {
      return internal.animate(state, attribs, 'up');
    },
    moveDown: function(state, attribs) {
      return internal.animate(state, attribs, 'down');
    },
    animate: function(state, attribs, dir) {
      var clone, el, height, obj, options, opts, selector;
      height = state.itemHeight;
      options = state.options;
      el = state.element;
      obj = el.children('ul');
      selector = dir === 'up' ? 'li:first' : 'li:last';
      el.trigger('vticker.beforeTick');
      clone = obj.children(selector).clone(true);
      if (options.height > 0) {
        height = obj.children('li:first').height();
      }
      height += options.margin + options.padding * 2;
      if (dir === 'down') {
        obj.css('top', '-' + height + 'px').prepend(clone);
      }
      if (attribs && attribs.animate) {
        if (state.animating) {
          return;
        }
        state.animating = true;
        opts = dir === 'up' ? {
          top: '-=' + height + 'px'
        } : {
          top: 0
        };
        obj.animate(opts, options.speed, function() {
          $(obj).children(selector).remove();
          $(obj).css('top', '0px');
          state.animating = false;
          return el.trigger('vticker.afterTick');
        });
      } else {
        obj.children(selector).remove();
        obj.css('top', '0px');
        el.trigger('vticker.afterTick');
      }
      if (dir === 'up') {
        return clone.appendTo(obj);
      }
    },
    nextUsePause: function() {
      var options, state;
      state = $(this).data('state');
      options = state.options;
      if (state.isPaused || state.itemCount < 2) {
        return;
      }
      return methods.next.call(this, {
        animate: options.animate
      });
    },
    startInterval: function() {
      var options, self, state;
      state = $(this).data('state');
      options = state.options;
      self = this;
      return state.intervalId = setInterval(function() {
        return internal.nextUsePause.call(self);
      }, options.pause);
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
    }
  };
  methods = {
    init: function(options) {
      var box, defaultsClone, el, self, state;
      methods.stop.call(this);
      defaultsClone = jQuery.extend({}, defaults);
      options = $.extend(defaultsClone, options);
      el = $(this);
      state = {
        itemCount: el.children('ul').children('li').length,
        itemHeight: 0,
        itemMargin: 0,
        element: el,
        animating: false,
        options: options,
        isPaused: options.startPaused ? true : false,
        pausedByCode: false
      };
      $(this).data('state', state);
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
          var current;
          current = $(this);
          if (current.height() > state.itemHeight) {
            return state.itemHeight = current.height();
          }
        });
        el.children('ul').children('li').each(function() {
          var current;
          current = $(this);
          return current.height(state.itemHeight);
        });
        box = options.margin + options.padding * 2;
        el.height((state.itemHeight + box) * options.showItems + options.margin);
      } else {
        el.height(options.height);
      }
      self = this;
      if (!options.startPaused) {
        internal.startInterval.call(self);
      }
      if (options.mousePause) {
        return el.bind('mouseenter', function() {
          if (state.isPaused === true) {
            return;
          }
          state.pausedByCode = true;
          internal.stopInterval.call(self);
          return methods.pause.call(self, true);
        }).bind('mouseleave', function() {
          if (state.isPaused === true && !state.pausedByCode) {
            return;
          }
          state.pausedByCode = false;
          methods.pause.call(self, false);
          return internal.startInterval.call(self);
        });
      }
    },
    pause: function(pauseState) {
      var el, state;
      state = $(this).data('state');
      if (!state) {
        return void 0;
      }
      if (state.itemCount < 2) {
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
      state = $(this).data('state');
      if (!state) {
        return void 0;
      }
      if (state.animating || state.itemCount < 2) {
        return false;
      }
      internal.restartInterval.call(this);
      return internal.moveUp(state, attribs);
    },
    prev: function(attribs) {
      var state;
      state = $(this).data('state');
      if (!state) {
        return void 0;
      }
      if (state.animating || state.itemCount < 2) {
        return false;
      }
      internal.restartInterval.call(this);
      return internal.moveDown(state, attribs);
    },
    stop: function() {
      var state;
      state = $(this).data('state');
      if (!state) {
        return void 0;
      }
      return internal.stopInterval.call(this);
    },
    remove: function() {
      var el, state;
      state = $(this).data('state');
      if (!state) {
        return void 0;
      }
      internal.stopInterval.call(this);
      el = state.element;
      el.unbind();
      return el.remove();
    }
  };
  return $.fn.vTicker = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      return $.error('Method ' + method + ' does not exist on jQuery.vTicker');
    }
  };
})(jQuery);
