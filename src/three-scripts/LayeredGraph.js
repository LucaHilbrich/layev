import * as THREE from 'three'; 
import { CONFIG, getScene, getCamera } from "./main.js";
import { makePlane, makeTexture, makeReferenceText, createDot, createLine } from "./graphicUtils.js";
import { applyFcose } from "./layout.js";
import { Label } from "./Label.js";

export class LayeredGraph {
    constructor() {
        this.layers = new Map();
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
            layer.removeNodeLines();
        }
        this.addNodeLines();
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

    addNodeLines() {
        const layerKeys = Object.keys(this.layers); // Get the keys of the layers object
        for (let i = 0; i < layerKeys.length - 1; i++) {
            const currentLayer = this.layers[layerKeys[i]];
            const nextLayer = this.layers[layerKeys[i + 1]];

            for (const node of currentLayer.nodes) {
                if (nextLayer.nodes.some(obj => obj.id === node.id)) {
                    currentLayer.createNodeLine(node.id);
                }
            }
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
        this.nodePoints = {};
        this.nodeLines = {};
        for (const n of this.nodes) {
            this.labelTexts[n.id] = new Label(n.id);
            this.nodePoints[n.id] = createDot();
        }
        getScene().add(this.plane);
        getScene().add(this.referenceText);
        for (const n of this.nodes) {
            getScene().add(this.labelTexts[n.id].getTextMesh());
            getScene().add(this.nodePoints[n.id]);
        }
    }

    createNodeLine(nodeId) {
        const n = this.nodes.find(x => x.id === nodeId);
        const [x, y] = worldCoordsFromTextureCoords(n.x, n.y);
        this.nodeLines[n.id] = createLine(x, this.plane.position.y, y, CONFIG.LAYER_DISTANCE);
        getScene().add(this.nodeLines[n.id]);
    }

    removeNodeLines() {
        for (const [name, nodeLine] of Object.entries(this.nodeLines)) {
            getScene().remove(nodeLine);
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
            const [x, y] = worldCoordsFromTextureCoords(n.x, n.y);
            this.labelTexts[n.id].setPosInit(x, this.plane.position.y, y);
            this.nodePoints[n.id].position.set(x, this.plane.position.y, y);
        }
    }

    updateTexture() {
        this.plane.material.map = makeTexture(this.nodes, this.edges);
        // this.plane.material.needsUpdate = true;
    }

    updateLabels() {
        for (const [k1, l1] of Object.entries(this.labelTexts)) {
            l1.faceCamera();
            // for (const [k2, l2] of Object.entries(this.labelTexts)) {
            //     if (k1 != k2) {
            //         if (l1.isOverlapping(l2)) {
            //             l1.selectPosAlternative();
            //         }
            //     }
            // }
        }
	}

    removeLayer() {
        getScene().remove(this.plane);
        getScene().remove(this.referenceText);
        for (const n of this.nodes) {
            getScene().remove(this.labelTexts[n.id].getTextMesh());
            getScene().remove(this.nodePoints[n.id]);
        }
        for (const [name, nodeLine] of Object.entries(this.nodeLines)) {
            getScene().remove(nodeLine);
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

function worldCoordsFromTextureCoords(textureX, textureY) {
    return [textureX * CONFIG.LAYER_WIDTH - (CONFIG.LAYER_WIDTH/2), (1 - textureY) * CONFIG.LAYER_HEIGHT - (CONFIG.LAYER_HEIGHT/2)];
}
