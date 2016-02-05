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
    makeMap();

});

function makeMap() {
    var width = ($("#texas-map").width());
    var height = width;


    var svg = d3.select("#texas-map").append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geo.mercator();

    var path = d3.geo.path()
        .projection(projection
            .center([(-106.64546828199987 - 93.50803251699989) / 2, (25.837048983000045 + 36.500568855000154) / 2])
            .translate([width / 2, height / 2])
            .scale(1500));

    var g = svg.append("g");

    d3.json("texas-map.json", function(error, topology) {

        g.selectAll("path")
            .data(topojson.object(topology, topology.objects.tx_counties)
                .geometries)
            .enter()
            .append("path")
            .attr("d", path);

    });
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
    d3.layout.cloud().size([$("#word-cloud").width(), 400])
        .words(find_common_words(dataset))
        .rotate(function() {
            return 0;
        })
        .font("Impact")
        .fontSize(function(d) {
            return 10 + d.size / 5;
        })
        .on("end", drawcloud)
        .start();



    function drawcloud(words) {
        var cloud = d3.select("#word-cloud").append("svg")
            .attr("width", $("#word-cloud").width())
            .append("g")
            .attr("transform", "translate(" + $("#word-cloud").width() / 2 + "," + (400 / 2) + ")")
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
