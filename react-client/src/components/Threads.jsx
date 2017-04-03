import ReactDOM from 'react-dom';
import React from 'react';
import Thread from './Thread.jsx';
import $ from 'jquery';

class Threads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      threads: []
    } 
  }

  fetchThreads() {
    console.log('fetching threads');
    $.get('/threads', {}, (data) => {
      this.setState({
        threads: data
      });
      console.log(this.state.threads);
    });

  }

  componentDidMount() {
    this.fetchThreads();
  }

  render() {
    if (this.state.threads.length) {
      return (  
        <div className="threads">
          {
            this.state.threads.map((thread) => {
              console.log('thread: ', thread);
              return <Thread thread={thread} key={thread._id}/>
            })
          }
        </div>
      )      
    } else {
      return (
        <div>Please login to see threads</div>
      )
    }

  }
}

export default Threads;