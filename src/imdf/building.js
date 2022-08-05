

export default class Building {

  currentOrdinal = 0
  showLevel = false

  /** @type { import('three').Scene } */
  scene = null

  constructor(data, levels, attractions) {
    this.data = data
    this.levels = levels
    this.attractions = attractions

    this.levelByOrdinal = levels.reduce((acc, level) => {
      acc[level.ordinal] = level
      return acc
    }, {})

  }

  /** @param { import('three').Scene } scene */
  Add(scene) {
    this.scene = scene
    this.ShowIndoor(1)
  }

  /** @param { import('three').Scene } scene */
  Remove(scene) {
    this.HideIndoor()
  }

  ShowIndoor(ordinal) {
    if (this.showLevel) return

    this.currentOrdinal = ordinal || this.currentOrdinal;
    if (!this.levelByOrdinal[this.currentOrdinal]) return

    this.levelByOrdinal[this.currentOrdinal].Add(this.scene)

    this.showLevel = true;
  }

  HideIndoor() {
    if (!this.showLevel) return
    if (!this.levelByOrdinal[this.currentOrdinal]) return

    this.levelByOrdinal[this.currentOrdinal].Remove(this.scene)
    this.showLevel = false


  }

  ChangeOrdinal(ordinal) {

  }

  Style(styleSheet) {
    this.levels.forEach(level => level.Style(styleSheet));
  }

  OnZoom(zoom) {
    this.levels.forEach(level => level.OnZoom(zoom));
  }

}
