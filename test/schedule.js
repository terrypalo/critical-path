var schedule = require("../").schedule;

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
