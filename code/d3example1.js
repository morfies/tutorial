require.config({
  paths: {
    jquery: "jquery-2.1.4.min",
    d3: "d3.min"
  },
  urlArgs: "v=1", //version
});
require(["jquery", "d3"], function($, d3) {
  function GetQueryString(name) {    
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");    
    var r = window.location.search.substr(1).match(reg);    
    if (r != null)
      return  decodeURIComponent(r[2]);
    return null;
  }
  var cid = GetQueryString("cid");
  // get data async
  $.get("http://www.padmatek.com/vclass/statsreport/" + cid)
    .then(function(data) {
      console.log(data);
      // {status: true,
      // data: {cindex: "class-7", pv: 2646, vids: [246, 98, 100, ... with 24 values for a day]}}
      if (data.status) {
        var pv = data.data.pv,
          list = data.data.vdis;
        var w = 1000,
          h = 500,
          padding = 1;
        // x-axis config, scale with total records against canvas width
        var xScale = d3.scale.linear()
          .domain([0, list.length])
          .range([0, w]);
        var max = d3.max(list);
        // y-axis config
        var yScale = d3.scale.linear()
          .domain([0, max])
          .range([0, h]);
        // color scale, from light to darker with data increase
        var colors = d3.scale.linear()
          .domain([0, max * .33, max * .66, max])
          .range(['#626762', '#506950', '#3C693B', '#064805']);
        var xAxis = d3.svg.axis()
          .scale(xScale)
          .orient("bottom");
        var yAxis = d3.svg.axis()
          .scale(d3.scale.linear()
            .domain([0, max])
            // here reverse y-axis text to look right
            .range([h, 0]))
          .orient("left")
          // here config how many ticks for this axis
          .ticks(10);
        // select an element to put the svg
        var svg = d3.select(".container .main")
          .append("svg")
          .attr("width", w)
          .attr("height", h);
        // hold the selection into a var so that we later animate it
        var awesome = svg.selectAll("rect")
          .data(list)
          .enter()
          .append("rect")
          .attr("x", function(d, i) {
            return xScale(i) - padding; //i*(w/list.length)-padding;
          })
          .attr("width", (w) / list.length - padding)
          // following two lines are key for animation, think the math
          .attr("height", 0)
          .attr("y", h)
          // fill the bars with defined color scale
          .attr("fill", function(d, i) {
            return colors(d);
          })
          .on("mouseover", function(d) {
            tmpColor = this.style.fill;
            d3.select(this).style("fill", "#2F1471");
          })
          .on("mouseout", function(d) {
            d3.select(this).style("fill", tmpColor);
          })
          .on("click", function(d) {
            console.log(d);
          })
        // animation set off here
        awesome.transition()
          // height and y changes with time,
          // make it look like the bar rises from bottom
          .attr('height', function(data) {
            return yScale(data);
          })
          .attr('y', function(data) {
            return h - yScale(data);
          })
          // each bar is delayed with its index
          .delay(function(data, i) {
            return i * 50;
          })
          .duration(2000)
          // some effect
          .ease('elastic');
        // text can also be added to the bars we draw
        svg.selectAll("text")
          .data(list)
          .enter()
          .append("text")
          .text(function(d) {
            return d;
          })
          .attr("x", function(d, i) {
            return xScale(i) + 5;
          })
          .attr("y", function(d) {
            return h - yScale(d) + 14;
          })
          .attr("font-family", "sans-serif")
          .attr("font-size", "11px")
          .attr("fill", "white");
        // hook up the axis
        svg.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + (h - padding) + ")")
          .call(xAxis);
        svg.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(-" + padding + ",0)")
          .call(yAxis);
        $("header span").html(pv);
        return data.data.cindex;
      }
      return undefined;
    }).then(function(cindex) {
      if (cindex) { // eg. cindex = "class-7"
        var index = cindex.match(/(\d)/)[1];
        $.get("http://www.padmatek.com/vclass/audioreport/" + index).then(function(result) {
          console.log(result);
          // {status: true,
          // data: [{pv: 123, resource: "1weike7.mp3"}, {pv: 345, resource: "2weike7.mp3"}]}
          if (result.status) {
            var list = result.data;
            //order by audio index
            list = list.sort(function(x, y) {
              return x.resource.match(/^(\d+)/)[1] - y.resource.match(/^(\d+)/)[1]
            });
            // ["1weike7.mp3","2weike7.mp3",...]
            var xlist = list.map(function(item) {
              return item.resource;
            });
            //pv array
            var ylist = list.map(function(item) {
              return item.pv;
            });
            var w = 500,
              h = 500,
              padding = 1;
            var xScale = d3.scale.linear()
              .domain([0, list.length])
              .range([0, w]);
            var max = d3.max(ylist);
            var yScale = d3.scale.linear()
              .domain([0, max])
              .range([0, h]);
            var colors = d3.scale.linear()
              .domain([0, max * .33, max * .66, max])
              .range(['#626762', '#506950', '#3C693B', '#064805']);
            var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              // a little trick to customize x-axis text words
              .tickFormat(function(d, i) {
                return xlist[i];
              });
            var yAxis = d3.svg.axis()
              .scale(d3.scale.linear()
                .domain([0, max])
                // reverse
                .range([h, 0]))
              .orient("left")
              .ticks(10);
            var svg = d3.select(".container1 .main")
              .append("svg")
              .attr("width", w)
              .attr("height", h);
            var awesome = svg.selectAll("rect")
              .data(ylist)
              .enter()
              .append("rect")
              .attr("x", function(d, i) {
                return xScale(i) - padding; //i*(w/list.length)-padding;
              })
              .attr("width", (w) / ylist.length - padding)
              .attr("height", 0)
              .attr("y", h)
              .attr("fill", function(d, i) {
                return colors(d);
              });
            awesome.transition()
              .attr('height', function(d) {
                return yScale(d);
              })
              .attr('y', function(d) {
                return h - yScale(d);
              })
              .delay(function(d, i) {
                return i * 50;
              })
              .duration(2000)
              .ease('elastic');
            svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + (h - padding) + ")")
              .call(xAxis)
              // here we want the decoration words under x-axis to be rotated
              // so that all words can be shown
              // dx and dy are relative position attributes for the text
              .selectAll("text")
              .attr("y", 0)
              .attr("x", 10)
              .attr("dy", "0")
              .attr("transform", "rotate(45)")
              .style("text-anchor", "start");
            // place the y-axis
            svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(-" + padding + ",0)")
              .call(yAxis);
          }
        });
      }
    });
});
