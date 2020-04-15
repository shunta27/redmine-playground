Raphael.fn.pieChart = function (cx, cy, r, values, border_width) {
  var paper = this,
      rad = Math.PI / 180,
      chart = this.set();
  function sector(cx, cy, r, startAngle, endAngle, params) {
    var x1 = cx + r * Math.cos(-startAngle * rad),
        x2 = cx + r * Math.cos(-endAngle * rad),
        y1 = cy + r * Math.sin(-startAngle * rad),
        y2 = cy + r * Math.sin(-endAngle * rad);
    return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, + (endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
  }
  if (values[0] === 100 || values[0] === 0) {
    if (values[0] === 100){
      color = '#AFE4AD';
      bcolor = '#63AD15';
    } else if (values[0] === 0) {
      color = '#F6B3B3';
      bcolor = '#FF4A4A';
    }
    var circle = paper.circle(r, r, r).attr({ fill: "90-" + bcolor + "-" + color, stroke: "#fff", "stroke-width": border_width, "stroke-linejoin": "round", "stroke-opacity": 1 });
    chart.push(circle);
  } else {
    var angle = 90,
        total = 0,
        process = function (j) {

          if (j === 0) {
            color = '#AFE4AD';
            bcolor = '#63AD15';
          } else if (j === 1) {
            color = '#F6B3B3';
            bcolor = '#FF4A4A';
          }

          var value = values[j],
              angleplus = 360 * value / total,
              p = sector(cx, cy, r, angle - angleplus, angle, { fill: "90-" + bcolor + "-" + color, stroke: "#fff", "stroke-width": border_width, "stroke-linejoin": "round", "stroke-opacity": 1 });
          angle -= angleplus;
          chart.push(p);
        };
    for (var i = 0, ii = values.length; i < ii; i++) {
      total += values[i];
    }
    for (var i = 0; i < ii; i++) {
      process(i);
    }
  }
  return chart;
};

