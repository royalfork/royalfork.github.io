// ECC params
var ec = {
  a: -3,
  b: 4,
  p: 29,
  points: [
    [-1, -1],
    [0, 2],
    [6, 17],
    [22, 1],
    [23, 3],
    [2, 8],
    [7, 6],
    [17, 9],
    [21, 3],
    [13, 25],
    [3, 15],
    [19, 22],
    [14, 26],
    [28, 8],
    [8, 17],
    [15, 17],
    [15, 12],
    [8, 12],
    [28, 21],
    [14, 3],
    [19, 7],
    [3, 14],
    [13, 4],
    [21, 26],
    [17, 20],
    [7, 23],
    [2, 21],
    [23, 26],
    [22, 28],
    [6, 12],
    [0, 27]
  ]
};

// plot bounds
var plot_config = {
  x_min: -3.5,
  x_max: 3,
  y_min: -4,
  y_max: 4,
  start_x: -2,
  colors: {
    pointA: "#a11d20",
    pointB: "#1859a9",
    sum: "#662c91",
    primary: "#f2d1b0",
    secondary: "#599ad3"
  }
};
plot_config.start_y = ecYCoord(plot_config.start_x);

// store our plots
//  plots[elementId] = flot object stored embedded in that elementId
var plots = {};

function showSignatureExample () {
  // set the information (this is all generated from the ruby script)
  //pk is: 7
  //pubk: 17, 9
  //Z is: 14
  //k is: 9
  //kpoint: 13, 25
  //Sig is: [13, 22]
  //W is: 24
  //u1: 26, u2: 2
  var priv_key = 7;
  var pub_key = ec.points[priv_key];
  var msg_hash = 14;
  var rand = 9;
  var rand_pt = ec.points[rand];

  // draw the plots
  var plotS = plotEmptyFF("#signature-sign");
  var plotV = plotEmptyFF("#signature-verify");
  var offset = plotS.getPlotOffset();

  function addPointInfo (plot, x, y, color, info_text) {
    // set the points
    plot.addPoint(x, y, color);
    var loc = plotS.p2c({x: x, y: y});

    var info = document.createElement('div');
    var $div = $("<div>", {
      class: "information sig-info",
      html: info_text,
      css: {
        "top": offset.top + loc.top - 10 + "px",
        "left": offset.left + loc.left + 20 + "px"
      }
    });
    $("#signature-sign").append($div);
  }

  // add generator point 
  addPointInfo(plotS, ec.points[1][0], ec.points[1][1], "black", "1 * G");
  // add public key point
  addPointInfo(plotS, pub_key[0], pub_key[1], "#59d", priv_key + " * G");
  // add random point
  addPointInfo(plotS, rand_pt[0], rand_pt[1], "#7c6", rand + " * G");

}

// resets the plot so we can draw new stuff
// canvas can't really be "erased", so we must destroy the plot and rebuild it if we want to delete points/lines on the curve
function resetPlot (elementId, clickHandler) {
  plots[elementId].destroy();
  plots[elementId] = null;
  $(elementId).unbind("plotclick");
  return plotEC(elementId, clickHandler);
}
function resetFF (elementId, clickHandler) {
  plots[elementId].destroy();
  plots[elementId] = null;
  $(elementId).unbind("plotclick");
  return plotFF(elementId, clickHandler);
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
    plotDashedVert(plot, int_x, Math.abs(int_y), -Math.abs(int_y), plot_config.colors.secondary);

    // add the original point (so it renders on top of the line)
    plot.addPoint(plot_config.start_x, plot_config.start_y, plot_config.colors.pointA);

    // add the "added" point
    plot.addPoint(x, y, plot_config.colors.pointB);

    plot.addPoint(int_x, int_y, plot_config.colors.sum);

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
    plotLine(plot, tangent.func, plot_config.colors.secondary);

    // add the added point
    plot.addPoint(x, y, plot_config.colors.pointA);

    // draw dashed vertical line
    //x3 = s^2 - x1 - x2 mod p
    //y3 = s(x1 - x3) - y1 mod p
    var line_x = Math.pow(tangent.slope, 2) - 2*x;
    var line_y = (tangent.slope * (x - line_x) - y);
    plotDashedVert(plot, line_x, Math.abs(line_y), -Math.abs(line_y), plot_config.colors.secondary);

    // draw point
    plot.addPoint(line_x, line_y, plot_config.colors.sum);

    // update equation
    $(".point-a-double").text("(" + (x >= 0 ? x.toString().substr(0,3) : x.toString().substr(0,4)) + ", " + (y >= 0 ? y.toString().substr(0,3) : y.toString().substr(0,4)) + ")");
    $(".sum-double").text("(" + (line_x >= 0 ? line_x.toString().substr(0,3) : line_x.toString().substr(0,4)) + ", " + (line_y >= 0 ? line_y.toString().substr(0,3) : line_y.toString().substr(0,4)) + ")");
  }
}

function showFFDouble (event, pos, item) {
  // draw "modular lines" until we pass through compliment of target point 
  // draw dashed line to our target point

  if (item) {

    var elementId ="#"+event.delegateTarget.id; 
    var plot = resetFF(elementId, showFFDouble);

    var x = item.datapoint[0];
    var y = item.datapoint[1];
    console.log("Clicked: " + x + ", " + y);

    // figure out the double point using our existing points
    var target = ffPointDouble(x,y);
    var comp_target = [target[0], ec.p/2-(target[1]-ec.p/2)]
    console.log("Comp target: " + comp_target[0] + ", " + comp_target[1]);

    // calculate discrete slope of line
    var disc_slope = (3 * (Math.pow(x,2)) + ec.a) * invmod(2*y, ec.p) % ec.p;
    console.log("Slope: " + disc_slope);

    // draw lines until we get to intersection point
    var lines = [];
    for (var i = 0; i < 14; i++) {
      var line;
      // for first line, point is point on plot
      if (i === 0) {
        line = pointSlope(x, y, disc_slope);
      } else {
        // after first line, we go in direction of the target point
        var goRight = comp_target[0] > x;
        console.log("Go Right: " + goRight);
        // for negative slope
        // if negative slope, and we go right, or positive slope and we go left
        if ((goRight && disc_slope < 0) || (!goRight && disc_slope > 0)) {
          line = pointSlope(lines[i-1].getX(-1), ec.p-1, disc_slope);
        } else {
          line = pointSlope(lines[i-1].getX(ec.p), 0, disc_slope);
        }
      }
      lines.push(line);
      plotLine(plot, line.getY, plot_config.colors.primary);


      // if this line passes through our target, we're done
      if (Math.abs(line.getY(target[0]) - comp_target[1]) < .01) {
        // draw dashed line from comp_target to target
        plotDashedVert(plot, target[0], comp_target[1], target[1], plot_config.colors.primary);
        break;
      }
    };

    // after lines are drawn...color code the important points
    plot.addPoint(x, y, plot_config.colors.pointA);
    plot.addPoint(target[0], target[1], plot_config.colors.sum);

    // show the point numbers 
    $(".point-a-ffdouble").text("(" + x + ", " + y + ")");
    $(".sum-ffdouble").text("(" + target[0] + ", " + target[1] + ")");

    $(".point-a-ffdouble-multiplier").text(getPointMultiplier(x, y));
    $(".sum-ffdouble-multiplier").text(getPointMultiplier(target[0], target[1]));
  }
}

function pointSlope (x, y, slope) {
  return {
    getX: function(y_coord) {
      return (y_coord - y + slope * x) / slope;
    },
    getY: function(x_coord) {
      return slope * (x_coord - x) + y;
    }
  }
}

function ffPointDouble (x, y) {
  var mult = getPointMultiplier(x,y) * 2;
  return ec.points[mult % (ec.points.length)]
}

function getPointMultiplier (x, y) {
  for (var i = 0; i < ec.points.length; i++) {
    if (ec.points[i][0] == x && ec.points[i][1] == y) {
      return i;
    }
  };
  return -1;
}

function invmod (e, et) {
  x = extended_gcd(e, et);
  if (x) {
    return x % et
  }
  return console.log("Can't compute inverse mod: " + x + ", " + y);
}

function extended_gcd (a, b) {
  var last_remainder = Math.abs(a);
  var remainder = Math.abs(b);
  var x = 0;
  var last_x = 1;
  var y = 1;
  var last_y = 0;
    
  while (remainder != 0){
    // do math
    var new_remainder = last_remainder % remainder;
    var quotient = Math.floor(last_remainder / remainder);
    var new_x = last_x - quotient*x;
    var new_y = last_y - quotient*y;

    // update vars
    last_remainder = remainder;
    remainder = new_remainder;
    last_x = x;
    x = new_x;
    last_y = y;
    y = new_y;
  }

  if (last_remainder == 1) {
    return last_x * (a < 0 ? -1 : 1);
  }
  return false;
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
  plotLine(plot, eqn, plot_config.colors.secondary);
  return slope;
}

function plotLine (plot, eq, color) {
  var data = getLinePts(plot, eq);
  plot.addPlot(data, color);
}

// eq will be an anonymous function with argument x which returns y
function getLinePts (plot, eq) {
  var plot_x_min = plot.getXAxes()[0].min;
  var plot_x_max = plot.getXAxes()[0].max;
  var pos = [[plot_x_min, eq(plot_x_min)], [plot_x_max, eq(plot_x_max)]];
  return pos;
}

// returns points for x=x_int between y bounds and makes a dashed line
function plotDashedVert (plot, x_int, y_max, y_min, color) {
  // make sure the order is right...it's easier to check here than from caller
  if (y_min > y_max) {
    var tmp = y_min;
    y_min = y_max;
    y_max = tmp;
  }

  var step = (plot.getYAxes()[0].max - plot.getYAxes()[0].min) / 40;
  var subs = Math.abs(y_max - y_min) / step;

  for (var i = 0; i < subs; i = i + 2) {
    var y1 = y_max - (i*step);
    var y2 = y_max - ((i+1)*step);
    // make sure dash doesn't extend beyond curve
    if (y2 < y_min) {
      y2 = y_min; 
    }
    var pos = [[x_int, y1], [x_int, y2]];
    plot.addPlot(pos, color);
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
      color: plot_config.colors.primary
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

function plotFF (elementId, cb) {
  var options = {
    xaxis: {
      min: 0,
      max: ec.p - 1 
    },
    yaxis: {
      min: 0,
      max: ec.p - 1
    },
    grid: {
      clickable: cb ? true : false,
      hoverable: cb ? true : false
    },
    series: {
      color: plot_config.colors.secondary,
      lines: {
        show: false
      },
      points: {
        show: true,
      }
    }
  };

  plots[elementId] = $.plot(elementId, [ec.points], options);

  if (cb) {
    $(elementId).bind("plotclick", cb);
  }

  return plots[elementId];
}

function plotEmptyFF (elementId) {
  var options = {
    xaxis: {
      min: 0,
      max: ec.p - 1 
    },
    yaxis: {
      min: 0,
      max: ec.p - 1
    },
    grid: {
      clickable: false,
      hoverable: false
    },
    series: {
      color: plot_config.colors.secondary,
      lines: {
        show: false
      },
      points: {
        show: true,
      }
    }
  };

  plots[elementId] = $.plot(elementId, [[]], options);

  return plots[elementId];
}


window.onload = function() {
  // example ec
  plotEC("#empty-ec");

  // ec which shows point addition
  plotEC("#ec-addition", showPointAddition);
  showPointAddition({delegateTarget: {id: "ec-addition"}}, {}, {datapoint: [1.9, 2.3]});
  //  ec which shows point doubling
  plotEC("#ec-double", showPointDouble);
  showPointDouble({delegateTarget: {id: "ec-double"}}, {}, {datapoint: [-0.8, 2.4]});

  // ff with points
  plotFF("#ff-points");

  // ff double
  plotFF("#ff-double", showFFDouble);
  showFFDouble({delegateTarget: {id: "ff-double"}}, {}, {datapoint: [8, 17]});

  showSignatureExample();

  $('select').selectric({
    //inheritOriginalWidth: true,
  });
};
