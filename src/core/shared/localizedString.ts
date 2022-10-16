
export function localCompare(a: LocalizedString, b: LocalizedString) {
  return a.bestLocalizedValue.localeCompare(b.bestLocalizedValue, undefined, { numeric: true, sensitivity: 'base' });
}

export class LocalizedString {
  private data: { [key: string]: string }

  constructor(data: { [key: string]: string }) {
    this.data = data
  }

  get bestLocalizedValue(): string {
    return this.data?.['ru']
  }

  localCompare(other: LocalizedString): number {
    return localCompare(this, other)
  }
}
