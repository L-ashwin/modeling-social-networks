let dom = {};
let params = { 'A': 6, 'B': 1, 'C': 1, 'D': 1, 'E': 1 };
let num_iterations = 10;

let descriptions = {

    'A': {
        1: 'Very High Polarization',
        5: 'High Polarization',
        6: 'Extreme Polarization',
    },

    'B': {
        1: 'Erdos Renyi Graph',
        2: 'Preferential Attachment Graph',
        3: 'Facebook Graph',
        4: 'US Blogs Graph',
    },

    'C': {
        1: 'Large Update Size',
        3: 'Small Update Size',
    },

    'D': {
        1: 'Intolerant Individuals',
    },

    'E': {
        1: 'Uniform Initial Distribution',
        3: 'Gaussian Initial Distribution',
    }
}

/****************************************************************/ 

function setup(){
    setup_images();
    create_events();
    update();
}

/****************************************************************/ 

function update(){
    update_images();

    let temp = ['A', 'B', 'C', 'D', 'E'].map((d) => {
        return descriptions[d][params[d]]
    })

    d3.select('#description').text( temp.join(' - ') );
}

/****************************************************************/ 

function setup_images(){
    let el = d3.select('#images');
    dom.images = {};

    for(let i = 0; i < num_iterations; i++){
        let row = el.append('div');

        row.append('h3')
            .text('Experiment ' + (i+1))
            .attrs({ 'class': 'my-4 py-2' })
            .styles({ 'background': 'aliceblue' })

        dom.images['l'+i] = row.append('div');
        dom.images['r'+i] = row.append('div');

        dom.images['l'+i].append('img').styles({ 'width': '95%' });
        dom.images['r'+i].append('img').styles({ 'width': '95%' });
    }
}

/****************************************************************/ 

function update_images(){
    let folder = '../graphs/run_' + Object.values(params).join('_') + '/';

    for(let i = 0; i < num_iterations; i++){
        dom.images['l'+i].select('img').attrs({ 'src': folder + 'run_' + Object.values(params).join('_') + '_experiment_'+(i+1)+'.jpg' });
        dom.images['r'+i].select('img').attrs({ 'src': folder + 'run_' + Object.values(params).join('_') + '_experiment_'+(i+1)+'_time_10000.jpg' });
    }
}

/****************************************************************/ 

function create_events(){
    ['A', 'B', 'C', 'D', 'E'].forEach((d) => {

        d3.select('#' +d+ '-dropdown').on('change', function(){
            let val = d3.select('#' +d+ '-dropdown').property('value');
            params[d] = val;
            update();
        })
    
    })

    // d3.select('#A-dropdown').on('change', function(){
    //     let val = d3.select('#A-dropdown').property('value');
    //     params['A'] = val;
    //     setup();
    // })
}

/****************************************************************/ 

$('document').ready(() => { setup(); })