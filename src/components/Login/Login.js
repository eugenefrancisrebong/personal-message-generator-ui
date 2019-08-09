import React from 'react';
import './Login.css'
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,DialogActions,DialogContent,DialogContentText } from '@material-ui/core';
import dotenv from 'dotenv';
import axios from 'axios';
import { withRouter } from "react-router-dom";
import { throws } from 'assert';

dotenv.config();

class Login extends React.Component {
  state = {
      username:'',
      password:'',
      open:false,
      dialogView:'loginFailed',
      emailAddress:'',
      keyValue:'',
      password:'',
      repeatPassword:'',
      resetPassword:''
  };
  
  componentWillMount() {
    if(this.props.isLoggedIn) {
      this.props.history.push('/home');
    }
  }

  handleChange=  (e) => {
    const value = e.target.value;
    switch(e.target.id) {
        case 'username':
            this.setState({username:value})
            break;
        case 'password':
            this.setState({password:value})
            break;
        default:
             break;
    }
  }

  setPassword=(e)=>{
    this.setState({password:e.target.value})
  }

  setRepeatPassword=(e)=>{
    this.setState({repeatPassword:e.target.value})
  }

  setResetPassword=(e)=>{
    this.setState({resetPassword:e.target.value})
  }

  handleLogin= (e) => {
    axios.post(`${process.env.REACT_APP_API_URL}login`,{username:this.state.username,password:this.state.password})
    .then((response)=>{
      if(response.data) {
        if(!response.data.code) {
          this.props.SetLoginData(response.data);
          this.props.history.push('/home')
        } else {
          this.setState({dialogView:'loginFailed'})
          this.setState({open:true})
        }
      } else {
        this.setState({dialogView:'loginFailed'})
        this.setState({open:true})
      }
    })
    .catch(function(error){
        console.log(error)
    }) 
  }

  handleForgotPassword=(e)=>{
    this.setState({dialogView:'resetPasswordInit'})
    this.handleOpen()
  }

  handleClose=(e) => {
    this.setState({open:false})
  }

  handleOpen=(e)=> {
    this.setState({open:true})
  }

  setEmailAddress=(e)=>{
    this.setState({emailAddress:e.target.value})
  }

  setKeyValue=(e)=>{
    this.setState({keyValue:e.target.value})
  }

  requestResetCode=(e)=>{
    axios.post(`${process.env.REACT_APP_API_URL}users/forgot-password/`,{email:this.state.emailAddress})
    .then((response)=>{
      if(response) {
        if(response.data.success===true){
          this.setState({dialogView:'resetPasswordCodeInput'})
        } else {
          alert('Email Not Found. Check your Email')
        }
      } else {
        this.handleClose();
      }
    })
    .catch(function(error){
        console.log(error)
    }) 
  }

  verifyResetCode=(e)=>{
    axios.post(`${process.env.REACT_APP_API_URL}users/forgot-password/verify`,{email:this.state.emailAddress,key:this.state.keyValue})
    .then((response)=>{
      if(response) {
        if(response.data[0].Valid===1) {
          this.setState({dialogView:'resetPassword'})
        } else {
          alert('Invalid Reset Code')
        }
      } else {
        alert('Invalid Reset Code')
        // this.handleClose();
      }
    })
    .catch(function(error){
        console.log(error)
    }) 
  }

  ResetPassword=(e)=>{
    if(this.state.password === this.state.repeatPassword) {
      axios.post(`${process.env.REACT_APP_API_URL}users/reset-password/`,{email:this.state.emailAddress,key:this.state.keyValue,password:this.state.password})
      .then((response)=>{
        if(response) {
          console.log(response);
          if(response.data[0][0].success===1) {
            alert('Password Changed')
            this.handleClose();
          } else {
            alert('Password Reset Session Expired')
          }
        } else {
          alert('Password Reset Failed')
          // this.handleClose();
        }
      })
      .catch(function(error){
          console.log(error)
          alert('Password Reset Failed')
      }) 
    } else {
      alert ('Password must be same as Repeat Password')
    }
  }

  renderLoginFailed = () => {
    return (<>
      <DialogTitle id="alert-dialog-title">{"Login Failed"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Did you forget your password? Check with your administrator!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose} color="primary" autoFocus>
          Ok
        </Button>
      </DialogActions>
    </>)
  }

  renderResetPasswordInit = () => {
    return (<>
      <DialogTitle id="alert-dialog-title">{"Reset Password"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Enter your Email Address used in your account
          <div>
            <TextField
              variant="outlined"
              value={this.state.emailAddress}
              onChange={this.setEmailAddress}
              style={{width:'100%'}}
            />
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.requestResetCode} color="primary" autoFocus>
          Next
        </Button>
      </DialogActions>
    </>)
  }

  renderResetPasswordCodeInput = () => {
    return (<>
      <DialogTitle id="alert-dialog-title">{"Reset Password"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Enter the Code you received in the email {this.state.emailAddress}
          <div>
            <TextField
                variant="outlined"
                value={this.state.keyValue}
                onChange={this.setKeyValue}
                style={{width:'100%'}}
            />
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.verifyResetCode} color="primary" autoFocus>
          Next
        </Button>
      </DialogActions>
    </>)
  }

  renderResetPassword = () => {
    return (<>
      <DialogTitle id="alert-dialog-title">{"Reset Password"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Enter your New Password
          <br/>
          <div>
            <TextField
                type="password"
                label="Password"
                variant="outlined"
                value={this.state.password}
                onChange={this.setPassword}
                style={{width:'100%'}}
            />
          </div>
          <br/>
          <div>
            <TextField
                type="password"
                label="Repeat Password"
                variant="outlined"
                value={this.state.repeatPassword}
                onChange={this.setRepeatPassword}
                style={{width:'100%'}}
            />
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.ResetPassword} color="primary" autoFocus>
          Next
        </Button>
      </DialogActions>
    </>)
  }

  render = () => {
    return (
        <Container>
          <Grid className="center-form-container" container spacing={3}>
            <Grid item xs={4}>
              <Box className="center-form-content" >
                <Card className="form-card">
                  <h1>Login</h1>
                  <TextField
                    id="username"
                    label="Username"
                    type="text"
                    name="Username"
                    autoComplete="Username"
                    margin="normal"
                    variant="outlined"
                    value={this.username}
                    fullWidth
                    onChange={this.handleChange}
                  />
                  <TextField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                    value={this.password}
                    fullWidth
                    onChange={this.handleChange}
                  />
                  <CardActions className="form-actions">
                    <Button variant="contained" color="primary" onClick={this.handleLogin}>Login</Button>
                    <Button variant="contained" color="primary" onClick={this.handleForgotPassword}>Forgot Password</Button>
                  </CardActions>
                </Card>
              </Box>
            </Grid>
          </Grid>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
              {this.state.dialogView === 'loginFailed' && <this.renderLoginFailed></this.renderLoginFailed>}
              {this.state.dialogView === 'resetPasswordInit' && <this.renderResetPasswordInit></this.renderResetPasswordInit>}
              {this.state.dialogView === 'resetPasswordCodeInput' && <this.renderResetPasswordCodeInput></this.renderResetPasswordCodeInput>}
              {this.state.dialogView === 'resetPassword' && <this.renderResetPassword></this.renderResetPassword>}
          </Dialog>
        </Container>);
  }
}

export default withRouter(Login);