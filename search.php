<?php


if(isset($_POST['address']) && !empty($_POST['address'])) {
    $address = $_POST['address'];

    // call API
	$url = "https://api.cityofnewyork.us/geoclient/v1/search.json?app_id=de3c2f35&app_key=a61944398cd32c7e0e079c49b71801fc&input=";
	$url .= urlencode($address);

	// 8503%20jamaica%20ave%20queens
	// 8503 jamaica ave queens

	//$response = json_decode(file_get_contents($url));
	$response = file_get_contents($url);

	$responseJson = json_decode($response);

	//$bbl = "4088590030";

	if($responseJson->status == "OK") {
		$results = $responseJson->results;
		//$bbl = $responseJson->{'results'};

		foreach ($results as $result) {
			//if($result->status == "EXACT_MATCH") {
	    		$buildingInfo = (string)$result->response->bbl;
	    		$buildingInfo .= "&";
	    		$buildingInfo .= (string)$result->response->latitude;
	    		$buildingInfo .= "&";
	    		$buildingInfo .= (string)$result->response->longitude;
	    	//}
		}

	} else {
		// $bbl = "0";
		$buildingInfo = "0";
	}

	// echo $bbl;
	echo $buildingInfo;
}

?>