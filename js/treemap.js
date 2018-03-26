  
function prepareTreemap(){
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


function makeTreemap(propertyInfos){

  var margin = {top: 40, right: 10, bottom: 10, left: 10},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var color = d3.scale.linear()
                .domain([d3.min(propertyInfos.children,function(d){return d.avg;}),
                          // d3.median(propertyInfos.children,function(d){return d.avg;}),
                          d3.max(propertyInfos.children,function(d){return d.avg;})
                ])
                .range([d3.rgb(hexColorLowEUI),
                        // d3.rgb(avgEUI),
                        d3.rgb(hexColorHighEUI)]);

  console.log(color(100), color(400));

  var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true)
      .sort(function(a,b){return a.count - b.count;})
      .value(function(d) { return d.count; });

  var div = d3.select("#treemap").append("div")
      .style("position", "relative")
      .style("width", (width + margin.left + margin.right) + "px")
      .style("height", (height + margin.top + margin.bottom) + "px")
      .style("left", margin.left + "px")
      .style("top", margin.top + "px");

  var node = div.datum(propertyInfos).selectAll(".node")
      .data(treemap.nodes)
    .enter().append("div")
      .attr("class", "node")
      .call(position)
      .style("background", function(d) { return color(d.avg); })
      .on("mouseover", function(d){
        d3.select(this)
        .style("background",function(d) { 
          if(d.avg != null){
            return d3.rgb(color(d.avg)).darker(0.1);
          } 
        });
      })
      .on("mouseout", function(d){
        d3.select(this)
        .style("background",function(d) { 
          if(d.avg != null){
            return color(d.avg);
          }
        });
      })
      .each(function(d){
        box = d3.select(this);
        if(d.count >= 60){
          treeStr = d.propertytype=="" ? "Unspecified" : d.propertytype; 
          treeStr += "<br>"+d.count+" properties";
          box.html(treeStr);
        }

      });

  // d3.selectAll("input").on("change", function change() {
  //   var value = this.value === "count"
  //       ? function() { return 1; }
  //       : function(d) { return d.size; };

  //   node
  //       .data(treemap.value(value).nodes)
  //     .transition()
  //       .duration(1500)
  //       .call(position);
  // });

  function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
  }

}