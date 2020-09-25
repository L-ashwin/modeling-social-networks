import os
import json
import numpy as np
import networkx as nx

from flask import Flask, render_template
app = Flask(__name__)

#########################################################################
# Random Graph Models

n, p = 100, 0.05
G = nx.erdos_renyi_graph(n, p, seed=1)

nodes = G.nodes()
bias  = np.random.choice((1,-1), size=len(nodes))

nx.set_node_attributes(G, {key:value for key, value in zip(nodes, bias)}, name='bias')

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

def return_lists():
    nodes_list = list(G.nodes)
    edges_list = list(G.edges)
    bias_list = []

    for i in range(len(G.nodes)):
        bias_list.append( int(G.nodes[i]['bias']) )
    
    return nodes_list, edges_list, bias_list

#########################################################################
# Store data for every tick

data = {}
for i in range(100):
    step(G, 'bias')
    nodes_list, edges_list, bias_list = return_lists()
    
    data[i] = {}
    data[i]['nodes'] = nodes_list
    data[i]['edges'] = edges_list
    data[i]['bias'] = bias_list

#########################################################################
# Root

@app.route('/')
def index():

    return render_template(
        'index.html',
        data = json.dumps(data)
    )

#########################################################################
# Running the script

if __name__ == "__main__":
    app.run(debug = True)
