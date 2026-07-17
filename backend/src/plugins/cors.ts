import fastifyCors, { FastifyCorsOptions } from "@fastify/cors";
import { FastifyPluginAsync } from "fastify";

const corsPlugin: FastifyPluginAsync<FastifyCorsOptions> = async (fastify, options) => {
    await fastify.register(fastifyCors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        ...options
    });
};

export default corsPlugin;
