'use strict';
// *********************************************************************************
// sol donation action
import {rpc,host} from '../config.js';
import {PublicKey,SystemProgram} from "@solana/web3.js";
import mcswap from 'mcswap-sdk';
import Express from 'express';
var donation_sol = Express.Router();
// *********************************************************************************

// *********************************************************************************
// sol donation config
donation_sol.get('/donate-sol-config',(req,res)=>{
  let obj = {}
  obj.icon = "https://mcdegen.xyz/images/pfp-416.png";
  obj.title = "Donate SOL to McDegens DAO";
  obj.description = "Enter SOL amount and click Send";
  obj.label = "donate";
  obj.links = {
  "actions": [
      {
        "label": "Send",
        "href": host+"/donate-sol-build?amount={amount}",
        "parameters": [
          {
            "name": "amount", // input field name
            "label": "SOL Amount", // text input placeholder
          }
        ]
      }
    ]
  }
  res.json(obj);
});
// *********************************************************************************

// *********************************************************************************
// sol donation tx 
donation_sol.route('/donate-sol-build').post(async function(req,res){
  let err={};

  // validate inputs or default for simulation
  if(typeof req.body.account=="undefined"){req.body.account="7Z3LJB2rxV4LiRBwgwTcufAWxnFTVJpcoCMiCo8Z5Ere";}
  if(typeof req.query.amount=="undefined" || req.query.amount=="<amount>" || isNaN(req.query.amount)){req.query.amount = 0;}
  console.log("req.body.account", req.body.account);
  console.log("req.query.amount", req.query.amount);

  // create instructions
  let lamports = req.query.amount * 1000000000;
  let from = new PublicKey(req.body.account);
  let to = new PublicKey("GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu");
  let donateIx = SystemProgram.transfer({fromPubkey:from, lamports:lamports, toPubkey:to});

  // build transaction
  let _tx_ = {};
  _tx_.rpc = rpc;                     // string : required
  _tx_.account = req.body.account;    // string : required
  _tx_.instructions = [ donateIx ];   // array  : required
  _tx_.signers = false;               // array  : default false
  _tx_.serialize = true;              // bool   : default false
  _tx_.encode = true;                 // bool   : default false
  _tx_.table = false;                 // array  : default false
  _tx_.tolerance = 1.2;                 // int    : default 1.1    
  _tx_.compute = false;               // bool   : default true
  _tx_.fees = false;                  // bool   : default true : helius rpc required when true
  let tx = await mcswap.tx(_tx_);     // package the tx
  res.json(tx);                       // output

});
export {donation_sol};
// *********************************************************************************