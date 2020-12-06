let dom = {};
let params = { 'A': 1, 'B': 1, 'C': 1, 'D': 1, 'E': 1 };
let num_images = 20;

/****************************************************************/ 

function setup(){
    setup_indicators();
    setup_items();
    update_items();
}

/****************************************************************/ 

function setup_items(){
    let el = d3.select('.carousel-inner');
    el.selectAll('div').remove();
    dom.items = [];

    for(let i = 0; i < num_images; i++){
        dom.items[i] = el.append('div').attrs({ 'class': 'carousel-item' });
        dom.items[i].append('img').attrs({ 'src': '', class: 'd-block w-100' });
    }
    dom.items[0].classed('active', true);
}

/****************************************************************/ 

function setup_indicators(){
    let el = d3.select('.carousel-indicators');
    el.selectAll('li').remove();
    dom.indicators = [];

    for(let i = 0; i < num_images; i++){
        dom.indicators[i] = el.append('li').attrs({ 'data-target': '#carouselExampleIndicators', 'data-slide-to': i });
    }
    dom.indicators[0].attrs({ 'class': 'active' });
}

/****************************************************************/ 

function update_items(){
    let folder = '../graphs/run_' + Object.values(params).join('_') + '/';
    for(let i = 0; i < 0.5*num_images; i++){
        dom.items[2*i].select('img').attrs({ 'src': folder + 'iteration_' + (i+1) + '.jpg' });
        dom.items[2*i+1].select('img').attrs({ 'src': folder + 'iteration_' + (i+1) + '_time_10000.jpg' });
    }
}

/****************************************************************/ 

$('document').ready(() => { setup(); })