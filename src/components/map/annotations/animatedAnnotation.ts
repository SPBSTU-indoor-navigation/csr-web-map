import { Animator } from "@/core/animator/animator";
import { DetailLevelAnnotation } from "@/core/Map/Annotations/annotation";
import { Size } from "@/core/Map/Annotations/bounds";
import { DetailLevelProcessor } from "@/core/Map/Annotations/detailLevelProcessor";
import { Vector2 } from "three";


export class AnimatedAnnotation<DetailLevel extends number, DetailLevelState> extends DetailLevelAnnotation<DetailLevel, DetailLevelState> {
  selectAnimation: Animator
  deSelectAnimation: Animator

  protected onAnim = () => {
    this.isDirty = true
    this.bounds.updateRect()
  }

  constructor(localPosition: Vector2, data: any, detailLevel: DetailLevel, levelProcessor: DetailLevelProcessor<DetailLevel, DetailLevelState>) {
    super(localPosition, detailLevel, data, (detailLevel: DetailLevel, mapSize: number) => levelProcessor.evaluate(detailLevel, mapSize))
    this.bounds.set({ size: new Size(15, 15), pivot: new Vector2(0.5, 0.5) })
  }

  override setSelected(selected: boolean, animated: boolean): void {
    super.setSelected(selected, animated)

    if (selected) {
      this.selectAnimation.start()
    }
    else {
      this.deSelectAnimation.start()
    }
  }

  protected animateChangeState(animator: Animator) {
    if (this.isSelected) return;

    animator
      .addDependent(this.selectAnimation)
      .addDependent(this.deSelectAnimation)
      .start()


    this.isDirty = true
  }
}
