'use strict';
import 'dotenv/config';

// *********************************************************************************
// server settings
var host = ""; // your live domain
host = "http://localhost"; // comment out before production deployment
var auto = "donate-sol-config"; // auto open blink in dial.to test window : ignored in prod
// *********************************************************************************

// *********************************************************************************
// no edit
if(host.includes("localhost")){host=host+":3000";}
// *********************************************************************************

// *********************************************************************************
// localhost dev actions.json rules 
var rules = {"rules":[
{"pathPattern":"/donate-usdc-config","apiPath":host+"/donate-usdc-config"},
{"pathPattern":"/donate-sol-config","apiPath":host+"/donate-sol-config"},
{"pathPattern":"/mcsend","apiPath":host+"/mcsend"},
]};
// *********************************************************************************

// *********************************************************************************
// no edit
var rpc_file = "rpcs/rpcs.json"; // move to server root for prod
var rpc_id = 0; // 0 = first rpc url from the file above
var rpc;
import fs from 'fs';
if(process.env.RPC){rpc=process.env.RPC;}
else{var rpcs=JSON.parse(fs.readFileSync(rpc_file).toString());rpc=rpcs[rpc_id].url;}
export var host, auto, rpc, rules;
// no edit
// *********************************************************************************