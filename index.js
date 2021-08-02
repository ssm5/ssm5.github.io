height = 600
width = 1200

margin = ({top: -150, right: 10, bottom: 10, left: 250})

function hover(svg, data, path) {
    if ("ontouchstart" in document) svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", moved)
        .on("touchstart", entered)
        .on("touchend", left)
    else svg
        .on("mousemove", moved)
        .on("mouseenter", entered)
        .on("mouseleave", left);

  
    }

const raw_data = d3.csv("data/waqi_covid_clean_pm25_pivot.csv");

raw_data.then(function(raw_data) {
    const columns = raw_data.columns.slice(2);

    const data = {
        y: "Year-over-year ∆pm25 From 2019",
        series: raw_data.map(d => ({
            name: d.City.replace(/, ([\w-]+).*/, " $1"),
            values: columns.map(k => +d[k])
        })),
        dates: columns.map(d => new Date(d))
    }
    
    x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right])
    
    y = d3.scaleLinear()
        .domain([(-d3.max(data.series, d => d3.max(d.values)))*2, d3.max(data.series, d => d3.max(d.values))*2]).nice()
        .range([height - margin.bottom, margin.top])
    
    xAxis = g => g
        .attr("transform", `translate(0,${height/2 - margin.bottom/2 + margin.top/2})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))
    
    line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => x(data.dates[i]))
        .y(d => y(d))
    
    var svg = d3.select("#first-chart");
    // .attr("viewBox", [0, 0, width, height])
    // .style("overflow", "visible");
    
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
    
    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(data.series)
    .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.values));

    svg.append("line")
        .attr("x1", x(new Date('03-17')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('03-17')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('05-10')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('05-10')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");

    svg.append("line")
        .attr("x1", x(new Date('10-30')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('10-30')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('12-14')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('12-14')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");

    const dot = svg.append("g")
        .attr("display", "none");
  
    dot.append("circle")
        .attr("r", 2.5);
  
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);

    svg.on("mousemove", function(event, datum) {
        // event.preventDefault();
        const pointer = d3.pointer(event, this);
        const xm = x.invert(pointer[0]);
        const ym = y.invert(pointer[1]);
        const i = d3.bisectCenter(data.dates, xm);
        const s = d3.least(data.series, d => Math.abs(d.values[i] - ym));
        path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
        dot.attr("transform", `translate(${x(data.dates[i])},${y(s.values[i])})`);
        dot.select("text").text(s.name);
    })
    .on("mouseenter", function() {
        path.style("mix-blend-mode", null).attr("stroke", "#ddd");
        dot.attr("display", null);
    })
    .on("mouseleave", function() {
        path.style("mix-blend-mode", "multiply").attr("stroke", null);
        dot.attr("display", "none");
    });

    const annotations = [
        {
            type: d3.annotationCalloutCircle,
            note: {
                // label: "May 10th 2020",
                label: "pm25 levels drop below 2019 levels",
                align: "left",  // try right or left
                wrap: 200,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower          
            },
            subject: {
                radius: 15
            },
            x: x(new Date('06-9')),
            y: 220,
            dy: -100,
            dx: 100
        },
        {
            type: d3.annotationCalloutCircle,
            note: {
                label: "pm25 levels increase possibly due to colder winter",
                align: "left",  // try right or left
                wrap: 200,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower          
            },
            subject: {
                radius: 15
            },
            x: x(new Date('11-7')),
            y: 220,
            dy: 150,
            dx: -250
        }
    ].map(function(d){ d.color = "#E8336D"; return d})
          
    // Add annotation to the chart
    const makeAnnotations = d3.annotation().annotations(annotations)
    svg.append("g")
        .call(makeAnnotations)


    return svg.node();
})


/**
 * Lockdown Charts.
 */
raw_data.then(function(raw_data) {
    const columns = raw_data.columns.slice(2);
    const data = {
        dates: columns.map(d => new Date(d))
    }

    x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right])

    var svg = d3.select("#lockdown-chart").attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible");
    
    svg.append("g").call(xAxis);

    // const annotations = [
    //     {
    //         note: {
    //             label: "Here is the annotation label",
    //             title: "Annotation title"
    //         },
    //         x:  x(new Date('05-10')),
    //         y: 100,
    //         dy: 100,
    //         dx: 100
    //     }
    // ]
    
    // // Add annotation to the chart
    // const makeAnnotations = d3.annotation()
    //     .annotations(annotations)
    // svg.call(makeAnnotations)

    const annotations = [
        {
            note: {
                // label: "May 10th 2020",
                title: "May 10th 2020: First Lockdown Ended",
                align: "middle",  // try right or left
                wrap: 200,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower          
            },
            connector: {
                end: "dot",
                type: "curve",
                //can also add a curve type, e.g. curve: d3.curveStep
                points: d3.curveStep()
            },
            x: x(new Date('05-10')),
            y: 220,
            dy: -150,
            dx: 50
        },
        {
            note: {
                title: "March 17th 2020: First Lockdown Announced"
            },
            connector: {
            end: "dot",
            type: "curve",
            //can also add a curve type, e.g. curve: d3.curveStep
            points: d3.curveStep()
          },
            x: x(new Date('03-17')),
            y: 220,
            dy: -200,
            dx: 190
        },
        {
            note: {
                title: "October 30th 2020: Second Lockdown Announced",
                wrap: 200,
            },
            connector: {
            end: "dot",
            type: "curve",
            //can also add a curve type, e.g. curve: d3.curveStep
            points: d3.curveStep()
          },
            x: x(new Date('10-30')),
            y: 220,
            dy: 200,
            dx: -175
        },
        {
            note: {
                title: "December 14th 2020: Second Lockdown Ended",
                wrap: 50,
                padding: 10
            },
            connector: {
            end: "dot",
            type: "curve",
            //can also add a curve type, e.g. curve: d3.curveStep
            points: d3.curveStep()
          },
            x: x(new Date('12-14')),
            y: 220,
            dy: 150,
            dx: -150
        }
    ].map(function(d){ d.color = "#E8336D"; return d})
          
    // Add annotation to the chart
    const makeAnnotations = d3.annotation().annotations(annotations)
    svg.append("g")
        .call(makeAnnotations)
    
    svg.append("line")
        .attr("x1", x(new Date('03-17')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('03-17')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.5)
        .style("stroke", "gray")
        .style("stroke-dasharray", ("3, 3"))
        .style("fill", "none");

    svg.append("line")
        .attr("x1", x(new Date('05-10')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('05-10')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.5)
        .style("stroke", "gray")
        .style("stroke-dasharray", ("3, 3"))
        .style("fill", "none");

    svg.append("line")
        .attr("x1", x(new Date('10-30')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('10-30')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.5)
        .style("stroke", "gray")
        .style("stroke-dasharray", ("3, 3"))
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('12-14')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('12-14')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.5)
        .style("stroke", "gray")
        .style("stroke-dasharray", ("3, 3"))
        .style("fill", "none");

    return svg.node();
})



const raw_data2 = d3.csv("data/waqi_covid_clean_pm10_pivot.csv");
raw_data2.then(function(raw_data) {
    const columns = raw_data.columns.slice(2);
    const data = {
        y: "Year-over-year ∆pm10 from 2019",
        series: raw_data.map(d => ({
            name: d.City.replace(/, ([\w-]+).*/, " $1"),
            values: columns.map(k => +d[k])
        })),
        dates: columns.map(d => new Date(d))
    }
    
    x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right])
    
    y = d3.scaleLinear()
        .domain([-d3.max(data.series, d => d3.max(d.values)), d3.max(data.series, d => d3.max(d.values))]).nice()
        .range([height - margin.bottom, margin.top])
    
    xAxis = g => g
        .attr("transform", `translate(0,${height/2 - margin.bottom/2 + margin.top/2})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))
    
    line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => x(data.dates[i]))
        .y(d => y(d))
    
    var svg = d3.select("#second-chart").attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible");
    
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
    
    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .selectAll("path")
        .data(data.series)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.values))
    
        svg.append("line")
        .attr("x1", x(new Date('03-17')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('03-17')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('05-10')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('05-10')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");

    svg.append("line")
        .attr("x1", x(new Date('10-30')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('10-30')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('12-14')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('12-14')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    // svg.call(hover, path);


    const annotations = [
        {
            type: d3.annotationCalloutCircle,
            note: {
                // label: "May 10th 2020",
                label: "pm10 levels drop below 2019 levels",
                align: "left",  // try right or left
                wrap: 200,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower          
            },
            subject: {
                radius: 15
            },
            x: x(new Date('06-10')),
            y: 220,
            dy: -100,
            dx: 100
        },
        {
            type: d3.annotationCalloutCircle,
            note: {
                // label: "May 10th 2020",
                label: "pm10 levels increase possibly due to colder winter",
                align: "left",  // try right or left
                wrap: 200,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower          
            },
            subject: {
                radius: 15
            },
            x: x(new Date('11-8')),
            y: 220,
            dy: 150,
            dx: -200
        }
    ].map(function(d){ d.color = "#E8336D"; return d})
          
    // Add annotation to the chart
    const makeAnnotations = d3.annotation().annotations(annotations)
    svg.append("g")
        .call(makeAnnotations)

    return svg.node();
})


const raw_data3 = d3.csv("data/waqi_covid_clean_pm1_pivot.csv");
raw_data3.then(function(raw_data) {
    const columns = raw_data.columns.slice(2);

    const data = {
        y: "Year-over-year ∆NO2 From 2019",
        series: raw_data.map(d => ({
            name: d.City.replace(/, ([\w-]+).*/, " $1"),
            values: columns.map(k => +d[k])
        })),
        dates: columns.map(d => new Date(d))
    }

    x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right])
    
    y = d3.scaleLinear()
        .domain([-d3.max(data.series, d => d3.max(d.values))*5, d3.max(data.series, d => d3.max(d.values))*5]).nice()
        .range([height - margin.bottom, margin.top])
    
    xAxis = g => g
        .attr("transform", `translate(0,${height/2 - margin.bottom/2 + margin.top/2})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))
    
    line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => x(data.dates[i]))
        .y(d => y(d))
    
    var svg = d3.select("#third-chart").attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible");
    
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
    
    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .selectAll("path")
        .data(data.series)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.values));
        svg.append("line")
        .attr("x1", x(new Date('03-17')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('03-17')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('05-10')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('05-10')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");

    svg.append("line")
        .attr("x1", x(new Date('10-30')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('10-30')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('12-14')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('12-14')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");


        const annotations = [
            {
                type: d3.annotationCalloutCircle,
                note: {
                    // label: "May 10th 2020",
                    label: "NO2 levels drop almost as soon as lockdown announced",
                    align: "left",  // try right or left
                    wrap: 200,  // try something smaller to see text split in several lines
                    padding: 10   // More = text lower          
                },
                subject: {
                    radius: 15
                },
                className: "show-bg",
                x: x(new Date('03-24')),
                y: 220,
                dy: -100,
                dx: 150
            }
        ].map(function(d){ d.color = "#E8336D"; return d})
              
    // Add annotation to the chart
    const makeAnnotations = d3.annotation().annotations(annotations)
    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations)

    // svg.call(hover, path);

    return svg.node();
})

const raw_data4 = d3.csv("data/waqi_covid_clean_temp_pivot.csv");
raw_data4.then(function(raw_data) {
    const columns = raw_data.columns.slice(2);


    const data = {
        y: "Year-over-year ∆Temperature From 2019",
        series: raw_data.map(d => ({
            name: d.City.replace(/, ([\w-]+).*/, " $1"),
            values: columns.map(k => +d[k])
        })),
        dates: columns.map(d => new Date(d))
    }

    
    x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right])
    
    y = d3.scaleLinear()
        .domain([-d3.max(data.series, d => d3.max(d.values)), d3.max(data.series, d => d3.max(d.values))]).nice()
        .range([height - margin.bottom, margin.top])
    
    xAxis = g => g
        .attr("transform", `translate(0,${height/2 - margin.bottom/2 + margin.top/2})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))
    
    line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => x(data.dates[i]))
        .y(d => y(d))
    
    var svg = d3.select("#fourth-chart").attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible");
    
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
    
    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .selectAll("path")
        .data(data.series)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.values));
    
        svg.append("line")
        .attr("x1", x(new Date('03-17')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('03-17')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('05-10')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('05-10')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");

    svg.append("line")
        .attr("x1", x(new Date('10-30')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('10-30')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");
    
    svg.append("line")
        .attr("x1", x(new Date('12-14')))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", x(new Date('12-14')))  //<<== and here
        .attr("y2", height - margin.bottom)
        .style("stroke-width", 0.25)
        .style("stroke", "gray")
        .style("fill", "none");

    // svg.call(hover, path);

    return svg.node();
})
