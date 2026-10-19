export function sortSteps(arr, algorithm) {
  if (arr.length === 0) {
    return [{ arr: [], action: 'done', indices: [] }];
  }
  if (arr.length === 1) {
    return [{ arr: [arr[0]], action: 'done', indices: [] }];
  }

  const steps = [];
  const a = arr.slice();

  if (algorithm === 'bubble') {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        steps.push({ arr: a.slice(), action: 'compare', indices: [j, j + 1] });
        if (a[j] > a[j + 1]) {
          const tmp = a[j];
          a[j] = a[j + 1];
          a[j + 1] = tmp;
          steps.push({ arr: a.slice(), action: 'swap', indices: [j, j + 1] });
        }
      }
    }
  } else if (algorithm === 'selection') {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        steps.push({ arr: a.slice(), action: 'compare', indices: [minIdx, j] });
        if (a[j] < a[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        const tmp = a[i];
        a[i] = a[minIdx];
        a[minIdx] = tmp;
        steps.push({ arr: a.slice(), action: 'swap', indices: [i, minIdx] });
      }
    }
  } else if (algorithm === 'insertion') {
    const n = a.length;
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        steps.push({ arr: a.slice(), action: 'compare', indices: [j - 1, j] });
        if (a[j - 1] > a[j]) {
          const tmp = a[j - 1];
          a[j - 1] = a[j];
          a[j] = tmp;
          steps.push({ arr: a.slice(), action: 'swap', indices: [j - 1, j] });
          j--;
        } else {
          break;
        }
      }
    }
  }

  steps.push({ arr: a.slice(), action: 'done', indices: [] });
  return steps;
}
