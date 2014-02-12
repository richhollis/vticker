describe("jquery.vticker", function() {
  
  var clock;
  var interval = 4000;

  beforeEach(function() {
    jQuery.fx.off = true;
    loadFixtures('dual.html');
    clock = sinon.useFakeTimers();
  });
  
  afterEach(function() {
    clock.restore();
  });

  it("supports two independent tickers", function() {
    $('#first').vTicker('init', {pause:500});
    $('#second').vTicker('init', {pause:1000});
    expect(first().text()).toEqual("Item 1");
    expect(second().text()).toEqual("Item A");
    clock.tick(500);
    expect(first().text()).toEqual("Item 2");
    expect(second().text()).toEqual("Item A");
    clock.tick(500);
    expect(first().text()).toEqual("Item 3");
    expect(second().text()).toEqual("Item B");
    clock.tick(500);
    expect(first().text()).toEqual("Item 4");
    expect(second().text()).toEqual("Item B");
    $('#first').vTicker('stop');
    $('#second').vTicker('stop');
    expect(clock.timeouts).toEqual({}); // timers were set, but cleaned up
  });

  it("adds paused class when paused", function() {
    init();
    pause();
    expect(el().attr("class")).toEqual("paused");
  });

  it("removes paused class when unpaused", function() {
    init();
    pause();
    unpause();
    expect(el().attr("class")).toEqual("");
  });

  it("should not scroll when paused and mouse enters/leaves (issue #6)", function() {
    init();
    pause();
    first().mouseenter().mouseleave();
    clock.tick(interval * 2);
    expect(val()).toEqual("Item 1");
    stopTicker();
    expect(clock.timeouts).toEqual({}); // timers were set, but cleaned up
  });

  it("doesn't scroll when startPaused option is set", function() {
    init({startPaused: true});
    expect(val()).toEqual("Item 1");
    clock.tick(interval);
    expect(val()).toEqual("Item 1");
    expect(clock.timeouts).toBeUndefined(); // timeouts were never set
  });

  it("doesn't scroll when startPaused option is set and mouse enters/leaves", function() {
    init({startPaused: true});
    first().mouseenter().mouseleave();
    clock.tick(interval * 2);
    expect(val()).toEqual("Item 1");
    expect(clock.timeouts).toBeUndefined(); // timeouts were never set
  });

  it("should not scroll after being stopped", function() {
    init();
    stopTicker();
    clock.tick(interval * 2);
    expect(val()).toEqual("Item 1");
    expect(clock.timeouts).toEqual({}); // timers were set, but cleaned up
  });

  it("only creates one timer interval when init called multiple times", function() {
    init();
    init();
    clock.tick(interval);
    expect(getIntervals(clock).length).toEqual(1); 
  });

  it("honors the pause option", function() {
    init({pause:500});
    expect(val()).toEqual("Item 1");
    clock.tick(499);
    expect(val()).toEqual("Item 1");
    clock.tick(1);
    expect(val()).toEqual("Item 2");
  });

  it("scrolls when mousePause option is false", function() {
    init({mousePause: false});
    first().mouseenter();
    clock.tick(interval - 1);
    expect(val()).toEqual("Item 1");
    clock.tick(1);
    expect(val()).toEqual("Item 2");
  });

  it("fires beforeTick and afterTick events in correct order when animating", function() {
    var i = 0;
    var beforeTick = 0;
    var afterTick = 0;
    $('#first').vTicker('init', {pause:500});
    $('#first').on('vticker.beforeTick', function() { 
      beforeTick = ++i;
    });
    $('#first').on('vticker.afterTick', function() { 
      afterTick = ++i;
    });
    clock.tick(499);
    expect(beforeTick).toBeFalsy();
    expect(afterTick).toBeFalsy();
    clock.tick(1);
    expect(beforeTick).toEqual(1);
    expect(afterTick).toEqual(2);
  });

  it("sends pause event when paused", function() {
    var paused = false;
    $('#first').on('vticker.pause', function() { paused = true; });
    init();
    expect(paused).toBeFalsy();
    pause();
    expect(paused).toBeTruthy();
  });

  it("sends resume event when un-paused", function() {
    var resume = false;
    $('#first').on('vticker.resume', function() { resume = true; });
    init();
    expect(resume).toBeFalsy();
    pause();
    expect(resume).toBeFalsy();
    unpause();
    expect(resume).toBeTruthy();
  });

  describe("when not initialized", function() {
    it("#stop should return undefined", function() {
      expect(stopTicker()).toBeUndefined();
    });
    it("#pause(true) should return undefined", function() {
      expect(pause()).toBeUndefined();
    });
    it("#pause(false) should return undefined", function() {
      expect(unpause()).toBeUndefined();
    });
    it("#prev should return undefined", function() {
      expect(prev()).toBeUndefined();
    });
    it("#next should return undefined", function() {
      expect(next()).toBeUndefined();
    });
  });

  it("can be removed", function() {
    init({pause:500});
    $('#second').vTicker('init', {pause:1000});
    clock.tick(500);
    expect(val()).toEqual("Item 2");
    remove();
    clock.tick(500);
    expect(document.getElementById("first")).toBeNull(); // removed
    expect(document.getElementById("second")).toBeDefined(); // not removed
    expect(second().text()).toEqual("Item B"); // second continues to tick
  });
});