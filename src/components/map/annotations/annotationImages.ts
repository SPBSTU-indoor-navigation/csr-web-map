

export class AnnotationImages {
  private static _instance: AnnotationImages;
  static get instance() {
    return this._instance || (this._instance = new this());
  }

  private images: { [key: string]: HTMLImageElement } = {}

  private constructor() {
    this.loadAnnotationImages()
  }

  private async loadAnnotationImages() {
    const annotationImages: any = import.meta.glob('@/assets/annotations/*.png')

    const load = Object.keys(annotationImages).map(async t => {
      const name = t.split('/').pop()?.split('.').slice(0, -1).join('.')
      this.images[name] = new Image()
      this.images[name].src = 'https://via.placeholder.com/256x256/'

      return {
        name,
        path: (await annotationImages[t]()).default
      }
    })

    load.forEach(async t => {
      const { name, path } = await t
      this.images[name].src = path
    })
  }

  public getImage(name: string): HTMLImageElement {
    return this.images[name]
  }
}
