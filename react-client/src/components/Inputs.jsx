import ReactDOM from 'react-dom';
import React from 'react';
import Message from './Message.jsx';
import SoundIcon from './SoundIcon.jsx';
import $ from 'jquery';

class Inputs extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      businesses: [],
      groupName: 'Auto Repair',
      location: 'San Francisco',
      sendSMS: false,
      sendPhone: false,
      textInput: '',
      recordingPublicUrl: '',
    }
  }

  handleTextInputChange(event) {
    this.setState({textInput: event.target.value});
    // console.log(this.state.textInput);
  }

  handleCheckBox(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({[name]: value});
    console.log('name is: ' + name + '; value is: ' + value);
  }

  // handleTextChange(e) {
  //   this.setState({textInput: e.target.value});
  //   // console.log(e.target.value);
  //   console.log(this.state.textInput);
  // }

  sendInfo() {
    console.log('Trying to send info', this.state.textInput);
    // console.log('groups: ', this.props.state.businesses);

    //Send data to server to send text messages
    // if (this.state.sendSMS === true){
      $.ajax({
        method: "POST",
        url: '/messages',
        data: 
          { textInput: this.state.textInput,
            businesses: this.props.state.businesses,
            groupName: this.props.state.groupName,
            location: this.props.state.location
          },
        success: (results) => {
          console.log('sucessfuly sent message', results);
        }, error: (err) => {  
          console.log('err recieved', err);
        }
      })
    // }

    //Send data to server to send phone calls
    if (this.state.sendPhone === true) {
      $.ajax({
        method: "POST",
        url: '/call',
        data: 
          { businesses: this.state.businesses,
            groupName: this.state.groupName,
            location: this.state.location
          },
        success: (results) => {
          console.log('successfully sent call', results);
          }, 
        error: (err) => {
          console.log('err in call', err);
        }
      })
    }
  }

  // sendInfo() {
  //   console.log('Trying to send info', this.state.textInput);

  //   //Send data to server to send text messages
  //   $.ajax({
  //     method: "POST",
  //     url: '/messages',
  //     data: {textInput: this.state.textInput},
  //     success: (results) => {
  //       console.log('sucessfuly sent message', results);
  //     }, error: (err) => {  
  //       console.log('err recieved', err);
  //     }
  //   })

  //   //Send data to server to send phone calls
  //   $.ajax({
  //     method: "POST",
  //     url: '/call',
  //     success: (results) => {
  //       console.log('successfully sent call', results);
  //     }, error: (err) => {
  //       console.log('err in call', err);
  //     }
  //   })
  // }



  render() {
    return (                  
      <div className="row inputs"> 
        <div className="col-sm-10">
          <tbody>
            <tr>
              <td><input  type="checkbox" 
                          name="sendSMS"
                          value={this.props.state.sendSMS}
                          onClick={this.handleCheckBox.bind(this)} /> Send SMS Message </td>
              <td><input  type="checkbox" 
                          name="sendPhone"
                          value={this.props.state.sendPhone}
                          onClick={this.handleCheckBox.bind(this)} /> Send Phone Message </td> 
            </tr>                         
          </tbody>
          <Message handleTextInputChange={this.handleTextInputChange.bind(this)}/>         
          <SoundIcon recordingPublicUrl={this.props.recordingPublicUrl} />        
          <button onClick={this.sendInfo.bind(this)} 
          className="btn btn-primary"> Contact your group </button>
          </div>
      </div>
    )
  }
}

export default Inputs;