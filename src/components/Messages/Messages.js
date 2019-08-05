import React from 'react';
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,
    DialogActions,DialogContent,DialogContentText,Fab, CardContent,CardHeader,
    ButtonGroup,List,ListItem,ListItemIcon,ListItemText} from '@material-ui/core';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { withRouter } from "react-router-dom";

class Messages extends React.Component {
  state = {
  };


  componentWillMount() {
    if(!this.props.isLoggedIn) {
      this.props.history.push('/login')
    }
  }

handleBack=()=>{
    this.props.history.push('/home')
}

  render = () => {
    return (<Container>
        <Fab size="small" color="primary" aria-label="back" onClick={this.handleBack}>
            <KeyboardArrowLeft/>
        </Fab>
        <br/>
        <br/>
        <br/>
        <Grid container spacing={3}>
            <Grid item xs={2}>
                <Card>
                    <CardContent>
                        <h1>Message Groups</h1>                    
                    </CardContent>
                    <CardActions>
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={10}>
                <Card>
                    <CardContent>
                        <h1>Messages</h1>                    
                    </CardContent>
                    <CardActions>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
    </Container>);
  }
}

export default withRouter(Messages);