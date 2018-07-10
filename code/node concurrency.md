有时候为了加快执行，可以在单线程的node中并发执行任务
通常有两种方案，一是利用yield特性，yield一个数组，即将你的任务拆分成多个数组，一批一批的执行，但是这样有短板效应，即会等到当前批次所有都执行完毕后才会开始下一批次

另一种方案就是下面代码示例的，避免了短板效应

```js
var co = require('co');
var tasks = [];
function* delayLog() {
  return yield new Promise((resolve, reject) => {
    setTimeout(function() { resolve(1) }, 1000 * Math.random(10));
  });
}
for (var i = 0; i < 100; i++) {
  tasks.push(delayLog(i));
}
function* parallel(concurrencyId) {
  console.log('concurrencyId::', concurrencyId);
  var fn = tasks.shift();
  if (!fn) {
    return;
  }
  var res = yield fn;
  console.log(res);
  yield parallel(concurrencyId);
}
var concurrency = 5;
for (var i = 0; i < concurrency; i++) {
  co(function* () {
    yield parallel(i);
  });
}
```
