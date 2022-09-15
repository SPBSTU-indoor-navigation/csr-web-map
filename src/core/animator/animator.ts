import { Easing, Tween } from '@tweenjs/tween.js'

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
  setDirty: () => void
  animations: Animation[] = []

  constructor(setDirty: () => void) {
    this.setDirty = setDirty
  }

  animate(animation: Animation): this {
    this.animations.push(animation)

    return this
  }

  start() {
    for (const animation of this.animations) {
      const { duration, delay, to, completion, onUpdate, easing } = animation

      let target = to
      if (typeof (to) === 'function') {
        target = to()
      }

      const tween = new Tween(animation.value)
        .to(target, duration ?? 1000)
        .delay(delay ?? 0)
        .onUpdate((t) => {
          this.setDirty?.()
          onUpdate?.(t)
        })
        .onComplete((t) => completion?.())

      if (animation.easing)
        tween.easing(animation.easing)

      tween.start()
    }
  }
}
