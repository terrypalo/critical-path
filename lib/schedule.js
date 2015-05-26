var _ = require("lodash");
var priority = require("./priority");

/**
 * Schedule a set of tasks amongst some workers
 *
 * @param {Array} tasks an array of task objects to be scheduled
 * @param {Number} number of workers to split tasks between
 * @returns {Array} s an array of length `workers` where each element contains
 * a start property which is the time when the task was started, a finish
 * property which is the time the task was completed and a task property with
 * a reference to the task object assigned in that period
 */
function schedule(tasks, workers) {
  var workerCosts, available, nextTask, ready, cost, currentTime;
  var remaining = priority(tasks.slice());
  var completed = [];
  var w = _.range(workers).map(function() { return []; });
  var inProgress = _.range(workers).map(function() { return null; });
  var times = _.range(workers).map(function() { return 0; });

  while (remaining.length) {

    for (var i = 0; i < remaining.length; i++) {
      nextTask = remaining[i];
      ready = _.chain(nextTask.depends)
        .map(function(task) { return _.contains(completed, task); })
        .all()
        .value();
      if (ready) {
        available = inProgress.indexOf(null);
        w[available].push({
          start: times[available],
          finish: times[available] + nextTask.cost,
          task: nextTask
        });
        times[available] += nextTask.cost;
        inProgress[available] = nextTask;
        _.pullAt(remaining, i);
        break;
      }
    }

    if (remaining.length && i === remaining.length) {
      // there are still tasks but no tasks can proceed
      // add all inProgress to completed and free up both workers
      completed = completed.concat(_.filter(inProgress))
      currentTime = _.max(times);
      times = _.map(times, function(t, i) {
        if (inProgress[i] === null) {
          // these workers had to wait
          t = currentTime;
        }
        return t;
      });
      inProgress = inProgress.map(function() { return null; });
    }

    if (_.filter(inProgress).length === workers) {
      // both workers are busy, free up the next available
      available = times.indexOf(_.min(times));
      completed.push(inProgress[available]);
      inProgress[available] = null;
    }

  }

  return w;

}

module.exports = schedule;
