

export function SpringEasing(dampingRatio: number, frequencyResponse: number, duration: number = 1) {
  const spring = new DampedHarmonicSpring(dampingRatio, frequencyResponse)
  return (progress: number) => 1 - spring.position(progress * duration)
}

export class DampedHarmonicSpring {

  private dampingCoefficient: number
  private mass: number
  private stiffness: number

  constructor(dampingRatio: number, frequencyResponse: number) {
    this.mass = 1
    this.stiffness = Math.pow(2 * Math.PI / frequencyResponse, 2) * this.mass
    this.dampingCoefficient = 4 * Math.PI * dampingRatio * this.mass / frequencyResponse
  }

  private get dampingRatio(): number {
    return this.dampingCoefficient / (2 * Math.sqrt(this.stiffness * this.mass))
  }

  private get undampedNaturalFrequency(): number {
    return Math.sqrt(this.stiffness / this.mass)
  }

  private get dampedNaturalFrequency(): number {
    return this.undampedNaturalFrequency * Math.sqrt(Math.abs(1 - Math.pow(this.dampingRatio, 2)))
  }

  position(time: number, initialPosition: number = 1, initialVelocity: number = 0): number {
    let ζ = this.dampingRatio
    let λ = this.dampingCoefficient / this.mass / 2
    let ω_d = this.dampedNaturalFrequency
    let s_0 = initialPosition
    let v_0 = initialVelocity
    let t = time

    if (Math.abs(ζ - 1) < 1e-6) {
      let c_1 = s_0
      let c_2 = v_0 + λ * s_0

      return Math.exp(-λ * t) * (c_1 + c_2 * t)
    }
    else if (ζ < 1) {
      let c_1 = s_0
      let c_2 = (v_0 + λ * s_0) / ω_d

      return Math.exp(-λ * t) * (c_1 * Math.cos(ω_d * t) + c_2 * Math.sin(ω_d * t))
    }
    else {
      let c_1 = (v_0 + s_0 * (λ + ω_d)) / (2 * ω_d)
      let c_2 = s_0 - c_1

      return Math.exp(-λ * t) * (c_1 * Math.exp(ω_d * t) + c_2 * Math.exp(-ω_d * t))
    }
  }
}
