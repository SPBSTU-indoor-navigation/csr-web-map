import { Ref, ref, computed } from '@vue/reactivity';
import { useGesture } from '@vueuse/gesture';
import { Easing, Group, Tween } from '@tweenjs/tween.js'
import { lerp, project } from '@/core/shared/utils';
import { SpringEasing } from '@/core/animator/springAnimation';

export enum State {
  small = 0,
  middle = 1,
  big = 2
}

function expLimit(x: number, maxVal: number): number {
  return (1 - Math.exp(-x / maxVal)) * maxVal
}

export function useBottomSheetGesture(page, scroll, containerHeight: Ref<number>, enabled: Ref<boolean>) {
  const state = ref(State.big)
  const tweenGroup = new Group()
  const targetY = ref(0)

  let isScrollDragBegin = false
  let isScrollPage = false
  let currentTween = null
  let movedByUser = false

  const offsetY = computed(() => {
    if (!movedByUser) return targetY.value

    const smallerPos = positionForState(State.small)
    const biggerPos = positionForState(State.big)
    if (biggerPos < targetY.value && targetY.value < smallerPos) {
      return targetY.value
    } else if (targetY.value > smallerPos) {
      let delta = targetY.value - smallerPos
      return smallerPos + expLimit(delta, 20)
    } else if (targetY.value < biggerPos) {
      let delta = biggerPos - targetY.value
      return biggerPos - expLimit(delta, 20)
    }
  })

  const smallOffset = computed(() => containerHeight.value - 80)
  const mediumOffset = computed(() => containerHeight.value - 320)

  const progress = computed(() => 1 - offsetY.value / smallOffset.value)

  const contentOpacity = computed(() => {
    const p = progress.value - 0.025
    if (p > 0.1) return 1
    return lerp(0, 1, p / 0.1)
  })

  const positionForState = (state: State) => {
    switch (state) {
      case State.small: return smallOffset.value
      case State.middle: return mediumOffset.value
      case State.big: return 0
    }
  }

  function nextState(velocity: number): State {
    const nearestState = (pos: number, possibleStates: State[]) => {
      var nearestDistance = Number.MAX_VALUE
      var nearestState = State.small

      for (let i = 0; i < possibleStates.length; i++) {
        const state = possibleStates[i];
        const distance = Math.abs(positionForState(state) - pos)
        if (distance < nearestDistance) {
          nearestState = state
          nearestDistance = distance
        }
      }

      return nearestState
    }

    let singlePosible: State[] = []
    switch (state.value) {
      case State.small:
        singlePosible = [State.small, State.middle]
        break;
      case State.middle:
        singlePosible = [State.small, State.big, State.middle]
        break;
      case State.big:
        singlePosible = [State.big, State.middle]
        break;
    }

    let nearestSingle = nearestState(project({ velocity: velocity * 1000, position: targetY.value, decelerationRate: 0.995 }), singlePosible)
    let nearestMulty = nearestState(project({ velocity: velocity * 1000, position: targetY.value, decelerationRate: 0.99 }), [State.small, State.big, State.middle])

    return Math.abs(state.value - nearestMulty) > 1 ? nearestMulty : nearestSingle
  }

  const endAnimation = (y) => {
    if (!enabled.value) return
    state.value = nextState(y)

    const delta = positionForState(state.value) - targetY.value
    let initialVelocity = Math.abs(1000 * y / delta)

    if (targetY.value < positionForState(State.big)) {
      targetY.value = offsetY.value
      initialVelocity = 0
    } else if (targetY.value > positionForState(State.small)) {
      targetY.value = offsetY.value
      initialVelocity = 0
    }


    console.log(initialVelocity);
    currentTween = new Tween({ y: targetY.value }, tweenGroup)
      .to({ y: positionForState(state.value) }, 1000)
      .easing(SpringEasing(initialVelocity > 0.01 ? 0.8 : 1, 0.35, 1, -initialVelocity))
      .onUpdate(({ y }) => {
        targetY.value = y
      })
      .onComplete(() => {
        tweenGroup.remove(currentTween)
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

  const beginDrag = () => {
    movedByUser = true
    currentTween?.stop()
  }

  useGesture({
    onDrag: ({ delta: [dx, dy] }) => moveTo(dy),
    onDragStart: beginDrag,
    onDragEnd: ({ velocities: [x, y] }) => {
      movedByUser = false
      endAnimation(y)
    },
  }, {
    domTarget: page,
    eventOptions: {
      passive: false
    }
  })

  useGesture({
    onDrag: dragHandler,
    onDragStart: () => {
      isScrollDragBegin = true
      beginDrag()
    },
    onDragEnd: ({ velocities: [x, y] }) => {
      if (isScrollPage) {
        movedByUser = false
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
