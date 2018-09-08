pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract SplitETH {
  using SafeMath for uint256;

    mapping (bytes32 => mapping (address => uint256)) public groupBalances;
    mapping (bytes32 => address[]) public groupUsers;
    mapping (bytes32 => address) public groupToken;
    mapping (bytes32 => uint256) public groupTimeout;
    mapping (bytes32 => uint256) public groupCloseTime;
    mapping (bytes32 => uint256) public groupUpdatedTime;

    event UserBalanceDeposited(bytes32 indexed _name, address indexed _user, address indexed _token, uint256 _deposit, uint256 _balance);
    event GroupCloseInitiated(bytes32 indexed _name, uint256 _closeTime);
    event GroupCloseUpdated(bytes32 indexed _name, uint256 _closeTime);
    event UserBalanceRefunded(bytes32 indexed _name, address indexed _user, address indexed _token, uint256 _refund);
    event GroupClosed(bytes32 indexed _name, uint256 _time);

    event GroupCreated(bytes32 indexed _name,  address[] _users, address _token, uint256 _timeout);

    function createGroup(bytes32 _name, address[] _users, address _token, uint256 _timeout) external {
        //TODO: Check _users are unique
        require(_users.length > 0, "Empty group");
        require(_users.length <= 10, "Group too large");
        require(groupUsers[_name].length == 0, "Name in use");
        groupUsers[_name] = _users;
        groupToken[_name] = _token;
        groupTimeout[_name] = _timeout;

        emit GroupCreated(_name, _users, _token, _timeout);

    }

    function fundUser(bytes32 _name, address _user, uint256 _amount) external {
        require(_user != address(0), "Invalid user");
        //require(_token != address(0), "Invalid token");
        //TODO: Check name actially exists
        require(ERC20(groupToken[_name]).transferFrom(msg.sender, address(this), _amount), "Transfer Failed");
        groupBalances[_name][_user] = groupBalances[_name][_user].add(_amount);
        //emit UserBalanceUpdated(_name, _user, groupToken[_name], groupBalances[_name][_user]);
    }

    /* function initiateCloseGroup(bytes32 _name) external {
        //TODO: Check msg.sender is in _name group
        require(groupCloseTime[_name] == 0, "Close already initiated");
        groupCloseTime[_name] = now.add(groupTimeout[_name]);
        emit GroupCloseInitiated(_name, groupCloseTime[_name]);
    }

    function finalizeCloseGroup(bytes32 _name) external {
        //TODO: Check msg.sender is in _name group
        require(groupCloseTime[_name] != 0, "Close not initiated");
        require(now > groupCloseTime[_name], "Timeout not met");
        for (uint8 i = 0; i < groupUsers[_name].length; i++) {
            address user = groupUsers[_name][i];
            require(ERC20(groupToken[_name]).transferFrom(address(this), user, groupBalances[_name][user]), "Transfer Failed");
            //emit UserBalanceRefunded(_name, _user, groupToken[_name], groupBalances[_name][user]);
            groupBalances[_name][groupUsers[_name][i]] = 0;
        }
        delete groupUsers[_name];
        delete groupToken[_name];
        delete groupTimeout[_name];
        delete groupCloseTime[_name];
        emit GroupClosed(_name, now);
    }

    function updateGroup(bytes32 _name, uint256[] _credits, uint256 _timestamp, bytes[] _sigs) external {
        //Order of _credits & _sigs should match groupUsers[_name]
        //Check it sums to 0
        require(groupUpdatedTime[_name] < _timestamp);
        groupUpdatedTime[_name] = _timestamp;
        for (uint8 j = 0; j < _credits.length; j++) {

        }

        /* for (uint8 i = 0; i < groupUsers[_name].length; i++) {
            bytes32 dataToBeSigned = keccak256(_credits, _timestamp);
            (uint8 v, bytes32 r, bytes32 s) = getSig(_sigs[i]);
            address signer = ecrecover(dataToBeSigned, v, r, s);
            require(signer == groupUsers[_name][i], "Mismatched signature");

        } */
        //Upcate groupBalances


    //} */


}
