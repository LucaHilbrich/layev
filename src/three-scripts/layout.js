import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { CONFIG } from './main';

cytoscape.use(fcose);

export async function applyFcose(layers) {

    // Transform data
    let nodes = new Set();
    let edges = [];
    layers.forEach((layer, name) => {
        for (const n of layer.nodes) {
            nodes.add(n);
        }
        for (const e of layer.edges) {
            if (e.type == 's' || e.type == 'sp' || e.type == 'sn') {
                edges.push(e);
            }
        }
    });
    nodes = Array.from(nodes);

    // // Prepare elements for cytoscape
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
        nodeRepulsion: 10000,
        edgeElasticity: 0.5,
        
        // idealEdgeLength: function (edge) {
        //     return edge.data().weight * 400;
        // },
        
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
            layers.forEach((layer, name) => {
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
