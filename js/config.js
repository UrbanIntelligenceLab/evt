
var map;
var mapSublayer;

var selectedBuildingPolygon;
var globalCartodb_id;
var globalBBL;

//save globally the address that got searched
var globalSearchedAddress = null;

//the globally selected scatter dot
var selectedDot = null;


var topicState = "EUI";
var propertyState = "All Property Types";
var yearState = "2015";
/* ColorBrewer2 colors */

//treemap
var hexColorLowEUI = "#ece7f2";//"#006837";
// var avgEUI = "#ffffbf";
var hexColorHighEUI = "#0A5A9C";//"#023858";//"#a50026";

var highlightColor = "#feb24c"; // soft orange
var hoverColor = '#FFEDD6';


//define some really big and small constants
LOWESTNUM = -99999999999;
HIGHESTNUM = 99999999999;


//initial states for filtering by age and size
yearLowState = LOWESTNUM;
yearHighState = HIGHESTNUM;
sizeLowState = LOWESTNUM;
sizeHighState = HIGHESTNUM;

//autocomplete object
var autocomplete = null;

var cartodbUrl = 'https://uil.carto.com/api/v2/';
var map_url = cartodbUrl+'viz/68d963a9-1715-4d2b-9d5b-a63cb1c2db42/viz.json';

/******************************************************
  QUERY stuff
******************************************************/

// limits for outliers

//Removing Outlier Notes
//
//
//
//We read data into R:
//
//data <- read.csv("/Users/davidmarulli/Downloads/full_energy_and_water_data_disclosure_2012.csv"0
//
//
//We chop off top and bottom percent:
//
//newData <- subset(data, COLUMN <= quantile(COLUMN, 0.99, na.rm = TRUE) & COLUMN >= quantile(COLUMN, 0.01, na.rm = TRUE))
//
//
//We grab bounding values:
//
//lowLimit = min(newData$COLUMN)
//upperLimit = max(newData$COLUMN)

var EUIUpperLimit = 700;
var EUILowerLimit = 4.6;

var WUIUpperLimit = 160;
var WUILowerLimit = 0;

var GHGUpperLimit = 30;
var GHGLowerLimit = 0;

var floorareaUpperLimit = 700000;
var floorareaLowerLimit = 6106;

//Limits for the legend text
var EUIUpperLimitLegend = 595;
var EUILowerLimitLegend = 110;
var WUIUpperLimitLegend = 158;
var WUILowerLimitLegend = 32;
var GHGUpperLimitLegend = 8.9;
var GHGLowerLimitLegend = 3.4;
var floorareaUpperLimitLegend = 826289;
var floorareaLowerLimitLegend = 81500;

// //limits for GHG in the scatterplot
// var upperLimitGHGScatter = 100;
// var lowerLimitGHGScatter = 0;


/******************************************************
  FRONTEND stuff 
******************************************************/
var minScreenWidth = 970;

var whiskerWidth = 190;
var whiskerHeight = 360;

// define histogram
var histoWidth = 260;
var histoHeight = 170;
var histoAreaPadding = 20;

var histoMaxFA = 1500000; 


//	define scatterplot
var scatterWidth = 500;
var scatterHeight = 250;
var minRadius = 2;
var maxRadius = 80;
var scatterAreaPadding = 40;

// consistent text for all our labels for frontend
var labelWeatherNormEUIShort = "Energy Use Intensity (kBTU/ft²)"// (kBTU/ft²)";
var labelWeatherNormEUI = "Weather Normalized Source EUI (kBTU/ft²)";
var labelWUIShort = "Water Use Intensity (gal/ft²)";
var labelWUI = "Indoor Water Use Intensity (gal/ft²)";
var labelGHGShort = "Greenhouse Gas Intensity (kgCO2/ft²)";
var labelGHG = "Greenhouse Gas Intensity (kgCO2/ft²)";
var labelFloorareaShort = "Gross Floor Area (ft²)";
var labelFloorarea = "Gross Floor Area (ft²)";



var buildingTypeConfigArray = [
	"All Property Types",
	"Multifamily Housing",
	"Office",
	// "Other",
	"Non-Refrigerated Warehouse", //"Warehouse (Unrefrigerated)",
	"Hotel",
	"Retail Store", //"Retail",
	"Senior Care Community", //"Senior Care Facility",
	"Residence Hall/Dormitory",
	"K-12 School",
	"College/University", //"College/University (Campus-Level)",
	"Hospital (General Medical and Surgical)", //"Hospital (General Medical and Surgical)",
];

// vis_by_topic symbology

// yellow2green = ['rgb(255,255,204)','rgb(217,240,163)','rgb(173,221,142)','rgb(120,198,121)','rgb(65,171,93)','rgb(35,132,67)','rgb(0,90,50)']
// yellow2blue = ['rgb(255,255,204)','rgb(199,233,180)','rgb(127,205,187)','rgb(65,182,196)','rgb(29,145,192)','rgb(34,94,168)','rgb(12,44,132)']
// yellow2brown = ['rgb(255,255,212)','rgb(254,227,145)','rgb(254,196,79)','rgb(254,153,41)','rgb(236,112,20)','rgb(204,76,2)','rgb(140,45,4)']
// yellow2red = ['rgb(255,255,178)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(252,78,42)','rgb(227,26,28)','rgb(177,0,38)']

var EUIcss = "/** choropleth visualization */"
			+ "\n#shapes{ polygon-fill: #FFFFFF; polygon-opacity: .2; line-color: #FFF; line-width: 0; line-opacity: 0;}"
			+ "\n#shapes [ weather_normalized_source_eui_kbtu_ft2 <= 9880.7]{polygon-fill: #0c2c84; polygon-opacity: 1;}"
			+ "\n#shapes [ weather_normalized_source_eui_kbtu_ft2 <= 595] {polygon-fill: #225ea8; polygon-opacity: 1;}"
			+ "\n#shapes [ weather_normalized_source_eui_kbtu_ft2 <= 348.9] {polygon-fill: #1d91c0; polygon-opacity: 1;}"
			+ "\n#shapes [ weather_normalized_source_eui_kbtu_ft2 <= 289.6] {polygon-fill: #41b6c4; polygon-opacity: 1;}"
			+ "\n#shapes [ weather_normalized_source_eui_kbtu_ft2 <= 208.8] {polygon-fill: #7fcdbb; polygon-opacity: 1;}"
			+ "\n#shapes [ weather_normalized_source_eui_kbtu_ft2 <= 127] { polygon-fill: #c7e9b4; polygon-opacity: 1;}"
			+ "\n#shapes [ weather_normalized_source_eui_kbtu_ft2 <= 110] {polygon-fill: #ffffcc; polygon-opacity: 1;}"


var GHGcss = "/** choropleth visualization */"
			+ "\n#shapes{ polygon-fill: #FFFFFF; polygon-opacity: .2; line-color: #FFF; line-width: 0; line-opacity: 0;}"
			+ "\n#shapes [ total_ghg_intensity_kgco2e_ft2 <= 2500000]{polygon-fill: #0c2c84; polygon-opacity: 1;}"
			+ "\n#shapes [ total_ghg_intensity_kgco2e_ft2 <= 8.9] {polygon-fill: #225ea8; polygon-opacity: 1;}"
			+ "\n#shapes [ total_ghg_intensity_kgco2e_ft2 <= 7.1] {polygon-fill: #1d91c0; polygon-opacity: 1;}"
			+ "\n#shapes [ total_ghg_intensity_kgco2e_ft2 <= 6] {polygon-fill: #41b6c4; polygon-opacity: 1;}"
			+ "\n#shapes [ total_ghg_intensity_kgco2e_ft2 <= 5.3] {polygon-fill: #7fcdbb; polygon-opacity: 1;}"
			+ "\n#shapes [ total_ghg_intensity_kgco2e_ft2 <= 4.5] { polygon-fill: #c7e9b4; polygon-opacity: 1;}"
			+ "\n#shapes [ total_ghg_intensity_kgco2e_ft2 <= 3.4] {polygon-fill: #ffffcc; polygon-opacity: 1;}"

var FLOORAREAcss = "/** choropleth visualization */"
			+ "\n#shapes{ polygon-fill: #FFFFFF; polygon-opacity: .2; line-color: #FFF; line-width: 0; line-opacity: 0;}"
			+ "\n#shapes [ property_floor_area_buildngs_and_parking_ft2 <= 17978250]{polygon-fill: #0c2c84; polygon-opacity: 1;}"
			+ "\n#shapes [ property_floor_area_buildngs_and_parking_ft2 <= 826200] {polygon-fill: #225ea8; polygon-opacity: 1;}"
			+ "\n#shapes [ property_floor_area_buildngs_and_parking_ft2 <= 334001] {polygon-fill: #1d91c0; polygon-opacity: 1;}"
			+ "\n#shapes [ property_floor_area_buildngs_and_parking_ft2 <= 235412] {polygon-fill: #41b6c4; polygon-opacity: 1;}"
			+ "\n#shapes [ property_floor_area_buildngs_and_parking_ft2 <= 135900] {polygon-fill: #7fcdbb; polygon-opacity: 1;}"
			+ "\n#shapes [ property_floor_area_buildngs_and_parking_ft2 <= 81983] { polygon-fill: #c7e9b4; polygon-opacity: 1;}"
			+ "\n#shapes [ property_floor_area_buildngs_and_parking_ft2 <= 81500] {polygon-fill: #ffffcc; polygon-opacity: 1;}"

var WUIcss = "/** choropleth visualization */"
			+ "\n#shapes{ polygon-fill: #FFFFFF; polygon-opacity: .2; line-color: #FFF; line-width: 0; line-opacity: 0;}"
			+ "\n#shapes [ indoor_water_intensity_all_water_sources_gal_ft2 <= 2800.57]{polygon-fill: #0c2c84; polygon-opacity: 1;}"
			+ "\n#shapes [ indoor_water_intensity_all_water_sources_gal_ft2 <= 158] {polygon-fill: #225ea8; polygon-opacity: 1;}"
			+ "\n#shapes [ indoor_water_intensity_all_water_sources_gal_ft2 <= 102.17] {polygon-fill: #1d91c0; polygon-opacity: 1;}"
			+ "\n#shapes [ indoor_water_intensity_all_water_sources_gal_ft2 <= 87.2] {polygon-fill: #41b6c4; polygon-opacity: 1;}"
			+ "\n#shapes [ indoor_water_intensity_all_water_sources_gal_ft2 <= 59.59] {polygon-fill: #7fcdbb; polygon-opacity: 1;}"
			+ "\n#shapes [ indoor_water_intensity_all_water_sources_gal_ft2 <= 35.08] { polygon-fill: #c7e9b4; polygon-opacity: 1;}"
			+ "\n#shapes [ indoor_water_intensity_all_water_sources_gal_ft2 <= 32] {polygon-fill: #ffffcc; polygon-opacity: 1;}"



//*******************************
//SQL query to create the merged tables used for vis
//******************************* 

// SELECT shapes.cartodb_id,
// shapes.bbl,
// data.weather_normalized_source_eui_kbtu_ft2, 
// data.indoor_water_intensity_all_water_sources_gal_ft2,
// data.total_ghg_intensity_kgco2e_ft2,
// data.property_floor_area_buildngs_and_parking_ft2,
// data.primary_property_type___self_selected,  
// data.energy_star_score,
// data.eui_flag__0, 
// data.wui_flag__0, 
// data.bbl_m_flag__0,
// data.eui_property_outlier_flag_2std,
// data.wui_property_outlier_flag_2std,
// data.zip_code AS zip,
// shapes.address,
// shapes.numbldgs,
// shapes.numfloors,
// shapes.yearbuilt,
// shapes.the_geom, 
// shapes.the_geom_webmercator

// FROM nyc_energy_by_bbl AS shapes
// INNER JOIN 
// clean_energy_and_water_data_disclosure_2013 as data
// ON  shapes.bbl=data.bbl