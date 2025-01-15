import { CONFIG, getScene } from "./main.js";
import { makePlane, makeTexture, makeReferenceText, makeLabelText } from "./graphicUtils.js";
import { applyFcose } from "./layout.js";

export class LayeredGraph {
    constructor() {
        this.layers = {};
    }

    addLayer(dotName, dotFile) {
        this.layers[dotName] = new Layer(dotFile);
        this.setLayout();
        this.updateLayerPositions();
        this.updateLayerTextures();
    }

    updateLayerPositions() {
        const nLayers = Object.keys(this.layers).length;
        for (const [index, [name, layer]] of Object.entries(Object.entries(this.layers))) {
            layer.updatePosition(index, nLayers);
        }
        console.log('Updated positions.');
    }

    updateLayerTextures() {
        for (const [name, layer] of Object.entries(this.layers)) {
            layer.updateTexture();
        }
        console.log('Updated textures.');
    }

    removeLayer(dotName) {
        this.layers[dotName].removeLayer();
        delete this.layers[dotName];
        this.setLayout();
        this.updateLayerPositions();
        this.updateLayerTextures();
    }

    setLayout() {
        applyFcose(this.layers);
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
        this.texture = makeTexture(this.nodes, this.edges);
        this.plane.material.map = this.texture;
        this.plane.material.transparent = true;
        this.plane.material.needsUpdate = true;
        this.referenceText = makeReferenceText(this.name, this.plane.position);
        getScene().add(this.plane);
        getScene().add(this.referenceText);
    }

    updatePosition(index, nLayers) {
        this.plane.position.set(0, index * CONFIG.LAYER_DISTANCE - (nLayers * CONFIG.LAYER_DISTANCE / 2), 0);
        this.referenceText.position.set(
            this.plane.position.x - CONFIG.LAYER_WIDTH/2,
            this.plane.position.y,
            this.plane.position.z - CONFIG.LAYER_HEIGHT/2
        );
    }

    updateTexture() {
        this.plane.material.map = makeTexture(this.nodes, this.edges);
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
    const nodeSet = new Set();
    
    let match;
    while ((match = edgeRegex.exec(dotFile)) !== null) {
        const src = match[1];
        const dst = match[2];
        const type = match[3];

        edges.push({ src, dst, type });

        nodeSet.add(src);
        nodeSet.add(dst);
    }

    let nodeArray = Array.from(nodeSet);
    let nodes = [];
    for (const n of nodeArray) {
        let nodeObject = {
            id: n,
            x: Math.random(),
            y: Math.random()
        };
        nodes.push(nodeObject);
    }

    return {
        name: graphName,
        nodes,
        edges,
    };
}
