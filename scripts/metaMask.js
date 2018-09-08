function signMsg(msgParams, from) {
  return web3.currentProvider.sendAsync({
    method: 'eth_signTypedData',
    params: [msgParams, from],
    from: from,
  });
}

function signMsg() {

  let msgParams = [
    {type: 'address', name: 'splitETH', value: '0x348f1e3cfec548d41e9b16ada985ffce1bc0df65'},
    {type: 'bytes32', name: 'name', value: "ETHBerlin"},
    {type: 'uint256', name: 'timestamp', value: 1},
    {type: 'uint256', name: 'amount_0', value: 100},
    {type: 'bool', name: 'isCredit_0', value: false},
    {type: 'uint256', name: 'amount_1', value: 150},
    {type: 'bool', name: 'isCredit_1', value: false},
    {type: 'uint256', name: 'amount_2', value: 250},
    {type: 'bool', name: 'isCredit_2', value: true},
  ];

  let from = "0x7c6cd0b60038c6c7fa916d3abb10598bc37cf9bb";

  web3.currentProvider.sendAsync({
    method: 'eth_signTypedData',
    params: [msgParams, from],
    from: from,
  }, function (err, result) {
    if (err) return console.error(err)
    if (result.error) {
      return console.error(result.error.message)
    }
    let res = result.result.slice(2);
    let r = '0x' + res.substr(0, 64),
      s = '0x' + res.substr(64, 64),
      v = parseInt(res.substr(128, 2), 16);
    console.log(v, r, s);
  });

}

let state = JSON.parse('{"tokenGet":"0x0000000000000000000000000000000000000000","amountGet":"1000000000000000000","tokenGive":"0x3a5c68daad2405146c5035a8561bd405e171bdba","amountGive":"1000000000000000000","nonce":"4130058392680569","expires":10000000000,"user":"0x9a9d8ff9854A2722A76a99dE6C1BB71D93898EF5"}');
signMsg();
