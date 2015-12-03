# node编码规范
主要参考dead-horse大神整理的[规范](https://github.com/dead-horse/node-style-guide)  
这里列一下我自己所还没养成习惯的规范：  
* 2空格缩进  
Sublime Text 2 设置(perfernces > Settings - User):  
```js
    "tab_size": 2,
    "translate_tabs_to_spaces": true
```

* 换行使用unix风格的换行符  
Sublime Text 2 设置(perfernces > Settings - User)：  
```js
    "default_line_ending": "unix"
```    

* 去除末尾多余空格  
Sublime Text 2 设置(perfernces > Settings - User)：  
```js
    "trim_trailing_white_space_on_save": true
```    

* 每行最多80字符  
Sublime Text 2 设置(perfernces > Settings - User)： 
```js
    "rules": [80]
```

* 使用单引号  
除非编写json文件，其它字符串等，都请使用单引号

* 使用 === 比较符  

* 三元操作符请分行  
```js
    a === b
    ? a
    : b;
```    
* 写精简函数，不超过15行  

* 给你的闭包命名  
可以更好的生成堆栈信息和CPU调用信息

* 不要嵌套闭包  
使用闭包，但是不要嵌套他们，否则你的代码将会一团糟。  
Right:  
```js
    setTimeout(function() {
      client.connect(afterConnect);
    }, 1000);
    
    function afterConnect() {
      console.log('winning');
    }
```
Wrong:  

```js
    setTimeout(function() {
      client.connect(function() {
        console.log('losing');
      });
    }, 1000);
```

* 使用 // 进行注释  
不管是单行注释还是多行注释，并且，尽量写高层次的注释，就是整体性的，不要在细节上写太多无用注释

* 继承，请尽量用node原生，即`util.inherits` 

* 文件命名 _ 分割，如果不想暴露的文件，_开头  

* 变量、函数名等，小驼峰命名  

* 类名，大驼峰；常亮，全大写  


# Express 项目目录结构
* controllers 存放所有router文件，router中的逻辑尽量精简，复杂逻辑封装进库
* helpers 第三方库或者自己封装的一些辅助类库，比如整个项目的config.js,自定义配置的logger.js,基础工具库baseUtil.js等等
* middlewares 中间件文件，比如健全，数据封装等
* models 数据层文件，封装数据库操作
* libs 复杂逻辑封装入库
* public 前端静态资源(后期这些资源可以选择性放CDN)
* views 前端页面模板(后期这些资源可以选择性放CDN)
* package.json 本项目的依赖库
* pm2config.json 如果使用pm2，这个文件放置pm2的启动配置
* index.js 项目入口文件，加载资源、启动监听

# 常用组件
* 数据库使用mysql2(基于mysql)，一定要用连接池。[连接示例](https://github.com/morfies/tutorial/blob/node-lyn/code/mysql2-conn.js)
* 缓存使用ioredis(redis也不错，ioredis的benchmark更好)，可以使用express-redis-cache简单的对路由级别进行缓存
* 日志使用bunyan，生成json格式日志，就是time格式不能自定义，ISO格式看不懂的话，需要自己塞比如Date().toLocaleString()进去
* 

