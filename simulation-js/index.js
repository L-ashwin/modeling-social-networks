/*************************************************************************/

let display = null;
let forceGraph = null;
let murata = null;
let dataset = { 'nodes': [], 'links': [] };

let weight2width = d3.scaleLinear().domain([0,1]).range([0.01, 1]);
let weight2strength = d3.scaleLinear().domain([0,1]).range([0.01, 4]);
let charge = -10;

let width = null;
let height = null;

let showAnimation = false;
let speed = 'slow';
let news_index = 0;
let graph = 'ER';
let news_polarization = 'high';
let tolerance = 'low';

let simulation_running = false;

/*************************************************************************/

function setup(){
    news_index = 0;
    d3.select('#news_count').html('News Count: ' + news_index);

    murata = new Murata();
    murata.setup(graph, news_polarization, tolerance);
    create_dataset(murata);

    forceGraph = new ForceGraph();
    forceGraph.setup(dataset);

    display = new Display();
    display.setup('canvas', dataset);
    display.update();
}

/*************************************************************************/

function render(){
    display.render();
}

/*************************************************************************/

function update(){
    if(!simulation_running){ return }
    news_index++;
    d3.select('#news_count').html('News Count: ' + news_index);
    propagation_data = murata.propagate();

    // let strengths_array = Object.values(murata.get_strengths());
    // if(news_index % 1 == 0){
    //     let temp_val = 0.5*math.mean(strengths_array);
    //     let min_strength = 1 - 4*temp_val > 0.01 ? 1 - 4*temp_val : 0.01;
    //     weight2strength = d3.scaleLinear().domain([0,1]).range([min_strength, 4]);
    // }

    if(showAnimation){
        update_temp_dataset(propagation_data, 0);
        // if(speed == 'fast'){
        //     if(news_index % 10 == 0){ update_temp_dataset(propagation_data, 0); }
        // } else {
        //     update_temp_dataset(propagation_data, 0);
        // }
    } else {
        if(speed == 'fast'){
            if(news_index % 10 == 0){
                update_dataset(murata);
                display.update();
                forceGraph.update(dataset);
            }            
        } else {
            update_dataset(murata);
            display.update();
            forceGraph.update(dataset);
        }

        setTimeout( () => { update(); }, 1000 )
    }
}

/*************************************************************************/

function create_dataset(murata){
    let nodes = murata.get_nodes();
    let edges = murata.get_edges();
    let opinions = murata.get_opinions();
    let strengths = murata.get_strengths();

    dataset.nodes = nodes.map((d) => { return { 'id': d, 'opinion': opinions[d], 'infected': false, 'susceptible': false } });
    dataset.links = [];
    dataset.link_keys = [];

    for(let i = 0; i < edges.end_1.length; i++){
        label = edges.end_1[i] + '_' + edges.end_2[i];
        dataset.links.push({ 'source': edges.end_1[i], 'target': edges.end_2[i], weight: strengths[label], 'active': 0 })
        dataset.link_keys.push(label);
    }
}

/*************************************************************************/

function update_temp_dataset(propagation_data, index){
    for(let i = 0; i < dataset.nodes.length; i++){
        dataset.nodes[i].infected = false;
        dataset.nodes[i].susceptible = false;
    }

    let infected_nodes = propagation_data.infected_nodes_array[index];
    infected_nodes.forEach(d => { dataset.nodes[d].infected = true; })

    let susceptible_nodes = propagation_data.neighbors_susceptibles[index];
    susceptible_nodes.forEach(list => { 
        list.forEach(d => {
            dataset.nodes[d].susceptible = true; 
        })
    })

    for(let i = 0; i < dataset.links.length; i++){
        dataset.links[i].active = 0;
    }

    let active_nodes = propagation_data.active_nodes_array[index];

    for(let i = 0; i < active_nodes.length; i++){
        active_node = active_nodes[i];
        neighbors = susceptible_nodes[i];
        neighbors.forEach(neighbor => {
            let a1 = active_node;
            let a2 = neighbor;
            if(neighbor < active_node){ a1 = neighbor; a2 = active_node; }
            let idx = _.indexOf(dataset.link_keys, a1+'_'+a2);
            dataset.links[idx].active = 1;
        })
    }

    if(simulation_running){ display.update(); }
    else{
        update_dataset(murata);
        display.update();
        forceGraph.update(dataset);
        return
    }

    if(index < propagation_data.infected_nodes_array.length-2){
        setTimeout( () => { update_temp_dataset(propagation_data, index+1) }, 1000 );
    } else {
        setTimeout( () => {
            update_dataset(murata);
            display.update();
            forceGraph.update(dataset);

            setTimeout( () => { update(); }, 1000 )
        }, 1000 );
    }
}

/*************************************************************************/

function update_dataset(murata){
    let opinions = murata.get_opinions();
    let strengths = murata.get_strengths();

    for(let i = 0; i < opinions.length; i++){
        dataset.nodes[i].opinion = opinions[i];
        dataset.nodes[i].infected = false;
        dataset.nodes[i].susceptible = false;
    }

    for(let i = 0; i < dataset.links.length; i++){
        dataset.links[i].weight = strengths[dataset.links[i].source.id+'_'+dataset.links[i].target.id];
        dataset.links[i].active = 0;
    }
}

/*************************************************************************/

function create_event_listeners(){
    d3.select('#graph').on('change', function(){
        graph = d3.select(this).property('value');
        simulation_running = false;
        setup();
    })

    d3.select('#news').on('change', function(){
        news_polarization = d3.select(this).property('value');
        simulation_running = false;
        setup();
    })

    d3.select('#tolerance').on('change', function(){
        tolerance = d3.select(this).property('value');
        simulation_running = false;
        setup();
    })

    d3.select('#animation').on('change', function(){
        let temp = d3.select(this).property('value');
        if(temp == 'true'){ showAnimation = true; }
        else{ showAnimation = false; }
    })

    d3.select('#speed').on('change', function(){
        speed = d3.select(this).property('value');
    })

    d3.select('#start').on('click', function(){
        simulation_running = true;
        update();
    })

    d3.select('#pause').on('click', function(){
        simulation_running = false;
    })

    d3.select('#reset').on('click', function(){
        simulation_running = false;
        setup();
    })
}

/*************************************************************************/

$('document').ready(function(){
    width = 0.9*parseInt(d3.select('#left-pane').style('width'));
    let top = d3.select('#left-pane').property('offsetTop');
    height = innerHeight-top;
    d3.select('#canvas').attrs({ 'width': width, 'height': 0.9*height })

    create_event_listeners();
    setup();
})

