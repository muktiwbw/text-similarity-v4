class RabinKarp{

    constructor(kgram1, kgram2){

        this.kgram1 = kgram1
        this.kgram2 = kgram2

        this.match = 0
        this.matchArray = {
            t1:[],
            t2:[]
        }

        this.calculateMatches()

    }

    get result(){

        return this.match

    }

    get matchIndexes(){

        return this.matchArray

    }

    calculateMatches(){

        let debug = []

        let rabinKarpClass = this

        rabinKarpClass.kgram1.hashes.forEach(function(t1_hash, i) {
            
            rabinKarpClass.kgram2.hashes.forEach(function(t2_hash, j){

                if(t1_hash == t2_hash){

                    if(rabinKarpClass.kgram1.strings[i] == rabinKarpClass.kgram2.strings[j]){

                        rabinKarpClass.matchArray.t1.push(i)
                        rabinKarpClass.matchArray.t2.push(j)

                        rabinKarpClass.match = rabinKarpClass.match + 1
                        debug.push(rabinKarpClass.match+". ["+i+"] ("+t1_hash+") "+rabinKarpClass.kgram1.strings[i]+" == ["+j+"] ("+t1_hash+") "+rabinKarpClass.kgram1.strings[i])
                    }
                    
                }
                
            })
            
        });

        console.log(debug)

    }

}