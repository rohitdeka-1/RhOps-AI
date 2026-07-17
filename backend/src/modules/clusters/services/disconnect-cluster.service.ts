import { ClusterRepository } from "../repositories/cluster.repository";

export class DisconnectClusterService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async disconnect(id: string, userId: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(id, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to delete it.");
        }

        await this.clusterRepository.deleteCluster(id);
    }
}
