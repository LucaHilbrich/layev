import { updateNodeLocking } from "../three-scripts/main";

const nodeLockPanel = document.getElementById("nodeLock");

export function addNodeToNodeLockPanel(nodeId) {
    let div = document.createElement("div");
    div.className = "filter-item";

    let nodeLock = document.createElement("input");
    nodeLock.type = "checkbox";
    nodeLock.checked = false;
    nodeLock.id = nodeId;
    nodeLock.style = "float:right";
    nodeLock.addEventListener('change', function() {
        updateNodeLocking();
    });

    let label = document.createElement("label")
    label.innerText = nodeId;

    div.append(nodeLock);
    div.append(label);

    nodeLockPanel.appendChild(div);
}

export function removeAllNodesFromNodeLockPanel() {
    nodeLockPanel.innerHTML = "<h3>Node Lock</h3>";
}

export function getFixedNodeConstraint() {
    const lockedNodeIds = getLockedNodes();
    if (lockedNodeIds.length <= 0) {
        return [{nodeId: '', position: {x: 0, y: 0}}];
    }

    const equidistantPoints = generateEquidistantPoints(lockedNodeIds.length);
    console.log(equidistantPoints)
    
    let fixedNodeConstraint = [];
    for (const [index, id] of lockedNodeIds.entries()) {
        fixedNodeConstraint.push({
            nodeId: id,
            position: {x: equidistantPoints[index].x * 800, y: equidistantPoints[index].y * 800}
        });
    }
    return fixedNodeConstraint;
}

function generateEquidistantPoints(nPoints, distance=0.2) {
    const gridSize = Math.ceil(Math.sqrt(nPoints));
    
    const xValues = Array.from({ length: gridSize }, (_, i) => (i / (gridSize - 1)) * distance);
    const yValues = Array.from({ length: gridSize }, (_, i) => (i / (gridSize - 1)) * distance);
    
    const points = [];
    for (let y of yValues) {
        for (let x of xValues) {
            points.push({ x: 0.5 + x - distance / 2, y: 0.5 + y - distance / 2 });
        }
    }
    return points.slice(0, nPoints);
}

function getLockedNodes() {
    const checkboxes = document.querySelectorAll(`#nodeLock input[type="checkbox"]:checked`);
    const checkedValues = Array.from(checkboxes).map(checkbox => checkbox.id);
    return checkedValues;
}
