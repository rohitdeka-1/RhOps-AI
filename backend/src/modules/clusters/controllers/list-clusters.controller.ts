import { FastifyRequest, FastifyReply } from "fastify";
import { ListClusterService } from "../services/list-cluster.service";


export class ListClusterController {

    private listClusterService: ListClusterService;

    constructor() {
        this.listClusterService = new ListClusterService();
    }

    listClusters = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusters = await this.listClusterService.listClusters(userId);

            return reply.code(200).send({
                success: true,
                data: clusters,
                message: "Clusters listed successfully"
            })

        } catch (err: any) {
            return reply.code(500).send({
                success: false,
                message: err.message
            })
        }
    }

    listNamespaces = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.params as any).id;

            if (!clusterId) {
                return reply.code(400).send({
                    success: false,
                    message: "Cluster ID is required."
                })
            }

            const namespaces = await this.listClusterService.listNamespaces(clusterId, userId);

            return reply.code(200).send({
                success: true,
                data: namespaces,
                message: "Namespaces listed successfully"
            });


        } catch (err: any) {
            return reply.code(500).send({
                success: false,
                message: err.message
            })
        }
    }

}