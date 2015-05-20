/**
 * Sorts an array of tasks into their priority based on their critical cost.
 * The task with the highest critical cost is at the beginning of the array.
 *
 * @param {Array} tasks an array of task objects
 * @returns {Array} the sorted array. The array is sorted in place so it's not
 * necessary to assign the output of this to anything.
 */
function priority(tasks) {
  tasks.sort(function(a, b) {
    if (a.criticalCost > b.criticalCost) {
      return -1;
    }
    if (a.criticalCost < b.criticalCost) {
      return 1;
    }
    // break ties by checking dependencies
    if (a.dependsOn(b)) {
      return 1;
    }
    if (b.dependsOn(a)) {
      return -1;
    }
    return 0;
  });
  return tasks;
}

module.exports = priority;
