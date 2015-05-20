var Task = require("../").Task;

var test = require("tap").test;

test("constructor", function(t) {

  t.test("name is set", function(tt) {
    tt.plan(1);
    var task = new Task({name: "foo", cost: 12});
    tt.equal(task.name, "foo");
  });

  t.test("cost is set", function(tt) {
    tt.plan(1);
    var task = new Task({cost: 42});
    tt.equal(task.cost, 42);
  });

  t.test("cost must be positive", function(tt) {
    tt.plan(1);
    tt.throws(function() { new Task({cost: -1}); });
  });

  t.test("single depends are set", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33, depends: foo});
    tt.similar(bar.depends, [foo]);
    tt.similar(foo.completeBefore, [bar]);
  });

  t.test("multiple depends are set", function(tt) {
    tt.plan(3);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    var baz = new Task({cost: 5, depends: [foo, bar]});
    tt.similar(baz.depends, [foo, bar]);
    tt.similar(foo.completeBefore, [baz]);
    tt.similar(bar.completeBefore, [baz]);
  });

  t.test("single completeBefore are set", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33, completeBefore: foo});
    tt.similar(bar.completeBefore, [foo]);
    tt.similar(foo.depends, [bar]);
  });

  t.test("multiple completeBefores are set", function(tt) {
    tt.plan(3);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    var baz = new Task({cost: 5, completeBefore: [foo, bar]});
    tt.similar(baz.completeBefore, [foo, bar]);
    tt.similar(foo.depends, [baz]);
    tt.similar(bar.depends, [baz]);
  });

  t.test("both depends and completeBefore can be set", function(tt) {
    tt.plan(4);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    var baz = new Task({cost: 5, depends: foo, completeBefore: bar});
    tt.similar(baz.completeBefore, [bar]);
    tt.similar(baz.depends, [foo]);
    tt.similar(foo.completeBefore, [baz]);
    tt.similar(bar.depends, [baz]);
  });

  t.end();

});

test("neededBy", function(t) {

  t.test("non-dependent tasks", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 42});
    tt.equal(foo.neededBy(bar), false);
    tt.equal(bar.neededBy(foo), false);
  });

  t.test("direct dependencies", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    var baz = new Task({cost: 5, completeBefore: [foo, bar]});
    tt.equal(baz.neededBy(foo), true);
    tt.equal(baz.neededBy(bar), true);
  });

  t.test("indirect depencencies", function(tt) {
    tt.plan(1);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33, completeBefore: foo});
    var baz = new Task({cost: 5, completeBefore: bar});
    tt.equal(baz.neededBy(foo), true);
  });

  t.end();

});

test("dependsOn", function(t) {

  t.test("non-dependent tasks", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 42});
    tt.equal(foo.dependsOn(bar), false);
    tt.equal(bar.dependsOn(foo), false);
  });

  t.test("direct dependencies", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    var baz = new Task({cost: 5, depends: [foo, bar]});
    tt.equal(baz.dependsOn(foo), true);
    tt.equal(baz.dependsOn(bar), true);
  });

  t.test("indirect depencencies", function(tt) {
    tt.plan(1);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33, depends: foo});
    var baz = new Task({cost: 5, depends: bar});
    tt.equal(baz.dependsOn(foo), true);
  });

  t.end();

});

test("criticalCost", function(t) {

  t.test("cost is returned if there are no dependencies", function(tt) {
    tt.plan(1);
    var task = new Task({cost: 42});
    tt.equal(task.criticalCost, 42);
  });

  t.test("cost + criticalCost is returned for 1 dependency", function(tt) {
    tt.plan(1);
    var foo = new Task({cost: 1});
    var bar = new Task({cost: 2, completeBefore: foo});
    tt.equal(bar.criticalCost, 3);
  });

  t.test("cost + Max of dependent criticalCost", function(tt) {
    tt.plan(1);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    var baz = new Task({cost: 5, completeBefore: [foo, bar]});
    tt.equal(baz.criticalCost, 47);
  });

  t.test("indirect dependencies", function(tt) {
    tt.plan(1);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33, completeBefore: foo});
    var baz = new Task({cost: 5, completeBefore: bar});
    tt.equal(baz.criticalCost, 42 + 33 + 5);
  });

  t.end();

});

test("addCompleteBefore", function(t) {

  t.test("direct dependency", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    bar.addCompleteBefore(foo);

    tt.equal(bar.neededBy(foo), true);
    tt.equal(foo.dependsOn(bar), true);
  });

  t.test("indirect dependency", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    var baz = new Task({cost: 5});
    bar.addCompleteBefore(foo);
    baz.addCompleteBefore(bar);

    tt.equal(baz.neededBy(foo), true);
    tt.equal(foo.dependsOn(baz), true);
  });

  t.test("throws on circular dependencies", function(tt) {
    tt.plan(3);
    var t1 = new Task({cost: 1});
    var t2 = new Task({cost: 1, completeBefore: t1});
    tt.throws(function() { t1.addCompleteBefore(t2); });
    tt.similar(t1.completeBefore, []);
    tt.similar(t2.depends, []);
  });

  t.end();

});

test("addDependency", function(t) {

  t.test("direct dependency", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    bar.addDependency(foo);

    tt.equal(bar.dependsOn(foo), true);
    tt.equal(foo.neededBy(bar), true);
  });

  t.test("indirect dependency", function(tt) {
    tt.plan(2);
    var foo = new Task({cost: 42});
    var bar = new Task({cost: 33});
    var baz = new Task({cost: 5});
    bar.addDependency(foo);
    baz.addDependency(bar);

    tt.equal(baz.dependsOn(foo), true);
    tt.equal(foo.neededBy(baz), true);
  });

  t.test("throws on circular dependencies", function(tt) {
    tt.plan(3);
    var t1 = new Task({cost: 1});
    var t2 = new Task({cost: 1, depends: t1});
    tt.throws(function() { t1.addDependency(t2); });
    tt.similar(t2.completeBefore, []);
    tt.similar(t1.depends, []);
  });

  t.end();

});
