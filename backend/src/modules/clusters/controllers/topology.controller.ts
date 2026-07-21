import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../../config/prisma';

export class TopologyController {
    
    async getTopology(request: FastifyRequest<{ Params: { id: string }, Querystring: { namespace: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const { namespace } = request.query;

            const topology = await prisma.topologyLayout.findUnique({
                where: {
                    clusterId_namespace: {
                        clusterId: id,
                        namespace: namespace || 'All Namespaces'
                    }
                }
            });

            if (!topology) {
                return reply.send({ layout: {} });
            }

            return reply.send({ layout: topology.layout });
        } catch (error) {
            console.error('Error fetching topology:', error);
            return reply.status(500).send({ message: 'Internal Server Error' });
        }
    }

    async saveTopology(request: FastifyRequest<{ Params: { id: string }, Body: { namespace: string, layout: any } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const { namespace, layout } = request.body;

            const topology = await prisma.topologyLayout.upsert({
                where: {
                    clusterId_namespace: {
                        clusterId: id,
                        namespace: namespace || 'All Namespaces'
                    }
                },
                update: {
                    layout
                },
                create: {
                    clusterId: id,
                    namespace: namespace || 'All Namespaces',
                    layout
                }
            });

            return reply.send({ success: true, layout: topology.layout });
        } catch (error) {
            console.error('Error saving topology:', error);
            return reply.status(500).send({ message: 'Internal Server Error' });
        }
    }
}
