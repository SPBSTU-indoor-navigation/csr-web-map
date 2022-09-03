import { OrthographicCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { ref, watch, watchEffect } from "vue";

import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

import { geoToVector } from '../../imdf/utils';

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

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.querySelector('.mk-map-view').insertBefore(labelRenderer.domElement, document.querySelector(".mk-map-view>.mk-map-node-element"))

  window.addEventListener('resize', () => { screenSize.value = { width: window.innerWidth, height: window.innerHeight } }, false);

  // ScreenSize
  watchEffect(() => {
    const { width, height } = screenSize.value
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);

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

  const text = document.createElement('div');
  text.className = 'label';
  text.textContent = 'CSS2DObject';

  const label = new CSS2DObject(text);
  label.position.set(0, 0, 0);
  scene.add(label);


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


    labelRenderer.render(scene, camera);
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
