const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src/infrastructure/kubernetes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');

  // Basic method body wrapper
  content = content.replace(/(const \w+ = await [a-zA-Z]+\.[a-zA-Z]+\(.*\);)[\s\n]+return (\w+)\.items;/g, (match, p1, p2) => {
      return p1 + '\n        return ' + p2 + '.body.items;';
  });

  // Direct return wrappers for read/create/replace/delete
  content = content.replace(/return (await \w+\.(?:read|create|replace|delete|patch)[a-zA-Z]+\(.*\));/g, 'return ($1).body;');

  // Specific deployment fixes
  content = content.replace(/scale && scale\.spec/g, 'scale && scale.body && scale.body.spec');
  content = content.replace(/scale\.spec\.replicas/g, 'scale.body.spec.replicas');
  content = content.replace(/replaceNamespacedDeploymentScale\(name, namespace, scale\)/g, 'replaceNamespacedDeploymentScale(name, namespace, scale.body)');
  content = content.replace(/!deployment\.spec/g, '!deployment.body.spec');
  content = content.replace(/deployment\.spec\.template/g, 'deployment.body.template');
  content = content.replace(/replaceNamespacedDeployment\(name, namespace, deployment\)/g, 'replaceNamespacedDeployment(name, namespace, deployment.body)');

  // Events fix
  content = content.replace(/return events\.items/g, 'return events.body.items');

  // Nodes fix for patch options (remove 6th undefined)
  content = content.replace(/patchNode\(name, patch, undefined, undefined, undefined, undefined, options\)/g, 'patchNode(name, patch, undefined, undefined, undefined, options)');

  fs.writeFileSync(path.join(dir, file), content);
}
console.log('Fixed k8s client files for v0.x');
