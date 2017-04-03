import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Nav from './components/Nav.jsx';
import Message from './components/Message.jsx'
import SoundIcon from './components/SoundIcon.jsx'
import Inputs from './components/Inputs.jsx'
import List from './components/List.jsx'
import Threads from './components/Threads.jsx'
import FileUpload from './components/FileUpload.jsx'
import {HashRouter, Route, IndexRoute, Link} from 'react-router-dom';
// import {BrowserRouter, Route,IndexRoute, Link} from 'react-router-dom'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      businesses: [],
      groupName: 'HRSF72',
      location: 'San Francisco',
      sendSMS: false,
      sendPhone: false,
      textInput: '',
      recordingPublicUrl: '',
      groupNames: [],
      threads: []
    }
  }

  handleGroupNameChange(event) {
    this.setState({groupName: event.target.value});
  }

  handleLocationChange(event) {
    this.setState({location: event.target.value});
  }

  fetchGroupNames() {
    let context = this;
    $.get('/groupNames', {}, (data) => {
      context.setState({
        groupNames: data
      });
    });
  }

  // sendInfo() {
  //   console.log('Trying to send info', this.state.textInput);

  //   //Send data to server to send text messages
  //   if (this.state.sendSMS === true){
  //     $.ajax({
  //       method: "POST",
  //       url: '/messages',
  //       data: { textInput: this.state.textInput,
  //               businesses: this.state.businesses,
  //               groupName: this.state.groupName,
  //               location: this.state.location},
  //       success: (results) => {
  //         console.log('sucessfuly sent message', results);
  //       }, error: (err) => {  
  //         console.log('err recieved', err);
  //       }
  //     })
  //   }

  //   //Send data to server to send phone calls
  //   if (this.state.sendPhone === true) {
  //     $.ajax({
  //       method: "POST",
  //       url: '/call',
  //       data: { businesses: this.state.businesses,
  //               groupName: this.state.groupName,
  //               location: this.state.location
  //       },
  //       success: (results) => {
  //         console.log('successfully sent call', results);
  //       }, error: (err) => {
  //         console.log('err in call', err);
  //       }
  //     })
  //   }
  // }

  // need to change this to fetch user contacts instead of querying yelp businesses
  fetchBusinesses(event) {
    let params = {};
    params.category = this.state.groupName || 'test';
    params.location = this.state.location || 'San Francisco';
    console.log('fetchBusiness params: ', params);

    $.post({
      url: '/businesses',
      data: params,
      dataType: 'json',
      success: (results) => {
        console.log('success results: ', results);
        this.setState({businesses: results});
      }, 
      error: (err) => {
        console.log('err', err);
      }
    })

    // $.get({
    //   url: '/contactList'
    // })
  }

  componentDidMount() {
    this.fetchBusinesses();
    this.fetchGroupNames();
  }

  render() {
    return (
    <HashRouter>
      <div>
        <Nav fetchBusinesses={this.fetchBusinesses.bind(this)} 
              handleGroupNameChange={this.handleGroupNameChange.bind(this)} 
              handleLocationChange={this.handleLocationChange.bind(this)} 
              searchParams={this.state} />
        <div className="page-header">
        <h1> <b> Quotely </b></h1>
        </div>
        <Route exact path="/" component={() => {
          return (
            <div>
            <Inputs state={this.state} /> 
            <List businesses={this.state.businesses} 
                  fetchBusinesses={this.fetchBusinesses.bind(this)} />        
          </div>
          )
        }}/>
        <Route path="/threads" component={Threads}/>
        <Route path="/fileUpload" component={() => {
          return(
            <FileUpload groupNames={this.state.groupNames} fetchGroupNames={this.fetchGroupNames.bind(this)}/>
          )
        }
        }/>
      </div>
    </HashRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));