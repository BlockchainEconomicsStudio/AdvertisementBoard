var AABoard = artifacts.require("./AABoard.sol");

module.exports = function (deployer) {
  deployer.deploy(AABoard, "ADS", "ADS");
};
