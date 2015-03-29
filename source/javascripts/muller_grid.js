"use strict";

//TODO: delete matrix once we've reached saturation


/* Default settings for Muller's Ratchet */
//  Rate of Muller's ratchet is specified by
//  - population size (pop_size)
//  - selection coefficient (s)
//  - mutation rate (u)
//  Additionally we specify a max number of mutations kmax for
//  graphic purposes.
var pop_size = 100; 
var s = 0.01;
var u = 0.12;
var kmax = 8;

/* Display settings */
var pixel_size = 20;
var svg_height = 400;
var svg_width = 720;

var colour_scale = d3.scale.linear()
                    .domain([0, kmax])
                    .range(['white', 'red']);

var svg = d3.select("#svgarea").append("svg")
    .attr("id", "svg_display")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .append("g")
    .attr("transform", "translate(2," + pixel_size + ")");

var helpertext = svg.append('text')
                    .attr('id', 'helpertext')
                    .attr('x', 10)
                    .attr('y', -3)
                    .attr('font-size', "15px");

/* 'Main' function */
window.onload=function(){

    var pop = initialise_population();
    update_view(pop);

    // The 'Event loop'.
    // 1) Apply new mutations and display them.
    // 2) Select parents for new generation and highlight them.
    // 3) Generate the new generation and display them. Repeat at (1).
    //

    setInterval(function(d){
        pop = add_mutations(pop);
        // Are we finished yet?
        if (d3.min(pop, function(d) { return d.mu }) == (kmax - 1)){
          console.log("we done here yo");
          pop = initialise_population();
        }
        update_view(pop);

    }, 1000);
}

/* Calculations */
function calc_row_n(n){
    // Calculate number of pixels to display per row.
    // Return a factor of n closest to sqrt(n). This will give the most
    // square-ish grid of pixels. If this value exceeds the max
    // number of pixels that will fit in a row, use the max instead.

    var pixel_max = Math.floor(svg_width / (pixel_size * 1.2));
    var x = Math.ceil(Math.sqrt(n));
    while (n % x){
        x++; // If svg is taller than long, do x-- instead.
    }
    var res = (x > 1 && x < pixel_max) ? x : pixel_max;
    
    return res;
}


function initialise_population(){
    var pop = [];
    var pix_per_row = calc_row_n(pop_size);
    for (var idx = 0; idx < pop_size; idx++){
        pop.push({i:Math.floor(idx/pix_per_row), j:idx%pix_per_row, mu:0});
    }
    return pop;
}

// Populate new generation of equal size through simple selection.
function pickParents(data){
    var parents = data.slice()
    var new_pop = [];
    var parent_index = new Set();
    while (new_pop.length < data.length){
        var n = Math.floor(Math.random() * data.length);
        var fitness = Math.pow((1 - s), (data[n]).mu);
        if (fitness >= Math.random()){
            new_pop.push(data[n]);
            parent_index.add(n);
        }
    }

    // We're done populating, now remove parents from the original
    // array so we can do fun display things.
    parent_index.forEach(function(element, index) {
        parents.splice(element, 1);
    });
    return [parents, new_pop];
}

// Add mutations to an array, sampling from Poisson distribution
// with delta = mutation rate, 'u'.
function add_mutations(data){
    for (var i = 0; i < data.length; i++){
            var L = Math.exp(-u);
            var k = 0;
            var p = 1.0;

            do {
              k++;
              p *= Math.random();
            } while (p > L);
            
            if (data[i].mu < kmax){
                data[i].mu += (k - 1);
            }
    }
    return data;
}

// 'Kill' individuals with kmax mutations. Testing function only.
function purge_mutants(data){
    for (var i = data.length; i--;){
        if (data[i].mu == kmax){
            data.splice(i,1);
        }
    }
    return data;
}


/* Visualisation */
function update_view(data) {
    var population = svg.selectAll("rect")
                .attr('class', 'pixel')
                .data(data);

    d3.select("#helpertext")
        .text(function(d){
            return "Least loaded class: " + 
             d3.min(data, function(d) { return d.mu }) +
            " mutations."
        });

    helpertext.moveToFront();

    // UPDATE
    population.attr("class", "update")
            .transition()
            .duration(750)
             .attr('y', function(d) { return d.i * pixel_size * 1.2;})
             .attr('x', function(d) { return d.j * pixel_size * 1.2;})
             .style('fill', function(d) { return colour_scale(d.mu); }) ;

  // ENTER
        population.enter().append("rect")
        .attr('class', 'pixel')

    .style('fill', function(d) { return colour_scale(d.mu); })
        .style('stroke', 'rgb(255,255,255)')
       .transition()
       .duration(1500)
        .attr('width', pixel_size)
        .attr('height', pixel_size)
        .style('stroke', 'rgb(0,0,0)')
        .style('stroke-width', 1)
        .attr('y', function(d) { return d.i * pixel_size * 1.2;})
        .attr('x', function(d) { return d.j * pixel_size * 1.2;});

  // EXIT
  population.exit()
        .attr("class", "exit")
        .transition()
        .duration(1000)
      //  .attr('width', 0)
      //  .attr('height', 0)
      //  .style('stroke-width', 0)
      //  .style("fill-opacity", 1e-6)
        .remove();
}


/*HELPER FUNCTIONS*/

d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
              this.parentNode.appendChild(this);
                });
};
