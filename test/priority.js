var priority = require("../").priority;
var Task = require("../").Task;

var test = require("tap").test;
var shuffle = require("shuffle-array");
var fixtures = require("./fixtures");

test("example1", function(t) {
  t.plan(2);

  // http://www.ctl.ua.edu/math103/scheduling/scheduling_algorithms.htm
  var fixture = fixtures().ex1;

  var tasks = fixture.tasks;
  shuffle(tasks);

  tasks = priority(tasks);
  t.similar(tasks, fixture.priority);

  // priority sorts in place
  shuffle(tasks);
  priority(tasks);
  t.similar(tasks, fixture.priority);

});

test("example2", function(t) {
  t.plan(2);

  // https://www.youtube.com/watch?v=3dYJRpsmSgY
  var fixture = fixtures().ex2;

  var tasks = fixture.tasks;
  shuffle(tasks);

  tasks = priority(tasks);
  t.similar(tasks, fixture.priority);

  shuffle(tasks);
  priority(tasks);
  t.similar(tasks, fixture.priority);

});

test("ties are broken with dependency", function(t) {
  t.plan(1);

  var a = new Task({cost: 0});
  var b = new Task({cost: 0, completeBefore: a});

  var tasks = priority([a, b]);

  t.similar(tasks, [b, a]);

});
