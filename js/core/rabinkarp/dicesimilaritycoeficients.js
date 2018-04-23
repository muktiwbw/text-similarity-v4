class DiceSimilarityCoeficients{

    constructor(kgram1_length, kgram2_length, matches){

        this.length1 = kgram1_length
        this.length2 = kgram2_length
        this.matches = matches

        this.similarity

        this.calculateSimilarity()

    }

    get result(){

        return this.similarity

    }

    calculateSimilarity(){

        this.similarity =  ((2 * this.matches) / (this.length1 + this.length2)) * 100

    }

}