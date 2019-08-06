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

class Messages extends React.Component {
  state = {
      messageGroups:[],
      currentContent:'',
      currentData:[],
      currentDone:[],
      currentHeaders:[],
      currentSelectedData:1,
      encoding:'normal'
  };


  componentWillMount() {
    if(!this.props.isLoggedIn) {
      this.props.history.push('/login')
    }
    console.log('mounting')
  }

  componentDidMount() {
      axios.get(`${process.env.REACT_APP_API_URL}messages/groups`)
      .then((res)=>{
          this.setState({messageGroups:res.data})
      })
  }

  updateCurrentMessageGroupData= (id)=>{
    axios.get(`${process.env.REACT_APP_API_URL}messages/get/${id}`)
    .then((res)=>{
        const {Content,Data,SentData} = res.data[0];
        let DataArray = unescape(Data).split("\n");
        const Headers = DataArray.shift();
        this.setState({currentContent:unescape(Content),currentData:DataArray,currentDone:unescape(SentData),currentHeaders:Headers.split(',')})
    })
  }

  deleteCurrentMessageGroup=(id)=>{
      axios.get(`${process.env.REACT_APP_API_URL}messages/delete/${id}`)
      .then((res)=>{
          console.log(res);
        })
        .catch((e)=>{console.log(e)})
        const lists = this.state.messageGroups.filter(x => {
        return x.ID !== id;
        })
        this.setState({messageGroups:lists})
  }

    handleBack=()=>{
        this.props.history.push('/home')
    }
    handleNextPreview=()=>{
        if(this.state.currentSelectedData>0 && this.state.currentSelectedData!==this.state.currentData.length+1) {
            this.setState({currentSelectedData:this.state.currentSelectedData+1})
        }
    }
  
    handlePreviousPreview=()=>{
      if(this.state.currentSelectedData>1 && this.state.currentSelectedData!==this.state.currentData.length+1) {
          this.setState({currentSelectedData:this.state.currentSelectedData-1})
      }
    }

    
  convertShortCodes=()=>{
    if(this.state.currentDefinition!==0) {
        const currentRecord = this.state.definitions[this.state.currentDefinition-1];
        let data = this.state.preview;
        this.state.columns.forEach((column,index)=>{
            var re = new RegExp("\\["+column+"\\]", 'g');
            data = data.replace(re,currentRecord[column]);
        })
        if(this.state.encoding==='whatsapp') {
            const bold_start = new RegExp("<strong>",'g')
            const bold_end = new RegExp("</strong>",'g')
            const italicized_start = new RegExp("<em>",'g')
            const italicized_end = new RegExp("</em>",'g')
            const strikethrough_start = new RegExp("<s>",'g')
            const strikethrough_end = new RegExp("</s>",'g')
            data=data.replace(bold_start,'<strong>*')
                .replace(bold_end,'*</strong>')
                .replace(italicized_start,'<em>_')
                .replace(italicized_end,'_</em>')
                .replace(strikethrough_start,'<s>~')
                .replace(strikethrough_end,'~</s>')
        }
        return data;
    } else {
        return '';
    }
  }
  
    setEncodingNormal= () => {
        this.setState({encoding:'normal'})
    }

    setEncodingWhatsApp=()=>{
        this.setState({encoding:'whatsapp'})
    }


    copyToClipboard = () => {
        const containerid="copyToClipboard";
        if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(document.getElementById(containerid));
            range.select().createTextRange();
            document.execCommand("copy");
          } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(document.getElementById(containerid));
            window.getSelection().removeAllRanges()
            window.getSelection().addRange(range);
            document.execCommand("copy");
          }
    }
    setCurrentSelectedData=(e) =>{
        console.log(e.target.value);
        console.log(e.target.value<this.state.currentData.length && e.target.value>0);
        if(e.target.value<=this.state.currentData.length && e.target.value>=0) {
            if(e.target.value==0) {
                this.setState({currentSelectedData:1})
            } else {
                this.setState({currentSelectedData:e.target.value})
            }
        }
    }

  render = () => {
    let content = unescape(this.state.currentContent);    
    const currentValues =this.state.currentData[this.state.currentSelectedData-1];
    this.state.currentHeaders.forEach((val,key)=>{
        var re = new RegExp("\\["+val+"\\]", 'g');
        content=content.replace(re,currentValues.split(',')[key]);
    })
    
    if(this.state.encoding==='whatsapp') {
        const bold_start = new RegExp("<strong>",'g')
        const bold_end = new RegExp("</strong>",'g')
        const italicized_start = new RegExp("<em>",'g')
        const italicized_end = new RegExp("</em>",'g')
        const strikethrough_start = new RegExp("<s>",'g')
        const strikethrough_end = new RegExp("</s>",'g')
        content=content.replace(bold_start,'<strong>*')
            .replace(bold_end,'*</strong>')
            .replace(italicized_start,'<em>_')
            .replace(italicized_end,'_</em>')
            .replace(strikethrough_start,'<s>~')
            .replace(strikethrough_end,'~</s>')
    }
    // let values = this.state.currentData[this.state.currentSelectedData];
    // if(values.length) {
    //     values=values.split(',')
    //     this.state.currentHeaders.forEach((column,index)=>{
    //         var re = new RegExp("\\["+column+"\\]", 'g');
    //         content = content.replace(re,values[column]);
    //     })
    // }


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
                        <h1>Message Groups</h1>                    
                        <List component="nav">
                            {
                                this.state.messageGroups.map((messageGroup)=>{
                                    console.log(unescape(messageGroup.Title))
                                    return(
                                        <ListItem
                                        button
                                        key={messageGroup.ID}
                                        onClick={()=>{this.updateCurrentMessageGroupData(messageGroup.ID)}}
                                        >
                                        <ListItemIcon>
                                            <InboxIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={unescape(messageGroup.Title)} />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" aria-label="delete" onClick={()=>{this.deleteCurrentMessageGroup(messageGroup.ID)}}>
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
                        <h1>Messages</h1>                    
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <div id="copyToClipboard" className={'ql-editor'} dangerouslySetInnerHTML={{__html:content}}>
                                </div>
                                <div>
                                    <Button onClick={this.handlePreviousPreview}><NavigateBefore/></Button>
                                    <TextField
                                        value={this.state.currentSelectedData}
                                        margin="normal"
                                        style={{width:40,margin:0}}
                                        onChange={this.setCurrentSelectedData}
                                    />/{this.state.currentData.length}
                                    {/* <Button disabled>{this.state.currentSelectedData}/</Button> */}
                                    <Button onClick={this.handleNextPreview}><NavigateNext/></Button>
                                    <Button onClick={this.copyToClipboard}>Copy to Clipboard</Button>
                                    <ButtonGroup size="small" aria-label="small outlined button group">
                                        <Button onClick={this.setEncodingNormal}>Normal</Button>
                                        <Button onClick={this.setEncodingWhatsApp}>WhatsApp</Button>
                                    </ButtonGroup>
                                </div>
                                <div>
                                </div>
                            </Grid>
                        </Grid>
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