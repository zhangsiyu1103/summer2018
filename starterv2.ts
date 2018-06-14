function generate(n: number): { [key: string]: string[] } {
    let i, j: number;
    let nodes: { [key: string]: string[] } = {};
    let visited: { [key: string]: boolean } = {};
    for (i = 0; i < n; i++) {
        visited["n" + i.toString()] = false;
    }
    let stack: string[] = [];
    let rest: string[] = [];
    for (i = 0; i < n; i++) {
        if ((typeof nodes["n" + i.toString()]) === 'undefined') {
            nodes["n" + i.toString()] = []
        }
        for (j = i + 1; j < n; j++) {
            if ((typeof nodes["n" + j.toString()]) === 'undefined') {
                nodes["n" + j.toString()] = [];
            }
            if (Math.random() < 0.2) {
                nodes["n" + i.toString()].push("n" + j.toString());
                nodes["n" + j.toString()].push("n" + i.toString());
            }
        }
    }
    for (i = 0; i < n; i++) {
        if (visited["n" + i.toString()] == false) {
            rest.push("n" + i.toString());
            stack.push("n" + i.toString());
            while (stack.length > 0) {
                var cur = stack.pop();
                if (cur !== undefined) {
                    if (visited[cur] == false) {
                        visited[cur] = true;
                        for (let val of nodes[cur]) {
                            stack.push(val);
                        }
                    }
                }
            }
        }
    }
    for (i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
        nodes[rest[i + 1]].push(rest[i]);
    }
    return nodes;
}

let newNodes = generate(20);
for (var keys in newNodes) {
    console.log(keys + " : " + newNodes[keys]);
}

