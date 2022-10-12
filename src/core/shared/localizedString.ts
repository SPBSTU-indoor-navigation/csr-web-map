
export class LocalizedString {
  private data: { [key: string]: string }

  constructor(data: { [key: string]: string }) {
    this.data = data
  }

  get bestLocalizedValue(): string {
    return this.data?.['ru']
  }
}
