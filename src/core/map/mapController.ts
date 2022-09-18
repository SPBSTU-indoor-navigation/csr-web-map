import { Camera, Scene } from 'three'
import { IAnnotation } from './annotations/annotation';
import { IMapAnnotations } from './annotations/useMapAnnotations';


export class MapController {
    scene: Scene
    camera: Camera

    mapAnnotations: IMapAnnotations
    mkGeometry: any

    constructor(mkGeometry: any) {
        this.mkGeometry = mkGeometry
    }

    render() {
        this.mapAnnotations.render({ cam: this.camera })
    }

    addOverlay(object: any) {
        this.scene.add(object)
    }

    removeOverlay(object: any) {
        this.scene.remove(object)
    }

    addAnnotation(annotation: IAnnotation | IAnnotation[]) {
        this.mapAnnotations.add(annotation)
    }

    removeAnnotation(annotation: IAnnotation | IAnnotation[]) {
        this.mapAnnotations.remove(annotation)
    }

    scheduleUpdate() {
        this.mkGeometry.style.fillOpacity = 1;
        this.mkGeometry.style.fillOpacity = 0;
    }
}
