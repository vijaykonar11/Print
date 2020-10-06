import React, { Component } from 'react';
import { Container, Divider, Dropdown, Grid, Header, 
    Image, List, Menu, Segment, Search, Icon } from 'semantic-ui-react'
import { connect } from 'react-redux'

import { logout, updateUserAccount, loadUserAccount } from '../actions/index'

class TopBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        };

        this.logout = this.logout.bind(this);
    }

    logout() {
        console.log("Logout triggered");
        this.props.logout();
        window.location = "/"
    }

    componentDidUpdate(prevProps) {
        if(this.props.userAccount != prevProps.userAccount){
            if(this.props.userAccount && !this.props.userAccount.balance){
                this.props.updateUserAccount({});
                alert("You have 5 Rs of promotional balance! Enjoy!!");
                
                setTimeout(() => {
                    this.props.loadUserAccount();
                }, 2000);
            }
        }
    }

    render() {
        const { isLoading } = this.state;

        return (
            <Grid>
                <Grid.Row only='large screen'>
                    <Menu fixed='top' inverted stackable>
                        <Container>
                            <Menu.Item header as='a' href="/">
                                <Image
                                    size='mini'
                                    src='/PLL_Logo_35x35.png'
                                    style={{ marginRight: '1.5em' }}
                                />
                                Print Le Le
                            </Menu.Item>

                            <Menu.Item as='a' header href='/home'>
                                Home
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
                                        <Dropdown.Item as='a' href="/user-account">{
                                        this.props.userAccount ?
                                            this.props.userAccount.balance ?
                                                (<div>
                                                    Account ({this.props.userAccount.balance} Rs)
                                                    </div>) :
                                                (<div>Account (No balance)</div>)
                                            : (
                                                <Container textAlign='center' fluid>
                                                    <Icon name='circle notched' loading size='big' />
                                                </Container>
                                            )
                                        }
                                        </Dropdown.Item>
                                        {/* <Dropdown.Item>
                                            Orders ({this.props.orders ? this.props.orders.length : ''})
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item as='a' href="/print-hub">Hub Admin</Dropdown.Item> */}
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
                        <Menu.Item header as='a' href="/">
                            <Image
                                size='mini'
                                src='/PLL_Logo_35x35.png'
                                style={{ marginRight: '1.5em' }}
                            />
                            Print Le Le
                        </Menu.Item>
                        <Menu.Item as='a' header href='/home'>
                            Home
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Dropdown item compact icon='user circle'>
                                <Dropdown.Menu>
                                    <Dropdown.Item as='a' href="/user-account">{
                                        this.props.userAccount ?
                                            this.props.userAccount.balance ?
                                                (<div>
                                                    Account ({this.props.userAccount.balance} Rs)
                                                    </div>) :
                                                (<div>Account (No balance)</div>)
                                            : (
                                                <Container textAlign='center' fluid>
                                                    <Icon name='circle notched' loading size='big' />
                                                </Container>
                                            )
                                    }
                                    </Dropdown.Item>
                                    {/* <Dropdown.Item>
                                            Orders ({this.props.orders ? this.props.orders.length : ''})
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item as='a' href="/print-hub">Hub Admin</Dropdown.Item> */}
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
        orders: state.Orders,
        userAccount: state.UserAccount
    };
}

export default connect(mapStateToProps, { updateUserAccount, loadUserAccount, logout })(TopBar);