import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Header, Left, Button, Icon, Body, Title, Right } from 'native-base'

import { logout } from '../actions/index'

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

    render() {
        const { isLoading } = this.state;

        return (
            <Header>
                <Left>
                    <Button transparent>
                        <Icon name='menu' />
                    </Button>
                </Left>
                <Body>
                    <Title>PrintLele</Title>
                </Body>
                <Right />
            </Header>
        );
    }

}

export default connect(null, { logout })(TopBar);