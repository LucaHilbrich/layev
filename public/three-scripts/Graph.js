export class Graph {
    constructor(dotFile) {
        this.nodes = [];
        this.edges = [];
        this.init(dotFile);
    }

    init(dotFile) {
        this.parseDot(dotFile);
    }

    async parseDot(dotFile) {
        const regex = /"(.+?)"\s*->\s*"(.+?)"\s*\[type=(.+?)\]/g;
        let match;
        let nodes = new Set();
        while ((match = regex.exec(dotFile)) !== null) {
            const startNode = match[1];
            const endNode = match[2];
            const type = match[3].replace(/^[\s"']+|[\s"']+$/g, '').replace(/[\[\]\s]/g, '');
            this.edges.push({ 'src': startNode, 'dst': endNode, 'type': type });
            nodes.add(startNode);
            nodes.add(endNode);
        }
        this.nodes = Array.from(nodes);
    }
}
