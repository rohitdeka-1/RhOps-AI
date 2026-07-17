import { prisma } from "../../../config/prisma";

export class ClusterRepository {

    async createCluster(data: {
        name: string;
        provider: string;
        projectId: string;
        apiServer: string;
        kubeconfig: string;
        userId: string;
    }) {
        return prisma.cluster.create({
            data: {
                name: data.name,
                provider: data.provider,
                projectId: data.projectId,
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

    async findClusterByIdAndUserId(id: string, userId: string) {
        return prisma.cluster.findFirst({
            where: { id, userId }
        });
    }

    async deleteCluster(id: string) {
        return prisma.cluster.delete({
            where: { id }
        });
    }


}
