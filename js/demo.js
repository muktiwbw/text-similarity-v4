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

$("button.extract-button").click(function(event){

    event.preventDefault();

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

function calculateRabinKarp(text1, text2){

    let k = 10
    let hashBasePrime = 2

    let preprocess1 = init_preprocess(text1)
    let preprocess2 = init_preprocess(text2)

    let preprocessedText1 = preprocess1.result
    let preprocessedText2 = preprocess2.result

    let kgram1 = init_kgram(k, hashBasePrime, preprocessedText1)
    let kgram2 = init_kgram(k, hashBasePrime, preprocessedText2)

    let kgramResult1 = kgram1.result
    let kgramResult2 = kgram2.result

    let rabinKarp = init_rabinkarp(kgramResult1, kgramResult2)

    let rabinKarpResult = rabinKarp.result

    let similarity = init_dicesimilaritycoeficients(kgramResult1.hashes.length, kgramResult2.hashes.length, rabinKarpResult)
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
    $("#rabin-karp-match").html("Jumlah k-gram hash yang sama adalah "+rabinKarpResult)
    
    let cols = 3
    let rows = Math.ceil(rabinKarpIndexes.t1.length/cols)
    let currentCol = 0
    for (let i = 0; i < cols; i++) {
        $("#col-rabin-karp-match-"+i).html("")
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

    let k = 10
    let w = 7
    let hashBasePrime = 2

    let preprocess1 = init_preprocess(text1, false)
    let preprocess2 = init_preprocess(text2, false)

    let preprocessedText1 = preprocess1.result
    let preprocessedText2 = preprocess2.result

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

    windowResult1.forEach(function(val, i) {
        $("#winnowing-window-section-1").append("<p class=\"appended-winnowing-window\">"+(i+1)+".) [ "+val.join(", ")+" ]</p>")
    });

    windowResult2.forEach(function(val, i) {
        $("#winnowing-window-section-2").append("<p class=\"appended-winnowing-window\">"+(i+1)+".) [ "+val.join(", ")+" ]</p>")
    });

    $(".algorithm-section").hide()
    $("#kgram-section").show()
    $("#winnowing-section").show()

}

function calculateLevenshteinDistance(text1, text2){

    let preprocess1 = init_preprocess(text1, true, true)
    let preprocess2 = init_preprocess(text2, true, true)

    let preprocessedText1 = preprocess1.result
    let preprocessedText2 = preprocess2.result

    let levenshtein = init_levenshteindistance(preprocessedText1, preprocessedText2)

    let levenshteinResult = levenshtein.result

    let similarity = init_similarityrate(levenshteinResult.distance, levenshteinResult.maxLength)

    let similarityResult = similarity.result

    $("#result").html("Persentase Kemiripan: "+similarityResult.toFixed(2)+"%")

}