###
  Vertical News Ticker 1.21

  Original by: Tadas Juozapaitis ( kasp3rito [eta] gmail (dot) com )
               https://github.com/kasp3r/vTicker

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
    autoAppend: true

  internal = 
    moveUp: (state, attribs) -> internal.showNextItem(state, attribs, 'up')

    moveDown: (state, attribs) -> internal.showNextItem(state, attribs, 'down')

    nextItemState: (state, dir) ->
      obj = state.element.children('ul')
      # calc height
      height = state.itemHeight
      height = obj.children('li:first').height() if state.options.height > 0        
      height += state.options.margin + state.options.padding * 2
      # attributes
      height: height
      options: state.options
      el: state.element
      obj: obj
      selector: if dir == 'up' then 'li:first' else 'li:last'
      dir: dir

    showNextItem: (state, attribs, dir) ->
      nis = internal.nextItemState(state, dir)
      nis.el.trigger 'vticker.beforeTick'
      clone = nis.obj.children(nis.selector).clone(true)
      # adjust for margins & padding
      nis.obj.css('top', '-' + nis.height + 'px').prepend(clone) if nis.dir == 'down' 
      if attribs && attribs.animate
        internal.animateNextItem(nis, state) unless state.animating
      else
        internal.nonAnimatedNextItem(nis)
      clone.appendTo(nis.obj) if nis.dir == 'up' && state.options.autoAppend
      nis.el.trigger 'vticker.afterTick'

    animateNextItem: (nis, state) ->
      state.animating = true
      opts = if nis.dir == 'up' then top: '-=' + nis.height + 'px' else top: 0
      nis.obj.animate opts, state.options.speed, ->
        $(nis.obj).children(nis.selector).remove()
        $(nis.obj).css 'top', '0px'
        state.animating = false

    nonAnimatedNextItem: (nis) ->
      nis.obj.children(nis.selector).remove()
      nis.obj.css 'top', '0px'          

    nextUsePause: ->
      state = $(@).data('state')
      options = state.options
      return if state.isPaused || internal.hasSingleItem(state)
      methods.next.call @, animate: options.animate

    startInterval: ->
      state = $(@).data('state')
      options = state.options
      state.intervalId = setInterval =>
        internal.nextUsePause.call @
      , options.pause

    stopInterval: ->
      return unless state = $(@).data('state')       
      clearInterval state.intervalId if state.intervalId
      state.intervalId = undefined

    restartInterval: ->
      internal.stopInterval.call @
      internal.startInterval.call @

    getState: (from, elem) ->      
      throw new Error("vTicker: No state available from #{from}") unless state = $(elem).data('state')
      state

    isAnimatingOrSingleItem: (state) -> state.animating || @hasSingleItem(state)

    hasMultipleItems: (state) -> state.itemCount > 1

    hasSingleItem: (state) -> !internal.hasMultipleItems(state)

    bindMousePausing: (el, state) =>
      el.bind 'mouseenter', ->
        # if the automatic scroll is paused, don't change that.
        return if state.isPaused
        state.pausedByCode = true
        # stop interval
        internal.stopInterval.call @
        methods.pause.call @, true
      .bind 'mouseleave', ->
        # if the automatic scroll is paused, don't change that.
        return if state.isPaused && !state.pausedByCode
        state.pausedByCode = false
        methods.pause.call @, false
        # restart interval
        internal.startInterval.call @

    setItemLayout: (el, state, options) ->
      el.css(overflow: 'hidden', position: 'relative')
      .children('ul').css(position: 'absolute', margin: 0, padding: 0)
      .children('li').css(margin: options.margin, padding: options.padding)

      if isNaN(options.height) || options.height == 0
        el.children('ul').children('li').each -> state.itemHeight = $(@).height() if $(@).height() > state.itemHeight
        # set the same height on all child elements
        el.children('ul').children('li').each -> $(@).height(state.itemHeight)
        # set element to total height
        box = options.margin + options.padding * 2
        el.height (state.itemHeight + box) * options.showItems + options.margin
      else        
        el.height options.height # set the preferred height

    defaultStateAttribs: (el, options) ->
      itemCount: el.children('ul').children('li').length
      itemHeight: 0
      itemMargin: 0
      element: el
      animating: false
      options: options
      isPaused: options.startPaused
      pausedByCode: false

  methods = 
    init: (options) ->     
      methods.stop.call @ if state = $(@).data('state') # if init called second time then stop first, then re-init
      state = null

      clonedDefaults = jQuery.extend({}, defaults)
      options = $.extend(clonedDefaults, options)
      
      el = $(@)
      
      state = internal.defaultStateAttribs(el, options)
      $(@).data('state', state)

      internal.setItemLayout(el, state, options)
      internal.startInterval.call @ unless options.startPaused
      internal.bindMousePausing(el, state) if options.mousePause

    pause: (pauseState) ->
      state = internal.getState('pause', @)
      return false unless internal.hasMultipleItems(state)
      state.isPaused = pauseState
      el = state.element
      if pauseState
        $(@).addClass 'paused'
        el.trigger 'vticker.pause'
      else
        $(@).removeClass 'paused'
        el.trigger 'vticker.resume'

    next: (attribs) ->
      state = internal.getState('next', @)
      return false if internal.isAnimatingOrSingleItem(state)
      internal.restartInterval.call @
      internal.moveUp state, attribs

    prev: (attribs) ->
      state = internal.getState('prev', @)
      return false if internal.isAnimatingOrSingleItem(state)
      internal.restartInterval.call @
      internal.moveDown state, attribs

    stop: ->
      state = internal.getState('stop', @)
      internal.stopInterval.call @

    remove: ->
      state = internal.getState('remove', @)
      internal.stopInterval.call @
      el = state.element
      el.unbind()
      el.remove()

  $.fn.vTicker = (method) ->
    return methods[method].apply(@, Array::slice.call(arguments, 1)) if methods[method]
    return methods.init.apply(@, arguments) if typeof method == 'object' || !method
    $.error 'Method ' + method + ' does not exist on jQuery.vTicker'
    
) jQuery    