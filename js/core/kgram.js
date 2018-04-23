class Kgram{

    constructor(k, hashBasePrime, text){
        
        this.k = k
        this.text = text
        this.hashBasePrime = hashBasePrime

        this.kgrams = []
        this.hashedKgrams = []
        
        this.createKgram()
        this.createHash()

    }

    get result(){

        return {strings: this.kgrams, hashes: this.hashedKgrams}

    }

    createKgram(){

        let text_length = this.text.length
        let limit = text_length - (this.k - 1)
        let start = 0
        let end = this.k // excluded
    
        while(start < limit){
            
            this.kgrams.push(this.text.substring((start), end))

            start++
            end++
    
        }

    }

    createHash(){

        let rabinKarpClass = this

        this.kgrams.forEach(function(kgram, i) {

            if(i > 0){
                
                rabinKarpClass.hashedKgrams.push(rabinKarpClass.secondRollingHashFormula(kgram, i))
                
            }else{
                
                rabinKarpClass.hashedKgrams.push(rabinKarpClass.firstRollingHashFormula(kgram))

            }

        });

    }

    firstRollingHashFormula(kgram){

        let power = kgram.length - 1
        let hash = 0

        for(let i = 0; i < kgram.length; i++){

            hash += kgram.charCodeAt(i) * Math.pow(this.hashBasePrime, power)

            power--

        }

        return hash

    }

    secondRollingHashFormula(kgram, i){

        let prevHashedKgram = this.hashedKgrams[i - 1]
        let firstCharCodeOfPrevKgram = this.kgrams[i - 1].charCodeAt(0)
        let lastCharCodeOfCurrentKgram = kgram.charCodeAt(kgram.length - 1)

        return (prevHashedKgram - (firstCharCodeOfPrevKgram * Math.pow(this.hashBasePrime, kgram.length - 1))) * this.hashBasePrime + lastCharCodeOfCurrentKgram

    }

}