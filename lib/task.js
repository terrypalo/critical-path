var assert = require("assert");
var _ = require("lodash");

/**
 * Creates a Task object
 *
 * @constructor
 * @param {Object} options options describing the Task
 * @param {number} options.cost the task's cost. must be positive
 * @param {Array|Object} [options.completeBefore] either a single Task object or
 * an array of Task objects which this task must be completed before working on
 * @param {Array|Object} [options.depends] either a single Task object or an
 * array of Task objects which this task depends on
 * @param {string} [options.name] a name for the task
 */
function Task(options) {
  this.depends = [];
  this.name = options.name || null;
  this.cost = options.cost;
  this.completeBefore = [].concat(options.completeBefore || []);
  this.completeBefore.forEach(function(task) {
    task.addDependency(this);
  }.bind(this));
  this.depends = [].concat(options.depends || []);
  this.depends.forEach(function(task) {
    task.addCompleteBefore(this);
  }.bind(this));

  assert(this.cost >= 0, "`options.cost` must be a positive number");
}

/**
 * Checks whether this task needs to be completed by another task
 *
 * @param {Task} other another task object
 * @returns {boolean} true if this task must be completed before the other task
 */
Task.prototype.neededBy = function(other) {
  if (this.completeBefore.indexOf(other) !== -1) {
    return true;
  }
  for (var i = 0; i < this.completeBefore.length; i++) {
    if (this.completeBefore[i].neededBy(other)) {
      return true;
    }
  }
  return false;
};

/**
 * Checks whether this task depends on another task
 *
 * @param {Task} other another task object
 * @returns {boolean} true if this task depends on the other task
 */
Task.prototype.dependsOn = function(other) {
  return other.neededBy(this);
};

/**
 * Add a dependency
 *
 * @param {Task} other another task object
 */
Task.prototype.addDependency = function(other) {
  assert(!other.dependsOn(this), "cannot define circular dependencies");
  if (this.depends.indexOf(other) === -1) {
    this.depends.push(other);
  }
  if (other.completeBefore.indexOf(this) === -1) {
    other.addCompleteBefore(this);
  }
};

/**
 * Add a task that needs to be completed by this
 *
 * @param {Task} other another task object
 */
Task.prototype.addCompleteBefore = function(other) {
  assert(!other.neededBy(this), "cannot define circular dependencies");
  if (this.completeBefore.indexOf(other) === -1) {
    this.completeBefore.push(other);
  }
  if (other.depends.indexOf(this) === -1) {
    other.addDependency(this);
  }
};

/**
 * This is equal to the tasks cost plus the maximum of the critical cost of its
 * direct dependencies.
 *
 * @name Task#criticalCost
 * @property {number} criticalCost the critical cost of the task
 */
Object.defineProperty(Task.prototype, "criticalCost", {
  get: function() {
    if (this.completeBefore.length === 0) {
      return this.cost;
    } else {
      var critical = _.chain(this.completeBefore)
        .pluck("criticalCost")
        .max()
        .value();
      return this.cost + critical;
    }
  },
  enumerable: true
});

module.exports = Task;
