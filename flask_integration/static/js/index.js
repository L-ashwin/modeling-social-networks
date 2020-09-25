let forceGraph, display;
let width, height;
let dataset = {};
let index = 0, num_iterations = null;

/***********************************************************/

function setup(){
    width = window.innerWidth;
    height = window.innerHeight;

    num_iterations = Object.keys(data).length;

    create_dataset();

    display = new Display();
    display.setup();

    forceGraph = new ForceGraph();
    forceGraph.setup();
}

/***********************************************************/

function render(){
    display.render();
    d3.select('#progress_bar').styles({ 'width': 100*(index/num_iterations)+'%' })
}

/***********************************************************/

function next(){
    if(index < num_iterations-1){ index++; }
    update();
}

function prev(){
    if(index > 0){ index--; }
    update();
}

/***********************************************************/

function update(){
    update_dataset();
    display.setup();
    forceGraph.update();
}

/***********************************************************/

// function step(){
//     let index = parseInt(Math.random()*(dataset.links.length));
//     dataset.links.splice(index, 2);
//     display.setup();
//     forceGraph.update();
// }

/***********************************************************/

function create_dataset(){
    let temp = data[index];
    let num_nodes = temp.nodes.length;
    let num_links = temp.edges.length;

    dataset.nodes = [];
    for(let i = 0; i < num_nodes; i++){
        dataset.nodes.push({ 'id': temp.nodes[i], 'bias': temp.bias[i] });
    }

    dataset.links = [];
    for(let i = 0; i < num_links; i++){
        dataset.links.push({ 'source': temp.edges[i][0], 'target': temp.edges[i][1] });
    }
}

/***********************************************************/

function update_dataset(){
    let temp = data[index];
    let num_nodes = temp.nodes.length;
    let num_links = temp.edges.length;

    for(let i = 0; i < num_nodes; i++){
        dataset.nodes[i].bias = temp.bias[i];
    }

    dataset.links = [];
    for(let i = 0; i < num_links; i++){
        dataset.links.push({ 'source': temp.edges[i][0], 'target': temp.edges[i][1] });
    }
}

/***********************************************************/

$('document').ready(function(){
    setup();
})