"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const buildApp = async () => {
    const app = (0, fastify_1.default)({
        logger: true,
    });
    // Register plugins
    await app.register(cors_1.default);
    await app.register(helmet_1.default);
    // Health check route
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
    return app;
};
exports.buildApp = buildApp;
