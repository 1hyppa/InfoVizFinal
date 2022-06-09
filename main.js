// Adapted from https://bl.ocks.org/alansmithy/6fd2625d3ba2b6c9ad48 & https://bl.ocks.org/mbostock/4063318
// layout
var cellSize = 17;
var xOffset = 20;
var yOffset = 60;
var calY = 50;
var calX = 25;
var width = 960;
var height = 163;
var cScale = d3.scaleSequential(d3.interpolateSpectral).domain([90, 10]);

format = d3.timeFormat("%d-%m-%Y");
toolDate = d3.timeFormat("%m/%d/%y");

// function to turn date column into JS date
function dateFormatter(dateStringParam) {
  const [year, month, day] = dateStringParam.split('-');
  const result = [month, day, year].join('/');
  var dateObject = new Date(result);
  return dateObject;
}

d3.csv("/data/combined.csv").then(function (data) {
  //parse data
  data.forEach(function (d) {
    d.date = dateFormatter(d.date)
    d.value = d.actual_mean_temp
    d.year = d.date.getFullYear(); //extract the year from the data
  });
  var yearlyData = d3.nest()
    .key(function (d) { return d.year; })
    .entries(data);

  var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", "75%")
    .attr("viewBox", "0 0 " + (xOffset + width) + " 450")

  // append title
  svg.append("text")
    .attr("x", xOffset)
    .attr("y", 20)
    .text("Annual Weather Data from 2014-2015");

  //create an SVG group for each year
  var cals = svg.selectAll("g")
    .data(yearlyData)
    .enter()
    .append("g")
    .attr("id", function (d) {
      return d.key;
    })
    .attr("transform", function (d, i) {
      return "translate(0," + (yOffset + (i * (height + calY))) + ")";
    })

  // append year labels
  var labels = cals.append("text")
    .attr("class", "yearLabel")
    .attr("x", xOffset)
    .attr("y", 15)
    .text(function (d) { return d.key });

  //create day labels
  var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];
  var dayLabels = cals.append("g").attr("id", "dayLabels")
  days.forEach(function (d, i) {
    dayLabels.append("text")
      .attr("class", "dayLabel")
      .attr("x", xOffset)
      .attr("y", function (d) { return calY + (i * cellSize); })
      .attr("dy", "0.9em")
      .text(d);
  })
  updateData("SEA")
  // event handler to update data when the dropdown changes
  d3.select("#dropdown").on("change", function (event, d) {
    const selectedOption = d3.select(this).property("value")
    updateData(selectedOption)
  })

  //function to draw the data on
  function updateData(selectedGroup) {
    var dataRects = cals.append("g")
      .attr("id", "dataDays")
      .selectAll(".dataday")
      .data(function (d) {
        return d.values.filter(e => e.city == selectedGroup);
      })
      .enter()
      .append("rect")
      .attr("id", function (d) {
        return format(d.date) + ":" + d.value;
      })
      .attr("stroke", "#ccc")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function (d) { return xOffset + calX + (d3.timeWeek.count(d3.timeYear(d.date), d.date) * cellSize); })
      .attr("y", function (d) { return calY + (d.date.getDay() * cellSize); })
      .attr("fill", (d) => cScale(d.value))

    //append a title element to give basic mouseover info
    dataRects.append("title")
      .text(function (d) { return toolDate(d.date) + ": " + d.value + " degrees" + "\n" + "Record High Temperature: " + d.record_max_temp + "\n" + "Record Low Temperature: " + d.record_min_temp + "\n" + "Actual Precipitation: " + d.actual_precipitation + "\n" + "Average Precipitation: " + d.average_precipitation; });
    //add montly outlines for calendar
    cals.append("g")
      .attr("id", "monthOutlines")
      .selectAll(".month")
      .data(function (d) {
        return d3.timeMonths(new Date(parseInt(d.key), 0, 1),
          new Date(parseInt(d.key) + 1, 0, 1));
      })
      .enter().append("path")
      .attr("class", "month")
      .attr("transform", "translate(" + (xOffset + calX) + "," + calY + ")")
      .attr("d", monthPath);

    //retreive the bounding boxes of the outlines
    var BB = new Array();
    var mp = document.getElementById("monthOutlines").childNodes;
    for (var i = 0; i < mp.length; i++) {
      BB.push(mp[i].getBBox());
    }

    var monthX = new Array();
    BB.forEach(function (d, i) {
      boxCentre = d.width / 2;
      monthX.push(xOffset + calX + d.x + boxCentre);
    })

    //create centred month labels around the bounding box of each month path
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var monthLabels = cals.append("g").attr("id", "monthLabels")
    months.forEach(function (d, i) {
      monthLabels.append("text")
        .attr("class", "monthLabel")
        .attr("x", monthX[i])
        .attr("y", calY / 1.2)
        .text(d);
    })
  }
  makeKey();

});//end data load

function makeKey() {
  var keyData = [
    { "color": "rgb(94, 79, 162)", "value": 0 },
    { "color": "rgb(94, 79, 162)", "value": 10 },
    { "color": "rgb(70, 150, 179)", "value": 20 },
    { "color": "rgb(137, 207, 165)", "value": 30 },
    { "color": "rgb(213, 238, 159)", "value": 40 },
    { "color": "rgb(251, 248, 176)", "value": 50 },
    { "color": "rgb(254, 210, 129)", "value": 60 },
    { "color": "rgb(248, 142, 83)", "value": 70 },
    { "color": "rgb(219, 73, 74)", "value": 80 },
    { "color": "rgb(158, 1, 66", "value": 90 }];
  var extent = d3.extent(keyData, d => d.value);

  var padding = 10;
  var keyWidth = 500;
  var innerWidth = keyWidth - (padding * 2);
  var barHeight = 8;
  var keyHeight = 100;

  var xScale = d3.scaleLinear()
    .range([0, innerWidth])
    .domain(extent);

  var xTicks = keyData.map(d => d.value);

  var xAxis = d3.axisBottom(xScale)
    .tickSize(barHeight * 2)
    .tickValues(xTicks);

  var keySvg = d3.select("#legend").append("svg").attr("width", keyWidth).attr("height", keyHeight);
  var g = keySvg.append("g").attr("transform", "translate(" + padding + ", 30)");

  var defs = keySvg.append("defs");
  var linearGradient = defs.append("linearGradient").attr("id", "myGradient");
  linearGradient.selectAll("stop")
    .data(keyData)
    .enter().append("stop")
    .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
    .attr("stop-color", d => d.color);

  g.append("rect")
    .attr("width", innerWidth)
    .attr("height", barHeight)
    .style("fill", "url(#myGradient)");

  g.append("g")
    .call(xAxis)
    .select(".domain").remove();

  g.append("g").attr("class", "temperature")
    .append("text").text("Temperature °F").style("font-size", "1rem")

}
// Mike Bolstock's function to calculate month shape
function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
    d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
    d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
    + "H" + w0 * cellSize + "V" + 7 * cellSize
    + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
    + "H" + (w1 + 1) * cellSize + "V" + 0
    + "H" + (w0 + 1) * cellSize + "Z";
}
