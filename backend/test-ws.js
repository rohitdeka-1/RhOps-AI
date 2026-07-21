const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJmM2I1ODkxLWJmOTktNDE4MS05YTk3LWQwMmI1ZGYzOTNkNiIsImVtYWlsIjoiYWxrYXJkb3JoZEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InJvaGl0Iiwicm9sZSI6IlJPT1QiLCJpYXQiOjE3ODQ2NjQ3MTAsImV4cCI6MTc4NDY2NTYxMH0.foTssD2adkHtLfnzvEdfKS5QZTpQCSHdYJGffgC-wfQ";
const ws = new WebSocket(`ws://localhost:8080/clusters/eee18b4f-f5ee-4005-8086-549e24d34a4a/stream?token=${token}`);

ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'CLUSTER_UPDATE') {
        const stats = msg.data;
        console.log("StatefulSets count:", stats.statefulsets?.length || 0);
        console.log("Ingresses count:", stats.ingresses?.length || 0);
        console.log("Deployments count:", stats.deployments?.length || 0);
        ws.close();
    }
});
ws.on('error', (err) => console.error(err));
