/*************************************************************************/

function Murata(){}

/*************************************************************************/

Murata.prototype.setup = function(graph, news_polarization, tolerance){


    /*************************************************/
    // Model Parameters

    this.B = 10;
    this.mu = 0.15;
    if(tolerance == 'high'){ this.mu = 0.5; }

    this.update_size = 0.01;
    this.graph = graph;
    this.news_polarization = news_polarization;

    /*************************************************/
    // Create Random Graph

    this.num_nodes = 100;
    this.edges_per_node = 10;

    this.adjacency_list = d3.range(this.num_nodes).map(() => { return [] });
    this.edges = { 'end_1': [], 'end_2': [] };

    /*************************************************/
    // Erdos Renyi

    if(this.graph == 'ER'){
        let p = 2*this.edges_per_node/(this.num_nodes-1);

        for(let i = 0; i < this.num_nodes; i++){
            for(let j = i+1; j < this.num_nodes; j++){
                if(Math.random() <= p){
                    this.adjacency_list[i].push(j);
                    this.adjacency_list[j].push(i);
                    this.edges.end_1.push(i);
                    this.edges.end_2.push(j);
                }
            }
        }    
    }

    /*************************************************/
    // Barabasi Preferential Attachment

    if(this.graph == 'barabasi'){
        for(let i = 0; i < this.edges_per_node; i++){
            for(let j = i+1; j < this.edges_per_node; j++){
                this.adjacency_list[i].push(j);
                this.adjacency_list[j].push(i);
            }
        }

        for(let i = this.edges_per_node; i < this.num_nodes; i++){
            let neighbors = math.pickRandom(
                _.range(this.num_nodes),
                this.edges_per_node,
                _.map(this.adjacency_list, (list) => { return list.length })
            )
            neighbors.forEach((d) => {
                this.adjacency_list[i].push(d);
                this.adjacency_list[d].push(i);
            })
        }

        for(let i = 0; i < this.edges_per_node; i++){
            this.adjacency_list[i] = this.adjacency_list[i].splice(this.edges_per_node-1)
        }

        for(let i = 0; i < this.num_nodes; i++){
            for(let j = 0; j < this.adjacency_list[i].length; j++){
                if(this.adjacency_list[i][j] > i){
                    this.edges.end_1.push(i);
                    this.edges.end_2.push(this.adjacency_list[i][j]);
                }
            }
        }
    }

    /*************************************************/
    // Graph Parameters

    this.num_edges = this.edges.end_1.length;

    this.opinions_array = d3.range(this.num_nodes).map(() => { return -1 + 2*Math.random() });
    this.strengths_array = new Object();

    d3.range(this.num_edges).forEach((i) => {
        end_1 = this.edges.end_1[i];
        end_2 = this.edges.end_2[i];

        temp = 0.5*Math.random();

        key = end_1 + '_' + end_2;
        this.strengths_array[key] = temp;

        key = end_2 + '_' + end_1;
        this.strengths_array[key] = temp;
    });
}

/*************************************************************************/

Murata.prototype.propagate = function(){

    /*************************************************/
    // Data to return

    propagation = {
        'news_item': null,
        'neighbors_susceptibles': null,
        'infected_nodes_array': null,
        'active_nodes_array': null
    };

    /*************************************************/
    // Setting up the propagation

    news_item = Math.random() < 0.5 ? -1 : 1;
    if(this.news_polarization == 'low'){ news_item = -1 + 2*Math.random(); }
    seed = math.randomInt(this.num_nodes);

    active_nodes_array = [ [seed] ]
    infected_nodes_array = [ seed ]

    propagation.news_item = news_item;
    propagation.neighbors_susceptibles = []
    propagation.infected_nodes_array = [ [seed] ];

    t = 0;

    /*************************************************/
    // Propagation

    while(active_nodes_array[t].length != 0){
        active_nodes_array.push([]);
        neighbors_susceptibles = []

        for(let i = 0; i < active_nodes_array[t].length; i++){
            active_node = active_nodes_array[t][i];

            neighbors_array = this.adjacency_list[active_node];
            uninfected_neighbors_array = _.difference(neighbors_array, infected_nodes_array);
            neighbors_susceptibles.push(uninfected_neighbors_array);

            for(let j = 0; j < uninfected_neighbors_array.length; j++){
                uninfected_neighbor = uninfected_neighbors_array[j];

                if(Math.random() < this.prob_successful_propagation(active_node, uninfected_neighbor, news_item)){
                    infected_nodes_array.push(uninfected_neighbor);
                    active_nodes_array[t+1].push(uninfected_neighbor);
                    
                    let opinion_update = this.update_size*Math.sign(news_item-this.opinions_array[uninfected_neighbor]);
                    let strength_update = this.update_size;

                    this.opinions_array[uninfected_neighbor] += opinion_update;
                    if(this.opinions_array[uninfected_neighbor] > 1){ this.opinions_array[uninfected_neighbor] = 1; }
                    if(this.opinions_array[uninfected_neighbor] < -1){ this.opinions_array[uninfected_neighbor] = -1; }

                    this.strengths_array[active_node+'_'+uninfected_neighbor] += strength_update;
                    if(this.strengths_array[active_node+'_'+uninfected_neighbor] > 1){ this.strengths_array[active_node+'_'+uninfected_neighbor] = 1; }

                    this.strengths_array[uninfected_neighbor+'_'+active_node] += strength_update;
                    if(this.strengths_array[uninfected_neighbor+'_'+active_node] > 1){ this.strengths_array[uninfected_neighbor+'_'+active_node] = 1; }
                } else {
                    let strength_update = this.update_size;

                    this.strengths_array[active_node+'_'+uninfected_neighbor] -= strength_update;
                    if(this.strengths_array[active_node+'_'+uninfected_neighbor] < 0){ this.strengths_array[active_node+'_'+uninfected_neighbor] = 0; }

                    this.strengths_array[uninfected_neighbor+'_'+active_node] -= strength_update;
                    if(this.strengths_array[uninfected_neighbor+'_'+active_node] < 0){ this.strengths_array[uninfected_neighbor+'_'+active_node] = 0; }
                }
            }

        }

        t++;
        propagation.neighbors_susceptibles.push(neighbors_susceptibles);
        propagation.infected_nodes_array.push(_.map(infected_nodes_array));
    }

    propagation.neighbors_susceptibles.push([]);
    propagation.active_nodes_array = active_nodes_array;
    return propagation
}

/*************************************************************************/

Murata.prototype.get_nodes = function(){
    return d3.range(this.num_nodes);
}

Murata.prototype.get_edges = function(){
    return this.edges;
}

Murata.prototype.get_opinions = function(){
    return this.opinions_array;
}

Murata.prototype.get_strengths = function(){
    return this.strengths_array;
}

/*************************************************************************/

Murata.prototype.logistic = function(x){
    return 1/(1 + Math.exp(-this.B*(x-this.mu)))
}

Murata.prototype.prob_successful_propagation = function(source, neighbor, news){
    strength = this.strengths_array[source+'_'+neighbor]
    neighbor_opinion = this.opinions_array[neighbor]
    prob = (strength*strength) + (1-strength) * (1-this.logistic(0.5*Math.abs(news-neighbor_opinion)))
    return prob
}

/*************************************************************************/