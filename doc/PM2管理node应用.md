**PM2可以很方便的用来管理多个node应用，而这多个应用又可以很方便的拆分为macro-service架构**  
为服务架构的好处：  
1，可以组件复用  
2，启动/关闭不同的服务  
3，简易拓展应用  
4，简单维护和理解代码逻辑  

**PM2可以通过json配置，很方便的实现多个服务管理，当然，如果你只有一个，那也是足够可用的**  
比如在processes.json:  
```
[{
  "script"    : "api.js",
  "name"      : "web-api",
  "exec_mode" : "cluster",
  "instances" : -1  // number of CPUs -1
}, {
  "script"    : "worker.js",
  "name"      : "worker",
  "exec_mode" : "fork",
  "watch"     : true,  // auto restart app on change,
  "env"            : {  // common env variables
    "INTERVAL" : 1000
  },
  "env_production" : {  // Used if --env prod
    "INTERVAL" : 60000
  }
}]
```
我们在配置文件中管理了两个应用，现在就可以通过pm2很方便的进行管理了：  
```
$ pm2 start  processes.json
$ pm2 start  processes.json --env production
$ pm2 stop   processes.json
$ pm2 delete processes.json
$ pm2 reload processes.json
# Graceful reload 
$ pm2 gracefulReload processes.json 

# Manage single process
$ pm2 stop   web-api
$ pm2 reload web-api
```
**完整参数列表：**  
```
{
  "name"             : "node-app",
  "cwd"              : "/srv/node-app/current",
  "args"             : ["--toto=heya coco", "-d", "1"],
  "script"           : "bin/app.js",
  "node_args"        : ["--harmony", " --max-stack-size=102400000"],
  "log_date_format"  : "YYYY-MM-DD HH:mm Z",
  "error_file"       : "/var/log/node-app/node-app.stderr.log",
  "out_file"         : "log/node-app.stdout.log",
  "pid_file"         : "pids/node-geo-api.pid",
  "instances"        : 6, //or 0 => 'max'
  "min_uptime"       : "200s", // 200 seconds, defaults to 1000
  "max_restarts"     : 10, // defaults to 15
  "max_memory_restart": "1M", // 1 megabytes, e.g.: "2G", "10M", "100K", 1024 the default unit is byte.
  "cron_restart"     : "1 0 * * *",
  "watch"            : false,
  "ignore_watch"      : ["[\\/\\\\]\\./", "node_modules"],
  "merge_logs"       : true,
  "exec_interpreter" : "node",
  "exec_mode"        : "fork",
  "autorestart"      : false, // enable/disable automatic restart when an app crashes or exits
  "vizion"           : false, // enable/disable vizion features (versioning control)
  // Default environment variables that will be injected in any environment and at any start
  "env": {
    "NODE_ENV": "production",
    "AWESOME_SERVICE_API_TOKEN": "xxx"
  }
  "env_*" : {
    "SPECIFIC_ENV" : true
  }
}
```

**切换不同环境：**  
You may have noticed that you can declare environment-specific variables with the attribute env_* (e.g. env_production, env_staging...). These can be switched easily. You just need to specify the --env <environment_name> when acting on the application declaration.

```
# Inject what is declared in env_production
$ pm2 start app.json --env production 

# Inject what is declared in env_staging
$ pm2 restart app.json --env staging
```
