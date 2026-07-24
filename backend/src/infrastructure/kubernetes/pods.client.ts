import * as k8s from '@kubernetes/client-node';

export class PodsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listPods(namespace?: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        if (!namespace || namespace === 'all') {
            const pods = await coreApi.listPodForAllNamespaces();
            return pods.body.items;
        } else {
            const pods = await coreApi.listNamespacedPod(namespace);
            return pods.body.items;
        }
    }

    async getPod(name: string, namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const pod = await coreApi.readNamespacedPod(name, namespace);
        return pod;
    }

    async deletePod(name: string, namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        await coreApi.deleteNamespacedPod(name, namespace);
        return true;
    }

    async getLogs(name: string, namespace: string = 'default', container?: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        try {
            let targetPodName = name;
            const containerName = container && container.trim() !== '' ? container : undefined;

            try {
                const logsRes: any = await coreApi.readNamespacedPodLog(targetPodName, namespace, containerName);
                if (typeof logsRes === 'string') return logsRes;
                if (logsRes && typeof logsRes.body === 'string') return logsRes.body;
                if (logsRes && typeof logsRes.data === 'string') return logsRes.data;
                return typeof logsRes === 'object' ? JSON.stringify(logsRes, null, 2) : String(logsRes);
            } catch (directErr: any) {
                // If name is a deployment/statefulset name (e.g. 'redis', 'postgres', 'frontend'), find matching pod
                const pods = await this.listPods(namespace);
                const matchingPod = pods.find((p: any) => 
                    p.metadata?.name === name ||
                    p.metadata?.name?.startsWith(`${name}-`) ||
                    p.metadata?.labels?.app === name ||
                    p.metadata?.labels?.['app.kubernetes.io/name'] === name
                );

                if (matchingPod?.metadata?.name) {
                    targetPodName = matchingPod.metadata.name;
                    const logsRes: any = await coreApi.readNamespacedPodLog(targetPodName, namespace, containerName);
                    if (typeof logsRes === 'string') return logsRes;
                    if (logsRes && typeof logsRes.body === 'string') return logsRes.body;
                    if (logsRes && typeof logsRes.data === 'string') return logsRes.data;
                    return typeof logsRes === 'object' ? JSON.stringify(logsRes, null, 2) : String(logsRes);
                }
                throw directErr;
            }
        } catch (error: any) {
            console.error(`Error reading logs for ${name} in ${namespace}:`, error?.message || error);
            throw new Error(error?.body?.message || error?.message || `Failed to fetch logs for ${name}`);
        }
    }

    async restartPod(name: string, namespace: string = 'default') {
        return this.deletePod(name, namespace);
    }

    async execCommand(name: string, namespace: string = 'default', command: string[], container?: string) {
        const exec = new k8s.Exec(this.kc);
        const { PassThrough } = require('stream');

        let outStr = '';
        let errStr = '';
        const outStream = new PassThrough();
        const errStream = new PassThrough();

        outStream.on('data', (chunk: any) => { outStr += chunk.toString(); });
        errStream.on('data', (chunk: any) => { errStr += chunk.toString(); });

        return new Promise((resolve, reject) => {
            exec.exec(namespace, name, container || '', command, outStream, errStream, null, false, (status: any) => {
                if (status && status.status === 'Failure') {
                    reject(new Error(status.message));
                } else {
                    resolve({ stdout: outStr, stderr: errStr });
                }
            }).catch(reject);
        });
    }
}
