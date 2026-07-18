import * as k8s from '@kubernetes/client-node';

export class PodsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listPods(namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const pods = await coreApi.listNamespacedPod(namespace);
        return pods.items;
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
        const logs = await coreApi.readNamespacedPodLog(name, namespace, container);
        return logs;
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
