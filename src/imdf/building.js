

export default class Building {

  currentOrdinal = 0

  constructor(data, levels, attractions) {
    this.data = data
    this.levels = levels
    this.attractions = attractions

  }

  /** @param { import('three').Scene } scene */
  Add(scene) {
    if (this.levels[0]) {
      this.levels[0].Add(scene)
    }
  }

  /** @param { import('three').Scene } scene */
  Remove(scene) {

  }

  /** @param { import('three').Scene } scene */
  ShowIndoor(scene, ordinal) {

  }

  /** @param { import('three').Scene } scene */
  HideIndoor(scene) {

  }

  ChangeOrdinal(ordinal) {

  }

  Style(styleSheet) {
    this.levels.forEach(level => level.Style(styleSheet));
  }
}
