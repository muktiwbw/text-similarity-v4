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

        console.log('matches: '+this.matches+', k1: '+this.length1+', k2: '+this.length2)

        this.similarity =  ((2 * this.matches) / (this.length1 + this.length2)) * 100

    }

}

export function init_dicesimilaritycoeficients(kgramResult1_hashes_length, kgramResult2_hashes_length, rabinKarpResult){
    return new DiceSimilarityCoeficients(kgramResult1_hashes_length, kgramResult2_hashes_length, rabinKarpResult)
}