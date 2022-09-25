import { Camera, Scene } from 'three'
import { toRaw } from 'vue';
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
        this.mapAnnotations.add(toRaw(annotation))
    }

    removeAnnotation(annotation: IAnnotation | IAnnotation[]) {
        this.mapAnnotations.remove(toRaw(annotation))
    }

    scheduleUpdate() {
        this.mkGeometry.style.fillOpacity = 1;
        this.mkGeometry.style.fillOpacity = 0;
    }
}
