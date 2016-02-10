var fill = d3.scale.category20();
var dataset = [];

d3.json("texas.json", function(error, json) {
    if (error) {
        alert(error);
    }

    var dataset = json;

    //c.log(JSON.stringify(find_common_words(dataset)));


    generatecloud(dataset);
    generate_random_quotes(dataset);
    generateracepie(dataset);
    makeMap(dataset);

    makeAgeGraph(dataset);
    drawLineGraph(dataset);
});

function drawLineGraph(d) {
    height = 400;
    width = 400;

    perYear = getYears(d);

    listYears = [];
    for (var y = 1982; y <= (new Date().getFullYear()); y++) {
        listYears.push(y);
    }

    var x = d3.time.scale()
        .domain([1982, (new Date().getFullYear())])
        .range([0, width]);

        //.domain([1982, (new Date().getFullYear())])

    console.log(d3.time.years(1982, 2016));


    var y = d3.scale.linear()
        .domain([0, d3.max(listYears.map(function(year) {
            return perYear[year];
        }))])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function(a) {
            return x(a);
        })
        .y(function(a) {
            return y(perYear[a]);
        });

    var svg = d3.select("#time-graph").append("svg")
        .attr("width", width + 60)
        .attr("height", height + 60)
        .append("g")
        .attr("transform", "translate(" + 30 + "," + 30 + ")");

    svg.append("path")
        .datum(listYears)
        .attr("class", "line")
        .attr("d", line);

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}

function getYears(d) {

    var format = d3.time.format("%m/%-d/%Y")

    var years = d.map(function(a) {
        return d3.time.year.floor(format.parse(a["Date"]))
    });

    console.log(d3.time.year.range(d3.min(years),d3.max(years)));

    perYear = {};
    for (var y = 1982; y <= (new Date().getFullYear()); y++) {
        perYear[y] = 0;
    }

    for (var i = 0; i < years.length; i++) {
        perYear[years[i]] += 1;
    }

    return perYear;
}




function getAgeData(d) {
    return d.map(function(c) {
        return parseInt(c["Age"]);
    });
}

function makeAgeGraph(d) {
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 30
    };
    var width = Math.min(600, ($("#age-chart").width()) * 0.8) - margin.left - margin.right;
    var height = Math.min(600, ($("#age-chart").width()) * 0.8) - margin.top - margin.bottom;

    values = getAgeData(d);

    var x = d3.scale.linear()
        .domain([0, (d3.max(values) - d3.min(values))])
        .range([0, width]);

    var x2 = d3.scale.linear()
        .domain([d3.min(values), d3.max(values)])
        .range([0, width]);



    var data = d3.layout.histogram()
        .bins(x2.ticks(30))
        (values);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) {
            return d.y;
        })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x2)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(8)
        .orient("left");



    var svg = d3.select("#age-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", function(d) {
            return "translate(" + x2(d.x) + "," + y(d.y) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", function(d) {
            return height - y(d.y);
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(yAxis);
}




function makeMap(d) {
    var width = Math.min(600, ($("#texas-map").width()) * 0.8);
    var height = width;



    var svg = d3.select("#texas-map").append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geo.mercator();

    var path = d3.geo.path()
        .projection(projection
            .center([(-106.64546828199987 - 93.50803251699989) / 2, (25.837048983000045 + 36.500568855000154) / 2])
            .translate([width / 2, height / 2])
            .scale(width * 5));

    var g = svg.append("g");

    d3.json("texas-map.json", function(error, topology) {

        county_nums = matchCounties(d, topology);

        console.log();

        var color = d3.scale.linear()
            .domain([0, Math.max.apply(null, Object.keys(county_nums).map(function(key) {
                return county_nums[key];
            })) / 4])
            .range(["#F4C2C2", "#701C1C"]);

        //console.log(county_nums);

        //console.log(JSON.stringify(topojson.object(topology, topology.objects.tx_counties).geometries[0]["properties"]["COUNTY"]));


        $.each(topojson.object(topology, topology.objects.tx_counties).geometries, function(i, county) {
            svg.append("path")
                .datum(county)
                .attr("d", path)
                .attr("fill", color(county_nums[county["properties"]["COUNTY"]]));
        });

        /*g.selectAll("path")
            .data(topojson.object(topology, topology.objects.tx_counties)
                .geometries)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", color(i));
        //.style("fill", );*/

    });
}

function matchCounties(d, t) {
    var county_names = {};

    for (var i = 0; i < t.objects.tx_counties.geometries.length; i++) {
        //console.log(t.objects.tx_counties.geometries[i].properties.COUNTY.slice(0,-7));
        county_names[t.objects.tx_counties.geometries[i].properties.COUNTY] = 0;
    }


    for (var j = 0; j < d.length; j++) {
        if ((d[j].County + " County") in county_names) {
            county_names[(d[j].County + " County")] += 1;
        }
    }
    return county_names;
}


function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'text': prop,
                'size': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) {
        return a.size - b.size;
    });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}


function generate_random_quotes(d) {

    quotes = d.map(function(c) {
        return [c["Last Statement"], c["First Name"] + " " + c["Last Name"] + ", " + c["Date"]];
    })

    randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    $('#quoteblock').addClass('animated fadeInDown').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        $(this).removeClass('animated fadeInDown');
    });
    $('#quote').text(randomQuote[0]);
    $('#author').text(randomQuote[1]);
    while ($('#quoteblock').height() > ($('#quoteblock').parent().height()) - 30) {
        $('#quoteblock').css('font-size', (parseInt($('#quoteblock').css('font-size')) - 1) + "px");
    }




    setInterval(function() {
        randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        $('#quoteblock').addClass('animated fadeOutDown').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass('animated fadeOutDown');
            $('#quote').text(randomQuote[0]);
            $('#author').text(randomQuote[1]);
            $('#quoteblock').css('font-size', "60px");
            while ($('#quoteblock').height() > ($('#quoteblock').parent().height()) - 30) {
                $('#quoteblock').css('font-size', (parseInt($('#quoteblock').css('font-size')) - 1) + "px");
            }
            $('#quoteblock').addClass('animated fadeInDown').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $(this).removeClass('animated fadeInDown');
            });
        });
    }, 10000);
};

function generateracepie(d) {
    var width = Math.min(400, $("#pie-graph").width() * 0.8);
    var height = width;
    var donutWidth = 75;
    var innerRadius = (Math.min(width, height) / 2) - donutWidth;
    var color = d3.scale.category10();
    var total_num = d.length;
    var save = sort_races(d);

    console.log(JSON.stringify(save));

    var svg = d3.select('#pie-graph')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + ($("#pie-graph").width() / 2) + ',' + (height / 2) + ')');

    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(function(d) {
            return innerRadius + 60;
        });

    var pie = d3.layout.pie()
        .value(function(d) {
            return d.size;
        })
        .sort(null);

    var path = svg.selectAll('path')
        .data(pie(sortObject(sort_races(d)).reverse()))
        .enter()
        .append('path')
        .attr('fill', function(d, i) {
            return color(d.data.text);
        })
        .transition().delay(function(d, i) {
            return i * 500;
        }).duration(500)
        .attrTween('d', function(d) {
            var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    var legendRectSize = 18;
    var legendSpacing = 4;

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * color.domain().length / 2;
            var horz = -3.2 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) {
            return d + " - " + parseFloat(save[d] / total_num * 100).toFixed(2) + "%";
        });
}

function sort_races(d) {
    racecount = {};

    for (var j = 0; j < d.length; j++) {
        if (d[j]["Race"] in racecount) {
            racecount[d[j]["Race"]] += 1;
        } else {
            racecount[d[j]["Race"]] = 1;
        }
    }

    return racecount;

}


function find_common_words(d) {
    var wordcounts = {};
    for (var i = 0; i < d.length; i++) {

        var wordsplit = d[i]["Last Statement"].toUpperCase().match(/\w+/g);
        for (var j = 0; j < wordsplit.length; j++) {
            if (wordsplit[j] in wordcounts) {
                wordcounts[wordsplit[j]] += 1;
            } else {
                wordcounts[wordsplit[j]] = 1;
            }
        }
    }

    var brokens = {
        "LL": "Y'ALL",
        "WASN": "WASN'T",
        "DON": "DON'T",
        "DIDN": "DIDN'T"
    }

    for (var a in brokens) {
        if (wordcounts[a]) {
            wordcounts[brokens[a]] = wordcounts[a];
        }
    }

    for (var k = 0; k < stop_words.length; k++) {
        delete wordcounts[stop_words[k].toUpperCase()];
    }

    for (var key in wordcounts) {
        if (wordcounts[key] < 10) {
            delete wordcounts[key];
        }
    }

    return sortObject(wordcounts).reverse();
};


function generatecloud(dataset) {
    var height = Math.min(600, ($("#word-cloud").width()) * 0.8);
    d3.layout.cloud().size([$("#word-cloud").width() * 0.8, height])
        .words(find_common_words(dataset))
        .rotate(function() {
            return 0;
        })
        .font("Impact")
        .fontSize(function(d) {
            return 12 + d.size / 5;
        })
        .on("end", drawcloud)
        .start();



    function drawcloud(words) {

        var cloud = d3.select("#word-cloud").append("svg")
            .attr("width", $("#word-cloud").width())
            .append("g")
            .attr("transform", "translate(" + $("#word-cloud").width() / 2 + "," + (height / 2) + ")")
            .selectAll("text")
            .data(words)


        cloud.enter().append("text")
            .style("font-family", "Impact")
            .style("fill", function(d, i) {
                return fill(i);
            })
            .attr("text-anchor", "middle")
            .attr('font-size', 1)
            .text(function(d) {
                return d.text;
            });

        cloud.transition()
            .duration(600)
            .style("font-size", function(d) {
                return d.size + "px";
            })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("fill-opacity", 1);

        //Exiting words
        cloud.exit()
            .transition()
            .duration(200)
            .style('fill-opacity', 1e-6)
            .attr('font-size', 1)
            .remove();
    };
};
