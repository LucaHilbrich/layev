import { CONFIG, getScene } from "./main.js";
import { makePlane, makeTexture } from "./graphicUtils.js";

export class LayeredGraph {
    constructor() {
        this.layers = {};
    }

    addLayer(dotName, dotFile) {
        this.layers[dotName] = new Layer(dotFile);
        this.updateLayerPositions();
    }

    updateLayerPositions() {
        const nLayers = Object.keys(this.layers).length;
        for (const [index, [name, layer]] of Object.entries(Object.entries(this.layers))) {
            layer.updatePosition(index, nLayers);
        }
    }

    updateLayerTextures() {
        for (const [index, [name, layer]] of Object.entries(Object.entries(this.layers))) {
            layer.updateTexture();
        }
    }

    removeLayer(dotName) {
        this.layers[dotName].removeLayer();
        delete this.layers[dotName];
        this.updateLayerPositions();
    }
}

class Layer {
    constructor(dotFile) {
        const dotContents = parseDot(dotFile);
        this.name = dotContents.name;
        this.nodes = dotContents.nodes;
        this.edges = dotContents.edges;
        this.createLayer();
    }

    createLayer() {
        this.plane = makePlane();
        this.texture = makeTexture(this.edges);
        this.plane.material.map = this.texture;
        this.plane.material.transparent = true;
        this.plane.material.needsUpdate = true;
        getScene().add(this.plane);
    }

    updatePosition(index, nLayers) {
        this.plane.position.set(0, index * CONFIG.LAYER_DISTANCE - (nLayers * CONFIG.LAYER_DISTANCE / 2), 0);
    }

    updateTexture() {
        this.plane.material.map = makeTexture(this.edges);
        // this.plane.material.needsUpdate = true;
    }

    removeLayer() {
        getScene().remove(this.plane);
    }
}

function parseDot(dotFile) {
    const graphNameRegex = /digraph\s+(\w+)\s*\{/;
    const edgeRegex = /"(\w+)"\s*->\s*"(\w+)"\s*\[type="(\w+)"\]/g;

    const graphNameMatch = dotFile.match(graphNameRegex);
    const graphName = graphNameMatch ? graphNameMatch[1] : null;

    const edges = [];
    const nodes = new Set();
    
    let match;
    while ((match = edgeRegex.exec(dotFile)) !== null) {
        const start = match[1];
        const end = match[2];
        const type = match[3];

        edges.push({ start, end, type });

        nodes.add(start);
        nodes.add(end);
    }

    return {
        name: graphName,
        nodes: Array.from(nodes),
        edges,
    };
}
