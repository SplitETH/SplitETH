import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

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
      this.getExpenses();
    }

    async getExpenses(){
      var expense1 = {
        name: "Restaurant",
        state: "[50,-50]",
        signatures:[{
          signer:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          signature: "0x2-Signature"
        },
        {
          signer:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          signature: "0x3-Signature"
        }],
        balanceChange:[{
          address:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          value:50
        },
        {
          address:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          value:-50
        }],
        totalBalanceChange:[{
          address:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          value:50
        },
        {
          address:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          value:-50
        }],
        totalAmount:400,
        parts:[{
          address:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          value:300
        },
        {
          address:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          value:100
        }],
        payments:[{
          address:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          value:350
        },
        {
          address:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          value:50
        }],
        fullySigned: true,
        timestamp: 1234567
      }

      var expense2 = {
        name: "Cafe",
        state: "[200,-200]",
        signatures:[{
          signer:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          signature: "0x2-Signature"
        },
        {
          signer:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          signature: "0x3-Signature"
        }],
        balanceChange:[{
          address:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          value:150
        },
        {
          address:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          value:-150
        }],
        totalBalanceChange:[{
          address:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          value:200
        },
        {
          address:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          value:-200
        }],
        totalAmount:500,
        parts:[{
          address:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          value:0
        },
        {
          address:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          value:500
        }],
        payments:[{
          address:"0x10916b1dd4590ab87f7bed0b5b02cfce94861eb3",
          value:150
        },
        {
          address:"0xa53ebd7dfb5d9c56a1bd935d98d9c71a1547b97e",
          value:350
        }],
        fullySigned: false,
        timestamp: 9999999999
      }

      console.log(expense1);
    }


    render() {
      return (
        <div>
          <Container className="Wallet">
            <Row>
              <Col sm="12" md={{ size: 8, offset: 2 }}>
                {/* {this.state.accounts[0]} (<EthBalanceDisplay web3={this.state.web3} web3WH={this.state.web3WH} />) */}
              </Col>
            </Row>
            <Row>
              <Col sm="12" md={{ size: 8, offset: 2 }}>
                Transfer funds
              </Col>
            </Row>
            <Row>
              <Col sm="12">
                <Form onSubmit={this.handleSubmit}>
                  <FormGroup row>
                    <Label for="To" sm={2}>To: </Label>
                    <Col sm={10}>
                      <Input type="text" name="To" placeholder="0x0123..." />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="Amount" sm={2}>Amount: </Label>
                    <Col sm={10}>
                      <Input type="text" name="Amount" placeholder="1.5" />
                    </Col>
                  </FormGroup>
                  <FormGroup check row>
                    <Col sm={{ size: 12, offset: 0 }}>
                      <Button>Transfer</Button>
                    </Col>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
          </Container>
        </div>
      )
    }
}

export default Expenses;
