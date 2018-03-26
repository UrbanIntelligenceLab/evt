
// Takes a SQL select query, and runs func with the SQL results
// as the parameter
function queryAndExecute(query, func) { 
  // TODO Query for "1440 MADISON AVENUE" creates error
  // bec property type has ' in it: Health Care: Inpatient (Specialty Hospitals, Excluding Children's)
  
  var queryUrl = cartodbUrl+'sql?q='+query;
  // console.log("queryAndExecute - queryUrl: ", queryUrl);

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


function onAddressSearch(){
  var address = $("#addressText")[0].value;
  console.log("CT address: ",address);
}


function changeTopic(topic) {
  prepareBuilingtypeList("All", topic);
  
  var currentButton = "#button" + topic;
  d3.select("#topic").selectAll("button").attr("class", "btn btn-primary");
  d3.select(currentButton).attr("class", "btn btn-primary active");

  setTopicCaptions(topic);

  // hide scatterplot
  d3.select("#scatterplotcontainer").attr("style", "visibility: hidden");
}

function setTopicCaptions(topic) {

  if(topic == "EUI") {
    d3.select("#filter").select("h4").text("Variation in Energy Use Intensity");
    d3.select("#filter").select("#whiskers").select("span").text(labelWeatherNormEUIShort);
    d3.select("#filter").select("#whiskers").select("span").attr("title", labelWeatherNormEUI);

  } else if(topic == "WUI") {
    d3.select("#filter").select("h4").text("Variation in Water Use Intensity");
    d3.select("#filter").select("#whiskers").select("span").text(labelWUIShort);
    d3.select("#filter").select("#whiskers").select("span").attr("title", labelWUI);

  } else if(topic == "GHG") {
    d3.select("#filter").select("h4").text("Variation in Greenhouse Gas Emissions");
    d3.select("#filter").select("#whiskers").select("span").text(labelGHGShort);
    d3.select("#filter").select("#whiskers").select("span").attr("title", labelGHG);

  } else if(topic == "floorarea") {
    d3.select("#filter").select("h4").text("Variation in Building Size");
    d3.select("#filter").select("#whiskers").select("span").text(labelFloorareaShort);
    d3.select("#filter").select("#whiskers").select("span").attr("title", labelFloorarea);

  }
}


/******************************************************
  MAP STUFF
******************************************************/

function loadDefaultMap() {

  cartodb.createVis('map', map_url, {
      shareable: false,
      infowindow: false,
      title: false,
      description: false,
      search: false,
      tiles_loader: true,
      center_lat: 40.72,
      center_lon: -73.9,
      zoom: 11
  })
  .done(function(vis, layers) {
    // layer 0 is the base layer, layer 1 is cartodb layer
    // setInteraction is disabled by default
    layers[1].setInteraction(true);
    layers[1].on('featureClick', function(e, pos, latlng, data) {
      onBuildingClick(data.cartodb_id);
    });
    // you can get the native map to work with it
    var map = vis.getNativeMap();
    // now, perform any operations you need
    // map.setZoom(3);
    // map.panTo([50.5, 30.5]);
  })
  .error(function(err) {
    console.log(err);
  });
}

function visFilter(identifier){
  //this is almost identical to the loadDefaultMap() above, except that 
  //(1) it first removes the current map and 
  //(2) it builds a map with a filter applied. 
  d3.select("#map").select("div").remove();

  //var propType = $(identifier).text()     //RP: not needed since I changed the type of the call
  var propType = identifier;

  if (propType == "No Type"){
    propType = ""
  }

  cartodb.createVis('map', map_url, {
      shareable: false,
      infowindow: false,
      title: false,
      description: true,
      search: false,
      tiles_loader: true,
      // center_lat: 0,
      // center_lon: 0,
      // zoom: 2
  })
  .done(function(vis, layers) {
    // layer 0 is the base layer, layer 1 is cartodb layer
    // setInteraction is disabled by default
    layers[1].setInteraction(true);
    
    if (propType != "All"){
        query = "SELECT * " +
            "FROM nyc_energy_by_bbl " +
            "WHERE nyc_energy_by_bbl.primary_property_type___self_selected = " + "'" + propType + "'";
        layers[1].getSubLayer(0).setSQL(query);
    }

    layers[1].on('featureClick', function(e, pos, latlng, data) {
      onBuildingClick(data.cartodb_id);
    });
    // you can get the native map to work with it
    var map = vis.getNativeMap();
    // now, perform any operations you need
    // map.setZoom(3);
    // map.panTo([50.5, 30.5]);
  })
  .error(function(err) {
    console.log(err);
  });
}


function onBuildingClick(cartodb_id) {

  globalCartodb_id = cartodb_id;
  
  selectedBuildingQuery = "SELECT * "+
    "FROM nyc_energy_by_bbl "+
    "WHERE cartodb_id="+cartodb_id;

  //get the information of clicked building
  queryAndExecute(selectedBuildingQuery, function(queryResult) {
    
    //select info vraiables from the object
    // console.log("this is building query: ",queryResult);
    var buildingEUI = queryResult.rows[0].weather_normalized_source_eui_kbtu_ft2;
    var propertyType = queryResult.rows[0].primary_property_type___self_selected;
    var address = queryResult.rows[0].street_number.concat(" ".concat(queryResult.rows[0].street_name));
    // console.log("EUI:",buildingEUI," propertyType:",propertyType," address:",address);
  
    //update the info text
    d3.select(".perbuildinginfo").attr("style", "visibility: visible");
    d3.select(".info")
      .html(
        "<div><h3> "+ address + "</h3>" + 
        "<p class='subline'>" + propertyType + "</p>" + 
        "</div>" +
        "<div class='bignumber'>" + buildingEUI + "</div>" +
        "<div class='smallnumber subline'><small>Yearly energy consumption, " + labelWeatherNormEUIShort + "</small></div>" +
        "<div class='smallnumber'>Distribution for " + propertyType + ":</div>");
  
    // update scatterplo
    updateScatterplot(cartodb_id);

    // remove default histogram nad replace with histogram filtered by building type
    var svg = d3.select("#histogram").select("svg").remove();

    //replace apostrophes with escaped apostrophes
    // propertyType = propertyType.replace(/'/, "\\'");
    // console.log("property type:", property_type);

    //query to get desired EUIs
    property_type_filter_query = "SELECT weather_normalized_source_eui_kbtu_ft2 "+
      "FROM nyc_energy_by_bbl "+
      "WHERE ("+
        "weather_normalized_source_eui_kbtu_ft2 >= 0 "+
        "AND weather_normalized_source_eui_kbtu_ft2 < 1000 "+
        "AND primary_property_type___self_selected ILIKE '"+propertyType+"'"+
        ")";

    //get all EUIs in property type, then draw histogram and add line
    queryAndExecute(property_type_filter_query, function(queryResult) {
      arr = [];
      for (i = 0; i < queryResult.rows.length; i++) {
        arr.push(queryResult.rows[i].weather_normalized_source_eui_kbtu_ft2);
      }
      makeHistogram(arr);
      drawLine([buildingEUI]);    
    });

  });
}



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

    $("#searchBar").submit(function(){
      onAddressSearch();
      return false;
    });
});


/******************************************************
  MAIN
******************************************************/

function main(){
  loadDefaultMap();
  prepareBuilingtypeList("All", "EUI");
  // prepareScatterData("All");  // RP: seems to be too many items, no useful visual

  var defaultEuiQuery = "SELECT weather_normalized_source_eui_kbtu_ft2 "+
    "FROM nyc_energy_by_bbl "+
    "WHERE ("+
      "weather_normalized_source_eui_kbtu_ft2 >= 0 "+
      "AND weather_normalized_source_eui_kbtu_ft2 < 1000"+
      ")";
  queryAndExecute(defaultEuiQuery, function(queryResult) {
    arr = [];
    for (i = 0; i < queryResult.rows.length; i++) {
      arr.push(queryResult.rows[i].weather_normalized_source_eui_kbtu_ft2)
    }
    makeHistogram(arr);
    
  });

  var treemapQuery = "SELECT primary_property_type___self_selected AS propertyType, "+
                      "count(primary_property_type___self_selected), "+
                      "avg(weather_normalized_source_eui_kbtu_ft2) "+
              "FROM nyc_energy_by_bbl "+
              "WHERE ("+
                "weather_normalized_source_eui_kbtu_ft2 >= 0 "+
                "AND weather_normalized_source_eui_kbtu_ft2 < 1000"+
                ") " +
              "GROUP BY primary_property_type___self_selected";

  queryAndExecute(treemapQuery, function(queryResult){
    // console.log("TREEMAP INPUT: ",queryResult);
    makeTreemap({
      "propertyType":"All",
      "children":queryResult.rows
    });
  });

}
