import { CONFIG, getScene, getCamera } from "./main.js";
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
        // console.log('Updated positions.');
    }

    updateLayerTextures() {
        for (const [name, layer] of Object.entries(this.layers)) {
            layer.updateTexture();
        }
        // console.log('Updated textures.');
    }

    updateLayerLabels() {
        for (const [name, layer] of Object.entries(this.layers)) {
            layer.updateLabels();
        }
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
        this.referenceText = makeReferenceText(this.name);
        this.labelTexts = {};
        for (const n of this.nodes) {
            this.labelTexts[n.id] = makeLabelText(n.id);
        }
        getScene().add(this.plane);
        getScene().add(this.referenceText);
        for (const [_, l] of Object.entries(this.labelTexts)) {
            getScene().add(l);
        }
    }

    updatePosition(index, nLayers) {
        this.plane.position.set(0, index * CONFIG.LAYER_DISTANCE - (nLayers * CONFIG.LAYER_DISTANCE / 2), 0);
        this.referenceText.position.set(
            this.plane.position.x - CONFIG.LAYER_WIDTH/2,
            this.plane.position.y,
            this.plane.position.z - CONFIG.LAYER_HEIGHT/2
        );
        for (const n of this.nodes) {
            this.labelTexts[n.id].position.set(
                n.x * CONFIG.LAYER_WIDTH - CONFIG.LAYER_WIDTH/2,
                this.plane.position.y,
                (1 - n.y) * CONFIG.LAYER_HEIGHT - CONFIG.LAYER_HEIGHT/2
            );
        }
    }

    updateTexture() {
        this.plane.material.map = makeTexture(this.nodes, this.edges);
        // this.plane.material.needsUpdate = true;
    }

    updateLabels() {
        // Face camera
        for (const [_, l] of Object.entries(this.labelTexts)) {
			l.quaternion.copy(getCamera().quaternion);
        }

        // Prevent overlaps
	}

    removeLayer() {
        getScene().remove(this.plane);
        getScene().remove(this.referenceText);
        for (const [_, l] of Object.entries(this.labelTexts)) {
            getScene().remove(l);
        }
    }
}

function parseDot(dotFile) {
    const graphNameRegex = /digraph\s+([\w-]+)\s*\{/;
    const edgeRegex = /"([^"]+)"\s*->\s*"([^"]+)"\s*\[type="([^"]+)"\]/g;

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
