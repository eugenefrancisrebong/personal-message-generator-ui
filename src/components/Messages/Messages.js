import React from 'react';
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,
    DialogActions,DialogContent,DialogContentText,Fab, CardContent,CardHeader,ListItemSecondaryAction,Collapse,
    ButtonGroup,List,ListItem,ListItemIcon,ListItemText,IconButton } from '@material-ui/core';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import InboxIcon from '@material-ui/icons/Inbox';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import { withRouter } from "react-router-dom";

class Messages extends React.Component {
  state = {
      messageGroups:[],
      messages:[],
      currentContent:'',
      currentData:[],
      processedData:[],
      currentDone:[],
      currentHeaders:[],
      currentSelectedData:1,
      encoding:'normal',
      drawerStatus:{},
      currentMessageCollection:null,
      hideSent:true,
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
            let drawerStatus={}
            res.data.forEach((data)=>{
                drawerStatus[data.Title]=false;
            })
            this.setState({messageGroups:res.data,drawerStatus})
        })
        axios.get(`${process.env.REACT_APP_API_URL}messages/get/`)
        .then((res)=>{
            this.setState({messages:res.data})
        })
  }

  updateCurrentMessageGroupData= (id)=>{
        axios.get(`${process.env.REACT_APP_API_URL}messages/get/${id}`)
        .then((res)=>{
            if(res.data[0]) {
                const {Content,Data,SentData,Title} = res.data[0];
                let DataArray = unescape(Data).split("\n");
                const Headers = DataArray.shift();
                this.setState({currentMessageCollection:id,currentTitle:unescape(Title),currentContent:unescape(Content),currentData:DataArray,currentDone:JSON.parse(unescape(SentData)),currentHeaders:Headers.split(','),currentSelectedData:1})
                if(this.state.hideSent) {
                    let selectedData = this.state.currentSelectedData;
                    while(this.state.currentDone.includes(selectedData)) {
                        selectedData++
                    }
                    this.setState({currentSelectedData:selectedData})
                }
            }
        })
  }

  deleteCurrentMessageGroup=(id)=>{
      axios.get(`${process.env.REACT_APP_API_URL}messages/delete/${id}`)
      .then((res)=>{
          console.log(res);
        })
        .catch((e)=>{console.log(e)})
        const lists = this.state.messages.filter(x => {
        return x.ID !== id;
        })
        this.setState({messages:lists})
  }

    handleBack=()=>{
        this.props.history.push('/home')
    }
    handleNextPreview=()=>{
        if(this.state.currentSelectedData>0 && this.state.currentSelectedData!==this.state.currentData.length+1) {
            if(this.state.hideSent) {
                let newSelectedData = this.state.currentSelectedData+1;
                while(this.state.currentDone.includes(newSelectedData)) {
                    newSelectedData++
                }
                if(newSelectedData<this.state.currentData.length) {
                    this.setState({currentSelectedData:newSelectedData})
                }
            } else {
                this.setState({currentSelectedData:this.state.currentSelectedData+1})
            }
        }
    }
  
    handlePreviousPreview=()=>{
      if(this.state.currentSelectedData>1 && this.state.currentSelectedData!==this.state.currentData.length+1) {
        if(this.state.hideSent) {
            let newSelectedData = this.state.currentSelectedData-1;
            while(this.state.currentDone.includes(newSelectedData)) {
                newSelectedData--
            }
            if(!newSelectedData<1) {
                this.setState({currentSelectedData:newSelectedData})
            }
        } else {
            this.setState({currentSelectedData:this.state.currentSelectedData-1})
        }
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
        if(e.target.value<=this.state.currentData.length && e.target.value>=0) {
            if(e.target.value==0) {
                this.setState({currentSelectedData:1})
            } else {
                this.setState({currentSelectedData:e.target.value})
            }
        }
    }
    
    toggleSent=()=>{
        if(this.state.currentMessageCollection) {
            let values = this.state.currentDone;
            if(!values.includes(this.state.currentSelectedData)) {
                values.push(this.state.currentSelectedData);
            } else {
                values=values.filter(value=>value!==this.state.currentSelectedData)
            }
            this.setState({currentDone:values});
            const sentData = escape(JSON.stringify(values));
            axios.post(`${process.env.REACT_APP_API_URL}messages/sentstatus/${this.state.currentMessageCollection}`,{SentData:sentData,commitby:this.props.userData.ID})
            .then((response)=>{
              if(response.data) {
                    this.handleClose();
                    this.setState({templateName:''})
              }
            })
            .catch(function(error){
                console.log(error)
            }) 
            // sentstatus
        }
    }

    checkValueIfSent=()=>{
        const {currentSelectedData,currentDone} = this.state;
        return currentDone.includes(currentSelectedData)
    }

    setDisplaySent=()=>{
        this.setState({hideSent:!this.state.hideSent})
    }

    openGenerate=()=>{
        this.props.history.push('/generate')
    }
  render = () => {
    let content = unescape(this.state.currentContent);    
    const currentValues =this.state.currentData[this.state.currentSelectedData-1];
    // this.state.currentData.map((data,key)=>{
    //     return({key,data})
    // })
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



    return (<Container>
        <Fab size="small" color="primary" aria-label="back" onClick={this.handleBack}>
            <KeyboardArrowLeft/>
        </Fab>
        <br/>
        <br/>
        <br/>
        <Grid container spacing={3}>
            <Grid item xs={3}>
                <Card>
                    <CardContent>
                        <h1>Messages</h1>  
                        <Button variant="outlined" onClick={this.openGenerate}component="span" >
                            Create New Messages
                        </Button>                                
                        <List component="nav">
                            {this.state.messageGroups.map((messageGroup)=>{
                                const messages = this.state.messages.filter(message=>message.GroupID===messageGroup.ID);
                                const hasMessages = messages.length>0 ? true:false;
                                const expanded = this.state.drawerStatus[messageGroup.Title];
                                return(<>
                                    <ListItem button
                                        onClick={()=>{
                                            if(hasMessages){
                                                let tempDrawerStatus = this.state.drawerStatus;
                                                tempDrawerStatus[messageGroup.Title]=!expanded
                                                this.setState({drawerStatus:tempDrawerStatus});
                                            }
                                        }}
                                    >
                                        <ListItemIcon>
                                        <InboxIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={unescape(messageGroup.Title)} />
                                        {hasMessages && (expanded ? <ExpandLess /> : <ExpandMore />)}
                                    </ListItem>
                                    {hasMessages && <Collapse in={expanded} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {messages.map((message)=>{
                                                return(<ListItem button  className="nested"
                                                onClick={()=>{this.updateCurrentMessageGroupData(message.ID)}}
                                                >
                                                    <ListItemIcon>
                                                    <InboxIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={unescape(message.Title)} />
                                                    <ListItemSecondaryAction>
                                                        <IconButton edge="end" aria-label="delete" onClick={()=>{this.deleteCurrentMessageGroup(message.ID)}}>
                                                        <DeleteIcon />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>)
                                            })}
                                    </List>
                                    </Collapse>
                                    }
                                </>)
                            })}
                        </List>
                    </CardContent>
                    <CardActions>
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={9}>
                <Card>
                    <CardContent>
                        <h1>{this.state.currentTitle}</h1>                    
                        <Grid container spacing={3}>
                            <Grid item xs={10}>
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
                            <Grid item xs={2}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Button onClick={this.toggleSent}>{!this.checkValueIfSent() && `Mark as `}Sent</Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <ButtonGroup size="small" aria-label="small outlined button group">
                                            <Button onClick={this.setDisplaySent}>{this.state.hideSent ? `Display`:`Hide`} Sent</Button>
                                        </ButtonGroup>
                                    </Grid>
                                    <Grid item xs={12}>
                                        Sent: {this.state.currentDone.length}/{this.state.currentData.length}
                                    </Grid>
                                </Grid>
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