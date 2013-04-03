/*
  Vertical News Ticker 1.12

  Original by: Tadas Juozapaitis ( kasp3rito [eta] gmail (dot) com )
               http://www.jugbit.com/jquery-vticker-vertical-news-ticker/

  Modified by: Richard Hollis @richhollis - richhollis.co.uk
*/

(function($){

  var defaults = {
    speed: 700,
    pause: 4000,
    showItems: 1,
    mousePause: true,
    height: 0,
    animate: true,
    margin: 0,
    padding: 0
  };

  var internal = { 

    moveUp: function(state, attribs) {    
      var height = state.itemHeight;
      var options = state.options;
      var el = state.element;
      var obj = el.children('ul');
      
      var clone = obj.children('li:first').clone(true);

      if(options.height > 0)
      {
        height = obj.children('li:first').height();
      }

      // adjust for margins & padding
      height += (options.margin) + (options.padding*2);

      if(attribs && attribs.animate) {
        state.animating = true;
        obj.animate({top: '-=' + height + 'px'}, options.speed, function() {
            $(obj).children('li:first').remove();
            $(obj).css('top', '0px');
            state.animating = false;
          });
      } else {
        obj.children('li:first').remove();
        obj.css('top', '0px');
      }

      clone.appendTo(obj);
    },

    moveDown: function(state, attribs){
      var height = state.itemHeight;
      var options = state.options;
      var el = state.element;
      var obj = el.children('ul');
      
      var clone = obj.children('li:last').clone(true);
      
      if(options.height > 0)
      {
        height = obj.children('li:first').height()
      }

      // adjust for margins & padding
      height += (options.margin) + (options.padding*2);
      
      obj.css('top', '-' + height + 'px')
        .prepend(clone);
      
      if(attribs && attribs.animate) {
        if(state.animating) return;
        state.animating = true;
        obj.animate({top: 0}, options.speed, function() {
          $(obj).children('li:last').remove();
          state.animating = false;
        });
      } else {
        obj.children('li:last').remove();
        obj.css('top', '0px');
      }
    },

    nextUsePause: function() {
      var state = $(this).data('state');
      var options = state.options;
      if(state.isPaused || state.itemCount < 2) return;
      methods.next.call( this, {animate:options.animate} );
    },

    startInterval: function() {
      var state = $(this).data('state');
      var options = state.options;
      var initThis = this;
      state.intervalId = setInterval(function(){ 
        internal.nextUsePause.call( initThis );
      }, options.pause);
    },

    stopInterval: function() {
      var state = $(this).data('state');
      if(state.intervalId) clearInterval(state.intervalId);
      state.interval = 0;
    },

    restartInterval: function() {
      internal.stopInterval.call(this);
      internal.startInterval.call(this);
    }

  };

  var methods = {

    init: function(options) {
      var defaultsClone = jQuery.extend({}, defaults);
      var options = $.extend(defaultsClone, options);
      var el = $(this);
      var state = { 
        itemCount: el.children('ul').children('li').length,
        itemHeight: 0,
        itemMargin: 0,
        element: el,
        animating: false,
        options: options,
        isPaused: false
      };
      $(this).data('state', state);

      el.css({overflow: 'hidden', position: 'relative'})
        .children('ul').css({position: 'absolute', margin: 0, padding: 0})
        .children('li').css({margin: options.margin, padding: options.padding});

      if(isNaN(options.height) || options.height == 0)
      {
        el.children('ul').children('li').each(function(){
          var current = $(this);
          if(current.height() > state.itemHeight)
            state.itemHeight = current.height();
        });

        // set the same height on all child elements
        el.children('ul').children('li').each(function(){
          var current = $(this);
          current.height(state.itemHeight);
        });

        // set element to total height
        var box = (options.margin) + (options.padding * 2);
        el.height(((state.itemHeight + box) * options.showItems) + options.margin);
      }
      else
      {
        // set the preferred height
        el.height(options.height);
      }

      var initThis = this;
      internal.startInterval.call( initThis );

      if(options.mousePause)
      {
        el.bind("mouseenter",function(){
          // stop interval
          internal.stopInterval.call( initThis );
          methods.pause.call( initThis, true );
        }).bind("mouseleave",function(){
          methods.pause.call( initThis, false );
          // restart interval
          internal.startInterval.call( initThis );
        });
      }
    },

    pause: function(pauseState) {
      var state = $(this).data('state');
      if(state.itemCount < 2) return false;
      state.isPaused = pauseState;
      if(pauseState) $(this).addClass('paused');
      else $(this).removeClass('paused');
    },

    next: function(attribs) { 
      var state = $(this).data('state');
      if(state.animating || state.itemCount < 2) return false;
      internal.restartInterval.call( this );
      internal.moveUp(state, attribs); 
    },

    prev: function(attribs) {
      var state = $(this).data('state');
      if(state.animating || state.itemCount < 2) return false;
      internal.restartInterval.call( this );
      internal.moveDown(state, attribs); 
    }
  };
 
  $.fn.vTicker = function( method ) {
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.vTicker' );
    }    
  };
})(jQuery);
