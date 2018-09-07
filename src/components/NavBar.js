import React, { Component } from 'react';

import EthBalanceDisplay from './EthBalanceDisplay'


import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';

  import {
    BrowserRouter as Router,
    Route,
    Link
  } from 'react-router-dom'


class NavBar extends Component {

  constructor(props) {
    super(props);

      this.state = {
        web3: props.web3,
        web3WH: props.web3WH
      };
    }

    async componentDidMount(){

      var accounts;
      this.state.web3.eth.getAccounts().then(res => {
        accounts = res;
        this.setState({accounts:accounts});
      })

    }

    render() {
      return (
        <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">SplitETH</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink><Link href="" to="/wallet"><EthBalanceDisplay web3={this.state.web3} web3WH={this.state.web3WH} /></Link></NavLink>
              </NavItem>
              <NavItem>
                <NavLink><Link href="" to="/">Home</Link></NavLink>
              </NavItem>
              <NavItem>
                <NavLink><Link href="" to="/about">About</Link></NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Options
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>
                    Option 1
                  </DropdownItem>
                  <DropdownItem>
                    Option 2
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>
                    Reset
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
      )
    }
  }

  export default NavBar;
