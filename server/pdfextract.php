<?php

    $data = $_FILES['pdf'];

    $fileType = strtolower(pathinfo($data['name'], PATHINFO_EXTENSION));

    // var_dump($data['name'], $data['tmp_name'], $data['size']);

    if($fileType === 'pdf'){

        require_once "../vendor/autoload.php";
    
        // Parse pdf file and build necessary objects.
        $parser = new \Smalot\PdfParser\Parser();
        $pdf    = $parser->parseFile($data['tmp_name']);
        
        $text = $pdf->getText();

        echo json_encode([
            'status' => 200,
            'message' => 'Document successfully extracted.',
            'name' => $data['name'],
            'data' => $text
        ]);

    }else{

        echo json_encode([
            'status' => 400,
            'message' => 'Error: Format file yang diizinkan adalah .pdf'
        ]);

    }


?>