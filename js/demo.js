$(function(){

    $("input.algorithm").click(function(){

        let name = $(this).next().html()

        $("#form-title").html("Algoritma "+name)

        switch ($(this).val()) {
            case "rabinkarp":
                $("#kgram-section").removeClass("hide")
                $("#rabin-karp-match").removeClass("hide")
                break;
            case "winnowing":
                $("#kgram-section").removeClass("hide")
                $("#rabin-karp-match").addClass("hide")
                break;
            case "levenshtein":
                
                break;
        }

    })

    $("#minimized-button").click(function(){

        let arrow = $("#minimized-button").find(".material-icons").html()
        // alert(arrow)
        if(arrow == "keyboard_arrow_down"){
            $("#result-window").fadeOut("slow", function(){
                $("#main-form").slideDown("slow", switchArrowIcon)
            })
        }else{
            $("#main-form").slideUp("slow", function(){
                $("#result-window").fadeIn("slow", switchArrowIcon)
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

    $("#calculate").click(function(){

        $("#main-form").slideUp("slow", function(){
            $("#result-window").fadeIn("slow")
            $("#minimized-main-form").fadeIn("slow")
            $("#minimized-button").find(".material-icons").html("keyboard_arrow_down")
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

    function kgramDisplayGenerator(kgramResult, rabinKarpIndexes, kgramDisplay){
        kgramResult.forEach(function(val, i) {
            let str = "["+val+"]"
            str += (i < kgramResult.length - 1) ? " " : ""
            str = (rabinKarpIndexes.indexOf(i) != -1) ? "<span class=\"red-text red-accent-1\">"+str+"</span>" : str
            
            kgramDisplay += str
        });

        return kgramDisplay
    }

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

        let rabinKarp = new RabinKarp(kgramResult1, kgramResult2)

        let rabinKarpResult = rabinKarp.result

        let similarity = new DiceSimilarityCoeficients(kgramResult1.hashes.length, kgramResult2.hashes.length, rabinKarpResult)
        let similarityResult = similarity.result

        let kgramStringDisplay1 = ""
        let kgramStringDisplay2 = ""
        let kgramHashDisplay1 = ""
        let kgramHashDisplay2 = ""
        let rabinKarpIndexes = rabinKarp.matchIndexes

        $("#result").html("Persentase Kemiripan: "+similarityResult.toFixed(2)+"%")
        $("#text-raw-1").html(text1)
        $("#text-preprocessed-1").html(preprocessedText1)
        $("#text-raw-2").html(text2)
        $("#text-preprocessed-2").html(preprocessedText2)
        $("#k-gram-1").html(kgramDisplayGenerator(kgramResult1.strings, rabinKarpIndexes.t1, kgramStringDisplay1))
        $("#k-gram-2").html(kgramDisplayGenerator(kgramResult2.strings, rabinKarpIndexes.t2, kgramStringDisplay2))
        $("#rolling-hash-1").html(kgramDisplayGenerator(kgramResult1.hashes, rabinKarpIndexes.t1, kgramHashDisplay1))
        $("#rolling-hash-2").html(kgramDisplayGenerator(kgramResult2.hashes, rabinKarpIndexes.t2, kgramHashDisplay2))
        $("#rabin-karp-match").html("Jumlah Hash dan String Sama: "+rabinKarpResult)

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

        let kgramStringDisplay1 = ""
        let kgramStringDisplay2 = ""
        let kgramHashDisplay1 = ""
        let kgramHashDisplay2 = ""

        $("#result").html("Persentase Kemiripan: "+similarityResult.toFixed(2)+"%")
        $("#text-raw-1").html(text1)
        $("#text-preprocessed-1").html(preprocessedText1)
        $("#text-raw-2").html(text2)
        $("#text-preprocessed-2").html(preprocessedText2)
        $("#k-gram-1").html(kgramResult1.strings.join(", "))
        $("#k-gram-2").html(kgramResult2.strings.join(", "))
        $("#rolling-hash-1").html(kgramResult1.hashes.join(", "))
        $("#rolling-hash-2").html(kgramResult2.hashes.join(", "))

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

        $("#result").html("Persentase Kemiripan: "+similarityResult.toFixed(2)+"%")

    }

})