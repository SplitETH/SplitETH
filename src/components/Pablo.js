import React, { Component } from 'react';
import {BigNumber} from 'bignumber.js';

class Pablo extends Component {

  constructor(props) {
    super(props);

    console.log(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);

    //const pabloAddress = JSON.parse(require('fs').readFileSync('./build/contracts/Pablo.json').toString()).networks[15].address;
    const PabloABI = [
      {
        "constant": true,
        "inputs": [],
        "name": "myData",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_message",
            "type": "string"
          }
        ],
        "name": "PabloEvent",
        "type": "event"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "x",
            "type": "uint256"
          }
        ],
        "name": "setData",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    const pabloC = new props.web3.eth.Contract(PabloABI,"0x72d50ed0a88eea0f414166c466bd049781c17773");
    const pabloC_event = new props.web3WH.eth.Contract(PabloABI,"0x72d50ed0a88eea0f414166c466bd049781c17773");
    pabloC_event.setProvider(props.web3WH.currentProvider);


    this.state = {
      web3: props.web3,
      web3WH: props.web3WH,
      PabloABI:PabloABI,
      pabloC:pabloC,
      pabloC_event:pabloC_event,
      myValue:0
    };
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

      this.state.pabloC_event.events.PabloEvent({ fromBlock: 'latest', toBlock: 'latest' })
      .on('data', event => {
          //console.log("QQQ",event.returnValues._message);
          this.state.pabloC.methods.myData().call().then( result => {
            console.log("PAPA",result);
            this.setState({myValue:result});
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

    handleChange(event) {
      //this.setState({myValue: event.target.value});
    }

    render() {
      return (
        <div>
          <p>Hola</p>
          <p className="App-intro">
            Your value is: {this.state.myValue}
          </p>
          <form onSubmit={this.handleClick}>
           <label>
             Value:
             <input type="text" name="myValueInput"  onChange={this.handleChange} />
           </label>
           <input type="submit" value="Submit" />
         </form>
        </div>
      )
    }
  }

  export default Pablo;
