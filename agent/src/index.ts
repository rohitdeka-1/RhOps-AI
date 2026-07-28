import './core/websocket';
import { k8sClient } from './core/k8s-client';

console.log('Booting RhOps Agent...');

setInterval(() => {
    console.log('RhOps Agent is running...');
}, 60000);
