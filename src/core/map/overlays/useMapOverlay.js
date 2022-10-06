import { OrthographicCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { ref, watch, watchEffect } from "vue";

import { geoToVector } from '@/core/imdf/utils';
import { useElementSize, useWindowSize } from '@vueuse/core';

export default function useMapOverlay(options) {
  const { venue, mkMap, styleSheet, onAnimate, mapController, mapContainer } = options

  const screenSize = useElementSize(mapContainer)
  const zoom = ref(0)

  const scene = new Scene()
  const camera = new OrthographicCamera(-100, 100, 100, -100, 0.1, 1000)

  mapController.camera = camera
  mapController.scene = scene


  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio)
  document.querySelector('.mk-map-view').insertBefore(renderer.domElement, document.querySelector(".mk-map-view>.map-annotations"))

  // ScreenSize
  watchEffect(() => {
    const width = screenSize.width.value
    const height = screenSize.height.value

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    venue.value.OnResolutionChange({ width: screenSize.width.value, height: screenSize.height.value })

    mapController.scheduleUpdate()
    renderer.render(scene, camera);
  })

  // Venue
  watchEffect(() => {
    mkMap.addOverlay(venue.value.mkGeometry)
    mkMap.region = venue.value.mkGeometry.region()
    mkMap.setCameraBoundaryAnimated(mkMap.region)
    mkMap.cameraZoomRange = new mapkit.CameraZoomRange(0, 3000)

    venue.value.Add(mapController)
  })

  // StyleSheet
  watchEffect(() => {
    venue.value.Style(styleSheet.value.imdf)
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

    renderer.render(scene, camera);
    onAnimate?.()
  }


  return {
    screenSize,
    scene,
    camera,
    renderer,
    zoom
  }
}
