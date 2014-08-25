// ECC params
var ec = {
  a: -3,
  b: 4,
  p: 29
};

// plot bounds
var plot_config = {
  x_min: -3.5,
  x_max: 3,
  y_min: -4,
  y_max: 4,
  start_x: -2,
};
plot_config.start_y = ecYCoord(plot_config.start_x);

// store our plots
//  plots[elementId] = flot object stored embedded in that elementId
var plots = {};


// resets the plot so we can draw new stuff
// canvas can't really be "erased", so we must destroy the plot and rebuild it if we want to delete points/lines on the curve
function resetPlot (elementId, clickHandler) {
  plots[elementId].destroy();
  plots[elementId] = null;
  $(elementId).unbind("plotclick");
  return plotEC(elementId, clickHandler);
}

// in our config, we have a "starting point".  when user clicks on the curve, this graphically adds the clicked point with the starting point,
function showPointAddition (event, pos, item) {
  if (item) {
    var elementId ="#"+event.delegateTarget.id; 
    var plot = resetPlot(elementId, showPointAddition);
    var x = item.datapoint[0];
    var y = item.datapoint[1];


    // plot intersection line
    var slope = plotLineBetweenPts(plot, plot_config.start_x, plot_config.start_y, x, y);

    // find intersection point
    var int_x = (Math.pow(slope,2) - plot_config.start_x - x);
    var int_y = (slope * (plot_config.start_x - int_x) - plot_config.start_y);

    // plot the dashed verical line
    plotDashedVert(plot, int_x, Math.abs(int_y), -Math.abs(int_y));

    // add the original point (so it renders on top of the line)
    plot.addPoint(plot_config.start_x, plot_config.start_y, "#1859a9");

    // add the "added" point
    plot.addPoint(x, y, "#a11d20");

    // find intersection point
    var int_x = (Math.pow(slope,2) - plot_config.start_x - x);
    var int_y = (slope * (plot_config.start_x - int_x) - plot_config.start_y);

    plot.addPoint(int_x, int_y, "#662c91");

    // update the equation
    $(".point-b-add").text("(" + (x >= 0 ? x.toString().substr(0,3) : x.toString().substr(0,4)) + ", " + (y >= 0 ? y.toString().substr(0,3) : y.toString().substr(0,4)) + ")");
    $(".sum-add").text("(" + (int_x >= 0 ? int_x.toString().substr(0,3) : int_x.toString().substr(0,4)) + ", " + (int_y >= 0 ? int_y.toString().substr(0,3) : int_y.toString().substr(0,4)) + ")");
    

  }
}

function showPointDouble (event, pos, item) {
  if (item) {
    var elementId ="#"+event.delegateTarget.id; 
    var plot = resetPlot(elementId, showPointDouble);
    var x = item.datapoint[0];
    var y = item.datapoint[1];

    var tangent = getTangent(x,y);
    plotLine(plot, tangent.func, "#599ad3");

    // add the added point
    plot.addPoint(x, y, "#1859a9");

    // draw dashed vertical line
    //x3 = s^2 - x1 - x2 mod p
    //y3 = s(x1 - x3) - y1 mod p
    var line_x = Math.pow(tangent.slope, 2) - 2*x;
    var line_y = (tangent.slope * (x - line_x) - y);
    plotDashedVert(plot, line_x, Math.abs(line_y), -Math.abs(line_y));

    // draw point
    plot.addPoint(line_x, line_y, "#662c91");

    // update equation
    $(".point-a-double").text("(" + (x >= 0 ? x.toString().substr(0,3) : x.toString().substr(0,4)) + ", " + (y >= 0 ? y.toString().substr(0,3) : y.toString().substr(0,4)) + ")");
    $(".sum-double").text("(" + (line_x >= 0 ? line_x.toString().substr(0,3) : line_x.toString().substr(0,4)) + ", " + (line_y >= 0 ? line_y.toString().substr(0,3) : line_y.toString().substr(0,4)) + ")");
  }
}

// given x, y coordinates, calculate tangent line eqn
// y = mx + b
// tangent slope = (3x^2 + a) / 2y
// returns {
//  slope: slope,
//  func: give it x, returns y for this line
// }
function getTangent (x, y) {
  var slope = (3*Math.pow(x, 2) + ec.a) / (2*y);
  return {
    func: function(x_coord) {
      return x_coord*slope + (y-(slope*x));
    },
    getX: function(y_coord) {
      return (y_coord - y + slope * x) / slope
    },
    slope: slope
  }
}

//
//  === Line Plotting functions
//
// given 2 points, this draws a solid line between them
function plotLineBetweenPts (plot, x1, y1, x2, y2) {
  // calculate slope
  var slope = (y2 - y1) / (x2 - x1);
  // make line eqn in point slope
  var eqn = function (x_coord) {
    return x_coord*slope + (y1-(slope*x1));
  }
  // call plotLine(eqn)
  plotLine(plot, eqn, "#599ad3");
  return slope;
}

function plotLine (plot, eq, color) {
  var data = getLinePts(plot, eq);
  plot.addPlot(data, color);
}

// eq will be an anonymous function with argument x which returns y
function getLinePts (plot, eq) {
  var plot_x_min = plot_config.x_min;
  var plot_x_max = plot_config.x_max;
  var pos = [[plot_x_min, eq(plot_x_min)], [plot_x_max, eq(plot_x_max)]];
  return pos;
}

// returns points for x=x_int between y bounds and makes a dashed line
function plotDashedVert (plot, x_int, y_max, y_min) {
  var goesUp = y_max < y_min;

  var step = .2;
  var subs = (y_max - y_min) / step;

  for (var i = 0; i < subs; i = i + 2) {
    var y1 = y_max - (i*step);
    var y2 = y_max - ((i+1)*step);
    // make sure dash doesn't extend beyond curve
    if (goesUp && y2 > y_max || !goesUp && y2 < y_min) {
      y2 = goesUp ? y_max : y_min; 
    }
    var pos = [[x_int, y1], [x_int, y2]];
    plot.addPlot(pos, "#599ad3");
  };
}

//
// === Elliptic Curve Plotting functions
//
function plotEC (elementId, cb) {
  // get points which make up the EC
  var pts = getECPts();

  pts.map(function(val) {
    return {
      data: val
    }
  });

  var options = {
    xaxis: {
      min: plot_config.x_min,
      max: plot_config.x_max 
    },
    yaxis: {
      min: plot_config.y_min,
      max: plot_config.y_max
    },
    grid: {
      clickable: cb ? true : false,
      hoverable: cb ? true : false
    },
    series: {
      color: "#f2d1b0"
    }
  };

  plots[elementId] = $.plot(elementId, pts, options);

  if (cb) {
    $(elementId).bind("plotclick", cb);
  }

  return plots[elementId];
}

// returns array of points for EC equation
function getECPts () {
  if (!ec.hasOwnProperty("contpts")) {
    var pos = [];
    for (var i = plot_config.x_max; i > plot_config.x_min; i -= 0.0002) {
      var yc = ecYCoord(i);
      if (!yc) {
        break;
      }
      pos.push([i, ecYCoord(i)]);
    }
    ec.contpts = pos;
  }

  var neg = ec.contpts.map(function(val) {
    return [val[0], -val[1]];
  }).reverse();

  var ret = [];
  ret.push(ec.contpts, neg);
  return ret;
}

// for continuous EC, given x, get y
function ecYCoord (x) {
  return Math.sqrt(Math.pow(x, 3) + ec.a*x + ec.b);
}

function test () {
  var math = MathJax.Hub.getAllJax("mathjax-addition")[0];
  MathJax.Hub.Queue(["Text",math,"(1,4) + (5,7) = (0,2)"]);
}


window.onload = function() {
  // the example ec
  plotEC("#empty-ec");

  // the ec which shows point addition
  plotEC("#ec-addition", showPointAddition);
  showPointAddition({delegateTarget: {id: "ec-addition"}}, {}, {datapoint: [1.9, 2.3]});
  //showPointAddition()
  //additionPlot.addPoint(plot_config.start_x, plot_config.start_y, "#1859a9");
  plotEC("#ec-double", showPointDouble);
  showPointDouble({delegateTarget: {id: "ec-double"}}, {}, {datapoint: [-0.8, 2.4]});
  //showPointAddition({delegateTarget: {id: "ec-addition"}}, {}, {datapoint: [1.9, 2.3]});
};
