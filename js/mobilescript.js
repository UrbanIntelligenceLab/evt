
function searchAgain(){
	$("#addressText").focus();
}

function showAboutMobile(){
  d3.select("#expandedbuildinginfo").classed("hidden", true);
  d3.select("#datasourcescontainer").classed("hidden", true);
  d3.select("#researchcontainer").classed("hidden", true);
  d3.select("#aboutcontainer").classed("hidden", false);
}

function showResearchMobile(){
  d3.select("#expandedbuildinginfo").classed("hidden", true);
  d3.select("#datasourcescontainer").classed("hidden", true);
  d3.select("#aboutcontainer").classed("hidden", true);
  d3.select("#researchcontainer").classed("hidden", false);
}

function showDataMobile(){
  d3.select("#expandedbuildinginfo").classed("hidden", true);
  d3.select("#researchcontainer").classed("hidden", true);
  d3.select("#aboutcontainer").classed("hidden", true);
  d3.select("#datasourcescontainer").classed("hidden", false);
}

function showVisMobile(){
  d3.select("#researchcontainer").classed("hidden", true);
  d3.select("#aboutcontainer").classed("hidden", true);
  d3.select("#datasourcescontainer").classed("hidden", true);
  d3.select("#expandedbuildinginfo").classed("hidden", false);
}

function mobileAddressSearch(){
    topic = topicState;

    var address = $("#addressText")[0].value;

	$.ajax({ url: 'search.php',
	     data: {address: address},
	     type: 'post',
	     success: function(output) {
	                  // console.log("CT address response:", output);

	                  matches = output.match(/-?\d+\.?\d*/g);
	                  // console.log("CT output matches: ", matches);

	                  if(matches != null){

	                    bbl = matches[0]
	                    lat = matches[1]
	                    lon = matches[2]
	                    latlng = [parseFloat(lat), parseFloat(lon)]

	                    // highlightBuilding(null, bbl);

	                    selectedBuildingQuery = "SELECT * "
	                                            + "FROM pluto_disclosure_merge_" + yearState
	                                            + " WHERE bbl ="+bbl;

	                    //get the information of clicked building
	                    showVisMobile();
	 				    updateMobileDisplay(selectedBuildingQuery, topicState);
					  }
		}
	});
  
}

function updateMobileDisplay(selectedBuildingQuery, topic){

  queryAndExecute(selectedBuildingQuery, function(queryResult){
    
    if(queryResult.rows.length > 0) {
      //select info vraiables from the object
      // console.log("CT returned from click: ",queryResult);

      var propertyType = queryResult.rows[0].primary_property_type_self_selected;
      if(propertyType.length < 2){
        propertyType = "Undefined Property Type";
      }

      // var address = queryResult.rows[0].street_number.concat(" ".concat(queryResult.rows[0].street_name));
      var address = queryResult.rows[0].address;
      if(getBoroName(queryResult.rows[0].bbl) != null){
        address += ", "+ getBoroName(queryResult.rows[0].bbl);
      }
      if(queryResult.rows[0].zip > 0){
        address += ", "+ queryResult.rows[0].zip;
      }
      // console.log("THIS WAS CLICKED: ", queryResult.rows[0].bbl);
    
      var displayStat = null;
      var label = null;

      floorarea_filter_query = "SELECT bbl, property_floor_area_buildngs_and_parking_ft2 "+
          "FROM pluto_disclosure_merge_" + yearState + " "+
          "WHERE ("+
            "property_floor_area_buildngs_and_parking_ft2 >= 10000 "+
            "AND property_floor_area_buildngs_and_parking_ft2 < 4000000 "+
            "AND eui_flag_0 >= 1 AND bbl_m_flag_0 >= 1 AND eui_property_outlier_flag_2std <= 0 "+
            " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "+
            " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;
            if(propertyType != "Undefined Property Type") {
              floorarea_filter_query += " AND primary_property_type_self_selected ILIKE '"+propertyType+"'"
            }
            floorarea_filter_query +=")";

      ghg_filter_query = "SELECT bbl, total_ghg_intensity_kgco2e_ft2 "+
          "FROM pluto_disclosure_merge_" + yearState + " "+
          "WHERE ("+
            "total_ghg_intensity_kgco2e_ft2 >= 0 "+
            "AND total_ghg_intensity_kgco2e_ft2 < 40 " +
            "AND eui_flag_0 >= 1 AND bbl_m_flag_0 >= 1 AND eui_property_outlier_flag_2std <= 0 "+
            " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "+
            " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;
            if(propertyType != "Undefined Property Type") {
              ghg_filter_query += " AND primary_property_type_self_selected ILIKE '"+propertyType+"'"
            }
            ghg_filter_query +=")";
      wui_filter_query = "SELECT bbl, indoor_water_intensity_all_water_sources_gal_ft2 "+
          "FROM pluto_disclosure_merge_" + yearState + " "+
          "WHERE ("+
            "indoor_water_intensity_all_water_sources_gal_ft2 >= 0 "+
            "AND indoor_water_intensity_all_water_sources_gal_ft2 < 500 " +
            "AND wui_flag_0 >= 1 AND bbl_m_flag_0 >= 1 AND wui_property_outlier_flag_2std <= 0 "+
            " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "+
            " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;
            if(propertyType != "Undefined Property Type") {
              wui_filter_query += " AND primary_property_type_self_selected ILIKE '"+propertyType+"'"
            }
            wui_filter_query +=")";

      eui_filter_query = "SELECT bbl, weather_normalized_source_eui_kbtu_ft2, yearbuilt,  property_floor_area_buildngs_and_parking_ft2 "+
          "FROM pluto_disclosure_merge_" + yearState + " "+
          "WHERE ("+
            "weather_normalized_source_eui_kbtu_ft2 >= 0 "+
            "AND weather_normalized_source_eui_kbtu_ft2 < 1000 " +
            "AND eui_flag_0 >= 1 AND bbl_m_flag_0 >= 1 AND eui_property_outlier_flag_2std <= 0 "+
            " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "+
            " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;
            if(propertyType != "Undefined Property Type") {
              eui_filter_query += " AND primary_property_type_self_selected ILIKE '"+propertyType+"'"
            }
            eui_filter_query +=")";

      overall_query = "SELECT * FROM "+
                      " ("+eui_filter_query+") AS eui "+
                      " FULL OUTER JOIN " +
                      " ("+wui_filter_query+") AS wui "+
                      " ON (eui.bbl = wui.bbl) " +
                      " FULL OUTER JOIN " +
                      " ("+ghg_filter_query+") AS ghg "+
                      " ON (wui.bbl = ghg.bbl) " +
                      " FULL OUTER JOIN " +
                      " ("+floorarea_filter_query+") AS floorarea " +
                      " ON (ghg.bbl = floorarea.bbl) ";

      if(topic == "floorarea") {
        displayStat = queryResult.rows[0].property_floor_area_buildngs_and_parking_ft2;
        label = labelFloorarea;
      } else if(topic == "GHG") {
        displayStat = queryResult.rows[0].total_ghg_intensity_kgco2e_ft2;
        label = labelGHG;
      } else if(topic == "WUI") {
        displayStat = queryResult.rows[0].indoor_water_intensity_all_water_sources_gal_ft2;
        label = labelWUI;
      } else {
        displayStat = queryResult.rows[0].weather_normalized_source_eui_kbtu_ft2;
        label = labelWeatherNormEUI;
      } 

      // console.log("CT queryresult: ",queryResult.rows[0]);
      // console.log("CT displayStat: ", displayStat);
      cartodb_id = queryResult.rows[0].cartodb_id;

      if(displayStat == null){
        displayStat = "Not Available";
      }
      yearbuilt = queryResult.rows[0].yearbuilt;
      if(yearbuilt < 1000){
        yearbuilt = "Not Available";
      }
      numbldgs = queryResult.rows[0].numbldgs;
      if(numbldgs < 1){
        numbldgs = "Not Available";
      }
      numfloors = queryResult.rows[0].numfloors;
      if(numfloors < 1){
        numfloors = "Not Available";
      }
      energyStar = queryResult.rows[0].energy_star_score;
      if(energyStar == "See Primary BBL"){
        energyStar = "Not Available";
      }
      gfa = queryResult.rows[0].property_floor_area_buildngs_and_parking_ft2;
      if(gfa < 1)
        gfa = "Not Available";
      else 
        gfa = gfa+" ft²";

      if(propertyType == "Undefined Property Type") {
        distributionText = "All Property Types";
      }
      else {
        distributionText = propertyType;
      }

      expandedInfoString = "<div><h3> "+ address + "</h3>" + 
          "<p class='mediumnumber expandedsubline'><br>" + propertyType + "</p>" + 
          "</div>" +
          "<div class='col-md-12'><ul>" +
            "<li class='smallnumber'>ENERGY STAR Score: <b>" + energyStar + "</b></li>" +
            "<li class='smallnumber'>Year built: <b>" + yearbuilt + "</b></li>" +
            "<li class='smallnumber'>Number of buildings on lot: <b>" + numbldgs + "</b></li>" +
            "<li class='smallnumber'>Number of floors in primary building: <b>" + numfloors + "</b></li>"+
          "</ul></div>";
          // "<br><div class='smallnumber'>Distribution for " + distributionText + ":</div>"
      //update the info text
      d3.select("#expandedinfo")
        .html(expandedInfoString);

      // remove default histogram nad replace with histogram filtered by building type
      // var svg = d3.select("#histogram").select("svg").remove();

      //replace apostrophes with escaped apostrophes
      // propertyType = propertyType.replace(/'/, "\\'");
      // console.log("HISTOGRAM query: ", overall_query);

      

      //get all EUIs in property type, then draw histogram and add line
      queryAndExecute(overall_query, function(OverallQueryResult) {
        // console.log("Big overall query: ", OverallQueryResult);

        var arrEUI = [];
        var arrWUI = [];
        var arrGHG = [];
        var arrFA = [];
        var numLessEUI = 0;
        var numLessWUI = 0;
        var numLessGHG = 0;
        var numLessFA = 0;
        var buildingEUI = queryResult.rows[0].weather_normalized_source_eui_kbtu_ft2;
        var buildingWUI = queryResult.rows[0].indoor_water_intensity_all_water_sources_gal_ft2;
        var buildingGHG = queryResult.rows[0].total_ghg_intensity_kgco2e_ft2;
        var buildingFA = queryResult.rows[0].property_floor_area_buildngs_and_parking_ft2;

        for (i = 0; i < OverallQueryResult.rows.length; i++) {

          tmpEUI = OverallQueryResult.rows[i].weather_normalized_source_eui_kbtu_ft2;
          tmpWUI = OverallQueryResult.rows[i].indoor_water_intensity_all_water_sources_gal_ft2;
          tmpGHG = OverallQueryResult.rows[i].total_ghg_intensity_kgco2e_ft2;
          tmpFA = OverallQueryResult.rows[i].property_floor_area_buildngs_and_parking_ft2;

          if(tmpEUI != undefined) {
            arrEUI.push(tmpEUI);
            //calculate where this buidling falls in the distribution
            if(tmpEUI < buildingEUI){
              numLessEUI++;
            }
          }
          if(tmpWUI != undefined) {
            arrWUI.push(tmpWUI);
            //calculate where this buidling falls in the distribution
            if(tmpWUI < buildingWUI){
              numLessWUI++;
            }
          }
          if(tmpGHG != undefined) {
            arrGHG.push(tmpGHG);
            //calculate where this buidling falls in the distribution
            if(tmpGHG < buildingGHG){
              numLessGHG++;
            }
          }
          if(tmpFA != undefined){
            arrFA.push(tmpFA);
            //calculate where this buidling falls in the distribution
            if(tmpFA < buildingFA){
              numLessFA++;
            }
          }
        }
        // console.log("CT QUERYRESULT: ", OverallQueryResult);
        // console.log("CT EUI ARRAY: ", arrEUI);
        // console.log("CT WUI ARRAY: ", arrWUI);
        // console.log("CT GHG ARRAY: ", arrGHG);
        // console.log("CT FA ARRAY: ", arrFA);

        buildingArr = [buildingEUI, buildingWUI, buildingGHG, buildingFA];
        percentLessArr = [numLessEUI/arrEUI.length, numLessWUI/arrWUI.length, numLessGHG/arrGHG.length, numLessFA/arrFA.length];
        displayExpandedStats(buildingArr, percentLessArr);

        displayArr = [];
        //take care of the current topic
        if(topic == "floorarea") {
          displayArr = arrFA;
        } else if(topic == "GHG") {
          displayArr = arrGHG;
        } else if(topic == "WUI") {
          displayArr = arrWUI;
        } else if(topic == "EUI"){
          displayArr = arrEUI;
        }

        makeHistogram(arrEUI, labelWeatherNormEUI, "#EUIhistogram");
        addHistogramLine([buildingEUI], "#EUIhistogram");

        makeHistogram(arrWUI, labelWUI, "#WUIhistogram");
        addHistogramLine([buildingWUI], "#WUIhistogram");

        makeHistogram(arrGHG, labelGHG, "#GHGhistogram");
        addHistogramLine([buildingGHG], "#GHGhistogram");

        makeHistogram(arrFA, labelFloorarea, "#floorareahistogram");
        addHistogramLine([buildingFA], "#floorareahistogram");
      });

    }
    else{
      expandedAlertString = 
          "<div class='bignumber'>Not Available</div>" +
          "Could not locate your building in our records.<br><br>" +
                  "Make sure that<br>"+
                  "a) You included the borough or zip-code in your search.<br>"+
                  "b) Your building is required to disclose under Local Law 84.<br>"+
                  "c) Your building reported its energy use for the years shown.<br>";
          // "<br><div class='smallnumber'>Distribution for " + distributionText + ":</div>"
      //update the info text
      d3.select("#expandedinfo")
        .html(expandedAlertString);

      d3.select("#EUIhistogram svg").remove();
      d3.select("#WUIhistogram svg").remove();
      d3.select("#GHGhistogram svg").remove();
      d3.select("#floorareahistogram svg").remove();

      d3.select("#EUItext").html("");
      d3.select("#WUItext").html("");
      d3.select("#GHGtext").html("");
      d3.select("#floorareatext").html("");
    }

  });
}


function mobileMain(){
  initAutocomplete();
}
