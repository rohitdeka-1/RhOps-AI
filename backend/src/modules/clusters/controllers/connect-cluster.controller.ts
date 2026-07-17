import { FastifyReply, FastifyRequest } from "fastify";
import { ConnectClusterService } from "../services/connect-cluster.service";

export class ConnectClusterController {
    private connectClusterService: ConnectClusterService;

    constructor() {
        this.connectClusterService = new ConnectClusterService();
    }

    connect = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            // 1. Fastify-multipart (with attachFieldsToBody: true) parses form-data into request.body
            const body = request.body as any;

            // 2. Extract values
            const name = body.name?.value;
            const provider = body.provider?.value;

            // 3. kubeconfig can be an uploaded file (array or object) or a pasted text string (object)
            let kubeconfig = "";
            const kcField = body.kubeconfig;

            if (Array.isArray(kcField)) {
                const file = kcField[0];
                if (file?._buf) kubeconfig = file._buf.toString('utf8');
                else if (file?.toBuffer) kubeconfig = (await file.toBuffer()).toString('utf8');
                else if (file?.data) kubeconfig = file.data.toString('utf8');
            } else if (kcField && typeof kcField === 'object') {
                if (kcField._buf) kubeconfig = kcField._buf.toString('utf8');
                else if (kcField.toBuffer) kubeconfig = (await kcField.toBuffer()).toString('utf8');
                else if (kcField.value) kubeconfig = kcField.value;
                else if (kcField.data) kubeconfig = kcField.data.toString('utf8');
            }

            if (!name || !provider || !kubeconfig) {
                return reply.code(400).send({
                    success: false,
                    message: "Missing required fields: name, provider, kubeconfig file"
                });
            }

            const cluster = await this.connectClusterService.connect({
                name,
                provider,
                kubeconfig,
                userId
            });

            return reply.code(201).send({
                success: true,
                data: cluster,
                message: "Cluster connected successfully"
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            });
        }
    }
}
