import React from 'react';
import firebase from '../fbinit'
import pdfDoc from 'jspdf'
export default class SearchAccounts extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      searchString: '',
      creatingAccount: false,
      filtered: [],
      accounts: [],
      current: {},
      temp: {},
      firstCurrent: false,
      saveEdit: 'Saved..',
      saveEditToggle: false,
      deleteEdit: 'Delete',
      notificationClass: 'btnNotification hide'
    }


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
    this.refs.notesInput.value = ""
    this.refs.invoiceNotesInput.value = ""
    this.refs.oPriceInput.value = ""
    this.refs.oPriceInputToggle.value = ""
    this.refs.iPriceInput.value = ""
    this.refs.iPriceInputToggle.value = ""
    this.refs.screenPriceInput.value = ""
    this.refs.screenPriceInputToggle.value = ""
  }

  shine(i) {
    if(this.state.creatingAccount || this.state.saveEditToggle){
      alert("Action needed before continuing")
    } else {
      this.clearAccountInfo()
      this.setState({
        current: i,
        temp: i
      })
    }
  }

   handleInfoChange(e) {
     var currently = this.state.current;
     currently[e.target.name] = e.target.value
     if(e.target.name=="oPriceToggle" || e.target.name=="iPriceToggle" || e.target.name=="screenPriceToggle"){
       currently[e.target.name] = e.target.checked
     }

     this.setState({current: currently})

     if(this.state.creatingAccount == false) {
       this.setState({
         saveEdit: 'Save',
         saveEditToggle: true,
         deleteEdit: 'Cancel'
       })
       this.refs.btnSaveAccount.classList.remove('disabled')
     }
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
     this.refs.addAccount.classList.add('disabled')

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
      this.refs.addAccount.classList.remove('disabled')
      this.setState({saveEdit: 'Saved..', deleteEdit: 'Delete', saveEditToggle: false})

  }

  deleteCancel() {
    if(this.state.creatingAccount){
      this.setState({
        creatingAccount: false,
        deleteEdit: 'Delete',
        saveEdit: 'Saved..',
        saveEditToggle: false
      })
      this.refs.btnSaveAccount.classList.add('disabled')
      this.refs.addAccount.classList.remove('disabled')
    } else {
      if(this.state.saveEditToggle){
        this.clearAccountInfo()
        this.setState({
          current: this.state.temp,
          creatingAccount: false,
          deleteEdit: 'Delete',
          saveEdit: 'Saved..',
          saveEditToggle: false
        })
        this.refs.btnSaveAccount.classList.add('disabled')
        this.refs.addAccount.classList.remove('disabled')
      } else {
        var db = firebase.database().ref('accounts/'+this.state.current.stringID)
        db.remove()
      }
    }
}

  generatePDF() {

    var doc = new pdfDoc()
    doc.setFontSize(24)
    doc.text(40,20, 'Windobros ')
    doc.text(176,20, 'Invoice')
    doc.setFontSize(12)
    doc.text(18,28, '46 E Point Drive Apt 1202, Draper, UT 84020')
    doc.text(46,34, '(801) 899-3930')

    doc.setFontType('bold')
    doc.text(18,45,'Service Address:')
    doc.text(85,45,'Invoice Number')
    doc.text(150,45,'Bill To:')
    doc.text(75,60,'Service Date')
    doc.text(92,65,'ETA')

    doc.text(30,82,'Type')
    doc.text(78,82,'Description')
    doc.text(160,82,'Price')

    doc.text(130,115,'Total')
    doc.text(30,130,'Notes:')

    doc.line(20,75,195,75)

    doc.setFontType('normal')
    doc.text(20,50,this.state.current.name)
    doc.text(20,55,this.state.current.address)
    doc.text(20,60,this.state.current.city + ", " + "UT")
    doc.text(20,65,this.state.current.number)

    var date = new Date(this.state.current.nextAppt)
    var year = date.getFullYear()
    var month = date.getMonth()
    var day = date.getDate()

    doc.text(87,50,String(year)+String(month+1)+String(day+1))
    doc.text(103,60,String(month+1)+'/'+String(day+1)+'/'+String(year))
    doc.text(103,65,this.state.current.nextApptTime)

    doc.text(152,50,this.state.current.name)
    doc.text(152,55,this.state.current.address)
    doc.text(152,60,this.state.current.city + ", " + "UT")

    var total = 0
    doc.text(30,90,this.state.current.frequency)
    if(this.state.current.oPriceToggle){
      doc.text(78,90,'Exterior')
      doc.text(176,90,"$"+this.state.current.oPrice+".00",'right')
      total += Number(this.state.current.oPrice)
    }
    if(this.state.current.iPriceToggle){
      doc.text(78,95,'Interior')
      doc.text(176,95,"$"+this.state.current.iPrice+".00",'right')
      total += Number(this.state.current.iPrice)
    }
    if(this.state.current.screenPriceToggle){
      doc.text(78,100,'Screens')
      doc.text(176,100,"$"+this.state.current.screenPrice+".00",'right')
      total += Number(this.state.current.screenPrice)
  }


    doc.text(176,115,"$"+total+".00",'right')

    doc.line(20,120,195,120)

    if(this.state.current.invoiceNotes!==undefined){
      var split = doc.splitTextToSize(this.state.current.invoiceNotes,135)
      doc.text(45,130,split)
    }


    doc.line(0,150,210,150)
    doc.save('yum.pdf')



  }

  checkPDFCreation() {

    alert(this.state.current.frequency)
    if(this.state.current.frequency==undefined){
      alert("Update: Frequency")
    } else {
      this.generatePDF()
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

        <button ref="addAccount" id="addAccount" className="btn btn-primary" onClick={() => this.startCreatingAccount()}>+</button>
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

                <button className="btn btn-info accountButton" onClick={() => this.shine(account)}>{account.name}<p className="btnNotification">{this.state.current.notificationCount}</p></button>

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
                <p>Number</p><input ref="numberInput" className="number accountInfo" value={this.state.current.number} name='number' onChange={this.handleInfoChange.bind(this)} />
                <input ref="optInTextInput" className="optText" type="checkbox" value={this.state.current.optInText} name='optInText' onChange={this.handleInfoChange.bind(this)}/>
                <p>Address</p><input ref="addressInput" className="accountInfo" value={this.state.current.address} name='address' onChange={this.handleInfoChange.bind(this)}/>
                <p>City</p><input ref="cityInput" className="accountInfo" value={this.state.current.city} name='city' onChange={this.handleInfoChange.bind(this)}/>
                <p>Notes</p><textarea ref="notesInput" className="accountInfo" value={this.state.current.notes} name='notes' onChange={this.handleInfoChange.bind(this)}/>
                <p>Invoice Notes</p><textarea ref="invoiceNotesInput" className="accountInfo" value={this.state.current.invoiceNotes} name='invoiceNotes' onChange={this.handleInfoChange.bind(this)}/>
                <button className="btn btn-warning" onClick={() => this.checkPDFCreation()}>Generate Invoice</button>
              </div>

              <div className="rightInfo">
                <p>Frequency</p>
                <select ref="frequencyInput" className="accountInfo" value={this.state.current.frequency} name='frequency' onChange={this.handleInfoChange.bind(this)}>
                  <option value="">None</option>
                  <option value="Annual">Annual</option>
                  <option value="Bi-Annual">Bi-Annual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="First Time Service">First Time Service</option>
                </select>

                <p>Last Appointment</p><input ref="lastApptInput" type="date"className="accountInfo" value={this.state.current.lastAppt} name='lastAppt' onChange={this.handleInfoChange.bind(this)}/>
                <p>Next Appointment</p><input ref="nextApptInput" type="date"className="accountInfo" value={this.state.current.nextAppt} name='nextAppt' onChange={this.handleInfoChange.bind(this)}/>
                <p>Time</p><input type="time" ref="nextApptTimeInput" className="accountInfo" value={this.state.current.nextApptTime} name='nextApptTime' onChange={this.handleInfoChange.bind(this)}/>
                <p>Exterior Price</p><input type="number" ref="oPriceInput" className="accountInfo" value={this.state.current.oPrice} name='oPrice' onChange={this.handleInfoChange.bind(this)}/>
                <input ref="oPriceInputToggle" type="checkbox" className="optText" checked={this.state.current.oPriceToggle} name='oPriceToggle' onChange={this.handleInfoChange.bind(this)}/>
                <p>Interior Price</p><input type="number" ref="iPriceInput" className="accountInfo" value={this.state.current.iPrice} name='iPrice' onChange={this.handleInfoChange.bind(this)}/>
                <input ref="iPriceInputToggle" type="checkbox" className="optText" checked={this.state.current.iPriceToggle} name='iPriceToggle' onChange={this.handleInfoChange.bind(this)}/>
                <p>Screens Price</p><input type="number" ref="screenPriceInput" className="accountInfo" value={this.state.current.screenPrice} name='screenPrice' onChange={this.handleInfoChange.bind(this)}/>
                <input ref="screenPriceInputToggle" type="checkbox" className="optText" checked={this.state.current.screenPriceToggle} name='screenPriceToggle' onChange={this.handleInfoChange.bind(this)}/>

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
