import os
import json
import numpy as np
import networkx as nx

from flask import Flask, render_template
app = Flask(__name__)

#########################################################################
# Random Graph Models

# n, p = 100, 0.05
# G = nx.erdos_renyi_graph(n, p, seed=1)

# nodes = G.nodes()
# bias  = np.random.choice((1,-1), size=len(nodes))

# nx.set_node_attributes(G, {key:value for key, value in zip(nodes, bias)}, name='bias')

#########################################################################
# One tick 

def step(G, attr):
    nodes  = G.nodes()
    tplus1 = {}
    for each in nodes:
        var = G.nodes[each]['bias']
        for neigh in nx.neighbors(G, each):
            var += G.nodes[neigh]['bias']
        tplus1[each] = np.sign(var)

    nx.set_node_attributes(G, tplus1, name='bias')

#########################################################################
# Preapre the data

def return_lists(G):
    nodes_list = list(G.nodes)
    edges_list = list(G.edges)
    bias_list = []
    polarization_index = polarization_idx(G, 'bias')

    for i in range(len(G.nodes)):
        bias_list.append( int(G.nodes[i]['bias']) )
    
    return nodes_list, edges_list, bias_list, polarization_index

#########################################################################
# Polarization Index

def polarization_idx(G, attr):
    val = [*nx.get_node_attributes(G, attr).values()]
    n_  = sum([ele == -1 for ele in val])/len(val)
    idx = 1 - 4*(n_ - 0.5)**2
    return idx

#########################################################################
# Store data for every tick

# data = {}
# for i in range(100):
#     step(G, 'bias')
#     nodes_list, edges_list, bias_list = return_lists()
    
#     data[i] = {}
#     data[i]['nodes'] = nodes_list
#     data[i]['edges'] = edges_list
#     data[i]['bias'] = bias_list

#########################################################################
# Simulation

def simulate():
    n, p = 300, 0.02
    G = nx.erdos_renyi_graph(n, p, seed=1)

    nodes = G.nodes()
    bias  = np.random.choice((1,-1), size=len(nodes))

    nx.set_node_attributes(G, {key:value for key, value in zip(nodes, bias)}, name='bias')

    data = {}
    for i in range(100):
        step(G, 'bias')
        nodes_list, edges_list, bias_list, polarization_index = return_lists(G)
        
        data[i] = {}
        data[i]['nodes'] = nodes_list
        data[i]['edges'] = edges_list
        data[i]['bias'] = bias_list
        data[i]['polarization_index'] = polarization_index

    return data

#########################################################################
# Root

@app.route('/')
def index():

    data = simulate()

    return render_template(
        'index.html',
        data = json.dumps(data)
    )

#########################################################################
# Running the script

if __name__ == "__main__":
    app.run(debug = True)
