"use strict";
const Koa    = require('koa');
const app    = new Koa();
const Router = require('koa-router');
const router = new Router();
//const parse  = require('co-busboy'); too complated, need to get your fields from array
const koaBody = require('koa-body')();
const co       = require('co');
const convert = require('koa-convert')
const baseUtil = require('./lib/base-util');
const pushupModel = require('./models/pushup');

// TODO: static file manage

// TODO: database connection

// logger
app.use((ctx, next) => {
    const start = new Date;
    return next().then(() => {
        const ms = new Date - start;
        console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    });
});

router.get('/getuserinfo/:mid', co.wrap(function* (ctx, next){
    console.log(`request from id: ${ctx.ip}, ---mid: ${ctx.params.mid}`);
    try {
        let user = yield pushupModel.userInfo(ctx.params.mid);
        //console.log(user);
        user.status = true;
        ctx.body = user;
    } catch(err) {
        ctx.status = err.status || 500;
        ctx.body = `get userinfo error: ${err.message}`;
    }
}));

router.get('/removeuser/:mid', co.wrap(function* (ctx, next){
    try {
        let result = yield pushupModel.deleteUserByMid(ctx.params.mid);
        console.log(result);
        ctx.body = result;
    }catch(err) {
        ctx.status = err.status || 500;
        ctx.body = `delete user by mid error: ${err.message}`;
    }
}));
/**
 * Save user to db, if _id present, update userinfo
 * //@name     {String} user name
 * @mid      {String} unique machine id
 * @w        {Number} kg
 * @h        {Number} cm
 * //@birthday {String} date
 * @sex      {Char}   sex: f || m
 */
router.post('/uploaduserinfo', convert(koaBody), co.wrap(function*(ctx, next){
    console.log(ctx.request.type);
    if(!ctx.request.is('application/x-www-form-urlencoded')) {
        // illegal request
        yield next();
        console.log('----------------should never print');
    }
    let data = ctx.request.body;
    // validate parameter
    if(!data.mid){
        ctx.status = 403;
        ctx.body = 'mid should not be null';
        return;
    }
    try {
        var result = yield pushupModel.userAdd(baseUtil.getNewObj(data, ['mid', 'w', 'h', 'sex']));
        ctx.body = {status: true};
    } catch(err) {
        ctx.status = err.status || 500;
        ctx.body = {status: false, reason: err.message};

        // can choose to emit error to app, for uniform handling
        ctx.app.emit("error", err, ctx);
    }
}));


/**
 * Save a new sport record
 * @mid        {String} machine id
 * @count      {Number} pushup count
 * @ampaverage {Number} cm
 * @ampmax     {Number} cm
 * @hzaverage  {Number} count/min
 * @hzmax      {Number} per min
 * @calorie    {Number}
 * @geolongitude
 * @geolatitude
 * @timestart
 * @timeend
 * @remarks
 * @timecount   {Number} time last in seconds
 * @evaluation  {Number} 0:dissatisfied,1:so so,2:satisfied
 */
router.post('/uploadOnce', convert(koaBody), co.wrap(function* (ctx, next){
    try {
        let data = ctx.request.body;
        let obj = baseUtil.getNewObj(data,
            [
             'mid','count','ampaverage','ampmax','hzaverage','hzmax',
             'calorie','geolongtitude','geolatitude',
             'remarks','timecount','evaluation'
            ]);
        obj.timestart = new Date(data.timestart);
        obj.timeend = new Date(data.timeend);
        let result = yield pushupModel.recordAdd(obj);
        console.log(`==============uploadOnce done:${result}`);
        ctx.body = {status:true};
    } catch(err) {
        console.log(`--------------uploadOnce Error:${err.message}`);
        ctx.status = err.status || 500;
        ctx.body = {status: false, reason: err.message};
    }
}));

/**
 * get monthly report of sport summary
 * @param {mid}   machine id           [description]
 * @param {year}                       [description]
 * @yield {month}                      [description]
 */
router.get('/getsum/:mid/:year/:month/:support?', co.wrap(function* (ctx, next){
    try {
        let mid = ctx.params.mid,
            year = ctx.params.year,
            month = ctx.params.month;
        let beginDate = new Date(year + '-' + month + '-01 00:00:00'),
            endDate = new Date(year + '-' + month + '-31 23:59:59');
        let result = yield pushupModel.getRecordWithinSpan(beginDate, endDate);
        let acttotal = result.length;
        let sum = {
            status: true,
            year,
            month,
            acttotal,
            actavertime: 0,
            actmaxtime: 0,
            ampaver: 0,
            countaver: 0,
            hzaver: 0,
            approvalrating: 0
        };
        for(let record of result){
            sum.actavertime += record.timecount/acttotal;
            sum.actmaxtime = parseInt(record.timecount)>parseInt(sum.actmaxtime)
                            ?parseInt(record.timecount)
                            :parseInt(sum.actmaxtime);
            sum.ampaver += record.ampaverage/acttotal;
            sum.countaver += record.count/acttotal;
            sum.hzaver += record.hzaverage/acttotal;
            sum.approvalrating += record.evaluation/acttotal;
        }
        sum.approvalrating = Math.ceil(sum.approvalrating);
        ctx.body = sum;
    } catch (err) {
        console.log(`--------------/getsum Error: ${err.message}`);
        ctx.status = err.status || 500;
        ctx.body = {status: false, reason: err.message};
    }
}));

app.use(router.routes()).use(router.allowedMethods);

app.on("error", (err,ctx) => {
    console.error(`application error happened: ${err.message}`);
    //ctx.status = 500;
    ctx.body = {status: false, reason: err.message};
});
module.exports = app;
