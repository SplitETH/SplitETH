import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import Pablo from './components/Pablo'
import Channel from './components/Channel'
import NavBar from './components/NavBar'
import Wallet from './components/Wallet'

const About = () => (
<div>
  <h2>About</h2>
</div>
)

class App extends Component {

  constructor(props) {
    super(props);

    // Web3 providers
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    const web3WH = new Web3();
    const eventProvider = new Web3.providers.WebsocketProvider('ws://localhost:8545')
    web3WH.setProvider(eventProvider)

    this.state = {
      web3: web3,
      web3WH: web3WH,
      accounts:'',
    };

  }

  render() {
    return (

      <div className="App">

        <Router>
          <div>
            <div>
              <NavBar web3={this.state.web3} web3WH={this.state.web3WH} />
            </div>

            <Route exact path='/' render={(props) => <Channel web3={this.state.web3} web3WH={this.state.web3WH} />}/>
            <Route path="/about" component={About}/>
            <Route path="/wallet" render={(props) => <Wallet web3={this.state.web3} web3WH={this.state.web3WH} />}/>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
