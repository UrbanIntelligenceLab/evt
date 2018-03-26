SELECT main.primary_property_type___self_selected AS propertytype, 
	count(main.primary_property_type___self_selected), 
	avg(main.weather_normalized_source_eui_kbtu_ft2), 
	stddev_pop(main.weather_normalized_source_eui_kbtu_ft2),
	moredata.indoor_water_intensity_all_water_sources_gal_ft2, 
	moredata.property_floor_area_buildngs_and_parking_ft2, 
	moredata.total_ghg_emissions_mtco2e 
FROM nyc_energy_by_bbl AS main 
JOIN full_energy_and_water_data_disclosure_2012 AS moredata 
	ON moredata.bbl = main.bbl 
WHERE (main.weather_normalized_source_eui_kbtu_ft2 >= 0 
	AND main.weather_normalized_source_eui_kbtu_ft2 < 1000 
	AND moredata.indoor_water_intensity_all_water_sources_gal_ft2 >= 0 
	AND moredata.indoor_water_intensity_all_water_sources_gal_ft2 < 1000 
	AND moredata.total_ghg_emissions_mtco2e >= 0 
	AND moredata.total_ghg_emissions_mtco2e < 15000) 
GROUP BY propertytype 
ORDER BY count(main.primary_property_type___self_selected) DESC