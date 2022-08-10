import * as ethers from 'ethers';
const private_key = '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709'
const sig = require('@metamask/eth-sig-util')
const wallet = new ethers.Wallet(private_key);


  export async function signMessage(data) {
    const signingKey = new ethers.utils.SigningKey(private_key);
    const sigParams = await signingKey.signDigest(ethers.utils.arrayify(data));
    return await ethers.utils.joinSignature(sigParams);
  }
  
  export async function signPersonalMessage(message) {
    return await wallet.signMessage(ethers.utils.isHexString(message) ? ethers.utils.arrayify(message) : message);
  }
  
  
  export async function signEthereumRequests(payload,state) {
    const {address} = state
    let errorMsg = "";
    let result = null;
      let dataToSign = null;
      let addressRequested = null;

      switch (payload.method) {
        case "eth_sign":
          dataToSign = payload.params[1];
          addressRequested = payload.params[0];
          if (address.toLowerCase() === addressRequested.toLowerCase()) {
            result = await signPersonalMessage(dataToSign);
          } else {
            errorMsg = "Address requested does not match active account";
          }
          break;
        case "personal_sign":

          dataToSign = payload.params[0];
          addressRequested = payload.params[1];
          if (address.toLowerCase() === addressRequested.toLowerCase()) {
            result = await signPersonalMessage(dataToSign);
          } else {
            errorMsg = "Address requested does not match active account";
          }
          break;
        case "eth_signTypedData":
          dataToSign = payload.params[1];
          addressRequested = payload.params[0];
          if (address.toLowerCase() === addressRequested.toLowerCase()) {
            result = await signPersonalMessage(dataToSign);
          } else {
            errorMsg = "Address requested does not match active account";
          }
          break;
        default:
          break;
      }
  
      if (result) {
        return result
      } else {
        let message = "JSON RPC method not supported";
        if (errorMsg) {
          message = errorMsg;
        }
        console.log("Error "+message)
      }
  }
  
  export async function enrichParams(payload) {
    var params = payload.params;
    switch (payload.method) {
      case "eth_sign":
        params = [
          ...params,
          { label: "Address", value: payload.params[0] },
          { label: "Message", value: payload.params[1] },
        ];
        break;
      case "personal_sign":
        params = [
          ...params,
          { label: "Address", value: payload.params[1] },
          {
            label: "Message",
            value: payload.params[0],
          },
        ];
        break;
      default:
        params = [
          ...params,
          {
            label: "params",
            value: JSON.stringify(payload.params, null, "\t"),
          },
        ];
        break;
    }
    return params;
  }