import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
// import App from './index.jsx';
import SignUp from './components/SignUp.jsx'
import MainContent from './MainContent.jsx'
import Login from './components/Login.jsx'
import Threads from './components/Threads.jsx'
// import {Router, Route, browserHistory, IndexRoute, HashRouter} from 'react-router';
import {BrowserRouter, Route,IndexRoute, Link} from 'react-router-dom'
// import {HashRouter, Route, IndexRoute, Link} from 'react-router-dom'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      threads: []
    }
  }

  componentDidMount() {
  }

  alertHello() {
    alert('hello')
  }
  render () {
    return (
      <BrowserRouter>
          <div>
              <Route exact path="/" component={MainContent} />
              <Route path="/ThreadView" component={(props, state) => <Threads threads={this.state.threads} />}/>
              <Route path="/SignUp" component={SignUp} />
              <Route path="/Login" component={Login} />
          </div>
      </ BrowserRouter>
    ) 
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
