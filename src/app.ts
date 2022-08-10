import WalletConnect from "@walletconnect/client";
import * as ethUtils from './ethUtils';
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('close', function () {
    console.log('\n Exit');
    process.exit(0);
  });

const public_key = '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'

//Initialization of the session with the URI represented by the QR code confronted with when clicking Sign On using WalletConnect in a DApp
rl.question('Enter URI please ', async (uri) => {
    const connector = new WalletConnect(
    {
      uri,
      clientMeta: {
        description: "SignOnly",
        url: "https://arts.org",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
        name: "SignOnly",
      }
    }
  );

  connector.on("session_request", async (error, payload) => {
    if (error) {
      throw error;
    }

    const {name,description} = payload.params[0].peerMeta;
    rl.question(`\n \n ------- \n Session request from ${name} ? \n Further description \n ${description} \n ----------\n Do you approve this request? (Y/n)`, async(response) => {
        if(response=='Y'){
            connector.approveSession({
                accounts: [public_key],
                chainId: 1
              });
        }
        else {
            connector.rejectSession()
        }
    })
    
  });
  
  // Subscribe to call requests (signature, in a full implementation also for transactions)
  connector.on("call_request", async (error, payload) => {
    if (error) {
      throw error;
    }
    payload.params = await ethUtils.enrichParams(payload);

    rl.question(`Do you approve the request to ${payload.method} (Y/n)`, async (sign_approval) => {
        if(sign_approval==='Y') {
            //This piece needs to be replaced with the API-request to the signature endpoint of the custody system
            const result = await ethUtils.signEthereumRequests(payload, { address: public_key, chainId: 1 })
            console.log(new Date() + " signature provided "+result)
          
            connector.approveRequest({
              id: payload.id,
              result
            });
        }
        else {
            connector.rejectRequest({
                id: payload.id,
            })
        }
    })
  });
  
  connector.on("connect", (error, payload) => {
    if (error) {
      throw error;
    }
    const {url,name} = payload.params[0].peerMeta;
    console.log(`Connected to ${name} with the account with the URL ${url}`);
  });
  
  connector.on("disconnect", (error, payload) => {
    if (error) {
      throw error;
    }
    console.log("Disconnect " + JSON.stringify(payload))
  });
});