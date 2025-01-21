import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import cola from 'cytoscape-cola';
import elk from 'cytoscape-elk';
import { CONFIG } from './main';

cytoscape.use(fcose);
cytoscape.use(cola);
cytoscape.use(elk);

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
        elements.push({ data: { id: n.id, outlier: false } });
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

    cy.layout({
        name: 'fcose',
        animate: true,
        randomize: true,
        fixedNodeConstraint: fixedNodeConstraint,
        boundingBox: {x1: 0, y1: 0, w: 800, h: 400},
        nodeRepulsion: 200000000,
        edgeElasticity: 0.1,
        idealEdgeLength: function (edge) {
            return edge.data().weight * 50;
        },
        
        ready: () => {
            let nodePositions = cy.nodes().map(node => {
                const pos = node.position();
                return {
                    id: node.id(),
                    x: pos.x,
                    y: pos.y
                };
            });

            let adjustedNodePositions = adjust(nodePositions, 1, 1, calculateMidpoint(fixedNodeConstraint));

            layeredGraph.layers.forEach((layer, name) => {
                for (const [i, _] of layer.nodes.entries()) {
                    const id = layer.nodes[i].id;
                    const p = adjustedNodePositions.find(x => x.id === id);

                    layer.nodes[i].x = p.x;
                    layer.nodes[i].y = p.y;
                }
            });
        }
    }).run();
}

function calculateMidpoint(nodes) {
    let midpoint = { x: 0, y: 0 };
    for (const n of nodes) {
        midpoint.x += n.position.x;
        midpoint.y += n.position.y;
    }
    if (nodes.length > 0) {
        midpoint.x /= nodes.length;
        midpoint.y /= nodes.length;
    }
    return midpoint;
}


function adjust(nodes, layoutWidth, layoutHeight, midpoint) {
	const dX = midpoint.x * layoutWidth;
	const dY = midpoint.y * layoutHeight;
	
	let adjustedNodes = [];
	for (const n of nodes) {
        const id = n.id;
		const x = n.x - dX;
		const y = n.y - dY;
		const adjustedNode = { id, x, y };
		// adjustedNode.outlier = n.outlier;
		adjustedNodes.push(adjustedNode);
	}
	
	const [x, y] = getLargestDistantXandY(adjustedNodes);
	
	for (const n of adjustedNodes) {
		n.x = n.x / x * (layoutWidth/2) + layoutWidth/2;
		n.y = n.y / y * (layoutHeight/2) + layoutHeight/2;
	}
	
	// projectOutliersToEdges(adjustedNodes, layoutWidth, layoutHeight);
	
	return adjustedNodes;
}

function getLargestDistantXandY(nodes) {
	let x = 0;
	let y = 0;
	
	for (const n of nodes) {
		if (!n.outlier) {
			if (Math.abs(n.x) > x) {
				x = Math.abs(n.x);
			}

			if (Math.abs(n.y) > y) {
				y = Math.abs(n.y);
			}
		}
	}
	
	return [x, y];
}

function projectOutliersToEdges(nodes, layoutWidth, layoutHeight) {
	for (const n of nodes) {
		if (n.outlier) {
			if (n.x < -layoutWidth/2) { n.x = -layoutWidth/2; }
			if (n.x > layoutWidth/2) { n.x = layoutWidth/2; }
			if (n.y < -layoutHeight/2) { n.y = -layoutHeight/2; }
			if (n.y > layoutHeight/2) { n.y = layoutHeight/2; }
		}
	}
}
