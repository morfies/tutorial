const co = require('co');

const tasks = [];

function delayLog() {
  return function* (index) {
    return yield new Promise((resolve, reject) => {
      const delay = 1000 // * Math.random(10);
      setTimeout(() => resolve(`${index}--${delay}`), delay);
    });
  }
}

for (let i = 0; i < 100; i++) {
  tasks.push(delayLog());
}

function* parallel(concurrencyId) {
  console.log('cid:', concurrencyId);
  const gen = tasks.shift();
  if (!gen) return;

  const res = yield* gen(concurrencyId);
  console.log(res);
  yield parallel(concurrencyId);
}

const concurrency = 5;
for (let j = 0; j < concurrency; j++) {
  co(function* () {
    yield parallel(j);
  });
}
