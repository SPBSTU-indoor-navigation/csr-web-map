export function useZoomDisable() {
  document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) event.preventDefault();
  })

  let drags = new Set() //set of all active drags
  document.addEventListener("touchmove", function (event) {
    if (!event.isTrusted) return //don't react to fake touches
    Array.from(event.changedTouches).forEach(function (touch) {
      drags.add(touch.identifier) //mark this touch as a drag
    })
  })

  document.addEventListener("touchend", function (event) {
    if (!event.isTrusted) return
    let isDrag = false
    Array.from(event.changedTouches).forEach(function (touch) {
      if (drags.has(touch.identifier)) {
        isDrag = true
      }
      drags.delete(touch.identifier) //touch ended, so delete it
    })
    if (!isDrag && document.activeElement == document.body) {
      //note that double-tap only happens when the body is active
      event.preventDefault() //don't zoom
      event.stopPropagation() //don't relay event
      event.target.focus() //in case it's an input element
      event.target.click() //in case it has a click handler
      event.target.dispatchEvent(new TouchEvent("touchend", event))
      //dispatch a copy of this event (for other touch handlers)
    }
  })
}
