import { prisma } from "../../../config/prisma";

export class ClusterRepository {

    async createCluster(data: {
        name: string;
        provider: string;
        apiServer: string;
        kubeconfig: string;
        userId: string;
    }) {
        return prisma.cluster.create({
            data: {
                name: data.name,
                provider: data.provider,
                apiServer: data.apiServer,
                kubeconfig: data.kubeconfig,
                userId: data.userId,
            }
        });
    }

    async findClustersByUserId(userId: string) {
        return prisma.cluster.findMany({
            where: { userId }
        });
    }
}
