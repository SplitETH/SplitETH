var Pablo = artifacts.require("./Pablo.sol");
var SplitETH = artifacts.require("./SplitETH.sol");
var SEToken = artifacts.require("./SEToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Pablo);
  deployer.deploy(SEToken);
  deployer.deploy(SplitETH);
};
