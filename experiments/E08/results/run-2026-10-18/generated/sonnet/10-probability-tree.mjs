export function probTree(root) {
  const leaves = [];

  function annotate(node, parentJoint) {
    const joint = parentJoint * node.prob;
    node.joint = joint;
    if (node.children.length === 0) {
      leaves.push({ name: node.name, joint });
    } else {
      for (const child of node.children) {
        annotate(child, joint);
      }
    }
  }

  annotate(root, 1);

  const sum = leaves.reduce((acc, leaf) => acc + leaf.joint, 0);
  const sumToOne = Math.abs(sum - 1.0) <= 0.0001;

  return { root, leaves, sumToOne };
}
