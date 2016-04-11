###
  Vertical News Ticker 1.2

  Original by: Tadas Juozapaitis ( kasp3rito [eta] gmail (dot) com )
               http://www.jugbit.com/jquery-vticker-vertical-news-ticker/

  Forked/Modified by: Richard Hollis @richhollis - richhollis.co.uk
###

(($) ->
  defaults = 
    speed: 700
    pause: 4000
    showItems: 1
    mousePause: true
    height: 0
    animate: true
    margin: 0
    padding: 0
    startPaused: false

  internal = 
    moveUp: (state, attribs) -> internal.animate state, attribs, 'up'

    moveDown: (state, attribs) -> internal.animate state, attribs, 'down'

    animate: (state, attribs, dir) ->
      height = state.itemHeight
      options = state.options
      el = state.element
      obj = el.children('ul')
      selector = if dir == 'up' then 'li:first' else 'li:last'
      el.trigger 'vticker.beforeTick'
      clone = obj.children(selector).clone(true)
      height = obj.children('li:first').height() if options.height > 0        
      height += options.margin + options.padding * 2
      # adjust for margins & padding
      obj.css('top', '-' + height + 'px').prepend clone if dir == 'down'        
      if attribs && attribs.animate
        return if state.animating
        state.animating = true
        opts = if dir == 'up' then top: '-=' + height + 'px' else top: 0
        obj.animate opts, options.speed, ->
          $(obj).children(selector).remove()
          $(obj).css 'top', '0px'
          state.animating = false
          el.trigger 'vticker.afterTick'
      else
        obj.children(selector).remove()
        obj.css 'top', '0px'
        el.trigger 'vticker.afterTick'
      clone.appendTo obj if dir == 'up'

    nextUsePause: ->
      state = $(@).data('state')
      options = state.options
      return if state.isPaused || state.itemCount < 2
      methods.next.call @, animate: options.animate

    startInterval: ->
      state = $(@).data('state')
      options = state.options
      self = @
      state.intervalId = setInterval ->
        internal.nextUsePause.call self
      , options.pause

    stopInterval: ->
      return if !state = $(@).data('state')       
      clearInterval state.intervalId if state.intervalId
      state.intervalId = undefined

    restartInterval: ->
      internal.stopInterval.call @
      internal.startInterval.call @

  methods = 
    init: (options) ->
      # if init called second time then stop first, then re-init
      methods.stop.call @
      # init
      defaultsClone = jQuery.extend({}, defaults)
      options = $.extend(defaultsClone, options)
      el = $(@)
      
      state = 
        itemCount: el.children('ul').children('li').length
        itemHeight: 0
        itemMargin: 0
        element: el
        animating: false
        options: options
        isPaused: if options.startPaused then true else false
        pausedByCode: false

      $(@).data 'state', state

      el.css(
        overflow: 'hidden'
        position: 'relative')
      .children('ul').css(
        position: 'absolute'
        margin: 0
        padding: 0)
      .children('li').css
        margin: options.margin
        padding: options.padding

      if isNaN(options.height) || options.height == 0
        el.children('ul').children('li').each ->
          current = $(@)
          if current.height() > state.itemHeight
            state.itemHeight = current.height()
        # set the same height on all child elements
        el.children('ul').children('li').each ->
          current = $(@)
          current.height state.itemHeight
        # set element to total height
        box = options.margin + options.padding * 2
        el.height (state.itemHeight + box) * options.showItems + options.margin
      else
        # set the preferred height
        el.height options.height
      self = @
      internal.startInterval.call self if !options.startPaused
      if options.mousePause
        el.bind('mouseenter', ->
          #if the automatic scroll is paused, don't change that.
          return if state.isPaused == true
          state.pausedByCode = true
          # stop interval
          internal.stopInterval.call self
          methods.pause.call self, true
        ).bind 'mouseleave', ->
          #if the automatic scroll is paused, don't change that.
          return if state.isPaused == true && !state.pausedByCode
          state.pausedByCode = false
          methods.pause.call self, false
          # restart interval
          internal.startInterval.call self

    pause: (pauseState) ->
      state = $(@).data('state')
      return undefined unless state
      return false if state.itemCount < 2
      state.isPaused = pauseState
      el = state.element
      if pauseState
        $(@).addClass 'paused'
        el.trigger 'vticker.pause'
      else
        $(@).removeClass 'paused'
        el.trigger 'vticker.resume'

    next: (attribs) ->
      state = $(@).data('state')
      return undefined unless state
      return false if state.animating || state.itemCount < 2
      internal.restartInterval.call @
      internal.moveUp state, attribs

    prev: (attribs) ->
      state = $(@).data('state')
      return undefined unless state
      return false if state.animating || state.itemCount < 2       
      internal.restartInterval.call @
      internal.moveDown state, attribs

    stop: ->
      state = $(@).data('state')
      return undefined unless state
      internal.stopInterval.call @

    remove: ->
      state = $(@).data('state')
      return undefined unless state
      internal.stopInterval.call @
      el = state.element
      el.unbind()
      el.remove()

  $.fn.vTicker = (method) ->
    if methods[method]
      return methods[method].apply(@, Array::slice.call(arguments, 1))
    else if typeof method == 'object' || !method
      return methods.init.apply(@, arguments)
    else
      $.error 'Method ' + method + ' does not exist on jQuery.vTicker'
) jQuery