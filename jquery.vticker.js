/*
* vertical news ticker
* Tadas Juozapaitis ( kasp3rito [eta] gmail (dot) com )
* http://www.jugbit.com/jquery-vticker-vertical-news-ticker/
*/
/* 
	Modified by Richard Hollis 
*/

(function($){
	var defaults = {
		speed: 700,
		pause: 4000,
		showItems: 3,
		mousePause: true,
		isPaused: false,
		height: 0
	};
	var methods = {
		options: null,
		maxHeight: 0,
		obj: null,
		animating: false,
		init: function(options) {
			var options = methods.options = $.extend(defaults, options);
			var obj = methods.obj = $(this);
			var maxHeight = 0;

			obj.css({overflow: 'hidden', position: 'relative'})
				.children('ul').css({position: 'absolute', margin: 0, padding: 0})
				.children('li').css({margin: 0, padding: 0});

			if(options.height == 0)
			{
				obj.children('ul').children('li').each(function(){
					if($(this).height() > maxHeight)
					{
						methods.maxHeight = $(this).height();
					}
				});

				obj.children('ul').children('li').each(function(){
					$(this).height(maxHeight);
				});

				obj.height(maxHeight * options.showItems);
			}
			else
			{
				obj.height(options.height);
			}
			
			var interval = setInterval(function(){ 
				methods.nextUsePause();
			}, options.pause);
			
			if(options.mousePause)
			{
				obj.bind("mouseenter",function(){
					methods.pause(true);
				}).bind("mouseleave",function(){
					methods.pause(false);
				});
			}
		},
		pause: function(state) {
			methods.options.isPaused = state;
		},
		moveUp: function(obj2, height, options, moveOptions){		
			var obj = obj2.children('ul');
			
			var clone = obj.children('li:first').clone(true);
			
			if(options.height > 0)
			{
				height = obj.children('li:first').height();
			}

			if(moveOptions && moveOptions.animate) {
				methods.animating = true;
				obj.animate({top: '-=' + height + 'px'}, options.speed, function() {
						$(this).children('li:first').remove();
						$(this).css('top', '0px');
						methods.animating = false;
					});
			} else {
				obj.children('li:first').remove();
				obj.css('top', '0px');
			}

			clone.appendTo(obj);
		},
		moveDown: function(obj2, height, options, moveOptions){
			var obj = obj2.children('ul');
			
			var clone = obj.children('li:last').clone(true);
			
			if(options.height > 0)
			{
				height = obj.children('li:first').height();
			}
			
			obj.css('top', '-' + height + 'px')
				.prepend(clone);
			
			if(moveOptions && moveOptions.animate) {
				if(methods.animating) return;
				methods.animating = true;
				obj.animate({top: 0}, options.speed, function() {
					$(this).children('li:last').remove();
					methods.animating = false;
				});
			} else {
				obj.children('li:last').remove();
				obj.css('top', '0px');
			}
		},
		nextUsePause: function() {
			if(methods.options.isPaused) return;
			methods.next({animate: true});
		},
		next: function(options) { 
			if(methods.animating) return false;
			methods.moveUp(methods.obj, methods.maxHeight, methods.options, options); 
		},
		prev: function(options) {
			if(methods.animating) return false;
			methods.moveDown(methods.obj, methods.maxHeight, methods.options, options); 
		}
	};
 
	$.fn.vTicker = function( method ) {

		if ( methods[method] ) {
		  return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
		  return methods.init.apply( this, arguments );
		} else {
		  $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}    
	};
})(jQuery);