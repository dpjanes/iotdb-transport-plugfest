/*
 *  send.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-23
 *
 *  Demonstrate sending something
 *  Make sure to see README first
 */

var Transport = require('../PlugfestTransport').PlugfestTransport;

var transport = new Transport({
});

var _update = function() {
    var now = (new Date()).toISOString();
    console.log("+ sent update", now);
    transport.put({
        id: "MyThingID", 
        band: "meta", 
        value: {
            first: "David",
            last: "Janes",
            now: now,
        },
    }, function(error, ud) {
        if (error) {
            console.log("#", error);
            return;
        }
        console.log("+ sent", ud);
    });
};

setInterval(_update, 10 * 1000);
_update();
