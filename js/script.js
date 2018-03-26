
function showAbout(){
  d3.select("#filtercontainer").classed("hidden", true);
  d3.select("#datasourcescontainer").classed("hidden", true);
  d3.select("#researchcontainer").classed("hidden", true);
  d3.select("#aboutcontainer").classed("hidden", false);
}

function showResearch(){
  d3.select("#filtercontainer").classed("hidden", true);
  d3.select("#datasourcescontainer").classed("hidden", true);
  d3.select("#aboutcontainer").classed("hidden", true);
  d3.select("#researchcontainer").classed("hidden", false);
}

function showData(){
  d3.select("#filtercontainer").classed("hidden", true);
  d3.select("#researchcontainer").classed("hidden", true);
  d3.select("#aboutcontainer").classed("hidden", true);
  d3.select("#datasourcescontainer").classed("hidden", false);
}
function showVis(){
  d3.select("#researchcontainer").classed("hidden", true);
  d3.select("#aboutcontainer").classed("hidden", true);
  d3.select("#datasourcescontainer").classed("hidden", true);
  d3.select("#filtercontainer").classed("hidden", false);
}

function expandBuildingView(){
  $("#mapcontainer").removeClass("col-xs-12 col-sm-5 col-md-6 col-lg-7");
  $("#mapcontainer").addClass("hidden");
  $("#perbuildinginfo").addClass("hidden");
  $("#expandedbuildinginfo").removeClass("hidden");
}

function reduceBuildingView(){
  $("#mapcontainer").addClass("col-xs-12 col-sm-5 col-md-6 col-lg-7");
  $("#mapcontainer").removeClass("hidden");
  $("#perbuildinginfo").removeClass("hidden");
  $("#expandedbuildinginfo").addClass("hidden");
}

function getBoroName(bbl){
  if(bbl > 5000000000)
    return "Staten Island";
  else if(bbl > 4000000000)
    return "Queens";
  else if(bbl > 3000000000)
    return "Brooklyn";
  else if(bbl > 2000000000)
    return "the Bronx";
  else if(bbl > 1000000000)
    return "Manhattan";
  else
    return null;
}

// Takes a SQL select query, and runs func with the SQL results
// as the parameter
function queryAndExecute(query, func) { 
  // TODO Query for "1440 MADISON AVENUE" creates error
  // bec property type has ' in it: Health Care: Inpatient (Specialty Hospitals, Excluding Children's)
  
  var queryUrl = cartodbUrl+'sql?q='+query;

  d3.json(queryUrl, function(error,data) {

  if (error) {
      d3.select('body').append('p').text('Error: '+error.statusText);
      console.log(error);
  } 
  else {
      // console.log("queryAndExecute - data: ", data);
      func(data);
      }
  })
}



function changeTopic(topic) {
  if(topic == null){
    topic = topicState;
  }

  prepareBuilingtypeList( topic);
  
  var currentButton = "#button" + topic;
  d3.select("#topic").selectAll("button").classed("active", false);
  d3.select(currentButton).classed("active", true);

  setTopicCaptions(topic);
  setLegendParams(topic);
  setFilterState(topic, propertyState);

  
  // if(cartodb_id === undefined) {
  //   // RP does not manage to get the update function to work, so we hide the per building
  //   // info when the topic changes
  //   //console.log("RP: cartodb_id: ", cartodb_id)
  //   //onBuildingClick(cartodb_id, topic);
  // } 
  
  // hide building info
  // if(!globalCartodb_id){
  //   d3.select(".perbuildinginfo").attr("style", "visibility: hidden");
  // }

  d3.select("#whiskers-legend").attr("style", "visibility: hidden");

  // hide scatterplot
  d3.select("#scatterplotcontainer").attr("style", "visibility: hidden");


}

function setFilterState(topic, propertyType){
  topicState = topic;
  propertyState = propertyType;
}


function setLegendParams(topic){

    if(topic == "EUI") {
    d3.select(".legend-title").text(labelWeatherNormEUI);
    d3.select(".min").text("< "+EUILowerLimitLegend);
    d3.select(".max").text(EUIUpperLimitLegend+"+");


  } else if(topic == "WUI") {
    d3.select(".legend-title").text(labelWUI);
    d3.select(".min").text("< "+WUILowerLimitLegend);
    d3.select(".max").text(WUIUpperLimitLegend+"+");

  } else if(topic == "GHG") {
    d3.select(".legend-title").text(labelGHG);
    d3.select(".min").text("< "+GHGLowerLimitLegend);
    d3.select(".max").text(GHGUpperLimitLegend+"+");

  } else if(topic == "floorarea") {
    d3.select(".legend-title").text(labelFloorarea);
    d3.select(".min").text("< "+floorareaLowerLimitLegend);
    d3.select(".max").text(floorareaUpperLimitLegend+"+");

  }

}

function setTopicCaptions(topic) {

  if(topic == "EUI") {
    d3.select("#filter").select("h4").text("Energy Use Intensity");
    d3.select("#filter").select("#whiskers").select("span").text(labelWeatherNormEUIShort);
    d3.select("#filter").select("#whiskers").select("span").attr("title", labelWeatherNormEUI);

  } else if(topic == "WUI") {
    d3.select("#filter").select("h4").text("Water Use Intensity");
    d3.select("#filter").select("#whiskers").select("span").text(labelWUIShort);
    d3.select("#filter").select("#whiskers").select("span").attr("title", labelWUI);

  } else if(topic == "GHG") {
    d3.select("#filter").select("h4").text("Greenhouse Gas Intensity");
    d3.select("#filter").select("#whiskers").select("span").text(labelGHGShort);
    d3.select("#filter").select("#whiskers").select("span").attr("title", labelGHG);

  } else if(topic == "floorarea") {
    d3.select("#filter").select("h4").text("Building Sizes");
    d3.select("#filter").select("#whiskers").select("span").text(labelFloorareaShort);
    d3.select("#filter").select("#whiskers").select("span").attr("title", labelFloorarea);

  }
}

function initAutocomplete(){
  var defaultBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(40.49, -74.266),
          new google.maps.LatLng(40.90, -73.688));

  var input = document.getElementById("addressText");
  var options = {
    bounds: defaultBounds,
    // types: ["address"]
  };

  // console.log(input)
  // console.log(options)
  autocomplete = new google.maps.places.Autocomplete(input, options);
  // autocomplete.addListener('place_changed', onAddressSearch);
}


/******************************************************
  MAP STUFF
******************************************************/
function initMap(){
  // initiate leaflet map
  map = new L.Map('map', { 
    shareable: false,
    infowindow: false,
    title: false,
    description: true,
    search: false,
    tiles_loader: true,
    center: [40.72,-73.95],
    zoom: 11,
    minZoom: 10,
    maxZoom: 18
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
      attribution: '&copy; C.E. Kontokosta & C. Tull 2015, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo(map);

  var layerUrl = map_url;

  var sublayers = [];

  // var  query = "SELECT DISTINCT shapes.cartodb_id, data.weather_normalized_source_eui_kbtu_ft2, shapes.the_geom, shapes.the_geom_webmercator "
  //           + "FROM nyc_energy_by_bbl AS shapes "
  //           + "INNER JOIN clean_energy_and_water_data_disclosure_" + yearState + " AS data "
  //           + "ON shapes.bbl=data.bbl ";
            // + "WHERE (data.weather_normalized_source_eui_kbtu_ft2 >= " + EUILowerLimit
            // + " AND data.weather_normalized_source_eui_kbtu_ft2 < " + EUIUpperLimit + ")";

  var  query = "SELECT DISTINCT cartodb_id, weather_normalized_source_eui_kbtu_ft2, the_geom, the_geom_webmercator "
            + "FROM pluto_disclosure_merge_" + yearState;


  cartodb.createLayer(map, layerUrl, { legends: false })
  // testing for new way of accessing the layer without viz.json
  // cartodb.createLayer(map,
  //       {
  //         user_name: 'uil', // Required
  //         type: 'cartodb', // Required
  //         sublayers: [
  //         { // first sublayer is the one that is painted at the bottom
  //             sql: "SELECT * FROM pluto_disclosure_merge_" + yearState, // Required
  //             interactivity: 'cartodb_id, weather_normalized_source_eui_kbtu_ft2, the_geom, the_geom_webmercator' // BB: added interactivity
  //             // cartocss: countriesStyle // specified inside the code
  //         }        
  //         ]
  //       },
  //       { 
  //         legends: false,
  //         https: true 
  //       })
  .addTo(map)
  .done( function(layer) {
    
    layer.setInteraction(true);
    addCursorInteraction(layer); 
    
    // change the query for the first layer
    var subLayerOptions = {
      sql: query,
      cartocss: EUIcss
    };

    var sublayer = layer.getSubLayer(0);
    sublayer.set(subLayerOptions);

    layer.on('featureClick', function(e, pos, latlng, data) {
      // console.log(data);
      onBuildingClick(data.cartodb_id, topicState);
    });

    sublayers.push(sublayer);
    mapSublayer = sublayer;
  }).on('error', function() {
    //log the error
  });

}

function changeLayer(topic, propertyType, zipCode) {
  // console.log("In changeLayer");
  // console.log("changing with params: ", topic, propertyType, zipCode);
  if (topic == null)
    topic = topicState;
  else
    topicState = topic;

  if (propertyType == "No Type" || propertyType == null)
    propertyType = propertyState;
  // else
  //   propertyState = propertyType;


  if(topic == "EUI") {
    
    query = "SELECT DISTINCT ON (bbl) cartodb_id, weather_normalized_source_eui_kbtu_ft2, the_geom, the_geom_webmercator "
            + " FROM pluto_disclosure_merge_" + yearState
            + " WHERE ( bbl_m_flag_0 >= 0.5 "
            + " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "
            + " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;

    if (propertyType != "All Property Types") {
      query = query + " AND primary_property_type_self_selected = " + "'" + propertyType + "'";
    }
    if (zipCode != null) {
      query = query + " AND zip = " + "'" + zipCode + "'";
    }
    query = query + ") ORDER BY bbl, weather_normalized_source_eui_kbtu_ft2 DESC NULLS LAST";

    css = EUIcss;
    // console.log("logging query: ", query);
    // console.log("logging css: ", css);

  } else if(topic == "WUI") {

    query = "SELECT DISTINCT ON (bbl) cartodb_id, indoor_water_intensity_all_water_sources_gal_ft2, the_geom, the_geom_webmercator "
            + " FROM pluto_disclosure_merge_" + yearState
            + " WHERE ( bbl_m_flag_0 >= 0.5 "
            + " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "
            + " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;

    if (propertyType != "All Property Types") {
      query = query + " AND primary_property_type_self_selected = " + "'" + propertyType + "'";
    }
    if (zipCode != null) {
      query = query + " AND zip = " + "'" + zipCode + "'";
    }
    query = query + ") ORDER BY bbl, indoor_water_intensity_all_water_sources_gal_ft2 DESC NULLS LAST";

    css = WUIcss
    // console.log("logging query: ", query);
    // console.log("logging css: ", css);

  } else if(topic == "GHG") {

    query = "SELECT DISTINCT ON (bbl) cartodb_id, total_ghg_intensity_kgco2e_ft2, the_geom, the_geom_webmercator "
            + "FROM pluto_disclosure_merge_" + yearState
            + " WHERE ( bbl_m_flag_0 >= 0.5 "
            + " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "
            + " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;

    if (propertyType != "All Property Types") {
      query = query + " AND primary_property_type_self_selected = " + "'" + propertyType + "'";
    }
    if (zipCode != null) {
      query = query + " AND zip = " + "'" + zipCode + "'";
    }
    query = query + ") ORDER BY bbl, total_ghg_intensity_kgco2e_ft2 DESC NULLS LAST";

    css = GHGcss
    // console.log("logging query: ", query);
    // console.log("logging css: ", css);

  } else if(topic == "floorarea") {

    query = "SELECT DISTINCT ON (bbl) cartodb_id, property_floor_area_buildngs_and_parking_ft2, the_geom, the_geom_webmercator "
            + "FROM pluto_disclosure_merge_" + yearState 
            + " WHERE ( bbl_m_flag_0 >= 0.5 "
            + " AND yearbuilt BETWEEN "+yearLowState+" AND "+yearHighState+" AND "
            + " property_floor_area_buildngs_and_parking_ft2 BETWEEN "+sizeLowState+" AND "+sizeHighState;

    if (propertyType != "All Property Types") {
      query = query + " AND primary_property_type_self_selected = " + "'" + propertyType + "'";
    }
    if (zipCode != null) {
      query = query + " AND zip = " + "'" + zipCode + "'";
    }
    query = query + ") ORDER BY bbl, property_floor_area_buildngs_and_parking_ft2 DESC NULLS LAST";

    css = FLOORAREAcss
    // console.log("logging query: ", query);
    // console.log("logging css: ", css);
  };

  //clear any highlighted building


  //set the layer attributes
  if(mapSublayer != null){
    // console.log("In changeLayer, setting the query.");
    mapSublayer.set({
    sql: query,
    cartocss: css
  });
    // console.log("In changeLayer, query was set.");
  }

}

 function highlightBuilding(cartodb_id, bbl) {
  var sql = new cartodb.SQL({ user: 'nyucusp', format: 'geojson' });
  // console.log("in highlightBuilding ",globalCartodb_id, globalBBL);
  if(cartodb_id != null){
    geomQuery = "SELECT the_geom FROM pluto_disclosure_merge_"+yearState+" WHERE cartodb_id = " + cartodb_id; 
  }
  else if(bbl != null){
    geomQuery = "SELECT the_geom FROM pluto_disclosure_merge_"+yearState+" WHERE bbl = " + bbl;
  }
  
  sql.execute(geomQuery).done(function(geojson) {
    // console.log("Click returns geom: ",geojson);
    if (selectedBuildingPolygon) {
      map.removeLayer(selectedBuildingPolygon);
    }
    selectedBuildingPolygon = L.geoJson(geojson, { 
      style: {
        color: "#feb24c",
        //fillColor: "#fff",
        weight: 5,
        opacity: 1
      }
    }).addTo(map);
  });
}

// dev by dave (end)
function onBuildingClick(cartodb_id, topic, panTo) {

  globalCartodb_id = cartodb_id;
  
  highlightBuilding(cartodb_id, null);

  //craft a query to match on cartodb_id
  selectedBuildingQuery = "SELECT *, ST_Y(ST_Centroid(the_geom)) as lat, ST_X(ST_Centroid(the_geom)) as lon "
                          + "FROM pluto_disclosure_merge_" + yearState 
                          + " WHERE cartodb_id="+cartodb_id;
  // console.log("in onbuildingclick ",globalCartodb_id, globalBBL);                   
  //get the information of clicked building
  updateDisplayFocus(selectedBuildingQuery, topic, panTo);
}



function onAddressSearch(){
  // place = autocomplete.getPlace()

  var address = $("#addressText")[0].value;
  globalSearchedAddress = address;
  // console.log("CT address:", address);

  // componentList = place.address_components;
  // console.log("Component list: ", componentList);

  // if(componentList){
  //   for (var i = 0; i < place.address_components.length; i++) {
  //     var addressType = place.address_components[i].types[0];
  //     console.log(addressType);
  //     if (true) {
  //       // var val = place.address_components[i][componentForm[addressType]];
  //       // document.getElementById(addressType).value = val;
  //     }
  //   }
  // }
  
  var regex = /^ *\d{5} *$/;
  match = address.match(regex);

  //if the search is something other than just a plain zipcode
  if(match == null){
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

                        highlightBuilding(null, bbl);

                        selectedBuildingQuery = "SELECT * "
                                                + "FROM pluto_disclosure_merge_" + yearState
                                                + " WHERE bbl ="+bbl;

                      //get the information of clicked building
                      updateDisplayFocus(selectedBuildingQuery, topicState, false);}
                      //craft a query to match on bbl
                      
                      map.panTo(latlng);  
                      map.setZoom(17);
                      map.panTo(latlng);  
                      map.setZoom(17);
                  }
    });
  }
  //if the search is just a 5-digit zipzode
  else{
    zipCode = match[0];
    changeLayer(topicState, propertyState, zipCode);
  }

}

Number.prototype.round = function(places) {
  return +(Math.round(this + "e+" + places)  + "e-" + places);
}

function numberWithCommas(x) {
  if(x == null)
    return x;
  else{
    if(x.round)
      return x.round(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    else
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

function onYearChange() {
  // var year = $('input[name="year"]:checked').val();
  var year = document.querySelector('#years').value
  console.log(year)
  yearState = year;
  
  if(globalBBL){
    getCartodbIDQuery = "SELECT cartodb_id FROM pluto_disclosure_merge_"+yearState+" WHERE bbl = " + globalBBL;
    queryAndExecute(getCartodbIDQuery, function(cartodbIDResult){
      // console.log("in onyearchange",cartodbIDResult, globalBBL);

      if(cartodbIDResult.rows.length > 0){
        globalCartodb_id = cartodbIDResult.rows[0].cartodb_id;
      
        if(globalCartodb_id){
          onBuildingClick(globalCartodb_id,topicState,false);
        }
      }
      else{
        globalCartodb_id = null;
        d3.select("#perbuildinginfo").attr("style", "visibility: hidden");
        if (selectedBuildingPolygon) {
          map.removeLayer(selectedBuildingPolygon);
        }
        addWhiskerLine(null,null);
        d3.select("#whiskers-legend").attr("style", "visibility: hidden");
      }
      changeTopic(null);
    }); 
  }
  else
    changeTopic(null);
}

function updateDisplayFocus(selectedBuildingQuery, topic, panTo) {

  queryAndExecute(selectedBuildingQuery, function(queryResult) {
    
    if(queryResult.rows.length > 0) {
      //select info vraiables from the object
      // console.log("CT returned from click: ",queryResult);

      globalBBL = queryResult.rows[0].bbl;

      // console.log("in updateDisplayFocus ",globalCartodb_id, globalBBL);
      // console.log(queryResult)

      if((panTo==true)&&($("#mapcontainer").hasClass("hidden")==false)){
        lat = queryResult.rows[0].lat;
        lon = queryResult.rows[0].lon;
        if(lat != null && lon != null){
          map.panTo([lat,lon]);
          map.setZoom(17);
          map.panTo([lat,lon]);
          map.setZoom(17);
        }
      }

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
            "AND ghg_flag_0 >= 1 AND ghg_property_outlier_flag_2std <=0 "+
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
            "AND ghg_flag_0 >= 1 AND ghg_property_outlier_flag_2std <=0 "+
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
            "AND ghg_flag_0 >= 1 AND ghg_property_outlier_flag_2std <=0 "+
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
            "AND ghg_flag_0 >= 1 AND ghg_property_outlier_flag_2std <=0 "+
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

      console.log("CT queryresult: ",queryResult.rows[0]);
      console.log("CT displayStat: ", displayStat);
      cartodb_id = queryResult.rows[0].cartodb_id;

      if(displayStat == null){
        displayStat = "Not Available*";
        d3.select("#naDisclaimer").attr("style", "visibility: visible");
      }
      else{
        d3.select("#naDisclaimer").attr("style", "visibility: hidden");
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

      infoString = "<div><h3> "+ address + "</h3>" + 
          "<p class='mediumnumber subline grey'>" + propertyType + "</p>" + 
          "</div>" +
          "<div class='bignumber'>" + numberWithCommas(displayStat) + "</div>" +
          "<div class='mediumnumber subline'><small>" + label + "</small></div>" +
          "<div class='smallnumber'><br>ENERGY STAR Score: <b>" + energyStar + "</b></div>" +
          "<div class='smallnumber'>Year built: <b>" + yearbuilt + "</b></div>" +
          "<div class='smallnumber'>Gross Floor Area: <b>" + numberWithCommas(gfa) + "</b></div>" +
          "<div class='smallnumber'>Number of buildings on lot: <b>" + numbldgs + "</b></div>" +
          "<div class='smallnumber'>Number of floors in primary building: <b>" + numfloors + "</b></div>" +
          "<br><div class='smallnumber'>Distribution for " + distributionText + ":</div>"
      //update the info text
      d3.select(".perbuildinginfo").attr("style", "visibility: visible");
      d3.select(".info")
        .html(infoString);
        

      d3.select(".perbuildinginfo .close")
        .on("click", function(){
          d3.select("#perbuildinginfo").attr("style", "visibility: hidden");
          d3.select("#naDisclaimer").attr("style", "visibility: hidden");
          if (selectedBuildingPolygon) {
            map.removeLayer(selectedBuildingPolygon);
          }
          if (selectedDot){
            selectedDot.attr("fill", hexColorHighEUI);
          }
          globalCartodb_id = null;
          globalBBL = null;
          addWhiskerLine(null,null);
          d3.select("#whiskers-legend").attr("style", "visibility: hidden");
      });

      expandedInfoString = "<div class='bignumber'>"+ address+ 
          "<p class='mediumnumber expandedsubline'><br>" + propertyType + "</p>" + 
          "</div>" +
          "<div class='col-md-6'><ul>" +
            "<li class='smallnumber'>ENERGY STAR Score: <b>" + energyStar + "</b></li>" +
            "<li class='smallnumber'>Year built: <b>" + yearbuilt + "</b></li>" +
          "</ul></div>" +
          "<div class='col-md-6'><ul>" +
            "<li class='smallnumber'>Number of buildings on lot: <b>" + numbldgs + "</b></li>" +
            "<li class='smallnumber'>Number of floors in primary building: <b>" + numfloors + "</b></li>"+
          "</ul></div>";
          // "<br><div class='smallnumber'>Distribution for " + distributionText + ":</div>"
      //update the info text
      d3.select("#expandedinfo")
        .html(expandedInfoString);

      d3.select(".expandedbuildinginfo .close")
      .on("click", function(){
        reduceBuildingView();
      });
    
      // update scatterplo
      updateScatterplot(cartodb_id);

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
        makeHistogram(displayArr, label, "#histogram");
        addWhiskerLine([displayStat], topic);    
        addHistogramLine([displayStat], "#histogram");

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
      alertText = "";
      if(globalSearchedAddress){
        alertText += "<div><h3> "+ globalSearchedAddress + "</h3></div>";
      }
      alertText +=  "<div class='bignumber'>Not Available</div>" +
                    "Could not locate your building in our records.<br><br>" +
                            "Make sure that<br>"+
                            "a) You included the borough or zip-code in your search.<br>"+
                            "b) Your building is required to disclose under Local Law 84.<br>"+
                            "c) Your building reported its energy use for the years shown.<br>";

      d3.select(".perbuildinginfo").attr("style", "visibility: visible");
      d3.select(".info")
        .html(alertText);

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

      d3.select("#histogram svg").remove();
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

function displayExpandedStats(buildingArr, percentLessArr){
  
  eui = buildingArr[0];
  euiPercent = Math.floor(100*percentLessArr[0]);
  if(euiPercent == 100) 
    euiPercent = 99;

  euiString = "<div class='mediumnumber'>Weather-Normalized Energy Use Intensity (EUI)</div>";
  if(eui == null){
    euiString += "<div class='smallnumber'>The EUI for this property is <b>Not Available.</b></div>";
  }
  else{
    if(euiPercent >= 50){
      lessMore = "more";}
    else {
      lessMore = "less";
      euiPercent = 100 - euiPercent;
    }
    euiString += "<div class='smallnumber'>The EUI for this property is <b>" + numberWithCommas(eui) + "</b>.</div>" +
              "<div class='smallnumber'>This is " + lessMore + " than <b>" + euiPercent + "</b>% of properties of this type.</div>";
  }      
  //update the info text
  d3.select("#EUItext").html(euiString);
  //----------------------------------------------------------------------
  wui = buildingArr[1];
  wuiPercent = Math.floor(100*percentLessArr[1]);
  if(wuiPercent == 100) 
    wuiPercent = 99;

  wuiString = "<div class='mediumnumber'>Indoor Water Use Intensity (WUI)</div>";
  if(wui == null){
    wuiString += "<div class='smallnumber'>The WUI for this property is <b>Not Available.</b></div>";  
  }
  else{
    if(wuiPercent >= 50){
      lessMore = "more";}
    else {
      lessMore = "less";
      wuiPercent = 100 - wuiPercent;
    }
    wuiString += "<div class='smallnumber'>The WUI for this property is <b>" + numberWithCommas(wui) + "</b>.</div>" +
              "<div class='smallnumber'>This is " + lessMore + " than <b>" + wuiPercent + "</b>% of properties of this type.</div>";
  }      
  //update the info text
  d3.select("#WUItext").html(wuiString);
  //----------------------------------------------------------------------
  ghg = buildingArr[2];
  ghgPercent = Math.floor(100*percentLessArr[2]);
  if(ghgPercent == 100) 
    ghgPercent = 99;

  ghgString = "<div class='mediumnumber'>Greenhouse Gas Intensity </div>";
  if(ghg == null){
    ghgString += "<div class='smallnumber'>The GHG intensity for this property is <b>Not Available.<br></b></div>";
  }
  else{
    if(ghgPercent >= 50){
      lessMore = "more";}
    else {
      lessMore = "less";
      ghgPercent = 100 - ghgPercent;
    }
    ghgString += "<div class='smallnumber'>The GHG intensity for this property is <b>" + numberWithCommas(ghg) + "</b>.</div>" +
              "<div class='smallnumber'>This is " + lessMore + " than <b>" + ghgPercent + "</b>% of properties of this type.</div>";
  }      
  //update the info text
  d3.select("#GHGtext").html(ghgString);
  //----------------------------------------------------------------------
  fa = buildingArr[3];
  faPercent = Math.floor(100*percentLessArr[3]);
  if(faPercent == 100) 
    faPercent = 99;

  faString = "<div class='mediumnumber'>Gross Floor Area</div>";
  if(fa == null){
    faString += "<div class='smallnumber'>The gross floor area for this property is <b>Not Available.<br></b></div>";
  }
  else{
    if(faPercent >= 50){
      lessMore = "larger";
    }
    else {
      lessMore = "smaller";
      faPercent = 100 - faPercent;
    }
    faString += "<div class='smallnumber '>The gross floor area for this property is <b>" + numberWithCommas(fa) + "</b>.</div>" +
              "<div class='smallnumber'>This is " + lessMore + " than <b>" + faPercent + "</b>% of properties of this type.</div>";
  }      
  //update the info text
  d3.select("#floorareatext").html(faString);
  //----------------------------------------------------------------------
}

function addCursorInteraction(layer) {
  var hovers = [];
  layer.bind('featureOver', function(e, latlon, pxPos, data, layer) {
    hovers[layer] = 1;
    if(_.any(hovers)) {
      $('#map').css('cursor', 'pointer');
    }
  });
  layer.bind('featureOut', function(m, layer) {
    hovers[layer] = 0;
    if(!_.any(hovers)) {
      $('#map').css('cursor', 'move');
    }
  });
}

//TESTING*********************************************************************
var map;

//TESTING*********************************************************************


$(document).ready(function(){
    $("#hideTreemapDiv").click(function(){
        $(treemapcontainer).hide();
    });
    $("#showTreemapDiv").click(function(){
        $(treemapcontainer).show();
    });
    $("#hideScatterplotDiv").click(function(){
        $(scatterplotcontainer).hide();
    });
    $("#showScatterplotDiv").click(function(){
        $(scatterplotcontainer).show();
    });

    $("#searchBar").submit(function(e){
      e.preventDefault();
      onAddressSearch();
      return false;
    });

    $("#mobileSearchBar").submit(function(e){
      e.preventDefault();
      mobileAddressSearch();
      return false;
    });

    $("#yearSelector").change(function(){
     $("#yearSelector").submit();
    });

    $("#yearSelector").submit(function(e){
      e.preventDefault();
      onYearChange()
      return false;
    });

    $("#yearSizeFilterBar").submit(function(e){
      e.preventDefault();
      onAgeSizeFilter()
      return false;
    });
});


/******************************************************
  MAIN
******************************************************/

function main(){

  initAutocomplete();
  initMap();
  prepareBuilingtypeList("EUI");
  // prepareScatterData("All");  // RP: seems to be too many items, no useful visual

}