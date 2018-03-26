
/******************************************************
  VISUALIZATIONS; Histogram
******************************************************/

function makeHistogram(dataset, label, divID) {

  var values = dataset;

  // A formatter for counts.
  var formatCount = d3.format(",.0f");

  var margin = {top: 10, right: histoAreaPadding, bottom: 40, left: 35},
      width = histoWidth - margin.left - margin.right,
      height = histoHeight - margin.top - margin.bottom;


  var minVal = Math.min.apply(null,values);

  //sinultaneously find the maximum and filter out values smaller than histoMaxFA
  var maxVal = -1;
  var smallerValues = [];
  for (var i = 0; i < values.length; i++){
    if(values[i] < histoMaxFA){

      smallerValues.push(values[i]);

      if(values[i] > maxVal){
        maxVal = values[i];
      }
    }
  } 

  // Math.max.apply(null,values);

  // console.log("MIN/MAX", minVal,"/", maxVal)

  var x = d3.scale.linear()
      .domain([minVal, maxVal])
      // .domain([0, maxVal])
      .range([0, width]);

  // Generate a histogram using twenty uniformly-spaced bins.
  var data = d3.layout.histogram()
      .bins(20)
      (smallerValues);

  var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.format(".2s"));

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format("s"));

  var locationDiv = d3.select(divID);


  //If histogram not created yet
  if (locationDiv.select("svg")[0][0] == null) {

    var svg = locationDiv.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("data-min", minVal)
        .attr("data-max", maxVal)
        .attr("data-height",height)
        .attr("data-width",width)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  }
  else{
    svg = locationDiv.select("svg")
                      .attr("data-min", minVal)
                      .attr("data-max", maxVal)
                  .select("g");

  }

  // DATA JOIN
  // Join new data with old elements, if any.
  var bars = svg.selectAll(".bar")
      .data(data)  

  // UPDATE
  // Update old elements as needed.
  bars.transition()
      .attr("transform", function(d) { 
        return "translate(" + x(d.x) + "," + y(d.y) + ")"; 
      });

  bars.select("rect")
      .transition()
      .attr("height", function(d) { return height - y(d.y); });
      
      // .attr("height", function(d) { 
      //   console.log(y(0), y(1), y(100));
      //   console.log(height,"|",d.x,x(d.x),"|",d.y,y(d.y),"|",height - y(d.y)); 
      //   return height - y(d.y); 
      // });

  // ENTER
  // Create new elements as needed.
   var barEnter = bars.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

  barEnter.append("rect")
      .attr("x", 1)
      .attr("width", x(data[0].dx + minVal) - 1 )
      // .attr("width", x(data[0].dx + 0) - 1 )
      .attr("height", function(d) { return height - y(d.y); });


  // bar.append("text")
  //     .attr("dy", ".75em")
  //     .attr("y", 6)
  //     .attr("x", x(data[0].dx + minVal) / 2)
  //     .attr("text-anchor", "middle")
  //     .text(function(d) { return formatCount(d.y); });
  if(svg.select(".x.axis")[0][0] == null){
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");
  }
  var ax = svg.select(".x.axis")      
    .transition()
      .call(xAxis)

  // ax.selectAll("text") 
  //     .attr("transform", function(d) {
  //               return "rotate(30)" 
  //               });

  
  axisLabel = svg.selectAll(".x.axis")
                  .selectAll(".label")
                  .data([label]);

// console.log("UPDate selector",axisLabel);
// console.log("enter selector",axisLabel.enter());
  axisLabel.text( function(d){  return d; });

  axisLabel.enter()
      .append("text")
      .attr("y", 22)
      .classed("smallnumber label", true)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .attr("transform", function(d) { return "translate(" + width/2 + "," +0+")"; })
      // changed label to reflect filtering
      .text( function(d){ return d; });


  if(svg.select(".y.axis")[0][0] == null){
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0," + 0 + ")");
  }
  var ax = svg.select(".y.axis")      
    .transition()
      .call(yAxis);

  svg.append("g").attr("class","vert_line");
}



function addHistogramLine(xVal, divID) {

  //if the value is null, remove the line
  if((xVal == null)||(xVal[0] == null)||(xVal == "Not Available*")||(xVal[0] == "Not Available*")){
    var svg = d3.select(divID).select("svg");
    svg.select("g.vert_line").remove();
    // svg.select("g.vert_line").remove();
  }
  //otherwise add/update the line
  else{
    new_xVal = [null];
    console.log("xVal:", xVal);
    // if(xVal[0])
    new_xVal[0] = xVal[0].round(2);
    // else if(xVal)
      // new_xVal[0] = xVal.round(2);
    // console.log("HISTOGRAM div=",divID," xVal=",new_xVal);
    // Select the svg element containing the histogram
    var svg = d3.select(divID).select("svg");

    // Generate a linear map
    var x = d3.scale.linear()
        .domain([svg.attr("data-min"), svg.attr("data-max")])
        // .domain([0, svg.attr("data-max")])
        .range([0, svg.attr("data-width")]);

        // console.log("xVal:",new_xVal," x(xVal)",x(new_xVal))
        // console.log("data-width:",svg.attr("data-width"),
        //             " data-min",svg.attr("data-min")," data-max",svg.attr("data-max"))

    // Get pointers to the line and text elements
    var line = svg.select("g.vert_line")
                  .selectAll("line")
                  .data(new_xVal);
    var lineText = svg.select("g.vert_line")
                      .selectAll("text")
                      .data(new_xVal);
    var yOffset = 20;

    //UPDATE
    line.transition()
        .attr("x1",x(new_xVal))
        .attr("x2",x(new_xVal))
    lineText.transition()
        .attr("x", x(new_xVal))
        .text(new_xVal);

    //ENTER
    line.enter()
        .append("line")
        .attr("x1",x(new_xVal))
        .attr("y1",yOffset)
        .attr("x2",x(new_xVal))
        .attr("y2",svg.attr("data-height"));
    lineText.enter()
        .append("text")
        .attr("dy", ".75em")
        .attr("y", yOffset-12)
        .attr("x", x(new_xVal))
        .attr("text-anchor", "middle")
        .text(new_xVal);
  }


  // If the line is already displayed
  // if(line[0].length > 0) {
  //   line.transition()
  //     .attr("x1",x(new_xVal))
  //     .attr("x2",x(new_xVal))

  //   lineText.transition()
  //     .attr("x", x(new_xVal))
  //     .text(new_xVal);
  // }
  // // Line is not yet displayed
  // else {
  //   line.data(new_xVal)
  //     .enter()
  //     .append("line")
  //     .attr("x1",x(new_xVal))
  //     .attr("y1",yOffset)
  //     .attr("x2",x(new_xVal))
  //     .attr("y2",svg.attr("data-height"));

  //   lineText.data(new_xVal)
  //     .enter()
  //     .append("text")
  //     .attr("dy", ".75em")
  //     .attr("y", yOffset-12)
  //     .attr("x", x(new_xVal))
  //     .attr("text-anchor", "middle")
  //     .text(new_xVal);
  // }

}
