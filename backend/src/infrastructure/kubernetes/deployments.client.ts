import * as k8s from '@kubernetes/client-node';

export class DeploymentsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listDeployments(namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const deployments = await appsApi.listNamespacedDeployment(namespace);
        return deployments.items;
    }

    async getDeployment(name: string, namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const deployment = await appsApi.readNamespacedDeployment(name, namespace);
        return deployment;
    }

    async deleteDeployment(name: string, namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        await appsApi.deleteNamespacedDeployment(name, namespace);
        return true;
    }

    async scaleDeployment(name: string, replicas: number, namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const scale = await appsApi.readNamespacedDeploymentScale(name, namespace);
        if (scale && scale.spec) {
            scale.spec.replicas = replicas;
            const result = await appsApi.replaceNamespacedDeploymentScale(name, namespace, scale);
            return result;
        }
        throw new Error("Could not read deployment scale");
    }

    async restartDeployment(name: string, namespace: string = 'default') {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        const deployment = await appsApi.readNamespacedDeployment(name, namespace);
        
        if (!deployment.spec) {
            throw new Error("Deployment spec not found");
        }
        if (!deployment.spec.template.metadata) {
            deployment.spec.template.metadata = {};
        }
        if (!deployment.spec.template.metadata.annotations) {
            deployment.spec.template.metadata.annotations = {};
        }
        deployment.spec.template.metadata.annotations['kubectl.kubernetes.io/restartedAt'] = new Date().toISOString();
        
        const result = await appsApi.replaceNamespacedDeployment(name, namespace, deployment);
        return result;
    }
}
