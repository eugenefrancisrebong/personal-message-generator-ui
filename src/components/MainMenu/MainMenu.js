import React from 'react';
import './MainMenu.css'
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,DialogActions,DialogContent,DialogContentText,Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DescriptionIcon from '@material-ui/icons/Description';
import MessageIcon from '@material-ui/icons/Message';
import SAIcon from '@material-ui/icons/SupervisorAccount';
import OffIcon from '@material-ui/icons/PowerSettingsNew';
import dotenv from 'dotenv';
import { withRouter } from "react-router-dom";

dotenv.config();

class MainMenu extends React.Component {
  state = {
  };

  componentWillMount() {
    if(!this.props.isLoggedIn) {
      this.props.history.push('/login')
    }
    }

    handleLogOut=()=>{
        this.props.HandleLogOut();
        this.props.history.push('/login')
    }

    handleGotoUsers=()=>{
        this.props.history.push('/users')
        localStorage.setItem('path','/users');
    }

  render = () => {
    return (
        <Container>
          <Grid className="center-form-container" container spacing={3}>
            <Grid item xs={4}>
              <Box className="center-form-content" >
                <Card className="form-card">
                    <Button fullWidth size="large" variant="outlined"><AddIcon /> Generate</Button>
                    <Button fullWidth size="large" variant="outlined"><DescriptionIcon /> Templates</Button>
                    <Button fullWidth size="large" variant="outlined"><MessageIcon /> Messages</Button>
                    {this.props.userData.PermissionLevel>=1 && <Button fullWidth size="large" variant="outlined" onClick={this.handleGotoUsers}><SAIcon /> Users</Button>}
                    <Button fullWidth size="large" variant="outlined" onClick={this.handleLogOut}><OffIcon /> Log Out</Button>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>);
  }
}

export default withRouter(MainMenu);