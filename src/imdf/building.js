

export default class Building {

  currentOrdinal = 0
  showLevel = false

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
    this.ShowIndoor(scene, 1)
  }

  /** @param { import('three').Scene } scene */
  Remove(scene) {

  }

  /** @param { import('three').Scene } scene */
  ShowIndoor(scene, ordinal) {
    if (this.showLevel) return

    const targetOrdinal = ordinal || this.currentOrdinal;
    if (!this.levelByOrdinal[targetOrdinal]) return

    this.levelByOrdinal[targetOrdinal].Add(scene)

    this.showLevel = true;
  }

  /** @param { import('three').Scene } scene */
  HideIndoor(scene) {
    if (!this.showLevel) return
    if (!this.levelByOrdinal[this.currentOrdinal]) return

    this.levelByOrdinal[this.currentOrdinal].Remove(scene)
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
