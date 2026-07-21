import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

export function inferTopology(streamData: any, selectedNamespace: string, showSystemNamespaces: boolean) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!streamData) return { nodes, edges };

    const { deployments = [], pods = [], services = [], ingresses = [], statefulsets = [] } = streamData;

    // Filter by namespace
    const filterNs = (item: any) => {
        const ns = item.metadata?.namespace || 'default';
        if (selectedNamespace !== 'All Namespaces' && ns !== selectedNamespace) return false;
        if (!showSystemNamespaces && ns.startsWith('kube-')) return false;
        return true;
    };

    const filteredDeployments = deployments.filter(filterNs);
    const filteredSts = statefulsets.filter(filterNs);
    const filteredServices = services.filter(filterNs);
    const filteredIngresses = ingresses.filter(filterNs);
    
    // Map Service to Deployment/StatefulSet
    const serviceToWorkload = new Map<string, string>(); // Service Name -> Workload ID
    
    filteredServices.forEach((svc: any) => {
        const selector = svc.spec?.selector;
        if (!selector) return;

        // Find matching deployment
        const matchingDep = filteredDeployments.find((d: any) => {
            const labels = d.spec?.template?.metadata?.labels || {};
            return Object.keys(selector).every(k => labels[k] === selector[k]);
        });
        if (matchingDep) {
            serviceToWorkload.set(svc.metadata.name, matchingDep.metadata.uid);
            return;
        }

        // Find matching statefulset
        const matchingSts = filteredSts.find((s: any) => {
            const labels = s.spec?.template?.metadata?.labels || {};
            return Object.keys(selector).every(k => labels[k] === selector[k]);
        });
        if (matchingSts) {
            serviceToWorkload.set(svc.metadata.name, matchingSts.metadata.uid);
        }
    });

    // 1. Create Ingress Nodes
    filteredIngresses.forEach((ing: any) => {
        const ingId = ing.metadata.uid;
        nodes.push({
            id: ingId,
            type: 'entryNode',
            data: {
                label: ing.metadata.name,
                type: 'Ingress',
                host: ing.spec?.rules?.[0]?.host || 'Unknown Host'
            },
            position: { x: 0, y: 0 }
        });

        // Edges from Ingress to Service (mapped to Workload)
        ing.spec?.rules?.forEach((rule: any) => {
            rule.http?.paths?.forEach((path: any) => {
                const svcName = path.backend?.service?.name;
                if (svcName) {
                    const workloadId = serviceToWorkload.get(svcName);
                    if (workloadId) {
                        edges.push({
                            id: `edge-${ingId}-${workloadId}`,
                            source: ingId,
                            target: workloadId,
                            animated: false,
                            type: 'smoothstep',
                            style: { stroke: '#525252', strokeWidth: 1.5, strokeDasharray: '4 4' },
                            markerEnd: {
                                type: dagre.graphlib.Graph ? 'arrowclosed' : 'arrowclosed',
                                width: 15,
                                height: 15,
                                color: '#525252',
                            }
                        });
                    }
                }
            });
        });
    });

    // 2. Create Deployment Nodes
    filteredDeployments.forEach((d: any) => {
        const depId = d.metadata.uid;
        const replicas = d.spec?.replicas || 0;
        const readyReplicas = d.status?.readyReplicas || 0;
        const isHealthy = readyReplicas === replicas && replicas > 0;

        nodes.push({
            id: depId,
            type: 'appNode',
            data: {
                label: d.metadata.name,
                status: isHealthy ? 'Running' : (readyReplicas > 0 ? 'Warning' : 'Critical'),
                replicas,
                readyReplicas,
                cpu: '-',
                mem: '-',
                isHealthy,
                expanded: false,
                raw: d
            },
            position: { x: 0, y: 0 }
        });

        // Analyze ENV for connections
        const containers = d.spec?.template?.spec?.containers || [];
        containers.forEach((c: any) => {
            const envs = c.env || [];
            envs.forEach((env: any) => {
                const val = env.value || '';
                if (!val) return;
                
                // If val contains another service name
                filteredServices.forEach((svc: any) => {
                    const svcName = svc.metadata.name;
                    if (val.includes(svcName)) {
                        // Edge from Deployment to Service
                        const targetId = serviceToWorkload.get(svcName) || `standalone-svc-${svcName}`;
                        
                        // Avoid self-loops
                        if (targetId !== depId) {
                            edges.push({
                                id: `edge-env-${depId}-${targetId}`,
                                source: depId,
                                target: targetId,
                                animated: false,
                                type: 'smoothstep',
                                style: { stroke: '#525252', strokeWidth: 1.5, strokeDasharray: '4 4' },
                                markerEnd: {
                                    type: dagre.graphlib.Graph ? 'arrowclosed' : 'arrowclosed',
                                    width: 15,
                                    height: 15,
                                    color: '#525252',
                                }
                            });
                        }
                    }
                });
            });
        });
    });

    // 3. Create Standalone Service Nodes (Databases, etc that have no deployment but are services)
    // Wait, usually databases have StatefulSets. Let's process StatefulSets.
    filteredSts.forEach((sts: any) => {
        const stsId = sts.metadata.uid;
        const name = sts.metadata.name.toLowerCase();
        
        let type = 'storageNode';
        let engine = 'unknown';

        if (name.includes('redis')) { engine = 'redis'; }
        else if (name.includes('postgres') || name.includes('pg')) { engine = 'postgres'; }
        else if (name.includes('mysql')) { engine = 'mysql'; }
        else if (name.includes('mongo')) { engine = 'mongodb'; }
        else if (name.includes('rabbit')) { type = 'messagingNode'; engine = 'rabbitmq'; }
        else if (name.includes('kafka')) { type = 'messagingNode'; engine = 'kafka'; }
        else { type = 'appNode'; } // Fallback to app node

        nodes.push({
            id: stsId,
            type: type,
            data: {
                label: sts.metadata.name,
                engine,
                status: 'Running',
                isHealthy: true,
                raw: sts
            },
            position: { x: 0, y: 0 }
        });
    });

    // Run Dagre Layout
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', ranksep: 150, nodesep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    nodes.forEach(node => {
        // Approximate width and height based on node type
        let width = 200, height = 150;
        if (node.type === 'entryNode') { width = 160; height = 120; }
        else if (node.type === 'storageNode' || node.type === 'messagingNode') { width = 120; height = 100; }
        
        g.setNode(node.id, { width, height });
    });

    // Remove duplicate edges
    const uniqueEdges = Array.from(new Set(edges.map(e => JSON.stringify({source: e.source, target: e.target}))))
                             .map(str => {
                                 const obj = JSON.parse(str);
                                 return edges.find(e => e.source === obj.source && e.target === obj.target)!;
                             });

    uniqueEdges.forEach(edge => {
        g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    nodes.forEach(node => {
        const nodeWithPosition = g.node(node.id);
        if (nodeWithPosition) {
            node.position = {
                x: nodeWithPosition.x - nodeWithPosition.width / 2,
                y: nodeWithPosition.y - nodeWithPosition.height / 2
            };
        }
    });

    return { nodes, edges: uniqueEdges };
}
