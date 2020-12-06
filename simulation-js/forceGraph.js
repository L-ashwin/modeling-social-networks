/*************************************************************************/

function ForceGraph(){}

/*************************************************************************/

ForceGraph.prototype.setup = function(data){
    this.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).strength(d => weight2strength(d.weight)))
        .force("charge", d3.forceManyBody().strength(charge))
        .force("center", d3.forceCenter(0, 0))

    this.simulation
        .nodes(data.nodes)
        .on("tick", render)
                    
    this.simulation
        .force("link")
        .links(data.links)
}

/*************************************************************************/

ForceGraph.prototype.update = function(data){
    this.simulation
        .nodes(data.nodes)
        .on("tick", render)
                    
    this.simulation
        .force("link")
        .links(data.links)

    this.simulation
        .alpha(0.3)
        .alphaTarget(0)
        .restart()
}

/*************************************************************************/