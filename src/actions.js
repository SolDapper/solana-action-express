// *********************************************************************************
// name: solana-action-express
// author: @SolDapper
// repo: github.com/McDegens-DAO/solana-action-express
// *********************************************************************************

// *********************************************************************************
// initialize server
import {host,auto,rules} from './config.js';
import open from 'open';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
app.use(bodyParser.json());
app.options('*', cors(
  {
    "methods": ["GET,PUT,POST,OPTIONS"],
    "allowedHeaders": ['Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids'],
    "exposeHeaders": ['X-Action-Version, X-Blockchain-Ids'],
    "preflightContinue": true,
    "optionsSuccessStatus": 204
  }
));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Encoding, Accept-Encoding');
  res.setHeader('X-Blockchain-Ids', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
  res.setHeader('X-Action-Version', '0.1');
  res.setHeader('Content-Encoding', 'compress');
  res.setHeader('Content-Type', 'application/json');
  next();
});
// initialize server
// *********************************************************************************

// *********************************************************************************
// include actions
import { donation_sol } from './actions/donation_sol.js';
app.use("/", donation_sol);
import { donation_usdc } from './actions/donation_usdc.js';
app.use("/", donation_usdc);
import { mcsend } from './actions/mcsend.js';
app.use("/", mcsend);
// include actions
// *********************************************************************************

// *********************************************************************************
app.get("/actions.json",(req,res)=>{
  res.send(JSON.stringify(rules));
});
app.get("/",(req,res)=>{
  res.send(JSON.stringify('solana-action-express server'));
});
app.listen(process.env.PORT || 3000, async() => {
  console.log("solana-action-express is running!");
  if(host.includes("localhost") && auto!=false){
    open("https://dial.to/?action=solana-action:"+host+"/"+auto);
  }
});
// *********************************************************************************


