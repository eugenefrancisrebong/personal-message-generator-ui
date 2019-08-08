import React from 'react';
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,
    DialogActions,DialogContent,DialogContentText,Fab, CardContent,CardHeader,ListItemSecondaryAction,Collapse,
    ButtonGroup,List,ListItem,ListItemIcon,ListItemText,IconButton } from '@material-ui/core';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import InboxIcon from '@material-ui/icons/Inbox';
import EditIcon from '@material-ui/icons/Edit';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import { withRouter } from "react-router-dom";

class RootComponent extends React.Component {
  state = {
      templateGroups:[],
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
    axios.get(`${process.env.REACT_APP_API_URL}templates/groups`)
    .then((res)=>{
        this.setState({templateGroups:res.data})
    })
  }

  selectCurrentTemplate=(id)=>{
    this.setState({currentTemplate:this.state.templates.filter(x => {
        return x.ID === id;
        })[0]})
  }

  editCurrentTemplate=(id)=>{
    this.props.history.push(`/generate/template/${id}`)
  }

  deleteCurrentTemplate=(id)=>{
    axios.post(`${process.env.REACT_APP_API_URL}templates/delete/${id}`,{commitby:this.props.userData.ID})
    .then((res)=>{
        const lists = this.state.templates.filter(x => {
        return x.ID !== id;
        })
        this.setState({templates:lists,currentTemplate:{}})
    })
    
  }
  handleBack=()=>{
      this.props.history.push('/home')
  }


  render = () => {
      const content = ''
      const {templates,templateGroups} = this.state
      console.log(templates,templateGroups)
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
                            { this.state.templateGroups.map((templateGroup)=>{
                                const templates = this.state.templates.filter((template)=>{
                                    return (template.GroupID===templateGroup.ID)
                                })
                                const hasChildren = templates.length>0 ? true:false;
                                console.log(templates)
                                return(<>
                                    <List component="nav">
                                    <ListItem button onClick={this.handleClick}>
                                      <ListItemIcon>
                                        <InboxIcon />
                                      </ListItemIcon>
                                      <ListItemText primary={unescape(templateGroup.Title)} />
                                      {hasChildren && (true ? <ExpandLess /> : <ExpandMore />)}
                                    </ListItem>
                                    {hasChildren && 
                                    <Collapse in={true} timeout="auto" className='nested' unmountOnExit>
                                      <List component="div" disablePadding>
                                          {templates.map((template)=>{
                                              return(<ListItem button
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
                                                    </ListItem>)
                                          })}
                                      </List>
                                    </Collapse>
                                    }
                                  </List>
                                </>)
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
                        <h1>{this.state.currentTemplate.Title} </h1>            
                        {this.state.currentTemplate.Title && <IconButton edge="end" aria-label="delete" onClick={()=>{this.editCurrentTemplate(this.state.currentTemplate.ID)}}>
                            <EditIcon />Edit
                        </IconButton>}
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