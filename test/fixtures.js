var Task = require("../").Task;

var test = require("tap").test;

// keep fixtures from showing up as pending
test("fixtures", function(t) {
  t.end();
});

module.exports = function() {
  // http://www.ctl.ua.edu/math103/scheduling/scheduling_algorithms.htm
  var ex1 = {};
  var a = ex1.a = new Task({cost: 3});
  var f = ex1.f = new Task({cost: 2});
  var x = ex1.x = new Task({cost: 4, completeBefore: [a, f]});
  var q = ex1.q = new Task({cost: 2, completeBefore: [a, x]});
  ex1.tasks = [a, f, x, q];
  ex1.priority = [q, x, a, f];

  // https://www.youtube.com/watch?v=3dYJRpsmSgY
  // edited to remove tie between t7 and t8
  var ex2 = {};
  var t9 = ex2.t9 = new Task({name: "t9", cost: 10});
  var t8 = ex2.t8 = new Task({name: "t8", cost: 4});
  var t7 = ex2.t7 = new Task({name: "t7", cost: 5});
  var t6 = ex2.t6 = new Task({name: "t6", cost: 7, completeBefore: t8});
  var t5 = ex2.t5 = new Task({name: "t5", cost: 8, completeBefore: t9});
  var t4 = ex2.t4 = new Task({name: "t4", cost: 11, completeBefore: [t7, t8]});
  var t3 = ex2.t3 = new Task({name: "t3", cost: 8, completeBefore: [t5, t6]});
  var t2 = ex2.t2 = new Task({name: "t2", cost: 7, completeBefore: [t4, t5]});
  var t1 = ex2.t1 = new Task({name: "t1", cost: 6, completeBefore: t5});
  ex2.tasks = [t1, t2, t3, t4, t5, t6, t7, t8, t9];
  ex2.priority = [t3, t2, t1, t5, t4, t6, t9, t7, t8];
  ex2.schedule = [
    [
      {start: 0, finish: 8, task: t3},
      {start: 8, finish: 19, task: t4},
      {start: 19, finish: 26, task: t6},
      {start: 26, finish: 31, task: t7},
      {start: 31, finish: 35, task: t8}
    ],
    [
      {start: 0, finish: 7, task: t2},
      {start: 7, finish: 13, task: t1},
      {start: 13, finish: 21, task: t5},
      {start: 21, finish: 31, task: t9}
    ]
  ];

  return {
    ex1: ex1,
    ex2: ex2
  };
};
