const cluster = require('cluster');

if (cluster.isMaster) {
  console.log('I am master');

  cluster.fork();

  cluster.on('disconnect', worker => {
    console.log(`#${worker.id} disconnected`);
    console.log(`is worker (${worker.process.pid} dead? `, worker.isDead());
  });

  // this is where API recommands to fork new workers
  cluster.on('exit', (worker, code, signal) => {
    console.log('worker %d died (%s). restarting...', worker.process.pid, worker.isDead());
    // 取消监听，防止内存泄露
    worker.removeAllListeners();
    // 异步，要跟踪新worker请监听事件
    cluster.fork();
  });

  cluster.on('fork', worker => {
    console.log('new worker forked %d', worker.process.pid);
    worker.on('listening', (address) => {
      // need to send after listening
      console.log('listening ', address);
      console.log('worker#send %d', worker.process.pid);
      worker.send('xxx');
    });
    worker.on('message', (msg) => {
      console.log('Msg from child ', msg);
      if ('error-quit' === msg) {
        console.log('the worker is going down, maybe need to to something in the master process!');
      }
    });
  });
    

} else if (cluster.isWorker) {
  const net = require('net');
  const server = net.createServer((socket) => {
    // connections never end
    console.log('req received');
    throw new Error('fucked');
  });

  server.listen(8000);
//	console.log('w', process.env);
  console.log(`I am worker #${cluster.worker.id}, (${process.pid})`);
  process.on('message', (msg) => console.log('msg from master:', msg));
  console.log('isConnected:', process.connected);
  // 如果不监听uncaughtException，则在抛错后，进程会直接退出
  process.on('uncaughtException', (err) => {
    console.log('====uncaughtException====');
    process.send('error-quit');
    // once disconnected, the server listening is shut down directly and this worker process is killed.
    // 'In a worker, this function will close all servers, wait for the 'close' event on those servers, and then disconnect the IPC channel.'
    // 'Note that after a server is closed, it will no longer accept new connections, but connections may be accepted by any other listening worker. Existing connections will be allowed to close as usual. When no more connections exist, see server.close(), the IPC channel to the worker will close allowing it to die gracefully.'
    process.disconnect();
  });
}
