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
      notificationClass: 'btnNotification hide',
      emailPDF: false,
      searchOption: 'Name',
      messages: [],
      invoices: [],
      invoiceDate: 0,
      invoiceNumber: 0
    }

    let totalPrice = 0

  }

  componentWillMount() {
    firebase.database().ref('Settings').once('value', (data) => {
      var tmpDate = data.val().invoiceDate
      var tmpNum = data.val().invoiceNumber
      this.setState({invoiceDate: tmpDate})
      this.setState({invoiceNumber: tmpNum})
    })
    var db = firebase.database().ref('accounts')
    db.once('value', (data) => {
      var getData = data.val();
      var keys = Object.keys(getData);
      keys.forEach((i) => {
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
    this.refs.attachedTo.value = ""
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
    this.refs.panesInput.value = ""
    this.refs.emailPDFInput.value = ""

  }

  shine(i) {

    if(i.invoices!==undefined || i.invoices=={}) {
      this.refs.invoiceTableRef.classList.remove('hide')
      this.refs.noInvoiceHistoryRef.classList.add('hide')
    } else {
      this.refs.invoiceTableRef.classList.add('hide')
      this.refs.noInvoiceHistoryRef.classList.remove('hide')
    }

    if(this.state.creatingAccount || this.state.saveEditToggle){
      alert("Action needed before continuing")
    } else {
      this.clearAccountInfo()
      this.setState({
        current: i,
        temp: i
      })
      var erase = []
      this.setState({messages: erase})
      if(i.texts!==undefined){
        var texting = i.texts
        var newMessage = this.state.messages
        this.setState({messages: texting})
      }
      if(i.invoices!==undefined){
        var invoicing = i.invoices
        var newMessage = this.state.invoices
        this.setState({invoices: invoicing})
      }
    }

  }

   handleInfoChange(e) {

     this.setState({emailPDF: false})
     var changeToSave = false
     if(e.target.name!=="emailPDF"){
       var currently = this.state.current;
       currently[e.target.name] = e.target.value
       if(e.target.name=="oPriceToggle" || e.target.name=="iPriceToggle" || e.target.name=="screenPriceToggle"){
         currently[e.target.name] = e.target.checked

       }

       this.setState({current: currently})
     } else {
       this.setState({emailPDF: e.target.checked})
       changeToSave = true
     }

     if(this.state.creatingAccount == false && changeToSave == false) {
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
        var currently = this.state.current
        var db = firebase.database()
        var newString = db.ref('accounts').push(currently).key
        currently.stringID = newString
        db.ref('accounts/' + newString).set(currently)
        this.refreshIt(false)
      } else {
          var splice = this.state.current
          db = firebase.database()
          db.ref('accounts/'+splice.stringID).update(splice)
      }

      this.refs.btnSaveAccount.classList.add('disabled')
      this.refs.addAccount.classList.remove('disabled')
      this.setState({saveEdit: 'Saved..', deleteEdit: 'Delete', saveEditToggle: false, creatingAccount: false})

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
        this.refreshIt(true)
      }
    }
}

  refreshIt(deleteIt) {
    var erase = []
    if(deleteIt){
      var erase2 = {}
      this.clearAccountInfo()
      this.setState({current: erase2})
    }
    this.setState({accounts: erase})
    this.componentWillMount()

  }


  checkPDFCreation(iTmp,tmp) {
    if(iTmp.nextAppt==undefined || iTmp.nextAppt==''){
      alert("Update Next Appointment Date")
    } else {
      this.generatePDF(this.state.emailPDF,iTmp,tmp)
      var thisR = iTmp
      thisR.notificationCount = ''
      if(thisR.nextAppt!==undefined){
        thisR.lastAppt = thisR.nextAppt
        //thisR.nextAppt = ''
      }
      this.setState({
        emailPDF: false,
        current: thisR
      })
      this.saveAccountInfo()

      if(this.state.emailPDF==false){
        var newInvoice = this.state.invoices
        var obj = {
          date: thisR.lastAppt,
          price: this.totalPrice,
          paid: false
        }
        var db = firebase.database()
        var newKey = db.ref('accounts/' + thisR.stringID + "/invoices/").push(obj).key
        obj.invoiceID = newKey
        db.ref('accounts/' + thisR.stringID + "/invoices/" + newKey).update(obj)
        newInvoice[newKey] = obj
        this.setState({invoices: newInvoice})
      }

      this.totalPrice = 0

    }

  }

  daysBetween(date1_,date2_,tmp) {

    var oneDay = 1000*60*60*24

    if(date1_!==undefined && date2_!==undefined){
      var date1 = new Date(date1_)
      var date2 = new Date(date2_)
      var d1MS = date1.getTime()
      var d2MS = date2.getTime()
    }

    var difference = d1MS - d2MS
    if(tmp==true){difference=Math.abs(difference)}
    var actual = Math.round(difference/oneDay)

    return actual
  }

  handleSearchChange(e) {
    this.setState({searchOption: e.target.value})
  }

  searching(account) {
    var tmp

    if(this.state.searchOption=="Name"){
      if(account.name!==undefined){tmp=account.name.toLowerCase().indexOf(this.state.searchString.toLowerCase()) !== -1}
    }
    if(this.state.searchOption=="Number"){
      if(account.number!==undefined){tmp=account.number.toLowerCase().indexOf(this.state.searchString.toLowerCase()) !== -1}
    }
    if(this.state.searchOption=="Next 30 Days"){
      var today = new Date()
      var days = this.daysBetween(account.nextAppt,today,false)
      if(days<31 && days>-1){tmp=account.name}
    }
    if(this.state.searchOption=="Next 7 Days"){
      var today = new Date()
      var days = this.daysBetween(account.nextAppt,today,false)
      if(days<7 && days>-1){tmp=account.name}
    }
    if(this.state.searchOption=="Tomorrow"){
      var today = new Date()
      var days = this.daysBetween(account.nextAppt,today,false)
      if(days==0 || days==1){tmp=account.name}
    }
    if(this.state.searchOption=="Today"){
      var today = new Date()
      var appt = new Date(account.nextAppt)
      var days = today.getDate()
      var aDay = appt.getDate()+1
      if(days==aDay){tmp=account.name}
    }
    if(this.state.searchOption=="AR"){
      if(account.invoices!==undefined){
        Object.keys(account.invoices).map((invoice) =>{
          if(account.invoices[invoice].paid==false){tmp=account.name}
        })
      }
    }
    if(this.state.searchOption=="Needs Reschedule"){
      var today = new Date()
      var days = this.daysBetween(account.nextAppt,today,false)
      var daysNaN = isNaN(days)
      if(days<0 || daysNaN==true){tmp=account.name}
    }
    return tmp
  }

  handleInvoiceCheckboxChange(e) {
    var currently = this.state.current
    var name = e.target.name
    currently.invoices[name].paid = e.target.checked
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

  deleteInvoice(sid) {

    var db = firebase.database()
    db.ref('accounts/'+this.state.current.stringID+'/invoices/'+sid).remove()

    var newInvoice = this.state.invoices
    delete newInvoice[sid]


    this.setState({invoices: newInvoice})

  }

  sendTextMessage() {

    var message = this.refs.writeArea.value
    var currently = this.state.current
    var newText = this.state.messages
    var date = Date.now()

    var obj = {
      who: 'You',
      what: message,
      date: date
    }

    var db = firebase.database()
    var newVal = db.ref('accounts/'+currently.stringID+"/texts/").push(obj).key

    newText[newVal] = obj
    this.setState({messages: newText})

    this.refs.writeArea.value = ''

  }

  invoiceAll(accounts) {

    var tmpNum=0
    accounts.map((account) => {
      tmpNum+=1
      this.checkPDFCreation(account,tmpNum)

    })




  }


  // BEGIN RENDER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  render() {

    let filtered = this.state.accounts.filter((account) => {return this.searching(account)})
    let invoicing = []
    let texting = []
    if(this.state.current.invoices!==undefined){
      invoicing = this.state.current.invoices
    }

    return(
      <div className="contain row">
        <div className="search">
          <div style={{display: 'flex'}}>
            <input className="searchBox" placeholder="Search" value={this.state.searchString} onChange={this.updateSearchBox.bind(this)}/>
            <select ref="searchOption" id="searchOption" value={this.state.searchOption} onChange={this.handleSearchChange.bind(this)}>
              <option value="Name">Name</option>
              <option value="Number">Number</option>
              <option value="AR">AR</option>
              <option value="Needs Reschedule">Needs Reschedule</option>
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
              <option value="Next 7 Days">Next 7 Days</option>
              <option value="Next 30 Days">Next 30 Days</option>
            </select>
          </div>
          <div className="btn-group btn-group-justified">
            <button className="btn btn-primary btn-sm" onClick={() => this.invoiceAll(filtered)}>Invoice All</button>

          </div>

          <ul className="searchList">
            {filtered.map((account) => {
              return <li key={account.stringID}>

                <button className="btn btn-info btn-sm accountButton" onClick={() => this.shine(account)}>{account.name}<p className="btnNotification">{account.notificationCount}</p></button>

              </li>
            })}
          </ul>
        </div>

          <div className="contain">
            <h3 id="accountThis">Account</h3>
            <button ref="addAccount" id="addAccount" className="btn btn-sm btn-success" onClick={() => this.startCreatingAccount()}><i className="fa fa-plus"></i></button>
            <button className="btn btn-primary btn-sm disabled" ref="btnSaveAccount" id="saveAccount" onClick={() => this.saveAccountInfo()}>{this.state.saveEdit}</button>
            <button className="btn btn-danger btn-sm" ref="btnDeleteAccount" onClick={() => this.deleteCancel()}>{this.state.deleteEdit}</button>
              <div className="accountInfoBox">
                <div className="leftInfo">
                  <p className="para">Name</p><input ref="nameInput" className="accountInfo" value={this.state.current.name} name='name' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Number</p><input ref="numberInput" className="withCheckbox accountInfo" value={this.state.current.number} name='number' onChange={this.handleInfoChange.bind(this)} />
                  <input ref="optInTextInput" className="optText" type="checkbox" value={this.state.current.optInText} name='optInText' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Address</p><input ref="addressInput" className="accountInfo" value={this.state.current.address} name='address' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">City</p><input ref="cityInput" className="accountInfo" value={this.state.current.city} name='city' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Attached Account</p>
                  <select ref="attachedTo" className="accountInfo accountInfoDrop" value={this.state.current.attachedTo} name='attchedTo' onChange={this.handleInfoChange.bind(this)}>
                    <option value="">None</option>
                    <option value="Account1">Windobros</option>
                    <option value="Account2">Hanes Window Wizards</option>
                  </select>
                  <p className="para">Internal Notes</p><textarea ref="notesInput" className="accountInfo" value={this.state.current.notes} name='notes' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Invoice Notes</p><textarea ref="invoiceNotesInput" className="accountInfo" value={this.state.current.invoiceNotes} name='invoiceNotes' onChange={this.handleInfoChange.bind(this)}/>
                  <button ref="BtnGenPDF" className="btn btn-sm btn-outline-primary generatePDF withCheckbox" onClick={() => this.checkPDFCreation(this.state.current,0)}>Generate Invoice</button>
                  <input ref="emailPDFInput" type='checkbox' className="optText" name="emailPDF" checked={this.state.emailPDF} onChange={this.handleInfoChange.bind(this)}/>
                </div>

                <div className="rightInfo">
                  <p className="para">Frequency</p>
                  <select ref="frequencyInput" className="accountInfo" value={this.state.current.frequency} name='frequency' onChange={this.handleInfoChange.bind(this)}>
                    <option value="">None</option>
                    <option value="Annual">Annual</option>
                    <option value="Bi-Annual">Bi-Annual</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="First Time Service">First Time Service</option>
                  </select>
                  <p className="para">Last Appointment</p><input ref="lastApptInput" type="date"className="accountInfo" value={this.state.current.lastAppt} name='lastAppt' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Next Appointment</p><input ref="nextApptInput" type="date"className="accountInfo" value={this.state.current.nextAppt} name='nextAppt' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Time</p><input type="time" ref="nextApptTimeInput" className="accountInfo" value={this.state.current.nextApptTime} name='nextApptTime' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Exterior Price</p><input type="number" ref="oPriceInput" className="withCheckbox accountInfo" value={this.state.current.oPrice} name='oPrice' onChange={this.handleInfoChange.bind(this)}/>
                  <input ref="oPriceInputToggle" type="checkbox" className="optText" checked={this.state.current.oPriceToggle} name='oPriceToggle' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Interior Price</p><input type="number" ref="iPriceInput" className="withCheckbox accountInfo" value={this.state.current.iPrice} name='iPrice' onChange={this.handleInfoChange.bind(this)}/>
                  <input ref="iPriceInputToggle" type="checkbox" className="optText" checked={this.state.current.iPriceToggle} name='iPriceToggle' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Screens Price</p><input type="number" ref="screenPriceInput" className="withCheckbox accountInfo" value={this.state.current.screenPrice} name='screenPrice' onChange={this.handleInfoChange.bind(this)}/>
                  <input ref="screenPriceInputToggle" type="checkbox" className="optText" checked={this.state.current.screenPriceToggle} name='screenPriceToggle' onChange={this.handleInfoChange.bind(this)}/>
                  <p className="para">Panes</p><input ref="panesInput" type="number" className="withCheckbox accountInfo" value={this.state.current.panes} name='panes' onChange={this.handleInfoChange.bind(this)}/>
                </div>

              </div>

            <button className="btn btn-success btn-sm btn-group flex" data-toggle="collapse" data-target="#invoiceTable">Invoice History</button>

            <div id="invoiceHistory" >
              <p ref="noInvoiceHistoryRef" className="smallInfo">No invoice history</p>
              <table ref="invoiceTableRef" id="invoiceTable" className="collapse hide">
                <tr className="invoiceList">
                  <th id="thDate">Date</th>
                  <th id="thPrice">Price</th>
                  <th id="thPaid">Paid</th>
                  <th id="thCancel"></th>
                </tr>
                {Object.keys(this.state.invoices).map((invoice) => {
                  return (
                  <tr className="invoiceList" key={this.state.invoices.invoiceID}>
                    <td>{this.state.invoices[invoice].date}</td>
                    <td>${this.state.invoices[invoice].price}.00</td>
                    <td><input type='checkbox' checked={this.state.invoices[invoice].paid} name={invoice} onChange={this.handleInvoiceCheckboxChange.bind(this)}/></td>
                    <td><button onClick={() => this.deleteInvoice(this.state.invoices[invoice].invoiceID)}><i className="btn btn-danger btn-sm fa fa-times"></i></button></td>
                  </tr>
                )
                })}
              </table>
            </div>

        </div>



        <div className="contain row hide" id="totalText">
          <div id="textLeftPadding"></div>
          <div>
            <h3 className="accountThis">Messages <p className="btnNotification">{this.state.current.notificationCount}</p></h3>
            <div id="messagesArea">
              <div id="messages">
              {Object.keys(this.state.messages).map((text) => {
                return (
                  <div>
                    <p className="textWho">{this.state.messages[text].who}</p>
                    <p className="textWhat">{this.state.messages[text].what}</p>
                  </div>

                )
              })}
              </div>
              <div id="writeMessage">
                <textarea ref="writeArea" id="writeArea"></textarea>
                <button className="btn btn-success" id="btnSend" onClick={() => this.sendTextMessage()}>Send</button>
              </div>
            </div>
          </div>
        </div>




      </div>
    )
  }

  generatePDF(bottomHalf,iTmp,tmp) {

    if(tmp===0){tmp=1}
    var currentInvoice = this.state.invoiceNumber
    currentInvoice+=tmp

    var nowDate = new Date()
    nowDate = Number(nowDate.getMonth()+1)+"/"+nowDate.getDate()+"/"+nowDate.getFullYear()

    var tmpDate = this.state.invoiceDate

    if(tmpDate!==nowDate){
      currentInvoice = tmp
      this.setState({invoiceDate: nowDate})
      tmpDate = nowDate
    }

    this.setState({invoiceNumber: currentInvoice})

    firebase.database().ref('Settings').set({
      invoiceDate: tmpDate,
      invoiceNumber: currentInvoice
    })


    var thisR = iTmp
    var doc = new pdfDoc()
    doc.setFontSize(24)
    doc.text(33,20, 'Windobros')
    doc.text(166,20, 'Invoice')
    doc.setFontSize(10)
    doc.text(18,28, '46 E Point Drive Apt 1202, Draper, UT 84020')
    doc.text(40,34, '(801) 899-3930')

    doc.line(15,42,200,42)

    doc.setFontType('bold')
    doc.text(18,50,'Service Address:')
    doc.text(90,50,'Invoice Number')
    doc.text(150,50,'Bill To:')
    doc.text(100,65,'Service Date','right')
    doc.text(100,70,'ETA','right')

    doc.text(30,82,'Type')
    doc.text(78,82,'Description')
    doc.text(160,82,'Price')

    doc.text(130,115,'Total')
    doc.text(30,130,'Notes:')

    doc.line(15,75,200,75)

    doc.setFontType('normal')
    if(thisR.name!==undefined){doc.text(20,55,thisR.name)}
    if(thisR.address!==undefined){doc.text(20,60,thisR.address)}
    if(thisR.city!==undefined){doc.text(20,65,thisR.city + ", " + "UT")}
    if(thisR.number!==undefined){doc.text(20,70,thisR.number)}

    if(thisR.nextAppt!==undefined){
      var date = new Date(thisR.nextAppt)
      var year = date.getFullYear()
      var month = date.getMonth()
      var day = date.getDate()

      doc.text(103,65,String(month+1)+'/'+String(day+1)+'/'+String(year))
      if(day<10){day="0"+String(day+1)}
      if(month<10){month="0"+String(month+1)}
      year = String(year).substring(String(year).length-2)
      doc.text(103,55,String(year)+String(month)+String(day)+currentInvoice,'center')
      doc.setFontSize(14)
      doc.text(193,27,"#"+String(year)+String(month)+String(day)+currentInvoice,'right')
      doc.setFontSize(10)

      if(thisR.nextApptTime!==undefined){doc.text(103,70,thisR.nextApptTime)}
    }

    if(thisR.name!==undefined){doc.text(152,55,thisR.name)}
    if(thisR.address!==undefined){doc.text(152,60,thisR.address)}
    if(thisR.city!==undefined){doc.text(152,65,thisR.city + ", " + "UT")}

    var total = 0
    if(thisR.frequency!==undefined){doc.text(30,90,thisR.frequency)}
    if(thisR.oPriceToggle && thisR.oPrice!==undefined){
      doc.text(78,90,'Exterior')
      doc.text(176,90,"$"+thisR.oPrice+".00",'right')
      total += Number(thisR.oPrice)
    }
    if(thisR.iPriceToggle && thisR.iPrice!==undefined){
      doc.text(78,95,'Interior')
      doc.text(176,95,"$"+thisR.iPrice+".00",'right')
      total += Number(thisR.iPrice)
    }
    if(thisR.screenPriceToggle && thisR.screenPrice!==undefined){
      doc.text(78,100,'Screens')
      doc.text(176,100,"$"+thisR.screenPrice+".00",'right')
      total += Number(thisR.screenPrice)
  }


    doc.text(176,115,"$"+total+".00",'right')
    this.totalPrice = total

    doc.line(15,120,200,120)

    if(thisR.invoiceNotes!==undefined){
      var split = doc.splitTextToSize(thisR.invoiceNotes,135)
      doc.text(45,130,split)
    }

    doc.line(0,150,210,150)

    //BottomHalf

    if(bottomHalf==false){

      var bH = 108

      doc.setFontSize(10)
      doc.setFontType('bold')
      doc.text(18,50+bH,'Service Address:')
      doc.text(90,50+bH,'Invoice Number')
      doc.text(150,50+bH,'Bill To:')
      doc.text(100,65+bH,'Service Date','right')
      doc.text(100,70+bH,'ETA','right')

      doc.text(30,82+bH,'Type')
      doc.text(78,82+bH,'Description')
      doc.text(160,82+bH,'Price')

      doc.text(130,115+bH,'Total')
      doc.text(30,130+bH,'Notes:')

      doc.line(15,75+bH,200,75+bH)

      doc.setFontType('normal')
      if(thisR.name!==undefined){doc.text(20,55+bH,thisR.name)}
      if(thisR.address!==undefined){doc.text(20,60+bH,thisR.address)}
      if(thisR.city!==undefined){doc.text(20,65+bH,thisR.city + ", " + "UT")}
      if(thisR.number!==undefined){doc.text(20,70+bH,thisR.number)}

      if(thisR.nextAppt!==undefined){
        var date = new Date(thisR.nextAppt)
        var year = date.getFullYear()
        var month = date.getMonth()
        var day = date.getDate()

        doc.text(103,65+bH,String(month+1)+'/'+String(day+1)+'/'+String(year))
        if(day<10){day="0"+String(day+1)}
        if(month<10){month="0"+String(month+1)}
        year = String(year).substring(String(year).length-2)
        doc.text(103,55+bH,String(year)+String(month)+String(day)+currentInvoice,'center')

        if(thisR.nextApptTime!==undefined){doc.text(103,70+bH,thisR.nextApptTime)}
      }

      if(thisR.name!==undefined){doc.text(152,55+bH,thisR.name)}
      if(thisR.address!==undefined){doc.text(152,60+bH,thisR.address)}
      if(thisR.city!==undefined){doc.text(152,65+bH,thisR.city + ", " + "UT")}

      var total = 0
      if(thisR.frequency!==undefined){doc.text(30,90+bH,thisR.frequency)}
      if(thisR.oPriceToggle && thisR.oPrice!==undefined){
        doc.text(78,90+bH,'Exterior')
        doc.text(176,90+bH,"$"+thisR.oPrice+".00",'right')
        total += Number(thisR.oPrice)
      }
      if(thisR.iPriceToggle && thisR.iPrice!==undefined){
        doc.text(78,95+bH,'Interior')
        doc.text(176,95+bH,"$"+thisR.iPrice+".00",'right')
        total += Number(thisR.iPrice)
      }
      if(thisR.screenPriceToggle && thisR.screenPrice!==undefined){
        doc.text(78,100+bH,'Screens')
        doc.text(176,100+bH,"$"+thisR.screenPrice+".00",'right')
        total += Number(thisR.screenPrice)
    }


      doc.text(176,115+bH,"$"+total+".00",'right')

      doc.line(15,120+bH,200,120+bH)
      if(thisR.notes!==undefined){
        var split = doc.splitTextToSize(thisR.notes,135)
        doc.text(45,130+bH,split)
      }

      doc.setFontSize(10)
      doc.setFontType('bold')
      doc.text(30.5,155+bH,'Actual Time In','center')
      doc.line(46,148+bH,46,180+bH)
      doc.text(49,155+bH,'Time Out')
      doc.line(67,148+bH,67,180+bH)
      doc.text(101,155+bH,'On Site','center')
      doc.line(135,148+bH,135,180+bH)
      doc.text(140,155+bH,'Referred By')
      doc.line(165,148+bH,165,180+bH)
      doc.text(182.5,155+bH,'Panes','center')
      if(thisR.panes!==undefined){doc.text(182.5,170+bH,thisR.panes,'center')}

      doc.line(15,160+bH,200,160+bH)

      doc.rect(15,148+bH,185,32)
    }





    doc.save('Invoice - '+thisR.name+'.pdf')


  }




}

/*
  name
  number
  address
  city
  frequency
  lastAppt
  nextAppt
  nextApptTime
  oPrice
  iPrice
  screenPrice
  Panes
  notes
  invoiceNotes


*/
