import React from 'react';

export default class SearchAccounts extends React.Component {

constructor(props) {
  super(props)
  this.state = {
    email: '',
    password: ''
  }


}

handleChange(e) {
  this.setState({
    [e.target.name]: e.target.value
  })
}



submitLogin() {
  var email = this.state.email
  var password = this.state.password
  this.props.updateTheLog(email,password)
}



render() {


  return(
    <div>
      <div>
        <h1 id='centerIt' className='btn-primary bg-primary'>Windobros Account Manager</h1>
      </div>
      <div>
        <input id='emailLogin' type='text' placeholder='Email' name='email' onChange={this.handleChange.bind(this)} value={this.state.email} />
        <input id='passwordLogin' type='password' placeholder="Password" name='password' onChange={this.handleChange.bind(this)} value={this.state.password} />
        <button className='btn btn-primary' id='btnLogin' onClick={() => this.submitLogin()}>Login</button>
      </div>
    </div>
  )



}





}
