//File: routes/signal.js

var async = require('async');

module.exports = function(app) {

  /*
  *   format function. "{0}{1}".format("uno","dos");
  */
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
  }

  var Measure = require('../models/measure');

      
  indexMeasures = function(req, res) {
    findAllMeasures(function(measures) {
      // Here is the measures
      if (measures)
        res.send("Here is a total of "+measures.length+" measures");
      else
        res.send("Error al recibir medidas");
    });
  }


  var findMeasureErrors = function(measures, callback) {
    var lastTime = null;
    var errors = [];
    // Need to split by device_id and then compare
    async.forEach(measures, function(item, callback) {
      if (!lastTime) {
        lasttime = item.date;
      } else {
        if (lastTime.getTime() - item.date.getTime() > 10*60000) {
          var timeDelayed = lastTime.getTime()-item.date.getTime();
          errors.push({item: item, lasttime: lastTime, delayedMinutes: timeDelayed/60000});
        }
      }
      lastTime = item.date;
      callback();
    }, function(err) {
      if (err)
        throw err
      else
        callback({count: errors.length, errors: errors});
    });
  }

  var analyzeMeasures = function(param1, param2, param3) {
    console.log(param1,param2,param3);
    var target, since, callback = null;
    var target = param1;
    if (param3) callback = param3;
    if (param3) since = param2;
    if (!param3) callback = param2;

    console.log(target,since,callback);


    var query = Measure.find({id_device: target})
    if (since) query.gte('date', since)
    query.select('-_id')
      .sort({date: -1})
      .exec(function(err, measures) {
        if (!err) { callback(measures); }
        else { throw err; callback(null); }
      });
  }

  viewAnalyzeSingleMeasure = function(req, res) {
    console.log(req.params);
    if (req.params.deviceid && req.params.since) {
      var split_date = req.params.since.split("-");
      var format_date = "{0}-{1}-{2}".format(split_date[1],split_date[0],split_date[2]);
      console.log("Find since "+ new Date(format_date));
      analyzeMeasures(parseInt(req.params.deviceid), new Date(req.params.since), function(measures) {
        findMeasureErrors(measures, function(errors) {
          res.send(errors);
        });
      });
    } else {
      console.log("No since");
      analyzeMeasures(parseInt(req.params.deviceid), function(measures) {
        findMeasureErrors(measures, function(errors) {
          res.send(errors);
        });
      });
    }
  }

app.get("/measures", indexMeasures);
app.get("/measures/:deviceid", viewAnalyzeSingleMeasure);
app.get("/measures/:deviceid/:since", viewAnalyzeSingleMeasure);

}

