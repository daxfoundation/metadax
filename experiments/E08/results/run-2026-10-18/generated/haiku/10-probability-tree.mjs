export function probTree(root) {
  function annotate(node, parentJoint) {
    const joint = parentJoint * node.prob;
    const annotated = { ...node, joint };
    if (node.children && node.children.length > 0) {
      annotated.children = node.children.map(child => annotate(child, joint));
    } else {
      annotated.children = node.children || [];
    }
    return annotated;
  }

  function collectLeaves(node) {
    if (!node.children || node.children.length === 0) {
      return [{ name: node.name, joint: node.joint }];
    }
    const leaves = [];
    for (const child of node.children) {
      leaves.push(...collectLeaves(child));
    }
    return leaves;
  }

  const annotatedRoot = annotate(root, 1);
  const leaves = collectLeaves(annotatedRoot);
  const sum = leaves.reduce((acc, leaf) => acc + leaf.joint, 0);
  const sumToOne = Math.abs(sum - 1.0) <= 0.0001;

  return { root: annotatedRoot, leaves, sumToOne };
}
