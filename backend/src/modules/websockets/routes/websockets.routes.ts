import { FastifyInstance } from 'fastify';
import { ClusterStreamService } from '../services/cluster-stream.service';

export default async function websocketsRoutes(fastify: FastifyInstance) {
    const streamService = new ClusterStreamService();

    fastify.get('/clusters/:id/stream', { websocket: true }, (socket: any, request: any) => {
        let interval: NodeJS.Timeout | undefined = undefined;
        const clusterId = request.params.id;
        const token = (request.query as any).token;

        (async () => {
            try {
                if (!token) {
                    socket.close(1008, 'Missing auth token');
                    return;
                }

                // Verify JWT
                const decoded = fastify.jwt.verify(token) as any;
                const userId = decoded.id;

                // Check permissions and get kubeconfig
                const kubeconfig = await streamService.getKubeconfig(clusterId, userId);

                // Function to fetch and send data
                const sendUpdate = async () => {
                    if (socket.readyState !== 1) return; // WebSocket.OPEN is 1
                    try {
                        const stats = await streamService.getAggregatedStats(kubeconfig);
                        socket.send(JSON.stringify({ type: 'CLUSTER_UPDATE', data: stats }));
                    } catch (err: any) {
                        fastify.log.error(`Stream error: ${err.message}`);
                    }
                };

                // Send initial payload immediately
                await sendUpdate();

                // Setup polling interval
                interval = setInterval(sendUpdate, 5000);

                // Cleanup on close
                socket.on('close', () => {
                    if (interval) clearInterval(interval);
                });
                
                socket.on('error', () => {
                    if (interval) clearInterval(interval);
                });

            } catch (err) {
                fastify.log.error(`WebSocket setup failed: ${err}`);
                socket.close(1008, 'Unauthorized or setup failed');
                if (interval) clearInterval(interval);
            }
        })();
    });
}
