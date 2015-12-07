## 简介
APIs犹如线索，大家可以借助之用来编制出丰富的web体验(也就是服务端的API可以很方便的在错综复杂的网络环境中各种调用)，
但是，当这种体验移植到客户端时，我们会发现有各种限制，比如跨域访问的请求就被限制在要么使用`JSON-P`(由于安全因素，使用并不广泛)，
或者通过自定义代理服务器(部署和维护可真够头痛的)。

**Cross-Origin Resource Sharing(CORS)** 是W3C专门用来允许浏览器端跨域通讯的一个标准，它是构建在`XMLHttpRequest`对象之上，
允许开发者能够像在同一个域名下一样跨域发起web请求。

`CORS`的使用场景很简单，想象网站`alice.com`拥有网站`bob.com`想要访问的数据，这种类型的请求，在传统的浏览器同源策略限制下，是被禁止的。
但是，如果支持了`CORS`，`alice.com`站点能够通过添加几个特别的响应头，以允许`bob.com`访问其所拥有的数据。

从上面场景可以看出，`CORS`是需要客户端和服务端有协调过程的，幸运的是，如果你只是前端开发人员，你不用关心绝大部分细节。
接下来的内容将讨论客户端如何发起跨域请求，以及服务端如何配置以支持`CORS`。

## 发起`CORS`请求
这部分讲解如何在js中发起一个跨域请求

### 创建`XMLHttpRequest`对象
CORS在以下浏览器中有支持：
* Chrome 3+
* Firefox 3.5+
* Opera 12+
* Safari 4+
* Internet Explorer 8+
(这里可以查看完整的支持列表，http://caniuse.com/#search=cors)

Chrome、FF、Opera、Safari都是使用`XMLHttpRequest2`对象， IE使用相似的`CDomainRequest`对象。
我们先从创建一个请求对象开始，Nicholas Zakas大神的一个[helper方法](http://www.nczonline.net/blog/2010/05/25/cross-domain-ajax-with-cross-origin-resource-sharing/)
，帮我们解决浏览器差异:  

```js
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHttpRequest2 objects.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // Otherwise, CORS is not supported by the browser.
    xhr = null;
  }
  return xhr;
}

var xhr = createCORSRequest('GET', url);
if (!xhr) {
  throw new Error('CORS not supported');
}
```
### 事件回调
原来的`XMLHttpRequest`对象仅仅一个事件回调，即`onreadystatechange`，由它处理所有的响应。
XMLTttpRequest2中onredaystatechange虽然任然存在，但也引入了几个其它的处理事件：
* onloadstart*  当请求开始时触发
* onprogress    当加载和传输数据时触发
* onabort*      当请求被终止，例如调用abort()方法
* onerror       当请求错误时触发
* onload        当请求成功结束
* ontimeout     当指明的timeout在请求完成前超时时触发
* onloadend*    当请求结束(不论成功或失败)
以上标星的都是不被IE XDomainRequest支持的

大多数情况下，你至少需要处理`onload` 和 `onerror` 两个事件：
```js
xhr.onload  = function () {
  var responseText = xhr.responseText;
  console.log(responseText);
  // process the response.
};

xhr.onerror = function () {
  console.log('There was an error!');
};
```
### withCredentials
标准的`CORS`请求默认不会发送或者设置任何`cookie`的，为了给请求中添加`cookie`，你需要设置 `XMLHttpRequest` 的 `withCredentials` 属性为true：  
```js
xhr.withCredentials = true;
```
为了保证正常工作，服务器还必须添加响应头
```js
"Access-Control-Allow-Credentials": true
```
`.withCredential`属性将把远程服务器的所有`cookie`包含进请求，并且会将服务器返回的`cookie`设置进去；但是需要注意，这些`cookie`任然
遵从同源策略的，也就是说，如果你是跨域请求，你在`document.cookie`或者`response.headers`中是不能访问`cookie`的，它们只能在远程跨域的服务器中操作。

### 发送跨域请求
现在你的`CORS`请求对象已经配置完毕，可以发送请求了：
```js
xhr.send();
```
如果请求有`body`对象，可以通过参数方式传递给`send`方法。

假设服务器配置得当，你的`onload`回调将会收到响应，就和同源的异步请求一样。  
下面是完整的示例代码：
```hs
// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest() {
  // All HTML5 Rocks properties support CORS.
  var url = 'http://updates.html5rocks.com';

  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
    alert('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  xhr.send();
}
```
### 给服务器配置CORS
`CORS`的绝大部分负载都发生在浏览器和服务器之间，浏览器会添加额外的请求头，有时还会有额外的请求发生，这些额外动作都
被浏览器隐藏，但是我们可以通过抓包工具比如`wireshark`看清出整个请求过程：
![CORS Flow](http://www.html5rocks.com/static/images/cors_flow.png)  

浏览器厂商会负责浏览器端的实现，本部分解释服务器上是如何配置其响应头的.

### CORS的请求类型
跨域请求主要有两种：
1，简单请求
2，非简单请求

满足如下条件的都是简单请求：
* HTTP请求方法(大小写敏感)匹配如下一种:
  * HEAD
  * GET
  * POST
* HTTP头(大小写敏感)匹配如下:
  * Accept
  * Accept-Language
  * Content-Language
  * Last-Event-ID
  * Content-Type, 但仅限于值为如下一种:
    * application/x-www-form-urlencoded
    * multipart/form-data
    * text/plain
简单请求被划分为这些特征是因为这种请求已经能在不使用`CORS`的情况下，被浏览器所支持，
比如`JSON-P`就能够发起一个跨域的`GET`请求，或者`HTML`页面可以直接被用来作一个表单的`POST`请求。

任何其它不满足上面标准的请求都是一个非简单请求，需要一点额外的通讯，也就是`preflight`请求

### 处理一个简单请求
让我们从解释一个客户端发起的简单请求开始，下面代码中，`CORS`相关的头用粗体显示：
JavaScript:  

```js
var url = 'http://api.alice.com/cors';
var xhr = createCORSRequest('GET', url);
xhr.send();
```
HTTP Request:  

GET /cors HTTP/1.1    
**Origin**: http://api.bob.com  
Host: api.alice.com  
Accept-Language: en-US  
Connection: keep-alive  
User-Agent: Mozilla/5.0...  

第一个值得注意的就是，一个合法的`CORS`请求总是会包含一个`Origin`头，该请求头被浏览器添加的，而且不被用户控制。
该字段的值是发起该请求的网址的 `schema+domain+port`

`Origin`请求头的存在并不意味着该请求是一个跨域请求，虽然所有跨域请求都会包含`Origin`头，有些同源请求也会包含该字段，
比如`FF`在同源请求中不包括`Origin`，但是`chrome`和`safari`中，即使是同源，**PUT/POST/DELETE**请求都会包含`Origin`。

如下是一个CORS请求的响应头例子：  
**Access-Control-Allow-Origin**: http://api.bob.com    
**Access-Control-Allow-Credentials**: true    
**Access-Control-Expose-Headers**: FooBar  
Content-Type: text/html; charset=utf-8  

所有CORS相关的头都是以"Access-Control-"为前缀的，如下是这些字段的详细介绍：
* `Access-Control-Allow-Origin`(required) - 该字段必须在所有合法的CORS响应头中存在，删除该字段会导致CORS请求失败，字段值
可以是`Origin` header所指定的值，也可以是'*'表示所有请求来源都被允许。
* `Access-Control-Allow-Credentials`(optional) - 默认情况下，CORS请求中并不包含`cookies`，本header表示cookies需要包含在请求中，
该header的唯一合法值是`true`，如果你不需要`cookies`，直接不使用该字段即可，不能设为`false`.
`Access-Control-Allow-Credentials` 头需要和`XMLHttpRequest2`对象的`withCredentials`属性配合使用，为了保证`CORS`请求正常工作，
这两个属性都需要设置为`true`。
* `Access-Control-Expose-Headers`(optional) - `XMLHttpRequest2`对象有一个`getResponseHeader()`方法，该方法会返回特定响应头的值，
在CORS请求中，`getResponseHeader()`方法只能访问简单请求的响应头字段：
  * Cache-Control
  * Content-Type
  * Expires
  * Last-Modified
  * Pragma
如果你想让客户端访问其它`header`，你就得设置`Access-Control-Expose-Headers`头了，其值是逗号分隔的你允许的头字段。

### 处理**非**简单请求
上面介绍的都是简单请求所需的了，如果你需要做更多的事，比如想支持其它的HTTP方法，比如`PUT or DELETE`， 或者接口想支持
`JSON`，即`Content-Type: application/json`，那么，你就需要处理非简单请求了。

一个**非**简单请求在浏览器的`network`中看上去会只有一个请求，但实际由两个请求组成：
1, 浏览器首先发出一个`preflight`请求，该请求向`server`申请访问权限
2, 一旦`preflight`的权限被确认，浏览器发出真正的请求  
`preflight`请求是可以被`cache`住的，这样就不会每一个请求都会附带`preflight`了。

下面是一个例子：
JavaScript:
```js
var url = 'http://api.alice.com/cors';
var xhr = createCORSRequest('PUT', url);
xhr.setRequestHeader('X-Custom-Header', 'value');
xhr.send();
```

Preflight Request:  
OPTIONS /cors HTTP/1.1  
**Origin**: http://api.bob.com  
**Access-Control-Request-Method**: PUT  
**Access-Control-Request-Headers**: X-Custom-Header  
Host: api.alice.com  
Accept-Language: en-US  
Connection: keep-alive  
User-Agent: Mozilla/5.0...  

和简单请求一样，浏览器会添加`Origin`头给每一个请求，包括`preflight`。
`preflight`请求是`OPTIONS`方法(**需要确保你的服务器支持该方法**)，然后它还包含一些请求头：
* `Access-Control-Request-Method` - 真实请求的HTTP方法
* `Access-Control-Request-Headers` - 逗号分隔的真实请求会包含的非简单请求头

`preflight`请求是征询服务器权限的一种方式，在发起真实请求之前，服务器检查上面两个请求头都是合法并且都可以接受的。  

如果检查通过，服务器会返回如下报文：
```js
**Access-Control-Allow-Origin**: http://api.bob.com
**Access-Control-Allow-Methods**: GET, POST, PUT
**Access-Control-Allow-Headers**: X-Custom-Header
Content-Type: text/html; charset=utf-8
```
* `Access-Control-Allow-Origin`(required) - 和简单请求一样，`preflight`返回头必须包含该字段
* `Access-Control-Allow-Methods`(required) - 逗号分隔的，支持的`HTTP`方法，
注意虽然`preflight`请求只会征询一种方法的权限，返回的响应中，依然会包含服务器所支持的所有方法，这是有用的，因为
`preflight`请求结果会被缓存。
* `Access-Control-Allow-Headers`(`Access-Control-Request-Headers`如果在请求头存在的话，该字段必须) - 逗号分隔的所支持的请求头
列出来的也是服务器所支持的所有支持的请求头
* `Access-Control-Allow-Credentials`(opetional) - 和简单请求一致
* `Access-Control-Max-Age`(optional) - 如果每个请求都包含`preflight`会很重载，该字段可以用来指定将`preflight`响应**缓存**多少秒

一旦`preflight`得到授权，真实请求就会发生，正式请求和简单请求相似，响应也需要按照同样的方式处理：  
真实请求：  
```js
PUT /cors HTTP/1.1
Origin: http://api.bob.com
Host: api.alice.com
X-Custom-Header: value
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```
真实响应：  
```js
Access-Control-Allow-Origin: http://api.bob.com  
Content-Type: text/html; charset=utf-8  
```
如果服务器想拒绝`CORS`请求，可以返回通用报文，即不包含任何`CORS` headers，**浏览器看不到CORS响应头，就会认为该请求非法**
进而不会发出真实请求。

`Preflight`请求：
```js
OPTIONS /cors HTTP/1.1
Origin: http://api.bob.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```
`preflight`响应：
```js
// ERROR - No CORS headers, this is an invalid request!
Content-Type: text/html; charset=utf-8
```
如果`CORS`请求发生错误，浏览器会触发客户端的`onerror`回调，`console`控制台会有如下错误打印：  
`XMLHttpRequest cannot load http://api.alice.com. Origin http://api.bob.com is not allowed by Access-Control-Allow-Origin.`

### 关于安全
`CORS`并不是安全管控的替代品，你不能依赖`CORS`头来管控你的资源，鉴权还是需要其他方法，比如`cookies`或者`OAuth2`

### jQuery中的CORS
`jQuery`中的`$.ajax()`方法能够被用来发起普通`XHR`请求和`CORS`请求，关于`jQuery`的实现：  
1，`jQuery`的`CORS`实现不支持IE的`XDomainRequest`对象，但是有插件做这事 http://bugs.jquery.com/ticket/8283
2，`$.support.cors` 在支持`CORS`的浏览器中会返回`true`，可以用这个值来判断
下面是个例子：  
```js
$.ajax({

  // The 'type' property sets the HTTP method.
  // A value of 'PUT' or 'DELETE' will trigger a preflight request.
  type: 'GET',

  // The URL to make the request to.
  url: 'http://updates.html5rocks.com',

  // The 'contentType' property sets the 'Content-Type' header.
  // The JQuery default for this property is
  // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
  // a preflight. If you set this value to anything other than
  // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
  // you will trigger a preflight request.
  contentType: 'text/plain',

  xhrFields: {
    // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
    // This can be used to set the 'withCredentials' property.
    // Set the value to 'true' if you'd like to pass cookies to the server.
    // If this is enabled, your server must respond with the header
    // 'Access-Control-Allow-Credentials: true'.
    withCredentials: false
  },

  headers: {
    // Set any custom headers here.
    // If you set any non-simple headers, your server must include these
    // headers in the 'Access-Control-Allow-Headers' response header.
  },

  success: function() {
    // Here's where you handle a successful response.
  },

  error: function() {
    // Here's where you handle an error response.
    // Note that if the error was due to a CORS issue,
    // this function will still fire, but there won't be any additional
    // information about the error.
  }
});
```
### CORS服务器流程图
![Server Flow](http://www.html5rocks.com/static/images/cors_server_flowchart.png)


本文翻译来源 http://www.html5rocks.com/en/tutorials/cors/#disqus_thread ，如有不对，欢迎指正





