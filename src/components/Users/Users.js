import React from 'react';
import { withRouter } from "react-router-dom";
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,DialogActions,DialogContent,DialogContentText,Fab } from '@material-ui/core';
import MaterialTable from 'material-table';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import axios from 'axios';

class Users extends React.Component {
    state = {    
        columns: [
            { title: 'Username', field: 'Username' },
            { title: 'Password', render: (rowData)=>{
                if(rowData) {
                    const ID = rowData.ID
                    const handleClick = () => {
                        // axios.post(`${process.env.REACT_APP_API_URL}/users/update/password/${ID}`)
                        this.setState({updatingPassword:ID,updatingPasswordUser:rowData.Username})
                        this.handleOpen();
                    }
                    return(<Button onClick={handleClick}>Change Password</Button>)
                } else {
                    return(<></>)
                }
            }},
            { title: 'FirstName', field: 'Firstname' },
            { title: 'LastName', field: 'Lastname' },
            { title: 'Designation', field: 'Designation' },
            { title: 'PermissionLevel', field: 'PermissionLevel' }
        ],
        data:[],
        updatingPassword:0,
        updatingPasswordUser:'',
        open:false,
        password:'',
        confirmpassword:''
    };

    componentWillMount() {
        if(!this.props.isLoggedIn) {
            this.props.history.push('/login')
        } 
        axios.get(`${process.env.REACT_APP_API_URL}users`)
        .then((response)=>{
            this.setState({data:response.data})
            return true;
        })
        .catch(function(err){
            return err
        })
    }

    handleBack=()=>{
        this.props.history.push('/home')
    }
    
    handleClose=(e) => {
        this.setState({open:false})
    }

    handleOpen=(e)=> {
        this.setState({open:true})
    }

    handleChange=(e)=>{
        switch(e.target.id) {
            case 'password':
                    this.setState({password:e.target.value})
                break;
            case 'confirmpassword':
                    this.setState({confirmpassword:e.target.value})
                break;
            default:
                break;
        }
    }

    handleChangePassword= async (e)=>{
        if(this.state.password===this.state.confirmpassword && this.state.password.trim()!=="") {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}users/update/password/${this.state.updatingPassword}`,{password:this.state.password,commitby:this.props.userData.ID});
            if(response.data.err) {
                alert ('An error has occured')
            } else {
                this.handleClose();
            }
        } else {
            alert('Password does not match!');
        }
    }


  render = () => {
    return (
        <Container>
          <Grid className="" container spacing={3}>
            <Grid item xs={1}>
                <Fab size="small" color="primary" aria-label="back" onClick={this.handleBack}>
                    <KeyboardArrowLeft/>
                </Fab>
            </Grid>
            <Grid item xs={12}>
              <Box className="" >
                <Card className="form-card">
                <MaterialTable
                title="Users"
                columns={this.state.columns}
                data={this.state.data}
                editable={{
                    onRowAdd: async (newData) => {
                        const {Username,Firstname,Lastname,Designation,PermissionLevel} = newData;
                        const payload = {username:Username,password:Math.random().toString(36).substring(8),firstname:Firstname,lastname:Lastname,designation:Designation,permissionlevel:PermissionLevel,commitby:this.props.userData.ID}
                        const response = await axios.post(`${process.env.REACT_APP_API_URL}users/register`,payload)
                        if(response.data.error) {
                            switch(response.data.err.code) {
                                case 'ER_DUP_ENTRY':
                                        alert('Username Already Exists');
                                    break;
                                default:
                                        alert('An Error Occured ['+response.data.err.code+']');
                                    break;
                            }
                        } else {
                            console.log(response.data);
                            let data = [...this.state.data];
                            data.push(newData);
                            this.setState({...this.state,data});
                        }
                    },
                    onRowUpdate:  async (newData,oldData) => {
                        const {ID} = oldData;
                        const {Username,Firstname,Lastname,Designation,PermissionLevel} = newData;
                        const payload = {username:Username,firstname:Firstname,lastname:Lastname,designation:Designation,permissionlevel:PermissionLevel,commitby:this.props.userData.id};
                        const response = await axios.post(`${process.env.REACT_APP_API_URL}users/update/${ID}`,payload)
                        if(response.data.error) {
                            switch(response.data.err.code) {
                                case 'ER_DUP_ENTRY':
                                        alert('Username Already Exists');
                                    break;
                                default:
                                        alert('An Error Occured ['+response.data.err.code+']');
                                    break;
                            }
                        } else {                            
                            const data = [...this.state.data];
                            data[data.indexOf(oldData)] = newData;
                            this.setState({ ...this.state, data });
                        }
                    },
                    onRowDelete:  async (oldData) => {
                        const {ID} = oldData;
                        const response = await axios.delete(`${process.env.REACT_APP_API_URL}users/${ID}`)
                        if(response.data.error) {
                            switch(response.data.err.code) {
                                case 'ER_DUP_ENTRY':
                                        alert('Username Already Exists');
                                    break;
                                default:
                                        alert('An Error Occured ['+response.data.err.code+']');
                                    break;
                            }
                        } else {
                            const data = [...this.state.data];
                            data.splice(data.indexOf(oldData), 1);
                            this.setState({ ...this.state, data });
                        }
                    }
                }}
                />
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
            <DialogTitle id="alert-dialog-title">{"Change Password"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Changing Password of: {this.state.updatingPasswordUser}
                
                <TextField
                    id="password"
                    label="New Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                    value={this.state.password}
                    fullWidth
                    onChange={this.handleChange}
                  />
                  <TextField
                    id="confirmpassword"
                    label="Confirm New Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                    value={this.state.confirmpassword}
                    fullWidth
                    onChange={this.handleChange}
                  />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary" autoFocus>
                Cancel
              </Button>
              <Button onClick={this.handleChangePassword} color="primary" autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Container>);
  }
}

export default withRouter(Users);