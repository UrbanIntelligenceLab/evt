
/******************************************************
  VISUALIZATIONS: Scatterplot
******************************************************/



function prepareScatterData(property_type, topic) {
        
    //query to get desired EUIs
    property_type_filter_query = "SELECT " +
      "cartodb_id, " +
      "weather_normalized_source_eui_kbtu_ft2, " +
      "primary_property_type_self_selected, " +
      "address, " +
      "indoor_water_intensity_all_water_sources_gal_ft2, " +
      "property_floor_area_buildngs_and_parking_ft2, " +
      "total_ghg_intensity_kgco2e_ft2 " +
      "FROM pluto_disclosure_merge_" + yearState + 
      " WHERE (" +
        "property_floor_area_buildngs_and_parking_ft2 >= 0 AND bbl_m_flag_0 >= 1"+
        " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "+
        " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;
        if(topic == "EUI" || topic == "GHG" || topic=="floorarea") {
          property_type_filter_query += " AND eui_flag_0 >= 1 AND eui_property_outlier_flag_2std < 1";
        }
        if(topic == "WUI") {
          property_type_filter_query += " AND wui_flag_0 >= 1 AND wui_property_outlier_flag_2std < 1 AND eui_flag_0 >= 1 AND eui_property_outlier_flag_2std < 1";
        }
        if(property_type != "All Property Types") {
          property_type_filter_query += " AND primary_property_type_self_selected ILIKE '"+ property_type +"' ";
        } 

        property_type_filter_query = property_type_filter_query + ")";
      
    // console.log("RP prepareScatterData - property_type_filter_query: ", property_type_filter_query);

    //get all EUIs, WUIs and GHG in property type, then draw scatterplot
    queryAndExecute(property_type_filter_query, function(queryResult) {
      arr = [];
      
      // console.log("RP: queryResult.rows.length: ", queryResult.rows.length);
      for (i = 0; i < queryResult.rows.length; i++) {
        tempObj = {};
        tempObj["cartodb_id"] = queryResult.rows[i].cartodb_id;
        tempObj["WUI"] = queryResult.rows[i].indoor_water_intensity_all_water_sources_gal_ft2;
        tempObj["EUI"] = queryResult.rows[i].weather_normalized_source_eui_kbtu_ft2;
        tempObj["GHG"] = queryResult.rows[i].total_ghg_intensity_kgco2e_ft2;
        tempObj["floorarea"] = queryResult.rows[i].property_floor_area_buildngs_and_parking_ft2;
        tempObj["address"] = queryResult.rows[i].address;// + " " + queryResult.rows[i].street_name;
        tempObj["propertyType"] = queryResult.rows[i].primary_property_type_self_selected;
        arr.push(tempObj);
      }

      makeScatterplot(arr, topic); 
    });
}



function makeScatterScalesArray(dataArray, topic) {
  if (topic === undefined) { topic = "EUI"; } 

  // x = WUI, e.g. 99.8
  //var WUIMin = d3.min(dataArray, function(d) { return d["WUI"]; });
  //var WUIMax = d3.max(dataArray, function(d) { return d["WUI"]; });

  // var xScale = d3.scale.linear()
  //         .domain([0, WUIMax])
  //         .range([scatterAreaPadding, scatterWidth - scatterAreaPadding]);

  // x = GHG, e.g. 99.8
  var GHGMin = d3.min(dataArray, function(d) { return d["GHG"]; });
  var GHGMax = d3.max(dataArray, function(d) { return d["GHG"]; });
  // var GHGMax = 10000
  // console.log("GHG min and MAX: ", GHGMin, GHGMax);


  var xScale = d3.scale.linear()
          .domain([0, GHGMax])
          .range([scatterAreaPadding, scatterWidth - scatterAreaPadding]);

  // y = siteEUI, e.g. 102
  var siteEUIMin = d3.min(dataArray, function(d) { return d[topic]; });
  var siteEUIMax = d3.max(dataArray, function(d) { return d[topic]; });
  // console.log("RP: siteEUIMax: ", siteEUIMax);
  if(topic == "floorarea") {
    var yScale = d3.scale.linear()
          //.domain([siteEUIMin, siteEUIMax])
          .domain([0, siteEUIMax])
          //.range([0, scatterHeight]); --> yScale needs to go into the other direction!
          .range([scatterHeight - scatterAreaPadding, scatterAreaPadding]);
  } else {
      var yScale = d3.scale.linear()
          .domain([0, siteEUIMax])
          .range([scatterHeight - scatterAreaPadding, scatterAreaPadding]);
  }

  // r = floorArea, e.g. 1338000
  var floorAreaMin = d3.min(dataArray, function(d) { return d["floorarea"]; });
  var floorAreaMax = d3.max(dataArray, function(d) { return d["floorarea"]; });
  var rScale = d3.scale.linear()
          .domain([floorAreaMin, floorAreaMax])
          .range([minRadius, maxRadius]);

  // color based on siteEUI, e.g. 102
  var color = d3.scale.linear()
          .domain([siteEUIMin, siteEUIMax])
          .range([d3.rgb(hexColorLowEUI), d3.rgb(hexColorHighEUI)]);

  var tempArray = [xScale, yScale, rScale, color];
  //console.log("Scale tempArray: ", tempArray);

  return tempArray;

}


function makeScatterplot(dataArray, topic) {
  if (topic === undefined) { topic = "EUI"; } 
  clickTopic = topic;

  if(topic == "EUI") {
    var ylabel = labelWeatherNormEUIShort;
  } else if(topic == "WUI") {
    var ylabel = labelWUIShort;
  } else if (topic == "GHG") { 
    topic = "floorarea";  // reset because for topic GHG and floorarea the scatterplot is the same
    var ylabel = labelFloorarea;
  } else if (topic == "floorarea") { 
    var ylabel = labelFloorarea;
  }

  d3.select("#tooltip").classed("hidden", true);
  d3.select("#scatterplotcontainer").attr("style", "visibility:visible");
  d3.select("#intro").attr("style", "display:none");

  d3.select("#scatterplot").select("svg").remove();
  var scalesArray = makeScatterScalesArray(dataArray, topic);
  var scatterArea = d3.select("#scatterplot");

  var svg = scatterArea.append("svg")
        .attr("width", scatterWidth)
        .attr("height", scatterHeight);

  // define clipping path
  svg.append("clipPath")
    .attr("id", "chart-area")
    .append("rect")
    .attr("x", scatterAreaPadding)
    .attr("y", scatterAreaPadding - 10) // -10 to not cut circles in the middle
    .attr("width", scatterWidth-2*scatterAreaPadding + 10)
    .attr("height", scatterHeight-2*scatterAreaPadding + 10)
    .attr("style", "border:1px solid red");

  // create circles
  svg.append("g")
    .attr("id", "circles")
    .attr("clip-path", "url(#chart-area)")
    
    .selectAll("circle")
      .data(dataArray)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return scalesArray[0](d["GHG"]);
      })
      .attr("cy", function(d) {
        return scalesArray[1](d[topic]);
      })
      // .attr("r", function(d) {
      //   return scalesArray[2](d["floorArea"]);
      // })
      .attr("r", 4)
      // .attr("fill", function(d) {
      //   return scalesArray[3](d["siteEUI"]);
      // })
      .attr("fill", hexColorHighEUI)
      .attr("style", "opacity:0.8; cursor:pointer")

      .on("mouseover", function(d) {
          d3.select(this)
              .attr("fill", highlightColor);

          // display tooltip
          var xPos = scalesArray[0](d["GHG"]) + 20;
          var yPos = scalesArray[1](d[topic]) + 20;
          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .select("#scatterTooltip-address")
            .text(function() {
                return (d["address"]);
          });

          d3.select("#scatterTooltip-propertyType")
            .text(function() {
                // return (d["propertyType"] + ", " + d["floorArea"] + " sqf.");
                return (d["floorarea"] + " sqf.");
          });

          d3.select("#scatterTooltip-buildingEUI")
            .html(function() {
                //return (d[topic] + " " + topic + ", " + d["GHG"] + " GHG");
                return ("<p> EUI: "+numberWithCommas(d["EUI"]) + "<br>GHG: " + numberWithCommas(d["GHG"]) + "<br>WUI: " + numberWithCommas(d["WUI"]) +"</p>");
          });

          d3.select("#tooltip").classed("hidden", false);
      })

      .on("mouseout", function(d) {
        thisDot = d3.select(this);

        // console.log("SELECTED DOT: ",selectedDot);
        // console.log("THIS DOT: ",thisDot);
        // console.log(thisDot[0][0].__data__.cartodb_id == globalCartodb_id);

        if(thisDot[0][0].__data__.cartodb_id != globalCartodb_id)
          thisDot.attr("fill", hexColorHighEUI);

        d3.select("#tooltip").classed("hidden", true);
      })

      .on("click", function(d) {

        //reset the color on old dot
        if (selectedDot)
          selectedDot.attr("fill", hexColorHighEUI);

        //highlight new dot
        selectedDot = d3.select(this);
        selectedDot.attr("fill", highlightColor);

        console.log("This is selected: ",selectedDot);
        //move to front
        d3.select(this).each(function(){
          this.parentNode.appendChild(this);
        });

        //update graphs
        onBuildingClick(d["cartodb_id"], clickTopic, true);

        // display tooltip
        d3.select("#tooltip").classed("hidden", true);

        var xPos = scalesArray[0](d["GHG"]) + 20;
        var yPos = scalesArray[1](d[topic]) + 20;
        d3.select("#tooltip")
          .style("left", xPos + "px")
          .style("top", yPos + "px")
          .select("#scatterTooltip-address")
          .text(function() {
              return (d["address"]);
        });

        d3.select("#scatterTooltip-propertyType")
          .text(function() {
              // return (d["propertyType"] + ", " + d["floorArea"] + " sqf.");
              return (d["floorarea"] + " sqf.");
        });

        d3.select("#scatterTooltip-buildingEUI")
          .text(function() {
              //return (d[topic] + " " + topic + ", " + d["GHG"] + " GHG");
              return (d["EUI"] + " EUI, \n" + d["GHG"] + " GHG, \n" + d["WUI"] + " WUI");
        });

        d3.select("#tooltip").classed("hidden", false);
      });

  // labels
  // svg.selectAll("text")
  //   .data(dataArray)
  //   .enter()
  //   .append("text")
  //   .text(function(d) {
  //     return (d["floorArea"] + " sqf");
  //   })
  //       .attr("x", function(d) {
  //     return scalesArray[0](d["WUI"]);
  //   })
  //   .attr("y", function(d) {
  //     return scalesArray[1](d["siteEUI"] + 5);
  //   })

  // axis
  var xAxis = d3.svg.axis()
        .scale(scalesArray[0])
        .orient("bottom")
        .ticks(5);

  var yAxis = d3.svg.axis()
      .scale(scalesArray[1])
      .orient("left")
      .ticks(5)
      .tickFormat(d3.format("s"));

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0, " + (scatterHeight - scatterAreaPadding) + ")")
    .call(xAxis);

   svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + scatterAreaPadding +", 0)")
      .call(yAxis);

  svg.append("text")
    .attr("style", "font-size:10px;")
    .attr("x", scatterWidth/2)
    .attr("y", scatterHeight-2)
    .text(labelGHG);

  if(topic != "floorarea") {
      svg.append("text")
        .attr("style", "font-size:10px;")
        .attr("transform", "rotate(-90)")
        .attr("x", -scatterHeight/2)
        .attr("y", 8)      // see http://www.d3noob.org/2012/12/adding-axis-labels-to-d3js-graph.html
        .text(ylabel);
  } else {
      svg.append("text")
        .attr("style", "font-size:10px;")
        .attr("transform", "rotate(-90)")
        .attr("x", -scatterHeight/2)
        .attr("y", 8)      // see http://www.d3noob.org/2012/12/adding-axis-labels-to-d3js-graph.html
        .text(ylabel);

  }
}

function updateScatterplot(cartodb_id) {

  // hide tooltip
  d3.select("#tooltip").classed("hidden", true);

  var group = d3.select("#scatterplot").select("svg").select("g");


  group.selectAll("circle").each(function(){

    thisDot = d3.select(this);

    if(thisDot[0][0].__data__.cartodb_id == globalCartodb_id) {
      //update dot
      console.log("This is the dot: ",thisDot);
      selectedDot = thisDot;
      
      //move to front
      selectedDot.each(function(){
        this.parentNode.appendChild(this);
      });

      selectedDot.attr("fill", highlightColor);
    } 
    else {
      thisDot.attr("fill", hexColorHighEUI);
    }
  })
}
