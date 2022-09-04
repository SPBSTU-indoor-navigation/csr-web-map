import { Camera, Scene } from 'three'
import { IAnnotation } from './Annotations/annotation';
import { IMapAnnotations } from './Annotations/useMapAnnotations';


export class MapController {
    scene: Scene
    camera: Camera

    mapAnnotations: IMapAnnotations
    mkGeometry: any

    constructor(scene: Scene, camera: Camera, mapAnnotations: IMapAnnotations, mkGeometry: any) {
        this.scene = scene
        this.mapAnnotations = mapAnnotations
        this.mkGeometry = mkGeometry
        this.camera = camera
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

    scheduleUpdate() {
        this.mkGeometry.style.fillOpacity = 1;
        this.mkGeometry.style.fillOpacity = 0;
    }
}
