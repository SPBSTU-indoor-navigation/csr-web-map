
export enum DetailLevelState {
    big,
    normal,
    min,
    hide,
    undefined
}

export class DetailLevelProcessor<DetailLevel extends number, State> {
    sizes: {
        [id: number]: {
            state: State,
            size: number
        }[]
    } = {}

    addLevel(detailLevel: DetailLevel, size: { state: State, size: number }[]): this {
        this.sizes[detailLevel] = size.sort((a, b) => a.size - b.size)
        return this
    }

    evaluate(detailLevel: DetailLevel, mapSize: number): State {

        const sizes = this.sizes[detailLevel]
        if (sizes == null) return null

        let result = sizes[0]
        if (mapSize < result.size) return result.state

        for (const size of sizes) {
            if (result.size <= mapSize && mapSize < size.size) {
                return result.state
            }
            result = size
        }

        return result.state;

    }
}
