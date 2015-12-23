describe('pushup all api test', function() {
  var request = require('supertest'),
    app = require('../app'),
    should = require('should'),
    http = require('http');
  var agent = request.agent(app.listen());
  var user = {
    mid: '12345678',
    w: 79,
    h: 178,
    sex: 'm'
  }, record;
  describe('insert and retrieve user data', function() {
    // remove user with same mid
    before(function(done) {
      agent
        .get('/removeuser/12345678')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);
          done();
        });
    });
    it('1, /uploaduserinfo {POST} full user data into mongo', function(done) {
      agent
        .post('/uploaduserinfo')
        .send(user)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) done(err);
          res.body.status.should.be.true();
          done()
        });
    });
  });
  describe('get inserted user data', function() {
    it('2, /getuserinfo/:mid {GET} last inserted user data from mongo', function(done) {
      agent
        .get('/getuserinfo/12345678')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err){
            done(err);
            return;
          }
          res.body.mid.should.equal('12345678');
          res.body.sex.should.equal('m');
          res.body.h.should.equal('178');
          res.body.w.should.equal('79');
          done();
        });
    });
  });
  describe('insert sport record', function(){
    before(function(done){
      record = {
        'mid': '12345678',         // machine id
        'count': 24,              // pushup count
        'ampaverage': 25,          // pushup route length in cm
        'ampmax': 28,              // max length
        'hzaverage': 39,           // count per minute
        'hzmax': 80,               // max count/min
        'calorie': 23.5,
        'geolongtitude': 123.12,
        'geolatitude': 98.67,
        'timestart': '2015-11-2 15:19:23',// YYYY-MM-DD HH:mm:ss
        'timeend': '2015-11-2 15:26:32',    // YYYY-MM-DD HH:mm:ss
        'remarks': '相当不错哦',           // comment about this record
        'timecount': 429,                  // time last in second
        'evaluation': 2                    // self-satisifiction in three levels:0,1,2 least to most
      };
      done();
    });
    it('3, /uploadOnce', function(done){
      agent
        .post('/uploadOnce')
        .send(record)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) done(err);
          res.body.status.should.be.true();
          done()
        });
    });
  });
  describe('get monthly sum report', function() {
    it('4, /getsum/:mid/:year/:month', function(done){
      agent
        .get('/getsum/12345678/2015/11')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);
          res.body.status.should.be.true();
          res.body.acttotal.should.be.Number;
          res.body.actavertime.should.be.Number;
          res.body.actmaxtime.should.be.Number;
          res.body.ampaver.should.be.Number;
          res.body.countaver.should.be.Number;
          res.body.hzaver.should.be.Number;
          res.body.approvalrating.should.be.Number;
          done();
        });
    });
  });
});