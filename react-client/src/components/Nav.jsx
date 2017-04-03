import ReactDOM from 'react-dom';
// import React from 'react';
import ListItem from './ListItem.jsx';
import $ from 'jquery';
import {HashRouter, Route, IndexRoute, Link} from 'react-router-dom';
import React, { Component, PropTypes } from 'react';

class Nav extends React.Component {
  constructor(props) {
    super(props);
    // this.handleClickPastThreads = this.handleClickPastThreads.bind(this);
  }

  // handleClickPastThreads (event) {
  // 	event.preventDefault();
  // 	this.context.router.history.push('/ThreadView');
  // }

  render() {
    return (
    <nav className="navbar navbar-default"> 
    <div className="container-fluid">
    <div>
      <button><Link to="/">Home</Link></button>
      <button><Link to="/threads">Past Threads</Link></button>
      <button><Link to="/fileUpload">Upload Contacts</Link></button>
    </div>
      <form onSubmit={this.props.fetchBusinesses}>
        <ul className="nav navbar-nav">
        <li className="dropdown">
        <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
          <label> Contact Group: </label> {' '}
          <select value={this.props.searchParams.groupName} onChange={this.props.handleGroupNameChange}>
            {
              this.props.searchParams.groupNames.map((groupName) => {
                return (<option value={groupName}>{groupName}</option>)
              })
            }
		          </select>
				</a>
			  </li>
			  <li> 
				<a>
					<label> Location: </label> {' '}
		 			<select value={this.props.searchParams.location} onChange={this.props.handleLocationChange}>
		            <option value="San Francisco">San Francisco</option>
		            <option value="Oakland">Oakland</option>
					<option value="San Jose">San Jose</option>								            
		          </select>    					
				</a>
			  </li>
			  <a className="loginFacebook" href="/auth/facebook">Login with Facebook</a>				
			  <input type="submit" value="Search Contacts" className="btn btn-warning search"/>   
  			</ul>
		  </form>
		</div>
	  </nav>
    )
  }
}

Nav.contextTypes = {
  router: PropTypes.object.isRequired
};

export default Nav; 
