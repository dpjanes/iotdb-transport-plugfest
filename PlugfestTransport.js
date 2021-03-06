/*
 *  PlugfestTransport.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-23
 *
 *  Copyright [2013-2016] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var iotdb_transport = require('iotdb-transport');
var iotdb_links = require('iotdb-links');
var _ = iotdb._;

var coap = require('coap');

var path = require('path');
var events = require('events');
var util = require('util');
var url = require('url');

var logger = iotdb.logger({
    name: 'iotdb-transport-plugfest',
    module: 'PlugfestTransport',
});

/* --- constructor --- */

/**
 *  Create a transport for Plugfest.
 */
var PlugfestTransport = function (initd) {
    var self = this;

    self.initd = _.defaults(
        initd, {
            channel: iotdb_transport.channel,
            unchannel: iotdb_transport.unchannel,
        },
        iotdb.keystore().get("/transports/PlugfestTransport/initd"), {
            prefix: "",
            server_host: null,
            server_port: 22001,
        }
    );

    self._emitter = new events.EventEmitter();
    self.native = null;
    self.server_url = null;

    self._emitter.on("server-ready", function() {
        self._setup_server();
    });

    _.net.external.ipv4(function (error, ipv4) {
        if (self.initd.server_host) {
            ipv4 = self.initd.server_host;
        } else if (error) {
            ipv4 = _.net.ipv4();
        }

        var server = coap.createServer();
        // server.listen(self.initd.server_port, "0.0.0.0", function (error) {
        server.listen(self.initd.server_port, "0.0.0.0", function (error) {
            if (error) {
                console.log("ERROR", error);
                return;
            }

            self.server_url = "coap://" + ipv4 + ":" + self.initd.server_port;

            console.log("===============================");
            console.log("=== Plugfest CoAP Server Up");
            console.log("=== ");
            console.log("=== Connect at:");
            console.log("=== " + self.server_url);
            console.log("===============================");

            self.native = server;
            self._emitter.emit("server-ready");
        });
    });
};

PlugfestTransport.prototype = new iotdb_transport.Transport();
PlugfestTransport.prototype._class = "PlugfestTransport";

/* --- CoAP server -- */
PlugfestTransport.prototype._setup_server = function () {
    var self = this;

    self.native.on('request', function (req, res) {
        try {
            logger.info({
                method: "_setup_server/on('request')",
                request_url: req.url,
                request_method: req.method,
            }, "CoAP request");

            var _done = function(error, content) {
                if (error) {
                    request.code = 500;
                }

                if (content) {
                    if (_.is.Dictionary(content)) {
                        content = JSON.stringify(content);
                    }

                    res.write(content);
                }

                res.end();
            }

            if (req.url === "/.well-known/core") {
                self._get_well_known(_done);
            } else if (req.url === "/bulletins") {
                self._get_bulletins(_done);
            } else {
                done(null, {});
            }

        } catch (x) {
            logger.error({
                method: "_setup_server/on('request')",
                exception: _.error.message(x),
                stack: x.stack,
            }, "unexpected exception");
        }
    });

};

PlugfestTransport.prototype._get_well_known = function (done) {
    var self = this;
    
    var resultd = {};
    resultd["/.well-known/core"] = {
        ct: 65202,
    };
    resultd["/bulletins"] = {};

    iotdb_links.produce(resultd, done);
};

PlugfestTransport.prototype._get_bulletins = function (done) {
    done(null, {});
};

/* --- methods --- */

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.list = function (paramd, callback) {
    var self = this;

    self._validate_list(paramd, callback);

    callback(null, null);
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.added = function (paramd, callback) {
    var self = this;

    self._validate_added(paramd, callback);

    var channel = self.initd.channel(self.initd, paramd.id);
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.get = function (paramd, callback) {
    var self = this;

    self._validate_get(paramd, callback);

    var gd = _.d.clone.shallow(paramd);
    gd.value = null;

    callback(new errors.NotImplemented(), gd);
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.put = function (paramd, callback) {
    var self = this;

    self._validate_update(paramd, callback);

    var pd = _.d.clone.shallow(paramd);

    callback(new errors.NotImplemented(), pd);
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.updated = function (paramd, callback) {
    var self = this;

    self._validate_updated(paramd, callback);
};

/**
 *  See {iotdb_transport.Transport#bands} for documentation.
 */
PlugfestTransport.prototype.bands = function (paramd, callback) {
    var self = this;

    self._validate_bands(paramd, callback);

    var bd = _.d.clone.shallow(paramd);

    callback(new errors.NeverImplemented(), bd);
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.remove = function (paramd, callback) {
    var self = this;

    self._validate_remove(paramd, callback);

    var rd = _.d.clone.shallow(paramd);
    delete rd.band;
    delete rd.value;

    callback(new errors.NotImplemented(), rd);
};

/* --- internals --- */

/**
 *  API
 */
exports.PlugfestTransport = PlugfestTransport;
