import React from 'react';
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,
    DialogActions,DialogContent,DialogContentText,Fab, CardContent,CardHeader,ListItemSecondaryAction,
    ButtonGroup,List,ListItem,ListItemIcon,ListItemText,IconButton } from '@material-ui/core';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import InboxIcon from '@material-ui/icons/Inbox';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import { withRouter } from "react-router-dom";

class RootComponent extends React.Component {
  state = {
      templates:[],
      currentTemplate:{},
  };

  componentWillMount() {
      if(!this.props.isLoggedIn) {
        this.props.history.push('/login')
    }
  }

  componentDidMount(){
      axios.get(`${process.env.REACT_APP_API_URL}templates/search`)
      .then((res)=>{
          this.setState({templates:res.data})
      })
  }

  selectCurrentTemplate=(id)=>{
    this.setState({currentTemplate:this.state.templates.filter(x => {
        return x.ID === id;
        })[0]})
  }

  deleteCurrentTemplate=(id)=>{
    axios.post(`${process.env.REACT_APP_API_URL}templates/delete/${id}`,{commitby:this.props.userData.ID})
    .then((res)=>{
        const lists = this.state.templates.filter(x => {
        return x.ID !== id;
        })
        this.setState({templates:lists})
    })
    
  }
  handleBack=()=>{
      this.props.history.push('/home')
  }


  render = () => {
      const content = ''
    return (<Container>
        <Fab size="small" color="primary" aria-label="back" onClick={this.handleBack}>
            <KeyboardArrowLeft/>
        </Fab>
        <br/>
        <br/>
        <br/>
        <Grid container spacing={3}>
            <Grid item xs={4}>
                <Card>
                    <CardContent>
                        <h1>Templates</h1>                    
                        <List component="nav">
                            {
                                this.state.templates &&
                                this.state.templates.map((template)=>{
                                    console.log(unescape(template.Title))
                                    return(
                                        <ListItem
                                        button
                                        key={template.ID}
                                        onClick={()=>{this.selectCurrentTemplate(template.ID)}}
                                        >
                                        <ListItemIcon>
                                            <InboxIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={unescape(template.Title)} />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" aria-label="delete" onClick={()=>{this.deleteCurrentTemplate(template.ID)}}>
                                            <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                })
                            }
                        </List>
                    </CardContent>
                    <CardActions>
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={8}>
                <Card>
                    <CardContent>
                        <h1>Raw Template View</h1>            
                        <div dangerouslySetInnerHTML={{__html:unescape(this.state.currentTemplate.Content || '')}}>
                            
                        </div>
                    </CardContent>
                    <CardActions>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
    </Container>);
  }
}

export default withRouter(RootComponent);