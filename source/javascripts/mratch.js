"use strict";
// Bar chart animations
//

/* Simulation settings */

var pop_size = 200; 
var s = 0.01;
var u = 0.12;
var kmax = 24;

/* Bar chart settings */

var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 670 - margin.left - margin.right,
            height = 530 - margin.top - margin.bottom;

var x_scale = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

var y_scale = d3.scale.linear()
        .range([height, 0]);

x_scale.domain(d3.range(0, kmax));

y_scale.domain([0, pop_size]);

var xAxis = d3.svg.axis()
        .scale(x_scale)
        .orient("bottom");

var yAxis = d3.svg.axis()
        .scale(y_scale)
        .orient("left")
        .ticks(4);

var svg_bar = d3.select("#svgarea3").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add axes
svg_bar.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg_bar.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Number of individuals");

/* Utility functions */

// Takes an array of individuals with n mutations and maps #n_mutations
// :individuals_with_n_mutations.
function make_mutation_map(data){
    var dmap = d3.map();
    for (var i = 0; i < data.length; i++){
        dmap.set(data[i], 
                    dmap.has(data[i]) ? dmap.get(data[i]) + 1 
                                      : 1
                );
    }
    //console.log("data_map is:", dmap);
    return dmap;
}

// Populate new generation of equal size through simple selection.
function pickParents_2(data){
    var new_pop = [];
    while (new_pop.length < data.length){
        var n = Math.floor(Math.random() * data.length);
        var fitness = Math.pow((1 - s), data[n]);
        if (fitness >= Math.random()){
            new_pop.push(data[n]);
        }
    }
    return new_pop;
}

// Add mutations to an array, sampling from Poisson distribution
// with delta = mutation rate, 'u'.
function add_mutations_2(data){
    for (var i = 0; i < data.length; i++){
            var L = Math.exp(-u);
            var k = 0;
            var p = 1.0;

            do {
              k++;
              p *= Math.random();
            } while (p > L);

            data[i] += (k - 1);

            if (data[i] > (kmax - 1)){
                data[i] = kmax - 1;
            }
    }
    return data;
}

    


/* Begin simulation! */
var dataset = Array.apply(null, new Array(pop_size)).map(Number.prototype.valueOf,0);

var data_map = make_mutation_map(dataset);

var dummydata = Array.apply(null, new Array(pop_size)).map(
        function(){
            return Math.floor(Math.random() * kmax);
        }
    );


// This is hacky... later on migrate this to the window.onload()

setTimeout(function(){
    run_sim();
}, 1000);

function run_sim(){
    setInterval(function(d){
        dataset = add_mutations_2(dataset, data_map);
        if (d3.min(dataset) == kmax - 1){
            console.log("fin");
            dataset = Array.apply(null, new Array(pop_size)).map(Number.prototype.valueOf,0);
        }
        update_barchart(dataset);
        /*
        var shuffled = d3.shuffle(dummydata);
        update_barchart(shuffled);
        */
    }, 700);
}

//update_barchart(dummydata);


// Takes a vector of ints (representing # mutations of individuals)
// of length pop_size. Counts number of occurences of n mutations
// and updates the bar chart.
function update_barchart(d){

    // Count frequency of n-mutations and bin them.
    function aggr(arr) {
        var res = Array.apply(null, new Array(kmax)).map(Number.prototype.valueOf, 0);
        for (var i = 0; i < arr.length; i++){
            res[arr[i]]++;
        }
        return res;
    }
    var data = aggr(d);
    //console.log("charting:", data);

    // Define selection for our bar charts
    var bars = svg_bar.selectAll(".bar")
                           .data(data);

    // ENTER
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d,i) { 
            //console.log("bar", i, "at position", x_scale(i));
            return x_scale(i); })
        .attr("y", height)
        .attr("width", x_scale.rangeBand())
        .attr("height", 0)
       .transition()
       .duration(700)
        .attr("y", function(d) { return y_scale(d); })
        .attr("height", function(d, i) { 
            //console.log(i, "entered as", d);
            return height - y_scale(d); 
        });


    // UPDATE
    bars.transition()
        .duration(700)
        .attr("y", function(d) {
                 return y_scale(d);
             })
        .attr("height", function(d,i) { 
            //console.log(i, "updating to", d);
            return height - y_scale(d);} 
            );

    // EXIT
    bars.exit()
        .attr("class", "exit")
        .transition()
        .duration(1000)
        .style("fill-opacity", 1e-6)
        .remove();
};

