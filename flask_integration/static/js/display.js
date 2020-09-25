function Display(){}

/***********************************************************/

Display.prototype.setup = function(){
    this.canvas = d3.select('#canvas');

    this.canvas
        .attrs({ 'viewBox': '-100 -100 200 200' })
        .styles({ 'width': 0.9*width, 'height': 0.8*height });

    d3.selectAll('.links').remove();
    d3.selectAll('.nodes').remove();

    this.links = this.canvas.append("g")
        .selectAll("line")
        .data(dataset.links)
        .enter().append("line")
        .attr("class", "links")
        .styles({ 'stroke': 'gray', 'stroke-opacity': 0.7, 'stroke-width': 0.2 });

    this.nodes = this.canvas.append("g")
        .selectAll("circle")
        .data(dataset.nodes)
        .enter().append("circle")
        .attr("class", "nodes")
        .attrs({ "r": d => 2 })
        .styles({ 'fill': d => d3.interpolateRdBu(0.5*(1+d.bias)), 'fill-opacity': 0.9, 'stroke': d => d3.interpolateRdBu(0.5*(1+d.bias)), 'stroke-width': 0.5 })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );    
}

/***********************************************************/

Display.prototype.render = function(){
    this.links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    this.nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}

/***********************************************************/

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
