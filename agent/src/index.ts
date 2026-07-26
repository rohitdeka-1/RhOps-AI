import './core/websocket';
import { k8sClient } from './core/k8s-client';

console.log('Booting RhOps Agent...');

// Initialize components if needed
// The WebSocketClient auto-connects on instantiation
// The K8sClient auto-loads the config on instantiation

// Simple heartbeat to keep process alive and log status
setInterval(() => {
    console.log('RhOps Agent is running...');
}, 60000);
