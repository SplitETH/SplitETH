pragma solidity ^0.4.24;

contract Pablo {
  event PabloEvent(string _message);

  uint public myData;

  constructor(){
    myData = 33;
  }

  function setData(uint x) public {
    myData = x;

    emit PabloEvent("Data stored successfully!");
  }
}
