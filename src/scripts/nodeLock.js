
const nodeLockPanel = document.getElementById("nodeLock");

export function addNodeToNodeLockPanel(nodeId) {
    let div = document.createElement("div");
    div.className = "filter-item";

    let nodeLock = document.createElement("input");
    nodeLock.type = "checkbox";
    nodeLock.checked = false;
    nodeLock.id = nodeId;
    nodeLock.style = "float:right";

    let label = document.createElement("label")
    label.innerText = nodeId;

    div.append(nodeLock);
    div.append(label);

    nodeLockPanel.appendChild(div);
}

export function removeAllNodesFromNodeLockPanel() {
    nodeLockPanel.innerHTML = "<h3>Nodes</h3>";
}