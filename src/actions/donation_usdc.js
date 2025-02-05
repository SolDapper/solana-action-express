'use strict';
// *********************************************************************************
// usdc donation action
import {rpc,host} from '../config.js';
import {Connection,PublicKey} from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import mcswap from 'mcswap-sdk';
import Express from 'express';
const donation_usdc = Express.Router();
// *********************************************************************************

// *********************************************************************************
// usdc donation config
donation_usdc.get('/donate-usdc-config',(req,res)=>{
const obj = {}
    obj.icon = "https://mcdegen.xyz/images/pfp-416-usdc.png";
    obj.title = "Donate USDC to McDegens DAO";
    obj.description = "Enter USDC amount and click Send";
    obj.label = "donate";
    obj.links = {
    "actions": [
        {
            "label": "Send",
            "href": host+"/donate-usdc-build?amount={amount}",
            "parameters": [
            {
                "name": "amount", // input field name
                "label": "USDC Amount", // text input placeholder
            }
            ]
        }
        ]
    }
    res.json(obj);
});
// *********************************************************************************

// *********************************************************************************
// usdc donation tx 
donation_usdc.route('/donate-usdc-build').post(async function(req,res){
let err={};

// validate inputs or default for simulation
if(typeof req.body.account=="undefined"){req.body.account="7Z3LJB2rxV4LiRBwgwTcufAWxnFTVJpcoCMiCo8Z5Ere";}
if(typeof req.query.amount=="undefined" || req.query.amount=="<amount>" || isNaN(req.query.amount)){req.query.amount = 0;}
console.log("req.body.account", req.body.account);
console.log("req.query.amount", req.query.amount);

// action settings
const decimals = 6; // usdc has 6 decimals
const MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // usdc mint address
const TO_WALLET = new PublicKey('GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu'); // treasury wallet

// connect : convert value to fractional units
const SOLANA_CONNECTION = new Connection(rpc,"confirmed");
const FROM_WALLET = new PublicKey(req.body.account);
let amount = parseFloat(req.query.amount);
amount = amount.toFixed(decimals);
const TRANSFER_AMOUNT = amount * Math.pow(10, decimals);

// usdc token account of sender
let fromTokenAccount = await splToken.getAssociatedTokenAddress(
    MINT_ADDRESS,
    FROM_WALLET,
    false,
    splToken.TOKEN_PROGRAM_ID,
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID
);

// check if the recipient wallet is oncurve
let oncurve = true;
if(PublicKey.isOnCurve(TO_WALLET.toString())){oncurve=false;}
console.log("oncurve:", oncurve);

// usdc token account of recipient
let toTokenAccount = null;
toTokenAccount = await splToken.getAssociatedTokenAddress(
    MINT_ADDRESS,
    TO_WALLET,
    oncurve,
    splToken.TOKEN_PROGRAM_ID,
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID
);

// check if the recipient wallet needs a usdc ata
let createATA=false;
await splToken.getAccount(SOLANA_CONNECTION,toTokenAccount,'confirmed',splToken.TOKEN_PROGRAM_ID).then(function(response){createATA=false;})
.catch(function(error){if(error.name=="TokenAccountNotFoundError"){createATA=true}else{return;}});

// create new instructions array
let instructions = [];

// create and add recipient ata instructions to array if needed
if (createATA === true) {
    let createATAiX = new splToken.createAssociatedTokenAccountInstruction(
    FROM_WALLET,
    toTokenAccount,
    TO_WALLET,
    MINT_ADDRESS,
    splToken.TOKEN_PROGRAM_ID,
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );
    instructions.push(createATAiX);
}

// create and add the usdc transfer instructions
let transferInstruction = splToken.createTransferInstruction(fromTokenAccount,toTokenAccount,FROM_WALLET,TRANSFER_AMOUNT);
instructions.push(transferInstruction);

// build transaction
let _tx_ = {};
_tx_.rpc = rpc;                     // string : required
_tx_.account = req.body.account;    // string : required
_tx_.instructions = instructions;   // array  : required
_tx_.signers = false;               // array  : default false
_tx_.serialize = true;              // bool   : default false
_tx_.encode = true;                 // bool   : default false
_tx_.table = false;                 // array  : default false
_tx_.tolerance = 1.2;               // int    : default 1.1    
_tx_.compute = false;               // bool   : default true
_tx_.fees = false;                  // bool   : default true : helius rpc required when true
_tx_.priority = req.query.priority; // string : VeryHigh,High,Medium,Low,Min : default Medium
let tx = await mcswap.tx(_tx_);    // package the tx
console.log(tx);
res.json(obj);

});
export {donation_usdc};
// *********************************************************************************