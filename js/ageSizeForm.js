

function onAgeSizeFilter(){
  var yearLow = $("#yearLow")[0].value;
  var yearHigh = $("#yearHigh")[0].value;
  var sizeLow = $("#sizeLow")[0].value;
  var sizeHigh = $("#sizeHigh")[0].value;

  validateInput(yearLow, yearHigh, sizeLow, sizeHigh);
}


function validateInput(yearLow, yearHigh, sizeLow, sizeHigh){
	var boolArr = [false,false,false,false];
	var parsed = parseFloat(yearLow);
	// console.log("This was parsed!", parsed)
	if(parsed){
		yearLowState = yearLow;
		boolArr[0] = true;
		
	}
	else{
		//if the field is not blank, but instead invalid
		if(yearLow == ""){
			boolArr[0] = true;
			$("#yearLow").css('border-color', '');
		}
		else
			$("#yearLow").css('border-color', 'red');

		yearLowState = LOWESTNUM;
	}

	parsed = parseFloat(yearHigh);
	// console.log("This was parsed!", parsed)
	if(parsed){
		yearHighState = yearHigh;
		boolArr[1] = true;
		
	}
	else{
		//if the field is not blank, but instead invalid
		if(yearHigh == ""){
			boolArr[1] = true;
			$("#yearHigh").css('border-color', '');
		}
		else
			$("#yearHigh").css('border-color', 'red');

		yearHighState = HIGHESTNUM;
	}

	parsed = parseFloat(sizeLow);
	// console.log("This was parsed!", parsed)
	if(parsed){
		sizeLowState = sizeLow;
		boolArr[2] = true;
		$("#sizeLow").css('border-color', '');
	}
	else{
		//if the field is not blank, but instead invalid
		if(sizeLow == ""){
			boolArr[2] = true;
			$("#sizeLow").css('border-color', '');
		}
			
		else
			$("#sizeLow").css('border-color', 'red');

		sizeLowState = LOWESTNUM;
	}

	parsed = parseFloat(sizeHigh);
	// console.log("This was parsed!", parsed)
	if(parsed){
		sizeHighState = sizeHigh;
		boolArr[3] = true;
		$("#sizeHigh").css('border-color', '');
	}
	else{
		//if the field is not blank, but instead invalid
		if(sizeHigh == ""){
			boolArr[3] = true;
			$("#sizeHigh").css('border-color', '');
		}
		else
			$("#sizeHigh").css('border-color', 'red');

		sizeHighState = HIGHESTNUM;
	}

	if(boolArr[0] && boolArr[1] && boolArr[2] && boolArr[3])
		changeTopic(null);
		if(globalCartodb_id){
	    	onBuildingClick(globalCartodb_id,topicState,false);
	  	}
	else
		return false;
}

function clearAgeSizeForm(){
	yearLowState = LOWESTNUM;
	yearHighState = HIGHESTNUM;
	sizeLowState = LOWESTNUM;
	sizeHighState = HIGHESTNUM;
	$("#yearSizeFilterBar").find('input:text, input:password, input:file, select, textarea').val('');
	$("#yearSizeFilterBar").find('input:text, input:password, input:file, select, textarea').css('border-color', '');
	changeTopic(null);
	if(globalCartodb_id){
    	onBuildingClick(globalCartodb_id,topicState,false);
  	}
}
