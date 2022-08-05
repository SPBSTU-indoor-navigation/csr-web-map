import { ref, toRef, watch, watchEffect } from "vue";
import { Scene, OrthographicCamera, WebGLRenderer } from 'three';
import { Vector2 } from 'three';

import { geoToVector } from '../imdf/utils'

export default function useMapOverlay(options) {
  const { venue, mkMap, styleSheet, onAnimate } = options

  const screenSize = ref({ width: window.innerWidth, height: window.innerHeight })
  const zoom = ref(0)

  const scene = new Scene()
  const camera = new OrthographicCamera(-100, 100, 100, -100, 0.1, 1000)


  const renderer = new WebGLRenderer({ alpha: true, antialias: true })
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio)
  document.querySelector('.mk-map-view').insertBefore(renderer.domElement, document.querySelector(".mk-map-view>.mk-map-node-element"))


  window.addEventListener('resize', () => { screenSize.value = { width: window.innerWidth, height: window.innerHeight } }, false);

  // ScreenSize
  watchEffect(() => {
    const { width, height } = screenSize.value
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    venue.value.OnResolutionChange(screenSize.value)
  })

  // Venue
  watchEffect(() => {
    mkMap.addOverlay(venue.value.mkGeometry)
    mkMap.region = venue.value.mkGeometry.region()
    mkMap.setCameraBoundaryAnimated(mkMap.region)
    mkMap.cameraZoomRange = new mapkit.CameraZoomRange(0, 3000)

    venue.value.Add(scene)
  })

  // StyleSheet
  watchEffect(() => {
    venue.value.Style(styleSheet.value)
  })

  watch(venue, (newValue, oldValue) => {
    oldValue.Remove(scene)
    newValue.Add(scene)
  })


  window.onMapkitUpdate = () => {
    const region = mkMap.region
    const delta = geoToVector(region.center,
      {
        latitude: region.center.latitude + region.span.latitudeDelta / 2,
        longitude: region.center.longitude + region.span.longitudeDelta / 2
      })


    camera.left = -delta.x
    camera.right = delta.x
    camera.top = delta.y
    camera.bottom = -delta.y


    const center = venue.value.Translate(mkMap.center)
    camera.position.set(center.x, center.y, 10)
    camera.rotation.set(0, 0, mkMap.rotation * Math.PI / 180)

    camera.updateProjectionMatrix()


    const size = new Vector2()
    renderer.getSize(size)
    zoom.value = size.x / delta.x
    venue.value.OnZoom(zoom.value)

    onAnimate?.()

    renderer.render(scene, camera);
  }


  return {
    screenSize,
    scene,
    camera,
    renderer,
    zoom
  }
}
