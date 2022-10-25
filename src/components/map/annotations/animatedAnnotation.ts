import { Animator } from "@/core/animator/animator";
import { DetailLevelAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { Size } from "@/core/map/overlayDrawing/annotations/bounds";
import { DetailLevelProcessor } from "@/core/map/overlayDrawing/annotations/detailLevelProcessor";
import { nextFrame } from "@/core/shared/utils";
import { Vector2 } from "three";


export class AnimatedAnnotation<DetailLevel extends number, DetailLevelState> extends DetailLevelAnnotation<DetailLevel, DetailLevelState> {
  selectAnimation: Animator
  deSelectAnimation: Animator
  changeStateAnimator: Animator | null = null

  protected onAnim = () => {
    this.isDirty = true
    this.bounds.updateRect()
  }

  protected onPinSelect() { }

  constructor(localPosition: Vector2, data: any, detailLevel: DetailLevel, levelProcessor: DetailLevelProcessor<DetailLevel, DetailLevelState>) {
    super(localPosition, detailLevel, data, (detailLevel: DetailLevel, mapSize: number) => levelProcessor.evaluate(detailLevel, mapSize))
    this.bounds.set({ size: new Size(15, 15), pivot: new Vector2(0.5, 0.5) })
  }

  override setSelected(selected: boolean, animated: boolean): void {
    super.setSelected(selected, animated)

    if (selected) {
      this.selectAnimation?.start(true)
    }
    else {
      this.deSelectAnimation?.start(true)
    }
    this.onPinSelect()
  }

  override setPinned(pinned: boolean, animated: boolean): void {
    super.setPinned(pinned, animated)
    this.setSelected(this.isSelected, animated)
    this.onPinSelect()
  }

  protected animateChangeState(animator: Animator, animated: boolean = true) {
    if (this.isSelected || this.isPinned) return;

    this.changeStateAnimator = animator

    animator
      .addDependent(this.selectAnimation)
      .addDependent(this.deSelectAnimation)

    if (animated) animator.start(true); else animator.skip()


    this.isDirty = true
  }
}
