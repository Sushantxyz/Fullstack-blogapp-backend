import NodeCache from "node-cache";

const nodeCache = new NodeCache({
    stdTTL:300
});

export default nodeCache;