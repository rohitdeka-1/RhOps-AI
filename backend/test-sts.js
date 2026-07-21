const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const appsApi = kc.makeApiClient(k8s.AppsV1Api);
appsApi.listStatefulSetForAllNamespaces().then(res => {
    console.log("StatefulSets:", res.body.items.length);
    res.body.items.forEach(sts => console.log(sts.metadata.name, sts.metadata.namespace));
}).catch(err => {
    console.error("Error fetching StatefulSets:", err);
});
