function initDropdown(selector, onchange, options) {
  const select = document.createElement("select");
  select.onchange = e => onchange(e.target.value);
  options.forEach(o => {
    const option = document.createElement("option");
    option.value = o;
    option.innerHTML = o;
    select.append(option);
  });
  $(selector).append(select);
}

function removeChildren(selector) {
  const node = $(selector);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function createSlider(selector, paramName, sliderParams, outputParams) {
  const valueProperty = newValue => {
    // A little helper to reduce repeating code in param definitons
    if (sliderParams.valueProperty) {
      return sliderParams.valueProperty(newValue);
    }
    return newValue
      ? (outputParams[paramName] = newValue)
      : outputParams[paramName];
  };
  const lineBreak = document.createElement("br");
  const label = $("<label>").text(`${paramName} = ${valueProperty()}`);
  const slider = document.createElement("input");
  $(lineBreak).attr({ class: "auto-generated" });
  $(label)
    .attr({ class: "auto-generated" })
    .css({ "vertical-align": "super", "margin-left": 5 });
  $(slider).attr({ type: "range", class: "auto-generated", ...sliderParams });

  slider.oninput = function() {
    outputParams[paramName] = parseFloat(valueProperty(this.value));
    $(label).text(`${paramName} = ${valueProperty()}`);
  };

  $(selector).append(lineBreak, slider, label);
}

function initSliders(_mainMethod, _lineSearchMethod) {
  mainMethod = _mainMethod;
  lineSearchMethod = _lineSearchMethod;

  $(".auto-generated").remove();

  Object.entries(mainMethod.sliderParams).forEach(([key, params]) => {
    createSlider("#mainMethodParameters", key, params, mainMethod.params);
  });

  Object.entries(lineSearchMethod.sliderParams).forEach(([key, params]) => {
    createSlider(
      "#lineSearchMethodParameters",
      key,
      params,
      lineSearchMethod.params
    );
  });
}

function visualizeAlgorithm(plot, _points, color) {
  const points = _points.map(p => plot.toPixels(p.toArray()));
  let p0 = points.shift();

  const circle = plot.svg
    .append("circle")
    .attr("class", "dot")
    .attr("fill", color)
    .attr("r", 4)
    .attr("transform", `translate(${p0})`);

  const line = d3
    .line()
    .x(d => d[0])
    .y(d => d[1]);

  function transition() {
    if (clearSignal) {
      return;
    }

    const p = points.shift();
    // Skip too large numbers (probably failing)
    if (Math.abs(p[0]) > 1e18 || Math.abs(p[1]) > 1e18) {
      return;
    }

    const path = plot.svg
      .append("path")
      .datum([p0, p])
      .attr("class", "trace")
      .attr("stroke", color)
      .attr("d", line);

    const totalLength = path.node().getTotalLength();

    p0 = p;

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      // .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    circle
      .transition()
      .duration(1000)
      // .ease(d3.easeLinear)
      .attr("transform", `translate(${p})`)
      .on("end", () => {
        if (points.length) transition();
      });
  }
  transition();
}
