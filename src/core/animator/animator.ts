import { Easing, Tween } from '@tweenjs/tween.js'
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

export class Animator {
  private setDirty: () => void
  private animations: Animation[] = []
  playedAnimations: Tween<Record<string, any>>[] = []
  private dependents: Animator[] = []

  private onStartCallback: () => void
  private onEndCallback: () => void


  get isPlaying() {
    return this.playedAnimations.length != 0
  }

  constructor(setDirty: () => void, dependents: Animator[] = []) {
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

  onStart(callback: () => void) {
    this.onStartCallback = callback
    return this
  }

  onEnd(callback: () => void, single = false) {
    if (single) {
      this.onEndCallback = () => {
        callback()
        this.onEndCallback = undefined
      }
    } else {
      this.onEndCallback = callback
    }
    return this
  }

  start() {
    this.dependents.forEach(d => d?.stop())

    for (const animation of this.animations) {
      const { duration, delay, to, completion, onUpdate, easing } = animation

      let target = to
      if (typeof (to) === 'function') {
        target = to()
      }

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
            this.onEndCallback?.()
          }
          completion?.()
        })

      tween['animator_id'] = id

      tween.easing(easing ?? Easing.Quadratic.InOut)
      this.playedAnimations.push(tween);

      tween.start()

    }

    this.onStartCallback?.()
  }

  stop() {
    for (const animation of this.playedAnimations) {
      animation.stop()
    }
    this.playedAnimations = []
    this.onEndCallback?.()
  }
}
