class Winnowing{

    constructor(windows){

        this.windows = windows

        this.fingerprints = []

        this.findFingerprints()

    }

    get result(){

        return this.fingerprints

    }

    findFingerprints(){

        let winnowingClass = this

        this.windows.forEach(function(window, i) {
          
            let minHash = Math.min(...window)

            if(winnowingClass.fingerprints.indexOf(minHash) == -1){

                winnowingClass.fingerprints.push(minHash)

            }

        })

    }

}