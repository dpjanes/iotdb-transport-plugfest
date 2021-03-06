/*
 *  receive.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-23
 *
 *  Demonstrate receiving
 *  Make sure to see README first
 */

var Transport = require('../PlugfestTransport').PlugfestTransport;

var transport = new Transport({
});
transport.updated({
    id: "MyThingID", 
    band: "meta", 
}, function(error, ud) {
    if (error) {
        console.log("#", error);
        return;
    }

    if (ud.value === undefined) {
        transport.get(ud, function(error, gd) {
            if (error) {
                console.log("#", error);
                return;
            }
            console.log("+", gd.id, gd.band, gd.value);
        });
    } else {
        console.log("+", ud.id, ud.band, ud.value);
    }
});
