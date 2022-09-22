

export class AnnotationImages {
  private static instance: AnnotationImages;
  private images: { [key: string]: HTMLImageElement } = {}

  private constructor() {
    this.loadAnnotationImages()
  }

  private async loadAnnotationImages() {
    const annotationImages: any = import.meta.glob('@/assets/annotations/*.png')

    const load = Object.keys(annotationImages).map(async t => {
      const name = t.split('/').pop()?.split('.').slice(0, -1).join('.')
      this.images[name] = new Image()

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

  public static get Instance() {
    return this.instance || (this.instance = new this());
  }
}
