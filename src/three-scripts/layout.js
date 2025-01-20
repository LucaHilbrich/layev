import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import cola from 'cytoscape-cola';
import { CONFIG } from './main';

cytoscape.use(fcose);
cytoscape.use(cola);

export async function applyFcose(layeredGraph, fixedNodeConstraint) {

    // Transform data
    let nodes = new Set();
    let edges = [];
    layeredGraph.layers.forEach((layer, name) => {
        for (const n of layer.nodes) {
            nodes.add(n);
        }
    });
    nodes = Array.from(nodes);

    // Count significant edges
    layeredGraph.layers.forEach((layer, name) => {
        for (const e of layer.edges) {
            if (e['type'] === 'sp' || e['type'] === 'sn' || e['type'] === 's') {
                const idx = edges.findIndex(x => x.src === e.src && x.dst === e.dst);
                if (idx >= 0) {
                    edges[idx]['n'] += 1;
                } else {
                    let temp = {'src': e.src, 'dst': e.dst, 'n': 1};
                    edges.push(temp);
                }
            }
        }
    });
    let nMax = 0;
    for (let e of edges) {
        if (e['n'] > nMax) {
            nMax = e['n'];
        }
    }
    for (let i = 0; i < edges.length; i++) {
        edges[i]['n'] /= nMax;
    }

    // Prepare elements for cytoscape
    let elements = [];
    for (let n of nodes) {
        elements.push({ data: { id: n.id } });
    }
    for (let e of edges) {
        elements.push({ data: { source: e.src, target: e.dst, weight: 1.0 - e.n } });
    }

    // Create cytoscape instance
    const cy = cytoscape({
        headless: true,
        styleEnabled: true,
        elements: elements
    });

    let normalizedPositions;
    cy.layout({
        name: 'fcose',
        animate: true,
        randomize: false,
        // fixedNodeConstraint: [{nodeId: 'Cybersickness', position: {x: 100, y: 200}}, {nodeId: 'Presence', position: {x: 700, y: 200}}],
        fixedNodeConstraint: fixedNodeConstraint,
        // boundingBox: {x1: 0, y1: 0, w: 800, h: 400},
        nodeRepulsion: 200000000,
        edgeElasticity: 0.1,
        idealEdgeLength: function (edge) {
            return edge.data().weight * 50;
        },
        
        ready: () => {
            let nodePositions = cy.nodes().map(node => node.position());

            const minX = Math.min(...nodePositions.map(pos => pos.x)) - CONFIG.NODE_PADDING;
            const maxX = Math.max(...nodePositions.map(pos => pos.x)) + CONFIG.NODE_PADDING;
            const minY = Math.min(...nodePositions.map(pos => pos.y)) - CONFIG.NODE_PADDING;
            const maxY = Math.max(...nodePositions.map(pos => pos.y)) + CONFIG.NODE_PADDING;

            normalizedPositions = cy.nodes().map(node => {
                const pos = node.position();
                return {
                    id: node.id(),
                    x: (pos.x - minX) / (maxX - minX),
                    y: (pos.y - minY) / (maxY - minY)
                };
            });
            layeredGraph.layers.forEach((layer, name) => {
                for (const [i, _] of layer.nodes.entries()) {
                    const id = layer.nodes[i].id;
                    const p = normalizedPositions.find(x => x.id === id);

                    layer.nodes[i].x = p.x;
                    layer.nodes[i].y = p.y;
                }
            });
        }
    }).run();
}
