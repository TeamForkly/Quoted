import React from 'react';
import ReactDOM from 'react-dom';
import DropzoneComponent from 'react-dropzone-component';
import $ from 'jquery';

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      groupName: ''
    };

    // For a full list of possible configurations,
    // please consult http://www.dropzonejs.com/#configuration
    this.djsConfig = {
      addRemoveLinks: true,
      acceptedFiles: 'text/csv,application/vnd.ms-excel'
    };

    this.componentConfig = {
      iconFiletypes: ['.csv'],
      showFiletypeIcon: true,
      postUrl: '/user/addcontacts',
    };

    // If you want to attach multiple callbacks, simply
    // create an array filled with all your callbacks.
    this.callbackArray = [() => console.log('Hi!'), () => console.log('Ho!')];

    // Simple callbacks work too, of course
    this.callback = () => console.log('Hello!');

    // should receive object of array of contacts
    // server response is second argument: http://www.dropzonejs.com/#configuration
    this.success = (data, contacts) => {
      // receives contacts in format of arrays within an array
      console.log('at component', contacts);
      // do I need to change contacts to an array of obejcts..?

      this.setState({contacts: contacts});
    }

    this.removedfile = file => console.log('removing...', file);

    this.dropzone = null;
  }


  changeHandler(event) {
    this.setState({groupName: event.target.value});
    // console.log(this.state.groupName);
  }

  // save groupname and contacts to db
  clickHandler() {
    console.log('clicked');
    console.log(this.state);
    let FileUploadContext = this;
    if (this.state.contacts.length && this.state.groupName) {
      $.post({
        url: '/db/contacts',
        data: this.state,
        success: (results) => {
          FileUploadContext.props.fetchGroupNames();
        },
        error: (err) => {

        } 

      })      
    }
  }

  render() {
    const config = this.componentConfig;
    const djsConfig = this.djsConfig;

    // For a list of all possible events (there are many), see README.md!
    const eventHandlers = {
      init: dz => this.dropzone = dz,
      drop: this.callbackArray,
      addedfile: this.callback,
      success: this.success,
      removedfile: this.removedfile
    };

    var contactsArray = [];

    if (this.state.contacts) {
      this.state.contacts.forEach((contacts) => {
      contactsArray.push(
        <li> {contacts[0]}, {contacts[1]}
        </li>)
      });
    }

    return (
      <div>
        <h3>Please upload your contacts and give them a group name!</h3>
        <p>Your CSV file should hold one contact's name and number per line, separated by commas.</p> 
        <br/>
        <p>Examples of correct ways to input contact information:</p>
        <ul>
          <li>Fork Ly, (111) 222-3333</li>
          <li>Mary Had A Little Lamb, (444)4444444 </li>
          <li>Erik, 7777777777</li>
        </ul>

        <DropzoneComponent config={config} eventHandlers={eventHandlers} djsConfig={djsConfig} />
        <br/>
        <h4>Group Name: </h4>
        <input onChange={this.changeHandler.bind(this)} value={this.state.groupName}/>
        <br/>
        <h4>Your successfully uploaded contacts: </h4>
        <p>Note: Toll-free numbers with area codes 888 and 800 will not be uploaded</p>
        <ul>
          {contactsArray}
        </ul>
        <br/>
        <button onClick={this.clickHandler.bind(this)}>Save group</button>
      </div>
      );
  }
}

export default FileUpload;