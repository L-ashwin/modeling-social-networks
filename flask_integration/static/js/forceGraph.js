function ForceGraph(){}

/***********************************************************/

ForceGraph.prototype.setup = function(){
    this.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-1))
        .force("center", d3.forceCenter(0, 0));

    this.simulation
        .nodes(dataset.nodes)
        .on("tick", render);
                    
    this.simulation
        .force("link")
        .links(dataset.links);
}

/***********************************************************/

ForceGraph.prototype.update = function(){
    this.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-1))
        .force("center", d3.forceCenter(0, 0))
        .alpha(0.3)
        .alphaTarget(0)
        .restart()
        .stop();

    this.simulation
        .nodes(dataset.nodes)
        .on("tick", render)
                    
    this.simulation
        .force("link")
        .links(dataset.links)
    
    render();
}
