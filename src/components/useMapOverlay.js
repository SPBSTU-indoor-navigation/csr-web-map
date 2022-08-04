

export default async function useMapOverlay(options) {
  const { mapID, } = options;


  return {
    scene,
    camera,
    renderer
  }
}
