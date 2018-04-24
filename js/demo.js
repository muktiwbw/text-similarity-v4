$(function(){

    $("input.algorithm").click(function(){

        let name = $(this).next().html()

        $("#form-title").html("Calculate "+name)

    })

    $("#minimized-button").click(function(){

        let arrow = $("#minimized-button").find(".material-icons").html()
        // alert(arrow)
        if(arrow == "keyboard_arrow_down"){
            $("#result-window").fadeToggle("slow", function(){
                $("#main-form").slideToggle("slow", switchArrowIcon)
            })
        }else{
            $("#main-form").slideToggle("slow", function(){
                $("#result-window").fadeToggle("slow", switchArrowIcon)
            })
        }

    })

    function switchArrowIcon(){
        if($("#minimized-button").find(".material-icons").html() == "keyboard_arrow_down"){
            $("#minimized-button").find(".material-icons").html("keyboard_arrow_up")
        }else{
            $("#minimized-button").find(".material-icons").html("keyboard_arrow_down")
        }
    }

    function incrementalFadeIn(){

    }

    $("#calculate").click(function(){

        $("#main-form").slideUp("slow", function(){
            $("#result-window").fadeIn("slow")
            $("#minimized-main-form").fadeIn("slow")
        })

        let text1 = $("#text1").val()
        let text2 = $("#text2").val()
        let algorithm = $("input[name=algorithm]:checked").val()
        
        switch (algorithm) {
            case "rabinkarp":
                calculateRabinKarp(text1, text2)
                break;
        
            case "winnowing":
                calculateWinnowing(text1, text2)
                break;

            case "levenshtein":
                calculateLevenshteinDistance(text1, text2)
                break;
        }

    })

    function calculateRabinKarp(text1, text2){

        let k = 10
        let hashBasePrime = 2

        let preprocess1 = new Preprocess(text1)
        let preprocess2 = new Preprocess(text2)

        let preprocessedText1 = preprocess1.result
        let preprocessedText2 = preprocess2.result

        let kgram1 = new Kgram(k, hashBasePrime, preprocessedText1)
        let kgram2 = new Kgram(k, hashBasePrime, preprocessedText2)

        let kgramResult1 = kgram1.result
        let kgramResult2 = kgram2.result

        let rabinKarp = new RabinKarp(kgramResult1, kgramResult1)

        let rabinKarpResult = rabinKarp.result

        let similarity = new DiceSimilarityCoeficients(kgramResult1.hashes.length, kgramResult2.hashes.length, rabinKarpResult)
        let similarityResult = similarity.result

        $("#result").html("Similarity rate: "+similarityResult+"%")
        $("#text-raw-1").html(text1)
        $("#text-preprocessed-1").html(preprocessedText1)
        $("#text-raw-2").html(text2)
        $("#text-preprocessed-2").html(preprocessedText2)

    }

    function calculateWinnowing(text1, text2){

        let k = 10
        let w = 7
        let hashBasePrime = 2

        let preprocess1 = new Preprocess(text1, false)
        let preprocess2 = new Preprocess(text2, false)

        let preprocessedText1 = preprocess1.result
        let preprocessedText2 = preprocess2.result

        let kgram1 = new Kgram(k, hashBasePrime, preprocessedText1)
        let kgram2 = new Kgram(k, hashBasePrime, preprocessedText2)

        let kgramResult1 = kgram1.result
        let kgramResult2 = kgram2.result

        let window1 = new Window(w, kgramResult1)
        let window2 = new Window(w, kgramResult2)

        let windowResult1 = window1.result
        let windowResult2 = window2.result

        let winnowing1 = new Winnowing(windowResult1)
        let winnowing2 = new Winnowing(windowResult2)

        let fingerprint1 = winnowing1.result
        let fingerprint2 = winnowing2.result

        let similarity = new JaccardCoeficients(fingerprint1, fingerprint2)

        let similarityResult = similarity.result

        $("#result").html("Similarity rate: "+similarityResult+"%")

    }

    function calculateLevenshteinDistance(text1, text2){

        let preprocess1 = new Preprocess(text1, true, true)
        let preprocess2 = new Preprocess(text2, true, true)

        let preprocessedText1 = preprocess1.result
        let preprocessedText2 = preprocess2.result

        let levenshtein = new LevenshteinDistance(preprocessedText1, preprocessedText2)

        let levenshteinResult = levenshtein.result

        let similarity = new SimilarityRate(levenshteinResult.distance, levenshteinResult.maxLength)

        let similarityResult = similarity.result

        $("#result").html("Similarity rate: "+similarityResult+"%")

    }

})