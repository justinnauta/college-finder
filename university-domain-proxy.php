<?php
    // University Domains API (https://github.com/Hipo/university-domains-list)
    $url = "http://universities.hipolabs.com/search?name=";

    if(array_key_exists("name", $_GET)) $url = $url . urlencode($_GET["name"]);
    if(array_key_exists("country", $_GET)) $url = $url . "&country=" . urlencode($_GET["country"]);

    header("Access-Control-Allow-Origin: *");
    echo file_get_contents($url);
?>