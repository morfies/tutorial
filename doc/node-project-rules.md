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

* 继承，请尽量用node原生，即util.inherits  

* 文件命名 _ 分割，如果不想暴露的文件，_开头  

* 变量、函数名等，小驼峰命名  

* 类名，大驼峰；常亮，全大写  


# Express 项目目录结构

# 常用组件
