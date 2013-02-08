# VTicker

This project is based on the cool vTicker jQuery plugin implentation by JugBit.

The original project can be found here: http://www.jugbit.com/jquery-vticker-vertical-news-ticker/

This project implements the original code but as a method based implementation. 
Compared to the original, it does not support fading and the direction option is removed as the animation direction is based on next or previous item: up for next; and down for previous.

There is a simple HTML test page which demonstrates the usage.

Please consider supporting the original author who has a Donate button on their page.

## Using

### Options

    var defaults = {
		speed: 700,
		pause: 4000,
		showItems: 3,
		mousePause: true,
		isPaused: false,
		height: 0
	};
	
### Starting ticker
	
    var $scroller = $("#scroller");
    $scroller.vTicker('init', {height: 20}); // fixed element height
    $scroller.vTicker('init', {showItems: 3}); // fixed number of items, automatically calculate item height
    $scroller.vTicker('init', {}); // show one item, automatically calculate item height
	
### Pausing
    
	$scroller.vTicker('pause', true);
	$scroller.vTicker('pause', false);	
	
### Adding previous / next buttons:

The options paramter of methods next & prev is optional. If omitted then animation is turned off (the default) As the animation slows down the speed at which the user can go through items this is why the default is off.

    $scroller.vTicker('next', {animate:true}); //animation==on
    $scroller.vTicker('next'); // animation==off

#### Sample next/prev usage:


    $(".next").click(function(event){ 
			event.preventDefault();
			$scroller.vTicker('next', {animate:true});
		});
	$(".prev,.next").hover(function(){ 
			$scroller.vTicker('pause', true);
		}, function(){
			$scroller.vTicker('pause', false);
	});
	$(".prev").click(function(event){ 
			event.preventDefault();
			$scroller.vTicker('prev', {animate:true});
		});	
	
