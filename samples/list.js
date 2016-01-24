/*
 *  list.js
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
transport.list(function(ld) {
    if (!ld) {
        break;
    }

    console.log("+", ld.id);
});