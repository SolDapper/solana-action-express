'use strict';
// *********************************************************************************
// sol donation action
import {rpc,host} from '../config.js';
import { MEMO_PROGRAM_ID } from "@solana/actions";
import { Connection, PublicKey, ComputeBudgetProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import mcswap from 'mcswap-sdk';
import Express from 'express';
var donation_sol = Express.Router();
const SOLANA_CONNECTION = new Connection(rpc,"confirmed");
// *********************************************************************************
const memo = async()=>{
  const acct = new PublicKey("7Z3LJB2rxV4LiRBwgwTcufAWxnFTVJpcoCMiCo8Z5Ere");
  const transaction = new Transaction();
  transaction.feePayer = acct;
  transaction.add(ComputeBudgetProgram.setComputeUnitPrice({microLamports:1000}),
  new TransactionInstruction({programId:new PublicKey(MEMO_PROGRAM_ID),data:Buffer.from("Memo!","utf8"),keys:[]}));
  const {blockhash,lastValidBlockHeight} = await SOLANA_CONNECTION.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  const serializedTransaction = transaction.serialize({requireAllSignatures:false,verifySignatures:false});
  return serializedTransaction.toString('base64');
};
// *********************************************************************************
// sol donation config
donation_sol.get('/donate-sol-config',(req,res)=>{
  let obj = {}
  obj.icon = "https://airadlabs.com/images/profile.jpg";
  obj.title = "Send SOL to @SolDapper";
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
donation_sol.route('/donate-sol-build').post(async function(req,res){
  try{
    if(typeof req.body.account=="undefined"||req.body.account.includes("1111111111111111111111")){
        const transaction = await memo();
        res.json({transaction,message:"memo"});
    }
    else{
      let err={};
      // validate inputs or default for simulation
      if(typeof req.query.amount=="undefined" || req.query.amount=="<amount>" || isNaN(req.query.amount)){req.query.amount = 0;}
      console.log("req.body.account", req.body.account);
      console.log("req.query.amount", req.query.amount);
      // create instructions
      let lamports = req.query.amount * 1000000000;
      let from = new PublicKey(req.body.account);
      let to = new PublicKey("7Z3LJB2rxV4LiRBwgwTcufAWxnFTVJpcoCMiCo8Z5Ere");
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
      res.json(tx);  
    }
  }
  catch(err){
    const _err_ = {};
    _err_.status="error";
    _err_.message="error";
    _err_.err=err;
    res.status(400).json(_err_);
  }
});
export {donation_sol};
// *********************************************************************************