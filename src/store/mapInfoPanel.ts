
declare type Listener<T> = (event: T) => void

class EventDispatcher<T> {

  listeners: Listener<T>[] = []
  constructor() { }

  addEventListener(listener: Listener<T>) {
    this.listeners.push(listener)
  }

  removeEventListener(listener: Listener<T>) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  dispatch(event: T) {
    this.listeners.forEach(l => l(event))
  }
}


declare type AnnotationSelectEvent = { annotation: any, annotationID: string }

export const onAnnotationSelect = new EventDispatcher<AnnotationSelectEvent>()
export const onAnnotationDeSelect = new EventDispatcher<AnnotationSelectEvent>()
