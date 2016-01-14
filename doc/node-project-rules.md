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
* `controllers` 存放所有router文件，router中的逻辑尽量精简，复杂逻辑封装进库
* `helpers` 第三方库或者自己封装的一些辅助类库，比如整个项目的config.js,自定义配置的logger.js,基础工具库baseUtil.js等等
* `middlewares` 中间件文件，比如健全，数据封装等
* `models` 数据层文件，封装数据库操作
* `libs` 复杂逻辑封装入库
* `public` 前端静态资源(后期这些资源可以选择性放CDN)
* `views` 前端页面模板(后期这些资源可以选择性放CDN)
* `package.json` 本项目的依赖库
* `pm2config.json` 如果使用pm2，这个文件放置pm2的启动配置
* `index.js` 项目入口文件，加载资源、启动监听

# 常用组件
* 数据库使用`mysql2`(基于mysql)，一定要用连接池。[连接示例](https://github.com/morfies/tutorial/blob/node-lyn/code/mysql2-conn.js)
* 缓存使用`ioredis`(redis也不错，ioredis的benchmark更好)，可以使用`express-redis-cache`简单的对路由级别进行缓存
* 日志使用`bunyan`，生成`json`格式日志，就是`time`格式不能自定义，ISO格式看不懂的话，需要自己塞比如`Date().toLocaleString()`进去;
  winston用作日志，可以添加exceptionHandlers，在程序出现异常时可以扑捉异常信息到日志文件
* 邮件模块使用nodemailer
* `express-session & connection-redis` for [session](https://github.com/morfies/tutorial/blob/node-lyn/code/session.js)
* 加密密码用bcrypt
* 队列有`bull`和`kue`可以选择，两者都是基于`redis`的，都有持久化功能，`kue`有web界面可以查看队列情况；需要注意的是目前`bull`中有使用阿里云`kvstore`不支持的指令
* 二维码生成使用的是qr-image
```js
router.get('/qr/:text', function(req, res) {
	var text = req.params.text;
	if (util.isEmpty(text)) {
		res.send("no text to qr encode");
		return;
	}
	text = decodeURIComponent(text);
	console.log("=======qr==text:" + text);
	var code = qr.image(text, {
		type: 'png',
		ec_level: 'H',
		size: 10,
		margin: 0
	});
	res.setHeader('Content-type', 'image/png');
	code.pipe(res);
});
```
* 测试框架`mocha`；断言库:`should.js, expect.js, chai`；覆盖率`instanbul, jscover, blanket`；Mock库`muk`；测试私有方法:`rewire`；web测试: `supertest`；持续集成: `Travis-cli`
* 物流系统，直接使用第三方API，[爱快递](http://www.aikuaidi.cn/api/)或者[聚合数据](http://www.juhe.cn/docs/api/id/43)

# 动静分离
后端接口全部restful提供纯数据接口，前端走诸如underscore template或者angular，js异步调用数据接口；  
并且，node之前最好架设nginx，所有静态资源全部拦截在nginx层，nginx可以相当高效的负载静态资源的请求，并且可以方便设置缓存、压缩等策略，
只把真正的数据请求接口向下转发到node本身。  
在使用KOA的过程中，一开始想使用koa-static中间件直接serve静态资源，发现即使设置了maxage，也不能启用浏览器缓存，还没来得及看源码，
不知是不是bug，我直接切换到由nginx负责serve静态资源，浏览器缓存立马见效了
![after nginx](https://goo.gl/photos/Qzm7Xqkpu1bEu6uu5)

