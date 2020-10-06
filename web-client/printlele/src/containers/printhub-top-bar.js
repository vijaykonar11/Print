import React, { Component } from 'react';
import { Container, Divider, Dropdown, Grid, Header, Image, List, Menu, Segment, Search } from 'semantic-ui-react'
import { connect } from 'react-redux'

import { logout } from '../actions/index'

class PrintHubTopBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        };

        this.logout = this.logout.bind(this);
    }

    logout(){
        console.log("Logout triggered");
        this.props.logout();
        window.location = "/"
    }

    render() {
        const { isLoading } = this.state;

        if(!this.props.userAccount){
            return (<div>Loading.. </div>);
        }

        return (
            <Grid>
                <Grid.Row only='large screen'>
                    <Menu fixed='top' inverted stackable>
                        <Container>
                            <Menu.Item as='a' header>
                                <Image
                                    size='mini'
                                    src='/logo.png'
                                    style={{ marginRight: '1.5em' }}
                                />
                                Print Le Le 
                    </Menu.Item>

                            <Menu.Menu position='right'>
                                {/* <Menu.Item >
                                    <Search placeholder="Search..."
                                        loading={isLoading}
                                    />
                                </Menu.Item>
                             */}
                                <Dropdown item simple text='Account'>
                                    <Dropdown.Menu>
                                        <Dropdown.Item>{this.props.userAccount.earnings} Rs Earnings</Dropdown.Item>
                                        <Dropdown.Item>{this.props.hubOrders ? this.props.hubOrders.length : ''} Orders</Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={this.logout}>Logout</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Menu.Menu>

                        </Container>
                    </Menu>
                    &nbsp;
                </Grid.Row>
                <Grid.Row >
                    &nbsp;
                </Grid.Row>
                <Grid.Row only='mobile tablet'>
                    <Menu fixed='top' inverted>
                        <Menu.Item header>
                                <Image
                                    size='mini'
                                    src='/logo.png'
                                    style={{ marginRight: '1.5em' }}
                                />
                                Print Le Le
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Dropdown item compact icon='user circle'>
                                    <Dropdown.Menu>
                                        <Dropdown.Item>{this.props.userAccount.earnings} Rs Earning</Dropdown.Item>
                                        <Dropdown.Item>{this.props.hubOrders ? this.props.hubOrders.length : ''} Orders</Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={this.logout}>Logout</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                        </Menu.Menu>
                    </Menu>
                    &nbsp;
                </Grid.Row>
                {/* <Grid.Row only='mobile tablet'>
                    <Grid.Column stretched>
                        <Container>
                            <Search
                                input={{ fluid: true }}
                                placeholder="Search..."
                                loading={isLoading}
                            />
                        </Container>
                    </Grid.Column>
                </Grid.Row> */}
            </Grid>
        );
    }

}

function mapStateToProps(state) {
    return {
        hubOrders: state.HubOrders,
        userAccount: state.UserAccount        
    };
}

export default connect(mapStateToProps, { logout })(PrintHubTopBar);