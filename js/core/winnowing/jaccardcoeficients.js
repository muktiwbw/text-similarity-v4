class JaccardCoeficients{

    constructor(fingerprint1, fingerprint2){

        this.fingerprint1 = fingerprint1
        this.fingerprint2 = fingerprint2

        this.intersection
        this.union
        this.similarity

        this.calculateIntersection()
        this.calculateUnion()
        this.calculateSimilarity()

    }

    get result(){

        return this.similarity

    }

    calculateIntersection(){

        let jaccardCoeficientsClass = this

        this.intersection = this.fingerprint1.filter(function(fingerprint){

            return jaccardCoeficientsClass.fingerprint2.indexOf(fingerprint) != -1

        })

    }

    calculateUnion(){

        let jaccardCoeficientsClass = this
        
        let fingerprintExcludeIntersects1 = this.fingerprint1.filter(function(fingerprint){

            return jaccardCoeficientsClass.intersection.indexOf(fingerprint) == -1

        })

        let fingerprintExcludeIntersects2 = this.fingerprint2.filter(function(fingerprint){

            return jaccardCoeficientsClass.intersection.indexOf(fingerprint) == -1

        })

        this.union = fingerprintExcludeIntersects1.concat(this.intersection, fingerprintExcludeIntersects2)

    }

    calculateSimilarity(){

        this.similarity = (this.intersection.length / this.union.length) * 100

    }

}