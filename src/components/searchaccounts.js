import React from 'react';
import firebase from '../fbinit'

export default class SearchAccounts extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      searchString: '',
      creatingAccount: false,
      filtered: [],
      accounts: [],
      current: {},
      firstCurrent: false,
      saveEdit: 'Saved',
      deleteEdit: 'Delete',
      btnClass: 'btn btn-primary btn-sm disabled'
    }
    this.baseState = this.state.current



  }
  componentWillMount() {
    var db = firebase.database().ref('accounts')
    db.once('value', (data) => {
      var getData = data.val();
      var keys = Object.keys(getData);
      console.log(keys);
      keys.forEach((i) => {
        console.log(getData[i].city)
        var newState = this.state.accounts.slice()
        getData[i].stringID = i;
        newState.push(getData[i])
        this.setState({accounts: newState})
      })
    })
  }

  updateSearchBox(event) {
    this.setState({searchString: event.target.value})
  }

  clearAccountInfo() {
    this.refs.nameInput.value = ""
    this.refs.numberInput.value = ""
    this.refs.optInTextInput.value = ""
    this.refs.addressInput.value = ""
    this.refs.cityInput.value = ""
    this.refs.frequencyInput.value = ""
    this.refs.lastApptInput.value = ""
    this.refs.nextApptInput.value = ""
    this.refs.nextApptTimeInput.value = ""
  }

  shine(i) {

    this.clearAccountInfo()
    this.setState({current: i})

  }

 handleInfoChange(e) {
   var currently = this.state.current;
   currently[e.target.name] = e.target.value
   this.setState({
     current: currently,
     saveEdit: 'Save',
   });
   this.refs.btnSaveAccount.classList.remove('disabled')
 }

 startCreatingAccount() {
   this.clearAccountInfo()
   this.setState({
     current: [],
     saveEdit: "Create Account",
     deleteEdit: "Cancel",
     creatingAccount: true
   })
   this.refs.btnSaveAccount.classList.remove('disabled')

 }
saveAccountInfo() {
    if(this.state.creatingAccount){
      var db = firebase.database().ref('accounts')
      var newString = db.push(this.state.current).key
      //db.ref(newString).set({stringID: newString})
    } else {
        db = firebase.database().ref('accounts/'+this.state.current.stringID)
        db.set(this.state.current)
    }
    this.refs.btnSaveAccount.classList.add('disabled')
    this.setState({saveEdit: 'Saved', deleteEdit: 'Delete'})

}

deleteCancel() {
  if(this.state.creatingAccount){
    this.setState({creatingAccount: false, deleteEdit: 'Delete', saveEdit: 'Saved'})
    this.refs.btnSaveAccount.classList.add('disabled')
  }
}


  render() {

    let filtered = this.state.accounts.filter(
      (account) => {
        return account.name.toLowerCase().indexOf(this.state.searchString.toLowerCase()) !== -1;
      }
    )

    return(
      <div className="contain row">

        <button id="addAccount" className="btn btn-primary" onClick={() => this.startCreatingAccount()}>+</button>
        <div className="search">
          <div style={{display: 'flex'}}>
            <input className="searchBox" placeholder="Search" value={this.state.searchString} onChange={this.updateSearchBox.bind(this)}/>
            <select id="searchOption">
              <option>Name</option>
            </select>
          </div>

          <ul className="searchList">
            {filtered.map((account) => {
              return <li key={account.stringID}>

                <button className="accountButton btn btn-info" onClick={() => this.shine(account)}>{account.name}</button>

              </li>
            })}
          </ul>
        </div>

        <div className="contain">
          <h3>Account</h3>
          <button className="btn btn-primary btn-sm disabled" ref="btnSaveAccount" id="saveAccount" onClick={() => this.saveAccountInfo()}>{this.state.saveEdit}</button>
          <button className="btn btn-danger btn-sm" ref="btnDeleteAccount" onClick={() => this.deleteCancel()}>{this.state.deleteEdit}</button>
            <div className="accountInfoBox">

              <div className="leftInfo">
                <p>Name</p><input ref="nameInput" className="accountInfo" value={this.state.current.name} name='name' onChange={this.handleInfoChange.bind(this)}/>
                <p>Number</p><input ref="numberInput" id="number" className="accountInfo" value={this.state.current.number} name='number' onChange={this.handleInfoChange.bind(this)} />
                <input ref="optInTextInput" id="optText" type="checkbox" value={this.state.current.optInText} name='optInText' onChange={this.handleInfoChange.bind(this)}/>
                <p>Address</p><input ref="addressInput" className="accountInfo" value={this.state.current.address} name='address' onChange={this.handleInfoChange.bind(this)}/>
                <p>City</p><input ref="cityInput" className="accountInfo" value={this.state.current.city} name='city' onChange={this.handleInfoChange.bind(this)}/>
              </div>
              <div className="rightInfo">
                <p>Frequency</p>
                <select ref="frequencyInput" className="accountInfo" value={this.state.current.frequency} name='frequency' onChange={this.handleInfoChange.bind(this)}>
                  <option value="">None</option>
                  <option value="Annual">Annual</option>
                  <option value="Bi-Annual">Bi-Annual</option>
                  <option value="Quarterly">Quarterly</option>
                </select>

                <p>Last Appointment</p><input ref="lastApptInput" type="date"className="accountInfo" value={this.state.current.lastAppt} name='lastAppt' onChange={this.handleInfoChange.bind(this)}/>
                <p>Next Appointment</p><input ref="nextApptInput" type="date"className="accountInfo" value={this.state.current.nextAppt} name='nextAppt' onChange={this.handleInfoChange.bind(this)}/>
                <p>Time</p><input type="time" ref="nextApptTimeInput" className="accountInfo" value={this.state.current.nextApptTime} name='nextApptTime' onChange={this.handleInfoChange.bind(this)}/>

              </div>
            </div>
        </div>
      </div>
    )
  }





}

/*
  name
  number
  optInText
  address
  city
  frequency
  lastAppt
  nextAppt
  nextApptTime
*/
