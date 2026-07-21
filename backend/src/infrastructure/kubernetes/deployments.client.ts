import * as k8s from '@kubernetes/client-node';

export class DeploymentsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listDeployments(namespace?: string) {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        if (!namespace || namespace === 'all') {
            const deployments = await appsApi.listDeploymentForAllNamespaces();
            return deployments.body.items;
        } else {
            const deployments = await appsApi.listNamespacedDeployment(namespace);
            return deployments.body.items;
        }
    }

    async getDeployment(name: string, namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const deployment = await appsApi.readNamespacedDeployment(name, namespace);
        return deployment.body;
    }

    async deleteDeployment(name: string, namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        await appsApi.deleteNamespacedDeployment(name, namespace);
        return true;
    }

    async scaleDeployment(name: string, replicas: number, namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const scale = await appsApi.readNamespacedDeploymentScale(name, namespace);
        if (scale && scale.body && scale.body.spec) {
            scale.body.spec.replicas = replicas;
            const result = await appsApi.replaceNamespacedDeploymentScale(name, namespace, scale.body);
            return result.body;
        }
        throw new Error("Could not read deployment scale");
    }

    async restartDeployment(name: string, namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const deployment = await appsApi.readNamespacedDeployment(name, namespace);

        if (!deployment.body.spec) {
            throw new Error("Deployment spec not found");
        }
        if (!deployment.body.spec.template.metadata) {
            deployment.body.spec.template.metadata = {};
        }
        if (!deployment.body.spec.template.metadata.annotations) {
            deployment.body.spec.template.metadata.annotations = {};
        }
        deployment.body.spec.template.metadata.annotations['kubectl.kubernetes.io/restartedAt'] = new Date().toISOString();

        const result = await appsApi.replaceNamespacedDeployment(name, namespace, deployment.body);
        return result.body;
    }

    async createDeployment(namespace: string = 'default', body: k8s.V1Deployment) {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const response = await appsApi.createNamespacedDeployment(namespace, body);
        return response.body;
    }

    async updateDeployment(name: string, namespace: string = 'default', body: k8s.V1Deployment) {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const response = await appsApi.replaceNamespacedDeployment(name, namespace, body);
        return response.body;
    }
}
