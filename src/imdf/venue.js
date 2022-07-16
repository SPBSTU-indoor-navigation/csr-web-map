import Environments from "./environment";
import { createPolygon, createMKStyle } from '../components/MapKit/utils'

export default class Venue {
  constructor(archive) {

    this.data = archive.venue
    console.log(archive);

    this.enviroment = new Environments(archive.enviroment, archive.detail.filter(t => !t.properties.level_id))



    this.building = createPolygon(archive.building)
    this.geometry = createPolygon(this.data)

  }

  Add(map) {
    map.addOverlay(this.geometry)
    this.enviroment.Add(map)
    map.addOverlay(this.building)
  }

  Remove(map) {
    map.removeOverlay(this.geometry)
    this.enviroment.Remove(map)
  }

  Style(styleSheet) {
    console.log(createMKStyle(styleSheet.venue));
    this.geometry.style = createMKStyle(styleSheet.venue)
    this.building.style = createMKStyle(styleSheet['building.footprint'])
    this.enviroment.Style(styleSheet)
  }
}
