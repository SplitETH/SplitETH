import React, { Component } from 'react';
import {BigNumber} from 'bignumber.js';
import PabloJSON from '../build/contracts/Pablo.json'
import SplitETHJSON from '../build/contracts/SplitETH.json'
import { Container, Row, Col } from 'reactstrap';
import { Button, Form, FormGroup, Label, Input, FormText, Table } from 'reactstrap';

import EthBalanceDisplay from './EthBalanceDisplay'


import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import SETokenJSON from '../build/contracts/SEToken.json'

class Channel extends Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleNewChannel = this.handleNewChannel.bind(this);
    this.handleJoinChannel = this.handleJoinChannel.bind(this);
    this.handleCloseChannel = this.handleCloseChannel.bind(this);
    this.handleSubmitNewChannel = this.handleSubmitNewChannel.bind(this);
    this.handleSubmitJoinChannel = this.handleSubmitJoinChannel.bind(this);
    this.handlePullFundsFromChannel = this.handlePullFundsFromChannel.bind(this);

    const pabloAddress = PabloJSON.networks[15].address;
    const PabloABI = PabloJSON.abi;

    const splitETHAddress = SplitETHJSON.networks[15].address;
    const splitETHABI = SplitETHJSON.abi;

    const SETAddress = SETokenJSON.networks[15].address;
    const SETABI = SETokenJSON.abi;

    const pabloC = new props.web3.eth.Contract(PabloABI,pabloAddress);
    const pabloC_event = new props.web3WH.eth.Contract(PabloABI,pabloAddress);
    pabloC_event.setProvider(props.web3WH.currentProvider);

    const splitETH = new props.web3.eth.Contract(splitETHABI,splitETHAddress);
    const splitETH_event = new props.web3WH.eth.Contract(splitETHABI,splitETHAddress);
    splitETH_event.setProvider(props.web3WH.currentProvider);

    const seToken = new props.web3.eth.Contract(SETABI,SETAddress);
    const seToken_event = new props.web3WH.eth.Contract(SETABI,SETAddress);
    seToken_event.setProvider(props.web3WH.currentProvider);


    this.state = {
      web3: props.web3,
      web3WH: props.web3WH,
      PabloABI:PabloABI,
      pabloC:pabloC,
      pabloC_event:pabloC_event,
      splitETH:splitETH,
      splitETH_event:splitETH_event,
      seToken:seToken,
      myValue:0,
      selectedOption:0,
      name: '',
      friends: [{ address: '' }],
      groups: []
    };

    //console.log(this.state.seToken._address);
  }

    async componentDidMount(){

      var accounts;
      this.state.web3.eth.getAccounts().then(res => {
        accounts = res;
        this.setState({accounts:accounts});
      });

      this.state.pabloC.methods.myData().call().then( result => {
        this.setState({myValue:result});
      });

      // this.state.splitETH_event.events.GroupCreated({ fromBlock: 'latest', toBlock: 'latest' })
      // .on('data', event => {
      //     //console.log("QQQ",event.returnValues._message);
      //     this.state.pabloC.methods.myData().call().then( result => {
      //       console.log("PAPA",result);
      //       this.setState({myValue:result});
      //     });
      // });
      this.getGroups();
    }

    async getGroups(){
      var _this = this;
      this.state.splitETH_event.getPastEvents('GroupCreated', {
          fromBlock: 0,
          toBlock: 'latest'
      }, function(error, events){})
      .then(async function(events){
        _this.setState({
          groups: []
        });

        for (let element of events) {
          var friends = [];
          for (let usr of element.returnValues._users) {
            const result = await _this.state.splitETH.methods.groupBalances(element.returnValues._name,usr).call();

            friends.push({
              address:usr,
              balance:result
            })
          }
          _this.setState({
            groups: [..._this.state.groups, {
                name: _this.state.web3.utils.toAscii(element.returnValues._name),
                friends: friends,
                timeout: element.returnValues._timeout
              }]
            });
        }

        // events.forEach(function(element) {
        //
        //
        //   element.returnValues._users.forEach(function(usr) {
        //
        //   })
        // });
      });
    }

    async handleSubmitNewChannel(event) {
      console.log(event.target.GroupName.value);
      event.preventDefault();

      var _this = this;

      var groupName = this.state.web3.utils.fromAscii(event.target.GroupName.value);
      var addresses = [];
      this.state.friends.forEach(function(element) {
        addresses.push(element.address);
      });
      var tokenAddress = event.target.TokenAddress.value;
      var expiry = event.target.Expiry.value;

      await this.state.splitETH.methods.createGroup(
        groupName,
        addresses,
        tokenAddress,
        expiry
      ).send({from:this.state.accounts[0]})
      .then(function(receipt){
        //console.log(web3.utils.toAscii(receipt.events.GroupCreated.returnValues._name));
        alert(_this.state.web3.utils.toAscii(receipt.events.GroupCreated.returnValues._name) + " Successfully created!");
        _this.setState({selectedOption:0});
        _this.getGroups();
      // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
      });
    }

    async handleSubmitJoinChannel(event) {
      //console.log(event.target.GroupName.value);
      event.preventDefault();

      var _this = this;

      var groupName = this.state.web3.utils.fromAscii(event.target.GroupName.value);
      var user = event.target.User.value;
      var amount = event.target.Amount.value;

      await this.state.seToken.methods.approve(this.state.splitETH._address,_this.state.web3.utils.toWei(amount,"ether"))
      .send({from:this.state.accounts[0]})
      .then(function(receipt_){
          _this.state.splitETH.methods.fundUser(
          groupName,
          user,
          _this.state.web3.utils.toWei(amount,"ether")
        ).send({from:_this.state.accounts[0]})
        .then(function(receipt){
        _this.setState({selectedOption:0});
          _this.getGroups();
        });
      });


    }

    async handleClick(event) {
      console.log(event.target.myValueInput.value);
      event.preventDefault();
      await this.state.pabloC.methods.setData(event.target.myValueInput.value).send({from:this.state.accounts[0]})
      .then(function(receipt){
        //console.log(receipt);
      // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
      });
    }

    async handleNewChannel(event) {
      //console.log(event.target.myValueInput.value);
      event.preventDefault();
      this.setState({selectedOption:1});
    }

    async handleJoinChannel(group) {
      console.log(group);
      //event.preventDefault();
      this.setState({
        selectedOption:2,
        selectedGroup:group
      });
    }

    async handleCloseChannel(group) {
      console.log(group);
      await this.state.splitETH.methods.closeGroup(
        this.state.web3.utils.fromAscii(group),
        [50,50],
        [true,false],
        1212121,
        [],
        [],
        []
      ).send({from:this.state.accounts[0]})
      .then(function(receipt){
        console.log(receipt);
      });

    }

    async handlePullFundsFromChannel(group) {
      console.log(group);
      await this.state.splitETH.methods.pullFunds(
        this.state.web3.utils.fromAscii(group)
      ).send({from:this.state.accounts[0]})
      .then(function(receipt){
        console.log(receipt);
      });

    }

    handleChange(event) {
      //this.setState({myValue: event.target.value});
    }

    renderSelectedOption(){
      if(this.state.selectedOption == 1){
        return(
          <Container className="Wallet">
            <Row>
              <Col sm="12" md={{ size: 8, offset: 2 }}>
                {/* {this.state.accounts[0]} (<EthBalanceDisplay web3={this.state.web3} web3WH={this.state.web3WH} />) */}
              </Col>
            </Row>
            <Row>
              <Col sm="12" md={{ size: 8, offset: 2 }}>
                Create New Channel
              </Col>
            </Row>
            <Row>
              <Col sm="12">
                <Form onSubmit={this.handleSubmitNewChannel}>
                  <FormGroup row>
                    <Label for="GroupName" sm={2}>Group Name: </Label>
                    <Col sm={10}>
                      <Input type="text" name="GroupName" placeholder="My new group" />
                    </Col>
                  </FormGroup>

                    {this.state.friends.map((friend, idx) => (
                      <div>
                        <FormGroup row>
                          <Col sm={10}>
                            <Input
                              type="text"
                              placeholder={`Friend #${idx + 1} ETH address`}
                              value={friend.address}
                              onChange={this.handleFriendNameChange(idx)}
                            />
                          </Col>
                          <Col sm={2}>
                            <Button type="button" onClick={this.handleRemoveFriend(idx)} className="small">-</Button>
                          </Col>
                        </FormGroup>
                      </div>
                    ))}
                    <FormGroup row>
                      <Button type="button" onClick={this.handleAddFriend} className="small">Add Friend</Button>
                    </FormGroup>

                  <FormGroup row>
                    <Label for="TokenAddress" sm={2}>DAI Token Address: </Label>
                    <Col sm={10}>
                      <Input type="text" name="TokenAddress" placeholder="0xabcdef" disabled value={this.state.seToken._address}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="Expiry" sm={2}>Expiry Date: </Label>
                    <Col sm={10}>
                      <Input type="text" name="Expiry" placeholder="12345678" />
                    </Col>
                  </FormGroup>
                  <FormGroup check row>
                    <Col sm={{ size: 12, offset: 0 }}>
                      <Button>Create new Channel</Button>
                    </Col>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
          </Container>
        )
      }else if(this.state.selectedOption == 2){
        return(
          <Container className="Wallet">
            <Row>
              <Col sm="12" md={{ size: 8, offset: 2 }}>
                Fund Group
              </Col>
            </Row>
            <Row>
              <Col sm="12">
                <Form onSubmit={this.handleSubmitJoinChannel}>
                  <FormGroup row>
                    <Label for="GroupName" sm={2}>Group: </Label>
                    <Col sm={10}>
                      <Input type="text" disabled name="GroupName" placeholder="Berlin" value={this.state.selectedGroup} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="User" sm={2}>User: </Label>
                    <Col sm={10}>
                      <Input type="text" name="User" placeholder="0x123" disabled value={this.state.accounts[0]}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="Amount" sm={2}>DAI Amount: </Label>
                    <Col sm={10}>
                      <Input type="text" name="Amount" placeholder="125" />
                    </Col>
                  </FormGroup>
                  <FormGroup check row>
                    <Col sm={{ size: 12, offset: 0 }}>
                      <Button>Fund</Button>
                    </Col>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
          </Container>
        )
      }

    }

  handleFriendNameChange = (idx) => (evt) => {
    const newFriends = this.state.friends.map((friend, sidx) => {
      if (idx !== sidx) return friend;
      return { ...friend, address: evt.target.value };
    });

    this.setState({ friends: newFriends });
  }

  // handleSubmit = (evt) => {
  //   const { name, friends } = this.state;
  //   alert(`Added: ${name} with ${friends.length} friends`);
  // }

  handleAddFriend = () => {
    this.setState({
      friends: this.state.friends.concat([{ address: '' }])
    });
  }

  handleRemoveFriend = (idx) => () => {
    this.setState({
      friends: this.state.friends.filter((s, sidx) => idx !== sidx)
    });
  }

  renderGroupList(){
    const listItems = this.state.groups.map((group) => {

      const participantsItems = group.friends.map((participant,i) => {

        var participantItem = {
          address: participant.address,
          balance: participant.balance
        }

        return(
          <li key={i}>{participantItem.address} - Balance: {this.state.web3.utils.fromWei(participant.balance,"ether")} DAI
          </li>
        )
      })

      return (<tr>
        <th scope="row">{group.name}</th>
        <td>{participantsItems}</td>
        <td>{group.timeout}</td>
        <td> <Button color="primary" size="sm" onClick={() => this.handleJoinChannel(group.name)}>Add Balance</Button></td>
        <td><Link href="" to={"/expenses/"+group.name}>Manage Expenses</Link></td>
        <td>
          <div><Button color="danger" size="sm" onClick={() => this.handleCloseChannel(group.name)}>CLOSE</Button></div>
          <Button color="info" size="sm" onClick={() => this.handlePullFundsFromChannel(group.name)}>Pull Funds</Button>
        </td>

      </tr>);
    });

    return (
      <Table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Participants</th>
            <th>Timeout</th>
            <th>Balance</th>
            <th>Expenses</th>
            <th>Close Group</th>
          </tr>
        </thead>
        <tbody>
          {listItems}
        </tbody>
      </Table>
    );
  }

    render() {
      return (
        <div className="NewChannel-Container">

          <Button color="primary" size="lg" block onClick={this.handleNewChannel}>Create New Group</Button>
          {/* <Button color="secondary" size="lg" block onClick={this.handleJoinChannel}>Join Existing Channel</Button> */}

          {this.renderSelectedOption()}

          {this.renderGroupList()}

        </div>
      )
    }
  }

  export default Channel;
