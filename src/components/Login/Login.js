import React from 'react';
import './Login.css'
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,DialogActions,DialogContent,DialogContentText } from '@material-ui/core';
import dotenv from 'dotenv';
import axios from 'axios';
import { withRouter } from "react-router-dom";

dotenv.config();

class Login extends React.Component {
  state = {
      username:'',
      password:'',
      open:false,
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

  handleLogin= (e) => {
    axios.post(`${process.env.REACT_APP_API_URL}login`,{username:this.state.username,password:this.state.password})
    .then((response)=>{
      if(response.data) {
        this.props.SetLoginData(response.data);
        this.props.history.push('/home')
      } else {
        this.setState({open:true})
      }
    })
    .catch(function(error){
        console.log(error)
    }) 
  }

  handleClose=(e) => {
    this.setState({open:false})
  }

  handleOpen=(e)=> {
    this.setState({open:true})
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
          </Dialog>
        </Container>);
  }
}

export default withRouter(Login);