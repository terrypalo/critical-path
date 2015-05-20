var _ = require("lodash");
var priority = require("./priority");

/**
 * Schedule a set of tasks amongst some workers
 *
 * @param {Array} tasks an array of task objects to be scheduled
 * @param {Number} number of workers to split tasks between
 * @returns {Object} schedule
 * @returns {Number} schedule.cost the max worker cost
 * @returns {Array} schedule.workers an array of length `workers` with tasks
 * assigned in to each worker in the order they should be completed
 */
function schedule(tasks, workers) {
  var workerCosts, available, nextTask, ready, cost;
  var remaining = priority(tasks.slice());
  var completed = [];
  var w = _.range(workers).map(function() { return []; });
  var inProgress = _.range(workers).map(function() { return null; });

  while (remaining.length) {

    for (var i = 0; i < remaining.length; i++) {
      nextTask = remaining[i];
      ready = _.chain(nextTask.depends)
        .map(function(task) { return _.contains(completed, task); })
        .all()
        .value();
      if (ready) {
        available = inProgress.indexOf(null);
        w[available].push(nextTask);
        inProgress[available] = nextTask;
        _.pullAt(remaining, i);
        break;
      }
    }

    if (remaining.length && i === remaining.length) {
      // there are still tasks but no tasks can proceed
      // add all inProgress to completed and free up both workers
      completed = completed.concat(_.filter(inProgress))
      inProgress = inProgress.map(function() { return null; });
    }

    if (_.filter(inProgress).length === workers) {
      // both workers are busy, free up the next available
      workerCosts = _.map(w, function(worker) {
        return _.sum(worker, "cost");
      });
      available = workerCosts.indexOf(_.min(workerCosts));
      completed.push(inProgress[available]);
      inProgress[available] = null;
    }

  }

  cost = _.chain(w)
    .map(function(worker) { return _.sum(worker, "cost"); })
    .max()
    .value();

  return {
    cost: cost,
    workers: w
  };

}

module.exports = schedule;
