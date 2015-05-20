var schedule = require("../").schedule;
var Task = require("../").Task;

var test = require("tap").test;
var shuffle = require("shuffle-array");
var _ = require("lodash");
var fixtures = require("./fixtures");

test("example", function(t) {
  t.plan(1);

  // https://www.youtube.com/watch?v=3dYJRpsmSgY
  var fixture = fixtures().ex2;

  var tasks = fixture.tasks;
  shuffle(tasks);

  t.similar(schedule(tasks, 2), fixture.schedule);

});

test("costly dependent tasks are cleared", function(t) {
  t.plan(1);

  var t1 = new Task({cost: 1000});
  var t2 = new Task({cost: 2, depends: t1});
  var t3 = new Task({cost: 1, depends: t1});

  var s = schedule([t1, t2, t3], 2);

  var expected = [
    [
      {start: 0, finish: 1000, task: t1},
      {start: 1000, finish: 1002, task: t2}
    ],
    [
      {start: 1000, finish: 1001, task: t3}
    ]
  ];

  t.similar(s, expected);

});
