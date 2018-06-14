function generate(n: number): { [key: string]: string[] } {
    let i, j: number;
    let nodes: { [key: string]: string[] } = {};
    var visited = new Set<string>();
    for (i = 0; i < n; i++) {
        if ((typeof nodes["n" + i.toString()]) === 'undefined') {
            nodes["n" + i.toString()] = []
        }
        for (j = i + 1; j < n; j++) {
            if ((typeof nodes["n" + j.toString()]) === 'undefined') {
                nodes["n" + j.toString()] = [];
            }
            if (Math.random() > 0.5) {
                nodes["n" + i.toString()].push("n" + j.toString());
                nodes["n" + j.toString()].push("n" + i.toString());
                if (visited.size == 0) {
                    visited.add("n" + i.toString());
                    visited.add("n" + j.toString());
                } else if (visited.has("n" + i.toString()) || visited.has("n" + j.toString())) {
                    visited.add("n" + i.toString());
                    visited.add("n" + j.toString());
                }
            }
        }
    }
    if (visited.size != n) {
        return generate(n);
    } else {
        return nodes;
    }
}

let newNodes = generate(5);
for (var keys in newNodes) {
    console.log(keys + " : " + newNodes[keys]);
}

