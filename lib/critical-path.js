function priority(tasks) {
  tasks.sort(function(a, b) {
    if (a.criticalCost > b.criticalCost) {
      return 1;
    }
    if (a.criticalCost < b.criticalCost) {
      return -1;
    }
    return 0;
  });
  return tasks;
}

module.exports = priority;
