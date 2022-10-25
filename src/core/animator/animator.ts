import { Easing, Tween } from '@tweenjs/tween.js'
import { modify, nextFrame } from '../shared/utils';
import { SpringEasing } from './springAnimation';

declare type Animation = {
  value: Record<string, any>,
  duration?: number,
  delay?: number,
  to?: any,
  toFunc?: () => any,
  easing?: (amount: number) => number,
  completion?: () => void,
  onUpdate?: (val: any) => void
};

declare type AnimationCallback = {
  callback: () => void,
  isSingle: boolean
}

export class Animator {
  private setDirty: () => void
  private animations: Animation[] = []
  playedAnimations: Tween<Record<string, any>>[] = []
  private dependents: Animator[] = []

  private onStartCallback: AnimationCallback[] = []
  private onEndCallback: AnimationCallback[] = []


  get isPlaying() {
    return this.playedAnimations.length != 0
  }

  constructor(setDirty: () => void = () => { }, dependents: Animator[] = []) {
    this.setDirty = setDirty
    this.dependents = dependents
  }

  animate(animation: Animation): this {
    this.animations.push(animation)

    return this
  }

  animateSpring(dampingRatio: number, frequencyResponse: number, animation: Animation) {
    return this.animate({
      ...animation,
      easing: SpringEasing(dampingRatio, frequencyResponse, (animation.duration ?? 1000) / 1000),
    })
  }

  addDependent(dependent: Animator | Animator[]) {
    const add = Array.isArray(dependent) ? dependent : [dependent]
    this.dependents.push(...add)
    return this
  }

  onStart(callback: () => void, single = false) {
    this.onStartCallback.push({ callback, isSingle: single })
    return this
  }

  onEnd(callback: () => void, single = false) {
    this.onEndCallback.push({ callback, isSingle: single })
    return this
  }

  start(skipFrame = false) {
    this.dependents.forEach(d => d?.stop())

    for (const animation of this.animations) {
      const { duration, delay, to, completion, onUpdate, easing } = animation

      let target = (typeof (to) === 'function') ? to() : to

      const id = this.playedAnimations.length
      const tween = new Tween(animation.value)
        .to(target, duration ?? 1000)
        .delay(Math.max(1, delay ?? 1))
        .onUpdate((t) => {
          this.setDirty?.()
          onUpdate?.(t)
        })
        .onComplete((t) => {
          this.playedAnimations = this.playedAnimations.filter((a) => a['animator_id'] != id)

          if (this.playedAnimations.length === 0) {
            executeCallback(this.onEndCallback)
          }
          completion?.()
        })

      tween['animator_id'] = id

      tween.easing(easing ?? Easing.Quadratic.InOut)
      this.playedAnimations.push(tween);

      if (!skipFrame) {
        tween.start()
      } else {
        nextFrame(() => {
          if (!tween['animation_stoped']) tween.start()
        })
      }
    }

    executeCallback(this.onStartCallback)
    return this
  }

  skip() {
    this.dependents.forEach(d => d?.stop())

    for (const animation of this.animations) {
      const { to, completion } = animation
      let target = (typeof (to) === 'function') ? to() : to

      executeCallback(this.onStartCallback)
      modify(animation.value, target)
      this.setDirty()
      executeCallback(this.onEndCallback)
      completion?.()
    }
    return this
  }

  stop() {
    if (!this.isPlaying) return
    this.playedAnimations.forEach(animation => {
      animation['animation_stoped'] = true
      animation.stop()
    })
    this.playedAnimations = []
    executeCallback(this.onEndCallback)
    return this
  }

}

function executeCallback(callbacks: AnimationCallback[]) {
  callbacks.forEach(c => c.callback())
  callbacks = callbacks.filter(t => !t.isSingle)
}
