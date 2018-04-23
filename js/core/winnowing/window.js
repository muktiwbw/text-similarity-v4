class Window{

    constructor(w, kgrams){

        this.windowLength = w
        this.kgrams = kgrams.hashes
        this.finalWindow = []

        this.createWindow()

    }

    get result(){

        return this.finalWindow

    }

    createWindow(){
        
        let kgramLength = this.kgrams.length
        let limit = kgramLength - (this.windowLength - 1)
        let start = 0
        let end = this.windowLength

        while(end < limit){

            let windowArray = []

            for(let i = start; i < end; i++){

                windowArray.push(this.kgrams[i])

            }

            this.finalWindow.push(windowArray)

            start++
            end++

        }

    }

}