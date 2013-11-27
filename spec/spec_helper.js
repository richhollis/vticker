beforeEach(function() {
});

function el() {
  return $('#first');
}

function first() {
  return $('#first li:first');
}

function second() {
  return $('#second li:first');
}

function val() { 
  return first().text();
}

function getIntervals(clock) {
  var intervals = [];
  $.each(clock.timeouts, function() { intervals.push(this); });
  return intervals;
}

function init(options) {
  if(options == undefined) options = {};
  $('#first').vTicker('init', options);
}

function pause() {
  el().vTicker('pause', true);
}

function unpause() {
  el().vTicker('pause', false);
}

function stopTicker() {
  el().vTicker('stop');
}

function prev() {
  el().vTicker('prev');
}

function next() {
  el().vTicker('next');
}

function remove() {
  el().vTicker('remove');
}