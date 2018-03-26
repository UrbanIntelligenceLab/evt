
/******************************************************
  BUILDING TYPE LIST
******************************************************/


function prepareBuilingtypeList(property_type, topic) {
    if (topic === undefined) { topic = "EUI"; } 
    
    // var listQuery = "SELECT main.primary_property_type___self_selected AS propertytype, "+
    //                   "count(main.primary_property_type___self_selected), "+
    //                   "avg(main.weather_normalized_source_eui_kbtu_ft2) AS avgEUI, " +
    //                   "stddev_pop(main.weather_normalized_source_eui_kbtu_ft2) AS stddevEUI, " +
    //                   "avg(moredata.indoor_water_intensity_all_water_sources_gal_ft2) AS avgWUI, " +
    //                   "stddev_pop(moredata.indoor_water_intensity_all_water_sources_gal_ft2) AS stddevWUI, " +
    //                   "avg(moredata.property_floor_area_buildngs_and_parking_ft2) AS avgFloorarea, " +
    //                   "stddev_pop(moredata.property_floor_area_buildngs_and_parking_ft2) stddevFloorarea, " +
    //                   "avg(moredata.total_ghg_emissions_mtco2e) AS avgGHG, " +
    //                   "stddev_pop(moredata.total_ghg_emissions_mtco2e) AS stddevGHG " +
    //           "FROM nyc_energy_by_bbl AS main " +
    //           "JOIN full_energy_and_water_data_disclosure_2012 AS moredata ON " +
    //                   "moredata.bbl = main.bbl " + 
    //           "WHERE ("+
    //             "main.weather_normalized_source_eui_kbtu_ft2 >= " + EUILowerLimit + " " +
    //             "AND main.weather_normalized_source_eui_kbtu_ft2 < " + EUIUpperLimit + " " +
    //             "AND moredata.indoor_water_intensity_all_water_sources_gal_ft2 >= " + WUILowerLimit + " " +
    //             "AND moredata.indoor_water_intensity_all_water_sources_gal_ft2 < " + WUIUpperLimit + " " +
    //             "AND moredata.total_ghg_emissions_mtco2e >= " + GHGLowerLimit + " " +
    //             "AND moredata.total_ghg_emissions_mtco2e < " + GHGUpperLimit +
    //             ") " +
    //           "GROUP BY main.primary_property_type___self_selected " +
    //           "ORDER BY count(main.primary_property_type___self_selected) DESC";

      if(topic == "EUI") {
              var listQuery = "SELECT main.primary_property_type___self_selected AS propertytype, "+
                            "count(main.primary_property_type___self_selected), "+
                            "avg(main.weather_normalized_source_eui_kbtu_ft2), " +
                            "stddev_pop(main.weather_normalized_source_eui_kbtu_ft2) " +
                    "FROM nyc_energy_by_bbl AS main " +
                    "WHERE ("+
                      "main.weather_normalized_source_eui_kbtu_ft2 >= " + EUILowerLimit + " " +
                      "AND main.weather_normalized_source_eui_kbtu_ft2 < " + EUIUpperLimit + " " +
                    ") " +
                    "GROUP BY main.primary_property_type___self_selected " +
                    "ORDER BY count(main.primary_property_type___self_selected) DESC";
      } else if(topic == "WUI") {
              var listQuery = "SELECT main.primary_property_type___self_selected AS propertytype, "+
                      "count(main.primary_property_type___self_selected), "+
                      "avg(moredata.indoor_water_intensity_all_water_sources_gal_ft2), " +
                      "stddev_pop(moredata.indoor_water_intensity_all_water_sources_gal_ft2) " +
                  "FROM nyc_energy_by_bbl AS main " +
                  "JOIN full_energy_and_water_data_disclosure_2012 AS moredata ON " +
                      "moredata.bbl = main.bbl " + 
                  "WHERE ("+
                    "moredata.indoor_water_intensity_all_water_sources_gal_ft2 >= " + WUILowerLimit + " " +
                    "AND moredata.indoor_water_intensity_all_water_sources_gal_ft2 < " + WUIUpperLimit +
                  ") " +
                  "GROUP BY main.primary_property_type___self_selected " +
                  "ORDER BY count(main.primary_property_type___self_selected) DESC";
      } else if(topic == "GHG") {
              var listQuery = "SELECT main.primary_property_type___self_selected AS propertytype, "+
                      "count(main.primary_property_type___self_selected), "+
                      "avg(moredata.total_ghg_emissions_mtco2e), " +
                      "stddev_pop(moredata.total_ghg_emissions_mtco2e) " +
                  "FROM nyc_energy_by_bbl AS main " +
                  "JOIN full_energy_and_water_data_disclosure_2012 AS moredata ON " +
                          "moredata.bbl = main.bbl " + 
                  "WHERE ("+
                    "moredata.total_ghg_emissions_mtco2e >= " + GHGLowerLimit + " " +
                    "AND moredata.total_ghg_emissions_mtco2e < " + GHGUpperLimit +
                  ") " +
                  "GROUP BY main.primary_property_type___self_selected " +
                  "ORDER BY count(main.primary_property_type___self_selected) DESC";
      } else if(topic == "floorarea") {
              var listQuery = "SELECT main.primary_property_type___self_selected AS propertytype, "+
                            "count(main.primary_property_type___self_selected), "+
                            "avg(moredata.property_floor_area_buildngs_and_parking_ft2), " +
                            "stddev_pop(moredata.property_floor_area_buildngs_and_parking_ft2) " +
                    "FROM nyc_energy_by_bbl AS main " +
                    "JOIN full_energy_and_water_data_disclosure_2012 AS moredata ON " +
                            "moredata.bbl = main.bbl " + 
                    "WHERE ("+
                      "moredata.property_floor_area_buildngs_and_parking_ft2 >= " + floorareaLowerLimit + " " +
                      "AND moredata.property_floor_area_buildngs_and_parking_ft2 < " + floorareaUpperLimit +
                      ") " +
                    "GROUP BY main.primary_property_type___self_selected " +
                    "ORDER BY count(main.primary_property_type___self_selected) DESC";
      }

      //console.log("RP: query building list with topic:", topic, listQuery);

      queryAndExecute(listQuery, function(queryResult) {
        arr = [];
        // add "All" to data array - TODO check w Chris for whiskers
        // tempObj = {};
        // tempObj["propertytype"] = "All";
        // tempObj["count"] = 10000;
        // tempObj["EUIavg"] = 127;
        // tempObj["EUIsd"] = 54;
        // arr.push(tempObj);

        for (i = 0; i < queryResult.rows.length; i++) {

          if(queryResult.rows[i].propertytype != null) {
            if(jQuery.inArray(queryResult.rows[i].propertytype, buildingTypeConfigArray) != -1) {
              tempObj = {};
              tempObj["propertytype"] = queryResult.rows[i].propertytype;
              tempObj["count"] = queryResult.rows[i].count;
              tempObj["topicavg"] = queryResult.rows[i].avg;
              tempObj["topicsd"] = queryResult.rows[i].stddev_pop;
              arr.push(tempObj);
            }
          }
          
        }
        console.log("CT datas: ", arr);

        createBuilingtypeList("All", arr); 
        makeWhiskerPlot(arr, topic);
      });


}

function createBuilingtypeList(property_type, dataArray) {

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

      // .on("mouseover", function() {
      //     d3.select(this)
      //         .transition()
      //         .duration(250)
      //         .attr("style", "background-color: " + highlightColor);
      // })

      // .on("mouseout", function() {
      //     d3.select(this)
      //         .transition()
      //         .duration(250)
      //         .attr("style", "background-color: white");

      // })

      .on("click", function(d) {
          // delete all background highlights
          d3.select("#typelist").select("ul")
            .selectAll("li")
              .attr("style", "background-color:white");

          d3.select(this)
            .attr("style", "background-color: " + highlightColor)

          // hide per building info
          d3.select(".perbuildinginfo").attr("style", "visibility: hidden");

          // filter map and scatterplot
          visFilter(d["propertytype"]);
          prepareScatterData(d["propertytype"]);
      })

      // add count in <span>
      .append("span")
        .attr("class", "badge")
        .text(function(d) { 
          return (d["count"]); })
 }