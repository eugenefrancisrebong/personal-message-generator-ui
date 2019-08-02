import React from 'react';
import './App.css';
import RootComponent from './components/RootComponent/RootComponent.js'
import Login from './components/Login/Login.js'
import MainMenu from './components/MainMenu/MainMenu.js'
import Users from './components/Users/Users.js'
import Generate from './components/Generate/Generate.js'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { CookiesProvider } from 'react-cookie';
import { withCookies,Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';


class App extends React.Component {
  
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies } = props;

    this.state = {
      isLoggedIn:cookies.get('isLoggedIn')==="true" ? true : false,
      userData: cookies.get('userData') || {}
    };
  }

  verifyLoggedIn=()=>{
    return this.state.isLoggedIn;
  }

  SetLoginData=(data)=>{
    const { cookies } = this.props;
 
    cookies.set('isLoggedIn', true, { path: '/' });
    cookies.set('userData', data, { path: '/' });

    this.setState({isLoggedIn:true,userData:data})
  }

  HandleLogOut=()=>{
    const { cookies } = this.props;
    console.log('wow',cookies)

    cookies.set('isLoggedIn', false, { path: '/' });
    cookies.set('userData', {}, { path: '/' });

    this.setState({isLoggedIn:false,userData:{}})
  }
  
  RootComponent = ()=>{
    return (<RootComponent isLoggedIn={this.state.isLoggedIn} userData={this.state.userData}></RootComponent>)
  }
  
  LoginComponent = ()=>{
    return (<Login isLoggedIn={this.state.isLoggedIn} SetLoginData={this.SetLoginData}></Login>)
  }
  
  MainMenuComponent = ()=>{
    return (<MainMenu isLoggedIn={this.state.isLoggedIn} HandleLogOut={this.HandleLogOut} userData={this.state.userData}></MainMenu>)
  }
  
  UsersComponent = ()=>{
    return (<Users isLoggedIn={this.state.isLoggedIn} userData={this.state.userData}></Users>)
  }
  
  GenerateComponent = ()=>{
    return (<Generate isLoggedIn={this.state.isLoggedIn} userData={this.state.userData}></Generate>)
  }

  render = () => {
    
    return (<CookiesProvider>
      <Router>
        <Route path="/" component={this.RootComponent}></Route>
        <Route path="/login" component={this.LoginComponent}></Route>
        <Route path="/home" component={this.MainMenuComponent}></Route>
        <Route path="/users" component={this.UsersComponent}></Route>
        <Route path="/generate" component={this.GenerateComponent}></Route>
      </Router>
      </CookiesProvider>
    );
  }
}

export default withCookies(App);