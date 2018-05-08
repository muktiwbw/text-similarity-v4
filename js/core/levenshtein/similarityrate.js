class SimilarityRate{

    constructor(distance, maxLength){

        this.distance = distance
        this.maxLength = maxLength

        this.similarity

        this.calculateSimilarity()

    }

    get result(){

        return this.similarity

    }

    calculateSimilarity(){

        this.similarity = (1 - (this.distance / this.maxLength)) * 100

    }

}

export function init_similarityrate(levenshteinResult_distance, levenshteinResult_maxLength){
    return new SimilarityRate(levenshteinResult_distance, levenshteinResult_maxLength)
}