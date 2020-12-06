/*************************************************************************/

function Display(){}

/*************************************************************************/

Display.prototype.setup = function(svg_id, data){
    this.canvas = d3.select('#'+svg_id);

    this.canvas
        .attrs({ 'viewBox': '-100 -100 200 200' });

    d3.selectAll('.links').remove();
    d3.selectAll('.nodes').remove();

    this.links = this.canvas.append("g")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("class", "links")

    this.nodes = this.canvas.append("g")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("class", "nodes")
        .attrs({ "r": d => 2 })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );
}

/*************************************************************************/

Display.prototype.update = function(){
    this.links
        .styles({ 
            'stroke': d => ['gray', 'black'][d.active], 
            'stroke-opacity': 0.7,
            'stroke-width': d => { if(d.active){ return weight2width(0.4); }; return weight2width(d.weight) },
            // 'stroke-dasharray': d => { if(d.active){ return '2 2' } }
        })

    this.nodes
        .styles({ 
            'fill': d => d3.interpolateRdBu(0.5*(1+d.opinion)), 
            'fill-opacity': 0.9, 
            'stroke': d => { if(d.infected){ return 'black' }; if(d.susceptible){ return 'black' }; }, 
            'stroke-width': d => { if(d.infected || d.susceptible){ return 0.5 } },
            'stroke-dasharray': d => { if(d.susceptible){ return '1 1' } }
        })
}

/*************************************************************************/

Display.prototype.render = function(){
    this.links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

    this.nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
}

/*************************************************************************/

function dragstarted(event) {
    if (!event.active) forceGraph.simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

function dragended(event) {
    if (!event.active) forceGraph.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}

/*************************************************************************/