
/******************************************************
  BUILDING TYPE LIST
******************************************************/


function prepareBuilingtypeList(topic) {
    if (topic === undefined) { topic = "EUI"; } 
    
    // var listQuery = "SELECT main.primary_property_type___self_selected AS propertytype, "+
    //                   "count(main.primary_property_type___self_selected), "+
    //                   "avg(main.weather_normalized_source_eui_kbtu_ft2) AS avgEUI, " +
    //                   "stddev_pop(main.weather_normalized_source_eui_kbtu_ft2) AS stddevEUI, " +
    //                   "avg(moredata.indoor_water_intensity_all_water_sources_gal_ft2) AS avgWUI, " +
    //                   "stddev_pop(moredata.indoor_water_intensity_all_water_sources_gal_ft2) AS stddevWUI, " +
    //                   "avg(moredata.property_floor_area_buildngs_and_parking_ft2) AS avgFloorarea, " +
    //                   "stddev_pop(moredata.property_floor_area_buildngs_and_parking_ft2) stddevFloorarea, " +
    //                   "avg(moredata.total_ghg_intensity_kgco2e_ft2) AS avgGHG, " +
    //                   "stddev_pop(moredata.total_ghg_intensity_kgco2e_ft2) AS stddevGHG " +
    //           "FROM nyc_energy_by_bbl AS main " +
    //           "JOIN full_energy_and_water_data_disclosure_2012 AS moredata ON " +
    //                   "moredata.bbl = main.bbl " + 
    //           "WHERE ("+
    //             "main.weather_normalized_source_eui_kbtu_ft2 >= " + EUILowerLimit + " " +
    //             "AND main.weather_normalized_source_eui_kbtu_ft2 < " + EUIUpperLimit + " " +
    //             "AND moredata.indoor_water_intensity_all_water_sources_gal_ft2 >= " + WUILowerLimit + " " +
    //             "AND moredata.indoor_water_intensity_all_water_sources_gal_ft2 < " + WUIUpperLimit + " " +
    //             "AND moredata.total_ghg_intensity_kgco2e_ft2 >= " + GHGLowerLimit + " " +
    //             "AND moredata.total_ghg_intensity_kgco2e_ft2 < " + GHGUpperLimit +
    //             ") " +
    //           "GROUP BY main.primary_property_type___self_selected " +
    //           "ORDER BY count(main.primary_property_type___self_selected) DESC";
      // console.log("TOPIC IS: ",topic)
      if(topic == "EUI") {
        var topicStr = "weather_normalized_source_eui_kbtu_ft2";  
        LL = EUILowerLimit;
        UL = EUIUpperLimit;
      } else if(topic == "WUI") {
        var topicStr = "indoor_water_intensity_all_water_sources_gal_ft2";  
        LL = WUILowerLimit;
        UL = WUIUpperLimit;
      } else if(topic == "GHG") {
        var topicStr = "total_ghg_intensity_kgco2e_ft2"; 
        LL = GHGLowerLimit;
        UL = GHGUpperLimit; 
      } else if(topic == "floorarea") {
        var topicStr = "property_floor_area_buildngs_and_parking_ft2";   
        LL = floorareaLowerLimit;
        UL = floorareaUpperLimit;      
      }

      var listQuery = "SELECT primary_property_type_self_selected AS propertytype, "+
                            "count(primary_property_type_self_selected), "+
                            "avg(" + topicStr + "), " +
                            "stddev_pop(" + topicStr + ") " +
                    "FROM pluto_disclosure_merge_" + yearState + " " +
                    "WHERE ("+
                      topicStr + " >= " + LL + " " +
                      "AND " + topicStr + " < " + UL + " " +
                    ") " +
                    "GROUP BY primary_property_type_self_selected " +
                    "ORDER BY count(primary_property_type_self_selected) DESC";

      // console.log("logging query: ", listQuery);



      //console.log("RP: query building list with topic:", topic, listQuery);

      queryAndExecute(listQuery, function(queryResult) {

        //Try to convert to percentiles instead of means and std. dev.
        // overallQuery = "SELECT percentile_disc(0.25) " + 
        // "WITHIN GROUP (ORDER BY weather_normalized_source_eui_kbtu_ft2) AS median   " +
        // "FROM nyc_energy_by_bbl AS main " +
        // "JOIN full_energy_and_water_data_disclosure_2013 AS moredata ON " +
        //         "moredata.bbl = main.bbl";

        // overallQuery = "SELECT weather_normalized_source_eui_kbtu_ft2, ntile(100) over (order by weather_normalized_source_eui_kbtu_ft2) AS percentile " +
        //                 "FROM nyc_energy_by_bbl AS main " +
        //                 "JOIN full_energy_and_water_data_disclosure_2013 AS moredata ON " +
        //                     "moredata.bbl = main.bbl "
        //                 "ORDER BY weather_normalized_source_eui_kbtu_ft2";

        var overallQuery = "SELECT "+
                            "count(*), "+
                            "avg(" + topicStr + "), " +
                            "stddev_pop(" + topicStr + ") " +
                    "FROM pluto_disclosure_merge_" + yearState + " " +
                    "WHERE ("+
                      topicStr + " >= " + LL + " " +
                      "AND " + topicStr + " < " + UL + " " +
                    ")";

      // console.log("logging query: ", overallQuery);


      //Add in the row for all property types
      queryAndExecute(overallQuery, function(overallQueryResult){
        // console.log("RESULT FROM THE OVERALL QUERY: ", queryResult);
        buildingTypelistArr = [];
        
        // add "All" to data array - TODO check w Chris for whiskers
        tempObj = {};
        tempObj["propertytype"] = "All Property Types";
        tempObj["count"] = overallQueryResult.rows[0].count;
        tempObj["topicavg"] = overallQueryResult.rows[0].avg;
        tempObj["topicsd"] = overallQueryResult.rows[0].stddev_pop;
        buildingTypelistArr.push(tempObj);

        for (i = 0; i < queryResult.rows.length; i++) {

          if(queryResult.rows[i].propertytype != null) {
            if(jQuery.inArray(queryResult.rows[i].propertytype, buildingTypeConfigArray) != -1) {
              tempObj = {};
              tempObj["propertytype"] = queryResult.rows[i].propertytype;
              tempObj["count"] = queryResult.rows[i].count;
              tempObj["topicavg"] = queryResult.rows[i].avg;
              tempObj["topicsd"] = queryResult.rows[i].stddev_pop;
              buildingTypelistArr.push(tempObj);
            }
          }
        }


        // console.log("CT datas: ", buildingTypelistArr);

        createBuilingtypeList(buildingTypelistArr, topic); 
        makeWhiskerPlot(buildingTypelistArr, topic);
        changeLayer(topic,propertyState,null);

        if(globalCartodb_id){
          onBuildingClick(globalCartodb_id,topic,false);
        }
        if (selectedBuildingPolygon) {
          map.removeLayer(selectedBuildingPolygon);
        }
      })
      
    });

    // console.log("leaving prepareBuilingtypeList.");
}


function createBuilingtypeList(dataArray, topic) {
  // console.log("How long is the data array? ",dataArray.length, dataArray);
  d3.select("#typelist").select("ul").remove();

	myList = d3.select("#typelist").append("ul")
		.attr("class", "list-group");

	myList.selectAll("li")
  		.data(dataArray)
  		.enter().append("li")
      .attr("class", "list-group-item")

      //.attr("onClick", "visFilter(this)")
  		.text(function(d) { 
  			     return (d["propertytype"]); })

      .on("mouseover", function() {
          d3.select(this)
              .transition()
              .duration(250)
              .attr("style", function(){
                if($(this).hasClass("selected") == false){
                  return "background-color: " + hoverColor;
                }
              });
      })

      .on("mouseout", function() {
          d3.select(this)
              .transition()
              .duration(250)
              .attr("style", function(){
                if($(this).hasClass("selected") == false){
                  return "background-color: white";
                }
              });
      })

      .on("click", function(d) {
          // delete all background highlights
          d3.select("#typelist").select("ul")
            .selectAll("li")
            .classed("selected",false)
              // .attr("style", "background-color:white");

          d3.select(this)
            .classed("selected",true)
            // .attr("style", "background-color: " + highlightColor)

          // hide per building info
          d3.select(".perbuildinginfo").attr("style", "visibility: hidden");
          if (selectedBuildingPolygon) {
            map.removeLayer(selectedBuildingPolygon);
          }

          // filter map and scatterplot
          setFilterState(topic, d["propertytype"]);
          changeLayer(topic,d["propertytype"],null);
          prepareScatterData(d["propertytype"], topic);
      })

      // add count in <span>
      .append("span")
        .attr("class", "badge")
        .text(function(d) { 
          return (d["count"]); })

  //loop through and highlight the element that was already selected
  myList.selectAll("li")
    .each(function(d){
      //if this is the entry that is currently the state,
      //we want it to be orange from creation.
      if(propertyState == d["propertytype"]){
        d3.select(this).classed("selected",true);
        prepareScatterData(d["propertytype"], topic);
      }
    });

 }