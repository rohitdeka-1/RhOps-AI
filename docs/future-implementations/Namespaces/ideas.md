# Namespaces Future Implementations

## 1. Resource Quota Management
A UI to easily view, set, and modify ResourceQuotas and LimitRanges for specific namespaces.
*   Visualize how much of a namespace's quota is currently being consumed vs requested.
*   Allow admins to dynamically resize the quota allocations directly from the UI.

## 2. Namespace Creation Wizard
While we have a basic creation form, we need a complete wizard.
*   Auto-generate default NetworkPolicies to secure the namespace (e.g. deny-all ingress by default).
*   Setup default RoleBindings (assigning specific GitHub users or teams to the namespace).
*   Assign default labels and annotations for billing/cost-tracking purposes.

## 3. Namespace Isolation Visualization
A graph view specifically for a single namespace, showing exactly what services are allowed to talk to it, and what it is allowed to talk to (visualizing NetworkPolicies).
