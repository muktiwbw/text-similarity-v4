class RabinKarp{

    constructor(kgram1, kgram2){

        this.kgram1 = kgram1
        this.kgram2 = kgram2

        this.match = 0
        this.matchArray = []

        this.calculateMatches()

    }

    get result(){

        return this.match

    }

    calculateMatches(){

        let rabinKarpClass = this

        rabinKarpClass.kgram1.hashes.forEach(function(t1_hash, i) {
            
            rabinKarpClass.kgram2.hashes.forEach(function(t2_hash, j){

                if(t1_hash == t2_hash){

                    if(rabinKarpClass.kgram1.strings[i] == rabinKarpClass.kgram2.strings[j]){

                        rabinKarpClass.matchArray.push({
                            h1:t1_hash,
                            h2:t2_hash,
                            s1:rabinKarpClass.kgram1.strings[i],
                            s2:rabinKarpClass.kgram2.strings[j],
                            i1:i,
                            i2:j
                        })

                        rabinKarpClass.match++

                    }

                }

            })

        });

    }

}