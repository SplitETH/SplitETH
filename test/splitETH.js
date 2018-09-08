const BigNumber = require('bignumber.js');
BigNumber.config({ ERRORS: false });
const SplitETH = artifacts.require("./SplitETH.sol");
const SEToken = artifacts.require("./SEToken.sol");
const utils = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
const assertFail = require("./helpers/assertFail");

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")) // Hardcoded development port

contract('SplitETH', function (accounts) {

    const ALICE = accounts[1];
    const BOB = accounts[2];
    const CHARLES = accounts[3];
    const DAVE = accounts[4];

    it("1. create ETHBerlin state channel with three participants", async () => {
        const splitETH = await SplitETH.deployed();
        const token = await SEToken.deployed();
        await splitETH.createGroup("ETHBerlin", [ALICE, BOB, CHARLES], token.address, 7 * 24 * 60 * 60);
    });

    it("2. Alice funds the state channel with 1000 tokens", async () => {
        const splitETH = await SplitETH.deployed();
        const token = await SEToken.deployed();
        await token.getTokens(ALICE, 1000);
        await token.approve(splitETH.address, 1000, {from: ALICE});
        await splitETH.fundUser("ETHBerlin", ALICE, 1000, {from: ALICE});
    });

    it("3. Bob funds the state channel with 500 tokens", async () => {
        const splitETH = await SplitETH.deployed();
        const token = await SEToken.deployed();
        await token.getTokens(BOB, 500);
        await token.approve(splitETH.address, 500, {from: BOB});
        await splitETH.fundUser("ETHBerlin", BOB, 500, {from: BOB});
    });

    it("4. Charles funds the state channel with 300 tokens", async () => {
        const splitETH = await SplitETH.deployed();
        const token = await SEToken.deployed();
        await token.getTokens(CHARLES, 300);
        await token.approve(splitETH.address, 300, {from: CHARLES});
        await splitETH.fundUser("ETHBerlin", CHARLES, 300, {from: CHARLES});
    });

    it("5. Close ETHBerlin state channel with updated state", async () => {
        signState(0, "3cd3e98347018d58694280163960a88e74afeecd1de4f87e9afb786551eb5202");

    });

});

const signState = (state, pk) => {

  let typedData = [
    {type: 'uint256', name: 'enclavesDEX', value: 100}
  ];

  const msgParams = { data: typedData };
  const privKey = new Buffer(pk, 'hex')

  const sig = sigUtil.signTypedData(privKey, msgParams);
  console.log("SIG: " + sig);

  let res = sig.slice(2);
  let r = '0x' + res.substr(0, 64),
    s = '0x' + res.substr(64, 64),
    v = parseInt(res.substr(128, 2), 16);

  const result = { r, s, v };
  return result;
}
