import { ClusterStreamService } from './src/modules/websockets/services/cluster-stream.service';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const streamService = new ClusterStreamService();
    // Use the clusterId from the screenshot: eee18b4f-f5ee-4005-8086-549e24d34a4a
    // And userId from JWT: 2f3b5891-bf99-4181-9a97-d02b5df393d6
    const kubeconfig = await streamService.getKubeconfig("eee18b4f-f5ee-4005-8086-549e24d34a4a", "2f3b5891-bf99-4181-9a97-d02b5df393d6");
    const stats = await streamService.getAggregatedStats(kubeconfig);
    console.log("StatefulSets fetched from service:", stats.statefulsets?.length);
    console.log("Ingresses fetched from service:", stats.ingresses?.length);
    console.log("Namespaces fetched:", stats.namespaces?.length);
}

run().catch(console.error).finally(() => prisma.$disconnect());
