import { OrthographicCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { ref, watch, watchEffect, Ref, ShallowRef } from "vue";

import { geoToVector } from '@/core/imdf/utils';
import { useElementSize, useWindowSize } from '@vueuse/core';
import Venue from '@/core/imdf/venue';

export default function useOverlayGeometry(options: {
  venue: Ref<Venue>,
  mapZoom: Ref<number>,
  mkMap: any,
  mapContainer: Ref<HTMLElement>,
  scheduleUpdate: () => void,
}) {
  const { venue, mkMap, styleSheet, mapContainer, scheduleUpdate, mapZoom } = options

  const screenSize = useElementSize(mapContainer)
  const scene = new Scene()
  const camera = new OrthographicCamera(-100, 100, 100, -100, 0.1, 1000)

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio)
  document.querySelector('.mk-map-view>.rt-root').after(renderer.domElement)

  renderer.domElement.className += ' map-geometry'

  function render() {
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
    mapZoom.value = size.x / delta.x
    venue.value.OnZoom(mapZoom.value)

    renderer.render(scene, camera);
  }

  // ScreenSize
  watchEffect(() => {
    const width = screenSize.width.value
    const height = screenSize.height.value

    // camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    venue.value.OnResolutionChange({ width, height })

    scheduleUpdate()
    renderer.render(scene, camera);
  })

  watchEffect(() => {
    mkMap.addOverlay(venue.value.mkGeometry)
    mkMap.region = venue.value.mkGeometry.region()
    mkMap.setCameraBoundaryAnimated(mkMap.region)

    //@ts-ignore
    mkMap.cameraZoomRange = new mapkit.CameraZoomRange(0, 3000)

    // val.Add(mapController)
  })

  // StyleSheet
  // watchEffect(() => venue.value.Style(styleSheet.value.imdf))


  return {
    scene,
    camera,
    renderer,
    render
  }
}
