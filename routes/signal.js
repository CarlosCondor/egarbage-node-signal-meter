//File: routes/signal.js

var async = require('async');

module.exports = function(app) {
  

  var Measure = require('../models/measure');

  var findAllMeasures = function(cb) {
    Measure.find(function(err, measures) {
      if (!err) {
        console.log("Finding all measures");
        cb(measures);
      }
      console.log(err);
      cb(null);
    });
  }

  var findByDevice = function(deviceid, cb) {
    
    if (typeof(deviceid)=='number') {
          
      var query = Measure.find({id_device: deviceid})
                          .select("-_id")
                          .sort({date: -1})
                          .exec(function(err, measures) {
          if (!err) {
            console.log("Encontradas "+measures.length+" mueasures del id "+deviceid);
            cb(measures);
          } else {
            console.log(err);
            cb(null);
          }
      });

    } else {
      console.log("device id is not integer,  is "+typeof(deviceid));
      return cb(null);
    }
  }

  var findByDeviceDate = function(deviceid, date, cb) {
    
    if (typeof(deviceid)=='number' && date instanceof Date) {
      var query = Measure.find({id_device: deviceid})
                        .gte('date', date)
                        .select("-_id")
                        .sort({date: -1})
                        .exec(function(err, measures) {
          if (!err) {
            console.log("Encontradas "+measures.length+" mueasures del id "+deviceid);
            cb(measures);
          } else {
            console.log(err);
            cb(null);
          }
      });

    } else {
      console.log("device id is not integer,  is "+typeof(deviceid));
      return cb(null);
    }
  }
      
  indexMeasures = function(req, res) {
    findAllMeasures(function(measures) {
      // Here is the measures
      if (measures)
        res.send("Here is a total of "+measures.length+" measures");
      else
        res.send("Error al recibir medidas");
    });
  }

  singleMeasure = function(req, res) {
    findByDevice(parseInt(req.params.deviceid), function(measures) {
      if (measures)
        res.send(measures);
      else
        res.send("Error al recibir medidas");
    })
  }

  analyzeMeasure = function(req, res) {
    findByDevice(parseInt(req.params.deviceid), function(measures) {
      if (!measures) {
        res.send("Error al recibir medidas, no hay measures");
        return;
      }
      var lastTime = null;
      var errors = [];
      async.forEach(measures, function(item, callback) {
        if (!lastTime) {
          lastTime = item.date;
        } else {
          // check if date is +10minutes from lastTime
          if (lastTime.getTime()-item.date.getTime() > 10*60000) {
            var timeDelayed = lastTime.getTime()-item.date.getTime();

            errors.push({item: item, lasttime: lastTime, delayedMinutes: timeDelayed/60000});
          }
        }
        lastTime = item.date;
        callback();
      }, function(err) {
        //Done..
        if (err)
          res.send("Err:"+err)
        res.send({ count: errors.length, errors: errors});
      })
    })
  }
  
  analyzeMeasureSince = function(req, res) {
    findByDeviceDate(parseInt(req.params.deviceid), new Date(new Date().getTime()-parseInt(req.params.since)*24*60*60000), function(measures) {
      if (!measures) {
        res.send("Error al recibir medidas");
        //return;
      }

      var lastTime = null;
      var errors = [];
      async.forEach(measures, function(item, callback) {
        if (!lastTime) {
          lastTime = item.date;
        } else {
          // check if date is +10minutes from lastTime
          if (lastTime.getTime()-item.date.getTime() > 10*60000) {
            var timeDelayed = lastTime.getTime()-item.date.getTime();

            errors.push({item: item, lasttime: lastTime, delayedMinutes: timeDelayed/60000});
          }
        }
        lastTime = item.date;
        callback();
      }, function(err) {
        //Done..
        if (err)
          res.send("Err:"+err)
        res.send({ count: errors.length, errors: errors});
      })
    })
  }
app.get("/measures", indexMeasures);
app.get("/measures/:deviceid", singleMeasure);
app.get("/measures/:deviceid/analyze", analyzeMeasure);
app.get("/measures/:deviceid/analyze/:since", analyzeMeasureSince); //since x days

}

