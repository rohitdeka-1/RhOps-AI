import { k8sClient } from "./src/core/k8s-client";

async function main() {
    console.log("Fetching stats...");
    const stats = await k8sClient.getAggregatedStats();
    console.log("Nodes:", stats.nodes.length);
    console.log("Pods:", stats.pods.length);
    console.log("Deployments:", stats.deployments.length);
}

main().catch(console.error);
