import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Message } from 'semantic-ui-react'
import axios from 'axios'

import { hubUrl } from '../config'

class PrinterStatus extends Component {

    constructor(props){
        super(props);

        this.state = {
            loading: true,
            jobsCount: 0
        };

        this.refreshStatus = this.refreshStatus.bind(this);
    }

    componentDidMount() {
        this.refreshStatus();
    }

    refreshStatus(){
        let printerAlias = this.props.printerAlias;

        axios({
            baseURL: hubUrl,
            url: `print-hub/by-alias/printer/${printerAlias}/status`,
            method: 'get',
            headers: {
                Authorization: this.props.tokens.id_token
            }
        }).then((response) => {
            if(response.status == 200){
                let state = response.data;
                state.loading = false;
                this.setState(state);

                if(state.connectionStatus == "ONLINE" && state.jobsCount == 0)
                    this.props.printerAvailability(true);
                else
                    this.props.printerAvailability(false);
            } else {
                throw new Error("Some error occured")
            }
        }).catch((error) => {
            console.error(error);
            this.props.printerAvailability(false);
        });
    }

    render() {
        return (
        <div>
            { this.state.loading ? <div></div> :
                <div>
                {this.state.connectionStatus == "ONLINE"? <div></div> :
                    (<Message color="red">
                        Sorry! <strong>{this.props.printerAlias}</strong> Printer is not available at this moment. 
                    </Message>)
                }
                {this.state.jobsCount == 0 ? <div></div> :
                    (<Message color="red">
                        <strong>{this.state.jobsCount}</strong> jobs in queue. Please wait till this get cleared.
                    </Message>)
                }
                {this.state.connectionStatus != "ONLINE" || this.state.jobsCount > 0 ?
                    <Button onClick={this.refreshStatus}>Refresh Status</Button> : null
                }
                </div>
            }
        </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        tokens: state.Tokens
    };
}

export default connect(mapStateToProps, null)(PrinterStatus); 