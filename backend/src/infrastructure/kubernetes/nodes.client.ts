import * as k8s from '@kubernetes/client-node';

export class NodesClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listNodes() {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const nodes = await coreApi.listNode();
        return nodes.items;
    }

    async getNode(name: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const node = await coreApi.readNode(name);
        return node;
    }

    async cordonNode(name: string, unschedulable: boolean) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);

        // Cordoning is done by patching the node's spec.unschedulable field
        const patch = [
            {
                op: 'replace',
                path: '/spec/unschedulable',
                value: unschedulable
            }
        ];

        const options = { "headers": { "Content-type": k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH } };
        const result = await coreApi.patchNode(name, patch, undefined, undefined, undefined, undefined, options);
        return result.body;
    }
}
