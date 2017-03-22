import ReactDOM from 'react-dom';
import React from 'react';

class ListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

  }

  handleChange(e) {
    this.setState({input: e.target.value});
    console.log(e.target.value);
  }

  render() {
    return (            
      <div className="listItem container-fluid">
        <div> Name: {this.props.business.businessName}</div>
        <div> Address: {this.props.business.businessAddress}</div>
        <div> Phone: {this.props.business.businessPhone}</div>
      </div> 
    )
  }
}

export default ListItem;