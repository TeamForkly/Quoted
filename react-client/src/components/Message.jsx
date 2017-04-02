import ReactDOM from 'react-dom';
import React from 'react';

class Message extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

  }

  render() {
    return (            
      <div className="form-group message">
      <label htmlFor="textArea" className="col-lg-4 control-label">Message</label>
      <div >
        <textarea className="form-control col-md-8" 
          rows="8" 
          id="textArea" 
          onChange={(e) => {this.props.handleTextInputChange(e)}}>
        </textarea>
        <span className="help-block">Enter your text message here</span>
      </div>
      </div> 
    )

  }
}

export default Message;