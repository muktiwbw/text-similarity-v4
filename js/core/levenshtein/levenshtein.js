class LevenshteinDistance{

    constructor(text1, text2){

        this.text1 = text1.split(" ")
        this.text2 = text2.split(" ")

        this.matrice = []

        this.initMatrice()
        this.populateMatrice()

        this.distance = this.matrice[this.text2.length][this.text1.length]

    }

    get result(){

        return {distance: this.distance, maxLength: Math.max(this.text1.length, this.text2.length)}

    }

    initMatrice(){

        for(let i = 0; i < this.text2.length + 1; i++){

            let tempMatrice = []

            for(let j = 0; j < this.text1.length + 1; j++){

                if(i == 0){
                    tempMatrice.push(j)
                }else if(j == 0){
                    tempMatrice.push(i)
                }else{
                    tempMatrice.push(0)
                }

            }

            this.matrice.push(tempMatrice)

        }

    }

    populateMatrice(){

        for(let i = 1; i < this.matrice.length; i++){

            for(let j = 1; j < this.matrice[i].length; j++){

                this.matrice[i][j] = this.text1[i - 1] == this.text2[j - 1] ? this.matrice[i - 1][j - 1] : Math.min(this.matrice[i][j - 1] + 1, this.matrice[i - 1][j] + 1, this.matrice[i - 1][j - 1] + 1)

            }

        }

    }

}

export function init_levenshteindistance(preprocessedText1, preprocessedText2){
    return new LevenshteinDistance(preprocessedText1, preprocessedText2)
}