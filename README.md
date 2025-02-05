# solana-action-express
solana actions server powered by node & express js

provides modular action endpoints for solana blinks

support: contact [@SolDapper](https://x.com/SolDapper)

# auto install and start
installs and starts the server

*this command creates the your-projects/solana-action-express working directory
```javascript
git clone https://github.com/SolDapper/solana-action-express.git && cd solana-action-express && npm install && npm run actions
```

# normal start
```javascript
npm run actions
```

# creating new actions
1. create your new action file
```javascript
touch src/actions/my_new_action.js
```
2. include the new file in actions.js
```javascript
// *********************************************************************************
// include actions
import { my_new_action } from './actions/my_new_action.js';
app.use("/", my_new_action);
import { donation_sol } from './actions/donation_sol.js';
app.use("/", donation_sol);
import { donation_usdc } from './actions/donation_usdc.js';
app.use("/", donation_usdc);
// include actions
// *********************************************************************************
```
3. build your new action module

 *src/actions/my_new_action.js*
```javascript
'use strict';
// *********************************************************************************
// sol donation action
import {rpc,host} from '../config.js';
import Express from 'express';
const my_new_action = Express.Router();
my_new_action.get('/my-new-action-config',(req,res)=>{
    const obj = {}
    obj.icon = "";
    obj.title = "";
    obj.description = "";
    obj.label = "donate";
    obj.links = {
    "actions": [
        {
          "label": "Send",
          "href": host+"/my-new-action-build?amount={amount}",
          "parameters": [
            {
              "name": "amount", // input field name
              "label": "SOL Amount", // text input placeholder
              "required": true
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
my_new_action.route('/my-new-action-build').post(async function(req,res){
  
  let error = false;
  let message = false;

  // validate inputs
  if(typeof req.body.account=="undefined"){
    error = true;
    message = "user wallet missing";
  }
  else if(typeof req.query.amount=="undefined" || req.query.amount=="<amount>" || isNaN(req.query.amount)){
    error = true;
    message = "no amount defined";
  }

  if(error === true){
    res.status(400).json({"message":message});
  }
  else{

    try{

      // create instructions
      const lamports = req.query.amount * 1000000000;
      const from = new PublicKey(req.body.account);
      const to = new PublicKey("GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu");
      const donateIx = SystemProgram.transfer({fromPubkey:from, lamports:lamports, toPubkey:to});
      
      // build transaction
      const _tx_ = {};
      _tx_.rpc = rpc;                     // string : required
      _tx_.account = req.body.account;    // string : required
      _tx_.instructions = [ donateIx ];   // array  : required
      _tx_.signers = false;               // array  : default false
      _tx_.serialize = true;              // bool   : default false
      _tx_.encode = true;                 // bool   : default false
      _tx_.table = false;                 // array  : default false
      _tx_.tolerance = 1.2;               // int    : default 1.1    
      _tx_.compute = false;               // bool   : default true
      _tx_.fees = false;                  // bool   : default true : helius rpc required when true
      _tx_.priority = req.query.priority; // string : VeryHigh,High,Medium,Low,Min : default Medium
      const tx = await mcswap.tx(_tx_);  // package the tx
      tx.message = "You sent "+req.query.amount+" SOL!";
      res.json(tx); // output

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }

  }

});
export {my_new_action};
// *********************************************************************************
```

# cloud deployment
by default your "host" is localhost. when deploying your server live you must update the host setting in src/config.js to your live domain.
```javascript
var host = "https://your-domain-name.com";
```
[heroku](https://www.heroku.com) hosting conviennently allows you to auto deploy or manually deploy from your github repo with one click.

create a config var in your apps hosting settings with the name "RPC" and the value being your protected rpc endpoint url. your solana-action-express server will then use it automatically.

# rendering on x
Although you can test locally on Dial.to and other tools, it's important to note that in order for a blink to render on x.com you must have:
1. your actions deployed live on a fully qualified domain name.
2. blinks must be enabled in your wallet settings.
3. the page you're sharing must have twitter-card metatags.

we use the following metatags
```javascript
  <title>Title</title>
  <meta name="description" content="" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@xHandle" />
  <meta name="twitter:creator" content="@xHandle" />
  <meta name="twitter:title" content="" />
  <meta name="twitter:description" content="" />
  <meta name="twitter:image" content="" />
  <meta property="og:title" content="" />
  <meta property="og:image" content="" />
  <meta property="og:url" content="" />
  <meta property="og:description" content="" />
  <link rel="apple-touch-icon" href="" type="image/png">
  <link rel="icon" href="" type="image/png">
```
you can test that your page is twitter-card enabled using this tool:

https://www.bannerbear.com/tools/twitter-card-preview-tool/

# actions registration
It is currently necessary to register the domain of your actions server or else your blinks will not render on x.

Dialect Action Registration: https://dial.to/register

# x users
users on x need to have a supporting wallet or the dialect extension to see the blinks. otherwise the post will default to the normal twitter-card.

**supporting wallets/extensions**

phantom wallet (enable in settings under "experimental features") [web store](https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa)

solflare wallet [web store](https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic)

backpack wallet [web store](https://chromewebstore.google.com/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof)

dialect blinks [web store](https://chromewebstore.google.com/detail/dialect-blinks/mhklkgpihchphohoiopkidjnbhdoilof) 

# non-node web apps
if the twitter-card metatags for your blink are located on a non-node website, blog, one the many oss ecom platforms, anything running on apache, you can use this php file in place of your actions.json to allow public access from blink clients without opening up cross domain requests to other files on your system. you will also need to add a RewriteRule in your your .htaccess file to route all requests for actions.json to the actions.php file.

**actions.php**
```javascript
<?php header("Access-Control-Allow-Origin:*");header('Access-Control-Max-Age:86400');header('Content-Type:application/json');
header("Access-Control-Allow-Methods:GET");if(isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])){header("Access-Control-Allow-Headers:{$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");}
$response=new stdClass;
$rules=array();
// ***************************************************************
$rule = new stdClass;
$rule->pathPattern = "/donate-sol";
$rule->apiPath = "https://www.solana-action-express.com/donate-sol-config";
$rules[] = $rule;
$rule = new stdClass;
$rule->pathPattern = "/donate-usdc";
$rule->apiPath = "https://www.solana-action-express.com/donate-usdc-config";
$rules[] = $rule;
$rule = new stdClass;
$rule->pathPattern = "/mcsend";
$rule->apiPath = "https://www.solana-action-express.com/mcsend";
$rules[] = $rule;
// ***************************************************************
$response->rules=$rules;
echo json_encode($response);
exit();
```
**.htaccess**
```javascript
RewriteRule ^actions.json$ actions.php [L]
```

# official solana actions docs

https://solana.com/docs/advanced/actions

https://github.com/solana-developers/solana-actions
