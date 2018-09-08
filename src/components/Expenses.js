import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import PabloJSON from '../build/contracts/Pablo.json'
import SplitETHJSON from '../build/contracts/SplitETH.json'
import { NETWORK_ID } from './Channel';
import BigNumber from 'bignumber.js';

const cleanAsciiText = text => text && text.replace(/[\x00-\x09\x0b-\x1F]/g, '').trim();

const TOKEN = (token) => new BigNumber(token).multipliedBy((new BigNumber(10)).pow(18));

const printNumber = (number) => `$${BigNumber.isBigNumber(number) ? number.div((new BigNumber(10)).pow(18)).toFixed() : number}`;

const getAddressName = (address, showAddress = true) => {
  address = address.toLowerCase();
  const savedEntry = window.localStorage.getItem(address);

  if (savedEntry) {
    return <span><b>{savedEntry}</b>{showAddress && ` (${address.slice(0, 6)}...${address.slice(address.length - 3, address.length)})`}</span>;
  }

  return address;
}

class Expenses extends Component {

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);

      this.state = {
        web3: props.web3,
        web3WH: props.web3WH,
        accounts:"",
        channelID:this.props.match.params.channelID,
        expenses:[]
      };

      var accounts;
      this.state.web3.eth.getAccounts().then(res => {
        accounts = res;
        this.setState({accounts:accounts});
      });
    }

    async handleSubmit(event) {

      let amount = this.state.web3.utils.toWei(event.target.Amount.value,"Ether")
      let to = event.target.To.value
      event.preventDefault();
      event.target.reset();
      this.state.web3.eth.sendTransaction({
          from: this.state.accounts[0],
          to: to,
          value: amount
      })
      .then(function(receipt){
          alert("Transaction successfully completed!");
      });
    }

    async componentDidMount(){
      console.log("ELID",this.state.channelID);
      await this.getExpenses();

      this.setupContracts();
      const group = await this.getGroupById(this.state.channelID);
      console.log('setstate', group);
      this.setState({
        group
      });
    }

    setupContracts() {
      const props = this.props;

      const pabloAddress = PabloJSON.networks[NETWORK_ID].address;
      const PabloABI = PabloJSON.abi;

      const splitETHAddress = SplitETHJSON.networks[NETWORK_ID].address;
      const splitETHABI = SplitETHJSON.abi;

      const pabloC = new props.web3.eth.Contract(PabloABI,pabloAddress);
      const pabloC_event = new props.web3WH.eth.Contract(PabloABI,pabloAddress);
      pabloC_event.setProvider(props.web3WH.currentProvider);

      const splitETH = new props.web3.eth.Contract(splitETHABI,splitETHAddress);
      const splitETH_event = new props.web3WH.eth.Contract(splitETHABI,splitETHAddress);
      splitETH_event.setProvider(props.web3WH.currentProvider);

      this.setState({
        splitETH,
        splitETH_event
      });
    }

    async getGroupById(name) {
      return new Promise(resolve => {
        var _this = this;
        this.state.splitETH_event.getPastEvents('GroupCreated', {
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){})
        .then(async function(events){
          const groups = [];

          for (let element of events) {
            var friends = [];
            for (let usr of element.returnValues._users) {
              const result = await _this.state.splitETH.methods.groupBalances(element.returnValues._name,usr).call();

              friends.push({
                address:usr,
                balance:result
              })
            }

            groups.push({
                name: cleanAsciiText(_this.state.web3.utils.toAscii(element.returnValues._name)),
                friends: friends,
                timeout: element.returnValues._timeout
            });
          }

          console.log('groups', groups, 'name', name, name === groups[0].name, groups.find(group => group.name === name));

          resolve(groups.find(group => group.name === name));
        });
      })

    }

    render() {
      let { bills, channelID, group } = this.state;

      console.log('group', group);

      if (bills && group) {
        bills = bills.map(bill => {
          bill.detailed = [];

          const addresses = {};

          bill.parts.map(part => {
            addresses[part.address.toLowerCase()] = {
              spent: part.value,
              paid: 0
            }
          });

          bill.payments.map(payment => {
            addresses[payment.address.toLowerCase()].paid = payment.value;
          });

          console.debug('aar', {
            addresses,
            friends: group.friends
          });
          group.friends.map(entry => {
            addresses[entry.address.toLowerCase()].balance = new BigNumber(entry.balance);
          });

          bill.totalBalanceChange.map(entry => {
            addresses[entry.address.toLowerCase()].balance = addresses[entry.address.toLowerCase()].balance.plus(new BigNumber(entry.value));
          });

          for (let key of Object.keys(addresses)) {
            bill.detailed.push({
              address: key,
              spent: addresses[key].spent,
              paid: addresses[key].paid,
              balance: addresses[key].balance
            });
          }

          return bill;
        });
      }


      console.log('bills', bills);
      console.log('group', group);



      return (
        <div className="mt-5">
          <h3>Bills from: {channelID}</h3>
          <div className="mt-5">
            {bills && bills.map((bill, index) => (
              <div className="Bill">
                <div className="Bill-name">
                  <h5>#{index + 1}. Name: {bill.name}</h5>
                  <br/>
                  Total amount paid: {printNumber(bill.totalAmount)}
                  <br/>
                  <table className="table mt-2">
                        <thead>
                          <th>Member</th>
                          <th>Spent</th>
                          <th>Paid</th>
                          <th>Balance</th>
                        </thead>
                        <tbody>
                  {bill.detailed && bill.detailed.map(entry => (
                    <tr>
                      <td>{getAddressName(entry.address)}</td>
                      <td>{printNumber(entry.spent)}</td>
                      <td>{printNumber(entry.paid)}</td>
                      <td>{printNumber(entry.balance)}</td>
                    </tr>
                  ))}
                    </tbody>
                  </table>
                  <br/>
                  <br/>
                  Signed by:&nbsp;
                  {bill.signatures.map((signature, index) => (
                    <span>
                      {getAddressName(signature.signer, false)}{index + 1 !== bill.signatures.length ? ',' : ''}&nbsp;
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    async getExpenses(){
      var expense1 = {
        name: "Restaurant",
        state: "[50,-50]",
        signatures:[{
          signer:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          signature: "0x2-Signature"
        },
        {
          signer:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          signature: "0x3-Signature"
        }],
        balanceChange:[{
          address:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          value: TOKEN(50)
        },
        {
          address:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          value: TOKEN(-50)
        }],
        totalBalanceChange:[{
          address:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          value: TOKEN(50)
        },
        {
          address:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          value: TOKEN(-50)
        }],
        totalAmount: TOKEN(400),
        parts:[{
          address:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          value: TOKEN(300)
        },
        {
          address:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          value: TOKEN(100)
        }],
        payments:[{
          address:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          value: TOKEN(350)
        },
        {
          address:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          value: TOKEN(50)
        }],
        fullySigned: true,
        timestamp: 1234567
      }

      var expense2 = {
        name: "Cafe",
        state: "[200,-200]",
        signatures:[{
          signer:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          signature: "0x2-Signature"
        },
        {
          signer:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          signature: "0x3-Signature"
        }],
        balanceChange:[{
          address:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          value: TOKEN(150)
        },
        {
          address:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          value:  TOKEN(-150)
        }],
        totalBalanceChange:[{
          address:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          value: TOKEN(200)
        },
        {
          address:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          value: TOKEN(-200)
        }],
        totalAmount: TOKEN(500),
        parts:[{
          address:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          value: TOKEN(0)
        },
        {
          address:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          value: TOKEN(500)
        }],
        payments:[{
          address:"0x487A54E1D033Db51C8Ee8C03edac2A0F8a6892c6",
          value: TOKEN(150)
        },
        {
          address:"0xcdc490ab4c4c7165b8885bdece9ff8798d3e59fa",
          value: TOKEN(350)
        }],
        fullySigned: false,
        timestamp: 9999999999
      }

      this.setState({
        bills: [expense1, expense2]
      });
    }
}

export default Expenses;
