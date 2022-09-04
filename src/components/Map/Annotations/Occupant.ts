import { Annotation } from '@/core/Map/Annotations/annotation'
import { Vector2 } from 'three'


export class OccupantAnnotation extends Annotation {

  size = new Vector2(50, 50);

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx)

  }
}
