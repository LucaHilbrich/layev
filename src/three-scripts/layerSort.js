export function layerSort(layers) {
    if (layers.size <= 1) return layers; // If 1 or no layers, no sorting needed

    const overlaps = [];
    
    // Step 1: Calculate pairwise overlaps
    const layerEntries = Array.from(layers.entries()); // Convert Map to an array of entries (key-value pairs)
    for (let i = 0; i < layerEntries.length; i++) {
        for (let j = i + 1; j < layerEntries.length; j++) {
            const [key1, layer1] = layerEntries[i];
            const [key2, layer2] = layerEntries[j];
            
            const overlap = getOverlappingElements(layer1.nodes, layer2.nodes);
            overlaps.push({
                graph1: layer1,
                graph2: layer2,
                overlap: overlap,
                nOverlap: overlap.length
            });
        }
    }

    // Step 2: Sort overlaps in descending order
    overlaps.sort((a, b) => b.nOverlap - a.nOverlap);

    // Step 3: Start ordering layers to maximize overlap
    const orderedLayers = [overlaps[0].graph1]; // Start with the graph with the most overlaps
    const usedLayers = new Set([orderedLayers[0]]);

    while (orderedLayers.length < layers.size) {
        const lastLayer = orderedLayers[orderedLayers.length - 1];
        
        // Find the next graph with the highest overlap with `lastLayer` that hasn't been used
        let nextOverlap = null;
        for (let o of overlaps) {
            if (o.graph1 === lastLayer && !usedLayers.has(o.graph2)) {
                nextOverlap = o;
                break;
            } else if (o.graph2 === lastLayer && !usedLayers.has(o.graph1)) {
                nextOverlap = o;
                break;
            }
        }

        // Add the found graph to the ordering
        if (nextOverlap) {
            const nextLayer = nextOverlap.graph1 === lastLayer ? nextOverlap.graph2 : nextOverlap.graph1;
            orderedLayers.push(nextLayer);
            usedLayers.add(nextLayer);
        } else {
            // In case no overlaps are left, add any remaining graph
            for (let [key, remainingLayer] of layers.entries()) {
                if (!usedLayers.has(remainingLayer)) {
                    orderedLayers.push(remainingLayer);
                    usedLayers.add(remainingLayer);
                    break; // Only add one unused graph at a time
                }
            }
        }
    }

    // Step 4: Reorder the values of the original Map while preserving the keys
    const sortedMap = new Map();
    for (const [key, value] of layers) {
        // Find the layer in orderedLayers and put them in sortedMap while preserving the keys
        const layer = orderedLayers.shift(); // Remove and return the first element
        sortedMap.set(key, layer);
    }

    // Now, sortedMap contains the layers in the correct order but with original keys intact.
    return sortedMap;
}

// Utility function to get overlapping elements based on the node's `id`
function getOverlappingElements(nodes1, nodes2) {
    const ids1 = new Set(nodes1.map(node => node.id));  // Extract ids from the first set of nodes
    const ids2 = new Set(nodes2.map(node => node.id));  // Extract ids from the second set of nodes
    return Array.from(ids1).filter(id => ids2.has(id));  // Return overlapping ids
}
