import { Ref, ref, computed } from '@vue/reactivity';
import { useGesture } from '@vueuse/gesture';
import { Easing, Group, Tween } from '@tweenjs/tween.js'
import { lerp } from '@/core/shared/utils';

export enum State {
  small,
  middle,
  big
}

export function useBottomSheetGesture(page, scroll, enabled: Ref<boolean>) {
  const state = ref(State.big)
  const tweenGroup = new Group()
  const targetY = ref(0)

  let isScrollDragBegin = false
  let isScrollPage = false

  const offsetY = computed(() => {
    const h = document.querySelector('.abs-full')?.clientHeight
    return Math.max(Math.min(targetY.value, h - 120), 0)
  })

  const progress = computed(() => {
    const h = (document.querySelector('.abs-full')?.clientHeight || 0) - 120
    return 1 - offsetY.value / h
  })

  const contentOpacity = computed(() => {
    if (progress.value > 0.05) return 1
    return lerp(0, 1, progress.value / 0.05)
  })

  const endAnimation = (y) => {
    if (!enabled.value) return
    const h = document.querySelector('.abs-full').clientHeight

    let target = 0;
    if (h / 2 - y * 200 > targetY.value) {
      target = 0
      state.value = State.big
    } else {
      target = h - 120
      state.value = State.small
    }

    const t = new Tween({ y: targetY.value }, tweenGroup)
      .to({ y: target }, 200)
      .easing(Easing.Quadratic.Out)
      .onUpdate(({ y }) => {
        targetY.value = y
      })
      .onComplete(() => {
        tweenGroup.remove(t)
      })
      .start()
  }

  const moveTo = (dy: number) => {
    if (!enabled.value) return
    targetY.value += dy
  }

  const dragHandler = ({ event, delta: [dx, dy] }) => {
    if (isScrollDragBegin) {
      if (dy != 0) {
        isScrollDragBegin = false

        if (state.value == State.big) {
          isScrollPage = Math.abs(scroll.value.scrollTop) < 5 && dy > 0
        } else if (state.value == State.middle) {
          isScrollPage = Math.abs(scroll.value.scrollTop) < 5
        } else {
          isScrollPage = true
        }
      }
    }

    if (isScrollPage) {
      moveTo(dy)
      event.preventDefault()
    }

    event.stopPropagation()
  }

  useGesture({
    onDrag: ({ delta: [dx, dy] }) => moveTo(dy),
    onDragEnd: ({ velocities: [x, y] }) => endAnimation(y),
  }, {
    domTarget: page,
    eventOptions: {
      passive: false
    }
  })

  useGesture({
    onDrag: dragHandler,
    onDragStart: () => isScrollDragBegin = true,
    onDragEnd: ({ velocities: [x, y] }) => {
      if (isScrollPage) {
        isScrollPage = false
        endAnimation(y)
      }
    }
  }, {
    domTarget: scroll,
    eventOptions: {
      passive: false
    }
  })

  const update = () => {
    requestAnimationFrame(update)
    tweenGroup.update()
  }
  update()

  const reset = () => {
    targetY.value = 0
  }

  return {
    offsetY,
    targetY,
    contentOpacity,
    progress,
    reset
  }
}
