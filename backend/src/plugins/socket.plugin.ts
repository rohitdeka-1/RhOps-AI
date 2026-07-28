import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Server } from 'socket.io';
import { agentManager } from '../modules/agent/agent.manager';
import { prisma } from '../config/prisma';

export default fp(async (fastify: FastifyInstance) => {
    // Attach Socket.io to the Fastify HTTP server
    const io = new Server(fastify.server, {
        path: '/api/v1/agent/socket.io',
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        maxHttpBufferSize: 1e8 // 100MB limit for large k8s payloads
    });

    fastify.decorate('io', io);

    // Authentication middleware for incoming agent connections
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error: Missing token'));
        }

        try {
            // For MVP, we assume the token is the cluster ID itself, or a mapped token in the DB.
            // In a real scenario, you would look up the Cluster by agentToken.
            // Let's assume the token passed is simply the clusterId for now.
            const cluster = await prisma.cluster.findUnique({
                where: { id: token }
            });

            if (!cluster) {
                return next(new Error('Authentication error: Invalid cluster token'));
            }

            // Attach clusterId to the socket context
            (socket as any).clusterId = cluster.id;
            next();
        } catch (error) {
            next(new Error('Authentication error: Database failure'));
        }
    });

    // Connection handler
    io.on('connection', async (socket) => {
        const clusterId = (socket as any).clusterId;
        console.log(`[Socket.io] New connection established for cluster: ${clusterId}`);
        
        // Update cluster status to ACTIVE
        try {
            await prisma.cluster.update({
                where: { id: clusterId },
                data: { status: 'ACTIVE' }
            });
        } catch (e) {
            console.error('Failed to update cluster status to ACTIVE', e);
        }

        // Register it with the AgentManager
        agentManager.registerAgent(clusterId, socket);

        socket.on('disconnect', async () => {
            console.log(`[Socket.io] Connection lost for cluster: ${clusterId}`);
            try {
                await prisma.cluster.update({
                    where: { id: clusterId },
                    data: { status: 'INACTIVE' }
                });
            } catch (e: any) {
                if (e.code === 'P2025') {
                    // Cluster was already deleted, ignore
                    console.log(`[Socket.io] Cluster ${clusterId} already removed from DB.`);
                } else {
                    console.error(`[Socket.io] Failed to update cluster status to INACTIVE: ${e.message}`);
                }
            }
        });
    });

    // Gracefully close Socket.io server on fastify close
    fastify.addHook('onClose', (fastify, done) => {
        io.close();
        done();
    });
});
