pragma solidity ^0.4.24;
/* pragma experimental ABIEncoderV2; */

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ECRecovery.sol";

contract SplitETH {
    using SafeMath for uint256;

    struct State {
        uint256 amount;
        bool isCredit;
    }

    mapping (bytes32 => mapping (address => uint256)) public groupBalances;
    mapping (bytes32 => mapping (address => bool)) public inGroup;
    mapping (bytes32 => address[]) public groupUsers;
    mapping (bytes32 => address) public groupToken;
    mapping (bytes32 => uint256) public groupTimeout;
    mapping (bytes32 => uint256) public groupCloseTime;
    mapping (bytes32 => uint256) public groupNonce;
    mapping (bytes32 => mapping (address => State)) public groupState;

    event GroupCreated(bytes32 indexed _name, address[] _users, address indexed _token, uint256 _timeout);
    event UserBalanceUpdated(bytes32 indexed _name, address indexed _user, address indexed _token, uint256 _deposit, uint256 _balance);
    event GroupClosed(bytes32 indexed _name, uint256 _challengeEndTime);
    event GroupUpdated(bytes32 indexed _name, uint256 _time);
    event UserBalanceWithdrawn(bytes32 indexed _name, address indexed _user, address indexed _token, uint256 _refund);

    function createGroup(bytes32 _name, address[] _users, address _token, uint256 _timeout) external {
        require(_users.length > 0, "Empty group");
        require(_users.length <= 10, "Group too large");
        require(groupUsers[_name].length == 0, "Name in use");
        require(_token != address(0), "Invalid token");
        groupUsers[_name] = _users;
        groupToken[_name] = _token;
        groupTimeout[_name] = _timeout;
        for (uint8 i = 0; i < _users.length; i++) {
            require(!inGroup[_name][_users[i]], "Duplicate users");
            inGroup[_name][_users[i]] = true;
        }
        emit GroupCreated(_name, _users, _token, _timeout);
    }

    function fundUser(bytes32 _name, address _user, uint256 _amount) external {
        require(_user != address(0), "Invalid user");
        require(inGroup[_name][_user], "User not in group");
        require(groupCloseTime[_name] == 0, "Group is closed");
        require(ERC20(groupToken[_name]).transferFrom(msg.sender, address(this), _amount), "Transfer Failed");
        groupBalances[_name][_user] = groupBalances[_name][_user].add(_amount);
        emit UserBalanceUpdated(_name, _user, groupToken[_name], _amount, groupBalances[_name][_user]);
    }

    function closeGroup(bytes32 _name, uint256[] _amounts, bool[] _isCredits, uint256 _timestamp, uint8[] _vs, bytes32[] _rs, bytes32[] _ss) external {
        require(groupCloseTime[_name] == 0, "Group already closed");
        groupCloseTime[_name] = now.add(groupTimeout[_name]);
        updateGroup(_name, _amounts, _isCredits, _timestamp, _vs, _rs, _ss);
        emit GroupClosed(_name, groupCloseTime[_name]);
    }

    function updateGroup(bytes32 _name, uint256[] _amounts, bool[] _isCredits, uint256 _timestamp, uint8[] _vs, bytes32[] _rs, bytes32[] _ss) public {
        //Check it sums to 0
        require(inGroup[_name][msg.sender], "User is not in group");
        require(groupNonce[_name] < _timestamp);
        require(groupCloseTime[_name] != 0, "Group not closed");
        require(_amounts.length == _isCredits.length, "Invalid state lengths");
        require(_amounts.length == groupUsers[_name].length, "Invalid user lengths");
        require(now <= groupCloseTime[_name], "Challenge period not active");
        require(checkSigs(_name, _amounts, _isCredits, _timestamp, _vs, _rs, _ss), "Invalid sigs");
        require(_updateState(_name, _amounts, _isCredits, _timestamp), "Invalid state");
        emit GroupUpdated(_name, now);
    }

    function pullFunds(bytes32 _name) external {
        require(inGroup[_name][msg.sender], "User is not in group");
        require(groupCloseTime[_name] != 0, "Close not initiated");
        require(now > groupCloseTime[_name], "Challenge period active");
        State memory userState = groupState[_name][msg.sender];
        uint256 withdrawn;
        if (userState.isCredit) {
            withdrawn = groupBalances[_name][msg.sender].add(userState.amount);
        } else {
            withdrawn = groupBalances[_name][msg.sender].sub(userState.amount);
        }
        require(ERC20(groupToken[_name]).transferFrom(address(this), msg.sender, groupBalances[_name][msg.sender].add(userState.amount)), "Transfer Failed");
        emit UserBalanceWithdrawn(_name, msg.sender, groupToken[_name], withdrawn);
        inGroup[_name][msg.sender] = false;
    }

    function _updateState(bytes32 _name, uint256[] _amounts, bool[] _isCredits, uint256 _timestamp) internal returns(bool) {
        //TODO: check amounts sum to 0
        for (uint8 i = 0; i < _amounts.length; i++) {
            groupState[_name][groupUsers[_name][i]] = State(_amounts[i], _isCredits[i]);
        }
        groupNonce[_name] = _timestamp;
        return true;
    }

    function checkSigs(bytes32 _name, uint256[] _amounts, bool[] _isCredits, uint256 _timestamp, uint8[] _vs, bytes32[] _rs, bytes32[] _ss) public view returns(bool) {
        //TODO: check sigs match state
        require(_vs.length == _rs.length, "Bad signatures");
        require(_vs.length == _ss.length, "Bad signatures");
        require(_vs.length == groupUsers[_name].length, "Incorrect sigs length");
        require(_vs.length == _amounts.length, "Incorrect amounts length");
        for (uint8 i = 0; i < groupUsers[_name].length; i++) {
            require(checkSig(_name, groupUsers[_name][i], _amounts, _isCredits, _timestamp, _vs[i], _rs[i], _ss[i]), "Invalid signature");
        }
        return true;
    }

    function checkSig(bytes32 _name, address _user, uint256[] _amounts, bool[] _isCredits, uint256 _timestamp, uint8 _v, bytes32 _r, bytes32 _s) public view returns(bool) {
        require(_amounts.length == _isCredits.length, "Incorrect isCredits length");
        bytes32 dataToBeSigned = keccak256(abi.encodePacked(_name, _amounts, _isCredits, _timestamp));
        require(_user == ecrecover(dataToBeSigned, _v, _r, _s), "Signature mismatch");
        return true;
    }


}
