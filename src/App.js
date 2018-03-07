import React, { Component } from 'react';
import Firebase from './fbinit'
import SearchAccounts from './components/searchaccounts';
import Login from './components/login';
import './app.css';

class App extends Component {

  constructor() {
    super()
    this.state = {
      logged: false
    }
  }
  componentWillMount() {
    var auth = Firebase.auth()
    auth.onAuthStateChanged((user) => {
      if(user){
        this.setState({logged: true})
        alert(user.email)
      } else {
        this.setState({logged: false})
      }
    })
  }

  updateLog(email, password) {
    var auth = Firebase.auth()
    auth.signInWithEmailAndPassword(email,password).catch((error) => {
    })

  }


  render() {
    this.state.logged=true
    if(this.state.logged){
      return(
        <SearchAccounts />
      )
    } else {
      return(
        <Login updateTheLog={this.updateLog} />
      )
    }

  }





}

export default App;
