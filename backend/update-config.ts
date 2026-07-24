import fs from 'fs';
import { prisma } from './src/config/prisma';
import { encrypt } from './src/utils/encryption.util';

async function run() {
    const config = fs.readFileSync('C:\\Users\\alkar\\.kube\\config', 'utf8');
    const clusters = await prisma.cluster.findMany();
    for (const c of clusters) {
        await prisma.cluster.update({ where: { id: c.id }, data: { kubeconfig: encrypt(config) } });
        console.log(`Updated cluster: ${c.name} (${c.id})`);
    }
}
run().finally(() => process.exit(0));
