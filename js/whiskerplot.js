


function makeWhiskerPlot(dataArray, topic) {
  if (topic === undefined) { topic = "EUI"; } 

  // define limit variables
  if(topic == "EUI") {
    var upperLimit = EUIUpperLimit;
    var lowerLimit = EUILowerLimit;

  } else if(topic == "WUI") {
    var upperLimit = WUIUpperLimit;
    var lowerLimit = WUILowerLimit;

  } else if(topic == "GHG") {
    var upperLimit = GHGUpperLimit;
    var lowerLimit = GHGLowerLimit;

  } else if(topic == "floorarea") {
    var upperLimit = floorareaUpperLimit;
    var lowerLimit = floorareaLowerLimit;
  }

  d3.select("#whiskers").select("svg").remove();

	var margin = {top: 25, right: 14, bottom: 25, left: 5},
      width = whiskerWidth - margin.left - margin.right,
      height = whiskerHeight - margin.top - margin.bottom;

	svg = d3.select("#whiskers").append("svg")
			.attr("width", width + margin.left + margin.right)
      		.attr("height", height + margin.top + margin.bottom)
      		.attr("data-width",width)
      		.attr("data-height",height)
	    .append("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	xScale = d3.scale.linear()
				.domain([0,upperLimit])
				.range([0,width]);

	yScale = d3.scale.ordinal()
				.domain(buildingTypeConfigArray)
				.rangeRoundPoints([20,height-10]);


	svg.selectAll("g")
		.data(dataArray)
		.enter()
		.append("g")
			.attr("class","whisker");


	svg.selectAll(".whisker")
		.each(function(){
			that = d3.select(this);
			d = that[0][0].__data__;
      // console.log("LOGGING THAT ",that);
			that.append("line")
				.attr("class","2std")
				.attr("x1",xScale(d3.max([ 0, d.topicavg - 2*d.topicsd])))
      			.attr("y1",yScale(d.propertytype))
      			.attr("x2",xScale(d.topicavg + 2*d.topicsd))
      			.attr("y2",yScale(d.propertytype)); 
		});
		

	svg.selectAll(".whisker")
		.each(function(){
			that = d3.select(this);
			d = that[0][0].__data__;
			that.append("line")
				.attr("class","1std")
				.attr("x1",xScale(d3.max([ 0, d.topicavg - d.topicsd])))
      			.attr("y1",yScale(d.propertytype))
      			.attr("x2",xScale(d.topicavg + d.topicsd))
      			.attr("y2",yScale(d.propertytype))
    			.attr("stroke-width","3"); 
		});


	svg.selectAll(".whisker")
		.each(function(){
			that = d3.select(this);
			d = that[0][0].__data__;
			that.append("circle")
				.attr("class","meanPoint")
      			.attr("cx",xScale(d.topicavg))
      			.attr("cy",yScale(d.propertytype))
      			.attr("r",3)
      			.attr("stroke-width","1");
		});
		
	 var bottomAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

   var topAxis = d3.svg.axis()
        .scale(xScale)
        .orient("top")
        .ticks(5);   

    // d3.select("#typelist svg")
    svg.append("g")
    	.attr("class", "axis")
    	.attr("transform", "translate(0, " + (height) + ")")
    	.call(bottomAxis);

   	svg.append("g")
    	.attr("class", "axis")
    	// .attr("transform", "translate(0,0)")
    	.call(topAxis);

    svg.append("g")
    	.attr("class","vert_line");

    // drawLine([500]);

    // drawLine([200]);
}


function addWhiskerLine(xVal, topic) {
  // console.log("Adding Whisker line!! : ", xVal, topic);

  //if the value is null, remove the line
  if((xVal == null)||(xVal[0] == null)||(xVal == "Not Available*")||(xVal[0] == "Not Available*")){
    var svg = d3.select("#whiskers svg g.vert_line");
    svg.selectAll("line").remove();
    svg.selectAll("text").remove();
    d3.select("#whiskers-legend").attr("style", "visibility: hidden");
  }
  //otherwise add/update the line
  else{

    if (topic === undefined) { topic = "EUI"; } 

    // define limit variables
    if(topic == "EUI") {
      var upperLimit = EUIUpperLimit;
      var lowerLimit = EUILowerLimit;

    } else if(topic == "WUI") {     
      var upperLimit = WUIUpperLimit;
      var lowerLimit = WUILowerLimit;

    } else if(topic == "GHG") {
      var upperLimit = GHGUpperLimit;
      var lowerLimit = GHGLowerLimit;

    } else if(topic == "floorarea") {
      var upperLimit = floorareaUpperLimit;
      var lowerLimit = floorareaLowerLimit;
    }

    d3.select("#whiskers-legend").attr("style", "visibility:visible");

  	var svg = d3.select("#whiskers svg g.vert_line");
    	
    // Generate a linear map
  	xScale = d3.scale.linear()
  			.domain([0,upperLimit])
  			.range([0,d3.select("#whiskers svg").attr("data-width")]);

    //SELECT
  	line = svg.selectAll("line")
  			.data(xVal);
    //UPDATE
  	line.transition()
        .attr("x1",function(d){
          // console.log(topic,upperLimit, d, xScale(d));
          return xScale(d);
        })
        .attr("x2",function(d){return xScale(d);}); 		
    //ENTER
  	line.enter()
        .append("line")
          .attr("x1",function(d){
            // console.log(topic,upperLimit, d, xScale(d));
            return xScale(d);
          })
      		.attr("y1",0)
      		.attr("x2",function(d){return xScale(d);})
      		.attr("y2",d3.select("#whiskers svg").attr("data-height"));
  }

}