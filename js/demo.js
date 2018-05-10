import { init_preprocess } from './core/preprocess'
import { init_kgram } from './core/kgram'
import { init_rabinkarp } from './core/rabinkarp/rabinkarp'
import { init_dicesimilaritycoeficients } from './core/rabinkarp/dicesimilaritycoeficients'
import { init_window } from './core/winnowing/window'
import { init_winnowing } from './core/winnowing/winnowing'
import { init_jaccardcoeficients } from './core/winnowing/jaccardcoeficients'
import { init_levenshteindistance } from './core/levenshtein/levenshtein'
import { init_similarityrate } from './core/levenshtein/similarityrate'

let pdfText = ["", ""]

$(".setting-option").click(function(){
    $("#float-title").html($(this).attr("data-option-name"))
    $("#float-field").val($(this).find("span.new.badge").html())
    $("#float-background").fadeIn()
    $("#float-field").select().focus()
})

$("#float-close").click(function(){
    $("#float-background").fadeOut()
})

$("#float-update").click(function(event){
    event.preventDefault()
    $("p[data-option-name="+$("#float-title").html()+"]").find("span.new.badge").html($("#float-field").val())
    $("#float-background").fadeOut()
    $("#calculate").focus()
})

$("#setting-toggle-button").click(function(){
    $("#setting-section").slideToggle()
})

$("button.extract-button").click(function(event){

    event.preventDefault()

    let form = $(this).parent()
    let data = new FormData(form[0])
    let buttonNumber = $(this).attr('data-submit-button-number')
    let extractMessage = $('#extract-message-'+buttonNumber)
    let textType = buttonNumber == 1 ? "uji" : "pembanding"
    let swapButtonArea = $("button[data-field-swap-number="+buttonNumber+"]").parent()

    let file = $("#pdf"+buttonNumber)[0].files[0]

    if(file.size <= 500000){

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/server/pdfextract.php",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (response) {

                let data = JSON.parse(response)

                if(data.status == 200){

                    pdfText[buttonNumber-1] = data.data
                    extractMessage.html("Ekstraksi dokumen "+textType+" selesai - "+data.name)
                    form.fadeOut("fast", function(){
                        extractMessage.parent().addClass("data-"+buttonNumber)
                        extractMessage.parent().attr("data-swap-toggle", "field-file-"+buttonNumber)
                        extractMessage.parent().fadeIn("fast")
                        form.remove()
                    })

                }else{
                    alert(data.message)
                }

            },
            error: function (e) {

                $("#result").text(e.responseText);
                console.log("ERROR : ", e);
                $("#btnSubmit").prop("disabled", false);

            }
        });
        
    }else{
        alert("Error: Ukuran file tidak diizinkan lebih dari 500KB")
    }

})

$("button.swap-button").click(function(){

    let swapTo = $(this).attr("data-field-swap-to")
    let swapNumber = $(this).attr("data-field-swap-number")
    let swapElement = $("[data-swap-toggle=field-"+swapTo+"-"+swapNumber+"]")
    let currentElement = $(".data-"+swapNumber).not(swapElement)
    let newSwapTo = swapTo == "file" ? "textarea" : "file"

    currentElement.fadeOut("fast", function(){
        swapElement.fadeIn("fast")
    })        
    $(this).attr("data-field-swap-to", newSwapTo)


})

$("input.algorithm").click(function(){

    let name = $(this).next().html()

    $("#form-title").html("Algoritma "+name)

    switch ($(this).val()) {
        case 'rabinkarp':
            $("#stemming-check").prop("checked", true)
            $("#whitespaces-check").prop("checked", true)
            $("#whitespaces-check").prop("disabled", false)
            $("#sorting-check").prop("checked", false)
            $("#sorting-check").prop("disabled", true)
            break;
        case 'winnowing':
            $("#stemming-check").prop("checked", true)
            $("#whitespaces-check").prop("checked", false)
            $("#whitespaces-check").prop("disabled", false)
            $("#sorting-check").prop("checked", false)
            $("#sorting-check").prop("disabled", true)
            break;
        case 'levenshtein':
            $("#stemming-check").prop("checked", true)
            $("#whitespaces-check").prop("checked", false)
            $("#whitespaces-check").prop("disabled", true)
            $("#sorting-check").prop("checked", true)
            $("#sorting-check").prop("disabled", false)
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

$("#calculate").click(function(event){

    if($("#text1").val().length <= 4000 && $("#text2").val().length <= 4000){
    
        let text1 = $("[data-swap-toggle=field-textarea-1]").css("display") == "none" ? pdfText[0] : $("#text1").val()
        let text2 = $("[data-swap-toggle=field-textarea-2]").css("display") == "none" ? pdfText[1] : $("#text2").val()
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

        $("#main-form").slideUp("slow", function(){
            $("#result-window").fadeIn("slow")
            $("#minimized-main-form").fadeIn("slow")
            $("#minimized-button").find(".material-icons").html("keyboard_arrow_down")
        })

    }else{
        alert("Error: Maksimal teks input tidak diizinkan melebihi 4000 karakter")
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

function calculateTime(start, end){
    return ((end.getTime() - start.getTime()) / 1000).toFixed(3)
}

function calculateRabinKarp(text1, text2){

    let stemming = $("#stemming-check").prop("checked")
    let whitespaces = $("#whitespaces-check").prop("checked")
    let sorting = $("#sorting-check").prop("checked")
    let k = $("p[data-option-toggle=kgram]").find("span.new.badge").html()
    let hashBasePrime = $("p[data-option-toggle=base-prime]").find("span.new.badge").html()
    let start;
    let end;

    start = new Date()
    
    let preprocess1 = init_preprocess(text1, whitespaces, stemming)
    let preprocess2 = init_preprocess(text2, whitespaces, stemming)
    
    end = new Date()

    let preprocessTime = calculateTime(start, end)

    let preprocessedText1 = preprocess1.result
    let preprocessedText2 = preprocess2.result

    start = new Date()

    let kgram1 = init_kgram(k, hashBasePrime, preprocessedText1)
    let kgram2 = init_kgram(k, hashBasePrime, preprocessedText2)

    let kgramResult1 = kgram1.result
    let kgramResult2 = kgram2.result

    let rabinKarp = init_rabinkarp(kgramResult1, kgramResult2)

    let rabinKarpResult = rabinKarp.result

    let similarity = init_dicesimilaritycoeficients(kgramResult1.hashes.length, kgramResult2.hashes.length, rabinKarpResult)

    end = new Date()

    let algorithmTime = calculateTime(start, end)

    let similarityResult = similarity.result

    let kgramStringDisplay1 = ""
    let kgramStringDisplay2 = ""
    let kgramHashDisplay1 = ""
    let kgramHashDisplay2 = ""
    let rabinKarpIndexes = rabinKarp.matchIndexes

    $("#result").html("Persentase Kemiripan: "+similarityResult.toFixed(2)+"%")
    $("#preprocess-time").html(preprocessTime)
    $("#algorithm-time").html(algorithmTime)
    $("#preprocess-title-param").html("("+(stemming ? "Stemming" : "<strike>Stemming</strike>")+", "+(whitespaces ? "Whitespaces" : "<strike>Whitespaces</strike>")+", "+(sorting ? "Sorting" : "<strike>Sorting</strike>")+")")
    $("#kgram-title-param").html("(K = "+k+")")
    $("#hash-title-param").html("(Basis Bilangan Prima = "+hashBasePrime+")")
    $("#text-raw-1").html(text1)
    $("#text-preprocessed-1").html(preprocessedText1)
    $("#text-raw-2").html(text2)
    $("#text-preprocessed-2").html(preprocessedText2)
    $("#k-gram-1").html(kgramDisplayGenerator(kgramResult1.strings, rabinKarpIndexes.t1, kgramStringDisplay1))
    $("#k-gram-2").html(kgramDisplayGenerator(kgramResult2.strings, rabinKarpIndexes.t2, kgramStringDisplay2))
    $("#rolling-hash-1").html(kgramDisplayGenerator(kgramResult1.hashes, rabinKarpIndexes.t1, kgramHashDisplay1))
    $("#rolling-hash-2").html(kgramDisplayGenerator(kgramResult2.hashes, rabinKarpIndexes.t2, kgramHashDisplay2))
    $("#rabin-karp-match").html("Jumlah k-gram hash yang sama adalah "+rabinKarpResult)
    
    let cols = 3
    let rows = Math.ceil(rabinKarpIndexes.t1.length/cols)
    let currentCol = 0
    for (let i = 0; i < cols; i++) {
        $("#col-rabin-karp-match-"+(i+1)).html("")
    }
    for (let i = 0; i < rabinKarpIndexes.t1.length; i++) {
        $("#col-rabin-karp-match-"+((i%3)+1)).append("<p>"+(i+1)+".) ["+rabinKarpIndexes.t1[i]+"] "+kgramResult1.hashes[rabinKarpIndexes.t1[i]]+" == ["+rabinKarpIndexes.t2[i]+"] "+kgramResult2.hashes[rabinKarpIndexes.t2[i]]+"</p>")

    }

    $("span#rabin-karp-c-val").html(rabinKarpResult)
    $("span#rabin-karp-a-val").html(kgramResult1.hashes.length)
    $("span#rabin-karp-b-val").html(kgramResult2.hashes.length)
    $(".appended-dice-similarity-section").remove()
    $("#dice-similarity-section").append("<p class=\"appended-dice-similarity-section\">S = ((2 * "+rabinKarpResult+") / ("+kgramResult1.hashes.length+" + "+kgramResult2.hashes.length+")) * 100%</p>")
    $("#dice-similarity-section").append("<p class=\"appended-dice-similarity-section\">S = "+similarityResult.toFixed(2)+"%</p>")

    $(".algorithm-section").hide()
    $("#kgram-section").show()
    $("#rabin-karp-section").show()

}

function calculateWinnowing(text1, text2){

    let stemming = $("#stemming-check").prop("checked")
    let whitespaces = $("#whitespaces-check").prop("checked")
    let sorting = $("#sorting-check").prop("checked")
    let k = $("p[data-option-toggle=kgram]").find("span.new.badge").html()
    let hashBasePrime = $("p[data-option-toggle=base-prime]").find("span.new.badge").html()
    let w = $("p[data-option-toggle=window]").find("span.new.badge").html()
    let start;
    let end;

    start = new Date()

    let preprocess1 = init_preprocess(text1, whitespaces, stemming)
    let preprocess2 = init_preprocess(text2, whitespaces, stemming)

    end = new Date()

    let preprocessTime = calculateTime(start, end)

    let preprocessedText1 = preprocess1.result
    let preprocessedText2 = preprocess2.result

    start = new Date()

    let kgram1 = init_kgram(k, hashBasePrime, preprocessedText1)
    let kgram2 = init_kgram(k, hashBasePrime, preprocessedText2)

    let kgramResult1 = kgram1.result
    let kgramResult2 = kgram2.result

    let window1 = init_window(w, kgramResult1)
    let window2 = init_window(w, kgramResult2)

    let windowResult1 = window1.result
    let windowResult2 = window2.result

    let winnowing1 = init_winnowing(windowResult1)
    let winnowing2 = init_winnowing(windowResult2)

    let fingerprint1 = winnowing1.result
    let fingerprint2 = winnowing2.result

    let similarity = init_jaccardcoeficients(fingerprint1, fingerprint2)

    end = new Date()

    let algorithmTime = calculateTime(start, end)

    let similarityResult = similarity.result

    let kgramStringDisplay1 = ""
    let kgramStringDisplay2 = ""
    let kgramHashDisplay1 = ""
    let kgramHashDisplay2 = ""

    $("#result").html("Persentase Kemiripan: "+similarityResult.toFixed(2)+"%")
    $("#preprocess-time").html(preprocessTime)
    $("#algorithm-time").html(algorithmTime)
    $("#preprocess-title-param").html("("+(stemming ? "Stemming" : "<strike>Stemming</strike>")+", "+(whitespaces ? "Whitespaces" : "<strike>Whitespaces</strike>")+", "+(sorting ? "Sorting" : "<strike>Sorting</strike>")+")")
    $("#kgram-title-param").html("(K = "+k+")")
    $("#hash-title-param").html("(Basis Bilangan Prima = "+hashBasePrime+")")
    $("#window-title-param").html("(Window = "+w+")")
    $("#text-raw-1").html(text1)
    $("#text-preprocessed-1").html(preprocessedText1)
    $("#text-raw-2").html(text2)
    $("#text-preprocessed-2").html(preprocessedText2)
    $("#k-gram-1").html(kgramResult1.strings.join(", "))
    $("#k-gram-2").html(kgramResult2.strings.join(", "))
    $("#rolling-hash-1").html(kgramResult1.hashes.join(", "))
    $("#rolling-hash-2").html(kgramResult2.hashes.join(", "))

    $("#winnowing-window-section-1").html("")
    $("#winnowing-window-section-2").html("")
    $(".appended-jaccard-section").remove()

    windowResult1.forEach(function(val, i) {
        $("#winnowing-window-section-1").append("<p class=\"appended-winnowing-window\">"+(i+1)+".) [ "+val.join(", ")+" ]</p>")
    });

    windowResult2.forEach(function(val, i) {
        $("#winnowing-window-section-2").append("<p class=\"appended-winnowing-window\">"+(i+1)+".) [ "+val.join(", ")+" ]</p>")
    });

    $("#winnowing-fingerprint-section-1").html("<p>"+fingerprint1.join(", ")+"</p>")
    $("#winnowing-fingerprint-section-2").html("<p>"+fingerprint2.join(", ")+"</p>")

    $("#jaccard-section").append("<p class=\"appended-jaccard-section\">S = ("+similarity.intersection.length+" / "+similarity.union.length+") * 100%</p>")
    $("#jaccard-section").append("<p class=\"appended-jaccard-section\">S = "+similarityResult+"%</p>")

    $(".algorithm-section").hide()
    $("#kgram-section").show()
    $("#winnowing-section").show()

}

function calculateLevenshteinDistance(text1, text2){

    let stemming = $("#stemming-check").prop("checked")
    let whitespaces = $("#whitespaces-check").prop("checked")
    let sorting = $("#sorting-check").prop("checked")
    let start;
    let end;
    
    start = new Date()
    
    let preprocess1 = init_preprocess(text1, true, stemming, sorting)
    let preprocess2 = init_preprocess(text2, true, stemming, sorting)
    
    end = new Date()
    
    let preprocessTime = calculateTime(start, end)
    
    let preprocessedText1 = preprocess1.result
    let preprocessedText2 = preprocess2.result
    
    start = new Date()
    
    let levenshtein = init_levenshteindistance(preprocessedText1, preprocessedText2)
    
    let levenshteinResult = levenshtein.result
    
    let similarity = init_similarityrate(levenshteinResult.distance, levenshteinResult.maxLength)
    
    end = new Date()
    
    let algorithmTime = calculateTime(start, end)

    let similarityResult = similarity.result

    $("#result").html("Persentase Kemiripan: "+similarityResult.toFixed(2)+"%")
    $("#preprocess-time").html(preprocessTime)
    $("#algorithm-time").html(algorithmTime)
    $("#preprocess-title-param").html("("+(stemming ? "Stemming" : "<strike>Stemming</strike>")+", "+(whitespaces ? "Whitespaces" : "<strike>Whitespaces</strike>")+", "+(sorting ? "Sorting" : "<strike>Sorting</strike>")+")")
    $("#text-raw-1").html(text1)
    $("#text-preprocessed-1").html(preprocessedText1)
    $("#text-raw-2").html(text2)
    $("#text-preprocessed-2").html(preprocessedText2)
    
    let splittedText1 = preprocessedText1.split(" ")
    let splittedText2 = preprocessedText2.split(" ")
    let matrice = $("#levenshtein-matrice-section").find("table")
    
    matrice.html("")
    $(".appended-similarity-rate-section").remove()

    for(let i = 0; i < splittedText2.length + 2; i++){
        
        let row = ""

        for(let j = 0; j < splittedText1.length + 2; j++){

            let value
            let align = "center"
            let color = ""

            if(i == 0 && j >= 2){
                value = "<b>"+splittedText1[j - 2]+"</b>"
            }else if(j == 0 && i >= 2){
                value = "<b>"+splittedText2[i - 2]+"</b>"
                align = "left"
            }else if((j == 0 && i == 0) || (j == 0 && i == 1) || (j == 1 && i == 0)){
                value = ""
            }else{
                value = levenshtein.matrice[i - 1][j - 1]
                color = (i == (splittedText2.length + 1)) && (j == (splittedText1.length + 1)) ? " teal lighten-2 white-text" : ""
            }

            row += "<td class=\""+align+"-align"+color+"\">"+value+"</td>"

        }

        matrice.append("<tr>"+row+"</tr>")

    }

    $("#levenshtein-result-section").html(levenshteinResult.distance)
    $("#similarity-rate-a-section").html(levenshteinResult.distance)
    $("#similarity-rate-b-section").html(levenshteinResult.maxLength)
    $("#similarity-rate-section").append("<p class=\"appended-similarity-rate-section\">S = (1 - ("+levenshteinResult.distance+" / "+levenshteinResult.maxLength+")) * 100%</p>")
    $("#similarity-rate-section").append("<p class=\"appended-similarity-rate-section\">S = "+similarityResult+"%</p>")

    $(".algorithm-section").hide()
    $("#levenshtein-section").show()

}