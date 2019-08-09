import React from 'react';
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,Collapse,
    DialogActions,DialogContent,DialogContentText,Fab, CardContent,CardHeader,Select,OutlinedInput,MenuItem,IconButton,ListSubheader,
    ButtonGroup,List,ListItem,ListItemIcon,ListItemText} from '@material-ui/core';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { withRouter } from "react-router-dom";
import fs from 'fs';
import {Editor, EditorState,convertFromRaw,convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import ReactQuill, { Quill } from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import './reactQuill.css';
import { /*EmojiBlot, ShortNameEmoji, ToolbarEmoji, TextAreaEmoji , */emojiList} from 'quill-emoji'
import InboxIcon from '@material-ui/icons/Inbox';
import AddIcon from '@material-ui/icons/Add';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Dropzone from './Dropzone.js'
import axios from 'axios';
import queryString from 'query-string';


var Block = Quill.import('blots/block');
var EmojiBlot = Quill.import('formats/emoji')
var ShortNameEmoji = Quill.import('modules/emoji-shortname')
var ToolbarEmoji = Quill.import('modules/emoji-toolbar')
var TextAreaEmoji = Quill.import('modules/emoji-textarea')
Block.tagName = 'DIV';
Quill.register(Block, true);
Quill.register(EmojiBlot, true);
Quill.register(ShortNameEmoji, true);
Quill.register(ToolbarEmoji, true);
Quill.register(TextAreaEmoji, true);


class Generate extends React.Component {
  state = {
      title:'',
      columns: /*localStorage.getItem('columns').split(','),//*/[],
      definitions:/*JSON.parse(localStorage.getItem('definitions')),//*/{},
      editorState:EditorState.createEmpty(), 
      preview:/*localStorage.getItem('preview'),//*/'',
      currentDefinition:/*Number(localStorage.getItem('currentDefinition')),//*/0,
      editorText:'',
      encoding:'normal',
      open:false,
      dialogTitle:'',
      dialogContent:'',
      dialogActions:'',
      dialogDisplay:'save',
      templateName:'',
      selectedUpdateTemplate:'',
      templateList:[],
      uploadedCSV:undefined,
      messageName:'',
      templateGroups:[],
      currentTemplateGroup:0,
      currentTemplateGroupName:'',
      templateGroupDrawers:{},
      messageGroups:[],
      currentMessageGroup:0,
      currentMessageGroupName:'',
      selectedShortCode:'',
  };

  modules = {
    toolbar:{
        container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'strike'],
        ['emoji'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['clean'],
        ['code-block'],
        ],
        handlers: {'emoji': function() {},
            'code-block': ()=>{
                if(this.state.columns.length) {
                    this.setInsertShortcode();
                    this.handleOpen();
                } else {
                    alert(`No Shortcodes Yet. Upload a CSV File`)
                }
            }
        }
    },
    
    "emoji-shortname": {
        emojiList: emojiList,
        fuse: {
          shouldSort: true,
          threshold: 0.1,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: [
            "shortname"
          ]
        },
    },
    "emoji-toolbar": true,
    // "emoji-textarea": true,
    // "emoji-shortname": true,
  }

  formats = [
    'header',
    'bold', 'italic', 'strike', 'blockquote','emoji',
    'list', 'bullet', 'indent',
    'link', 'image','shortcode'
  ]

  handleInsertShortCode=(value)=>{
    var range = this.quillRef.getSelection();
    let position = range ? range.index : 0;
    this.quillRef.insertText(position,this.state.selectedShortCode);
    this.handleClose();
  }

  handleOpen=()=>{
      this.setState({open:true})
  }

  handleClose=()=>{
      this.setState({open:false})
  }

  setInsertShortcode=()=>{
      this.setState({dialogDisplay:'insert_shortcode'});
  }
  componentWillMount() {
    console.log(this.props.match.params)

      if(!this.props.isLoggedIn) {
        this.props.history.push('/login')
    }
    const {editState,editWhat} = this.props.match.params;
    if(editState==='template') {
        this.handleSelectCurrentTemplate(editWhat);
    }
  }
  
  componentDidMount () {
    this.attachQuillRefs()
  }
  
  componentDidUpdate () {
    this.attachQuillRefs()
  }
  
  attachQuillRefs() {
    // Ensure React-Quill reference is available:
    if (typeof this.reactQuillRef.getEditor !== 'function') return;
    // Skip if Quill reference is defined:
    if (this.quillRef != null) return;
    
    const quillRef = this.reactQuillRef.getEditor();
    if (quillRef != null) this.quillRef = quillRef;
  }
  
  handleBack=()=>{
      this.props.history.push('/home')
  }

  handleNextPreview=()=>{
      if(this.state.currentDefinition>0 && this.state.currentDefinition!==this.state.definitions.length+1) {
          this.setState({currentDefinition:Number(this.state.currentDefinition)+1})
      }
  }

  handlePreviousPreview=()=>{
    if(this.state.currentDefinition>1 && this.state.currentDefinition!==this.state.definitions.length+1) {
        this.setState({currentDefinition:Number(this.state.currentDefinition)-1})
    }
  }

  handleUpdateEditor=(value)=>{
      this.setState({preview:value})
    
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

  onUploadCSV=(e)=>{
    const reader = new FileReader();
    console.log(e)
    let file = e[0];
    if(file) {
        this.setState({uploadedCSV:file})
        reader.onload = (event) => {
            const text = event.target.result;
            this.parseCSV(text);
        }
        reader.readAsText(file);
    }
  }

  parseCSV(text){
      const rawRows = text.split('\n');
      const columns = rawRows.shift().split(',');
      const definitions = [];
      rawRows.forEach((row)=>{
          let container = {};
          const properties = row.split(',');
          columns.forEach((item,key)=>{
              container[item]=properties[key];
          })
          definitions.push(container);
      })
      this.setState({columns,definitions,currentDefinition:1});
      localStorage.setItem('columns',columns)
      localStorage.setItem('definitions',JSON.stringify(definitions))
      localStorage.setItem('currentDefinition',1)
  }

  readFile (path) {
        var fileContent;
        return new Promise(function(resolve) {
            fileContent = fs.readFileSync(path, {encoding: 'utf8'});
            resolve(fileContent);
        });
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

    setEncodingNormal= () => {
        this.setState({encoding:'normal'})
    }

    setEncodingWhatsApp=()=>{
        this.setState({encoding:'whatsapp'})
    }

    getTemplateGroups= async ()=>{
        let groups = await axios.get(`${process.env.REACT_APP_API_URL}templates/groups/`);
        this.setState({templateGroups:groups.data});
    }

    getMessageGroups= async ()=>{
        let groups = await axios.get(`${process.env.REACT_APP_API_URL}messages/groups/`);
        this.setState({messageGroups:groups.data});
    }

    handleSaveAsTemplate=()=>{
        this.getTemplateGroups();
        this.setState({dialogDisplay:'save'})
        this.handleOpen();
    }

    handleSelectTemplate=()=>{
        this.renderTemplates();
        this.getTemplateGroups();
        this.setState({dialogDisplay:'select'})
        this.handleOpen();
    }

    handleSaveMessages=()=>{
        this.getMessageGroups();
        this.setState({dialogDisplay:'messages'})
        this.handleOpen();
    }

    updateSaveTemplateName=(e)=>{
        this.setState({templateName:e.target.value})
    }

    handleSetUpdateTemplate=(e)=>{
        this.setState({selectedUpdateTemplate:e})
    }

    handleSelectCurrentTemplate = async (e)=> {
        let templates = await axios.get(`${process.env.REACT_APP_API_URL}templates/search/${e}`);
        const data = templates.data
        this.setState({preview:unescape(data[0].Content)})
        this.handleClose();
    }

    handleRequestUpdateTemplate=async (e)=> {
        if(this.state.preview!=="") {
            const template=this.state.templateList.filter((template)=>{
                return template.Title===escape(this.state.templateName)
            })
            if(template) {
                axios.post(`${process.env.REACT_APP_API_URL}templates/update/${template[0].ID}`,{content:this.state.preview,commitby:this.props.userData.ID})
                .then((response)=>{
                  if(response.data) {
                        this.handleClose();
                        this.setState({templateName:''})
                  }
                })
                .catch(function(error){
                    console.log(error)
                }) 
            } else {
                alert('Error Selecting Template')
            }         
        } else {
            alert('empty content')
            this.handleClose();
        }
    }

    handleRequestNewTemplateGroup=async (e)=> {
        axios.post(`${process.env.REACT_APP_API_URL}templates/groups/create/`,{title:this.state.currentTemplateGroupName,commitby:this.props.userData.ID})
        .then((response)=>{
            if(response.data) {
                if(response.data) {
                    console.log(response.data);
                    if(response.data[0]){
                        alert('Template Group already Exists. Try another name')
                    }else if(response.data.affectedRows>=0) {
                        this.handleClose();
                      } else {
                          this.handleClose();
                    }
                }
            }
        })
        .catch(function(error){
            console.log(error)
        }) 
    }

    handleRequestNewMessageGroup=async (e)=> {
        axios.post(`${process.env.REACT_APP_API_URL}messages/groups/create/`,{title:this.state.currentMessageGroupName,commitby:this.props.userData.ID})
        .then((response)=>{
            if(response.data) {
                if(response.data) {
                    console.log(response.data);
                    if(response.data[0]){
                        alert('Message Group already Exists. Try another name')
                    }else if(response.data.affectedRows>=0) {
                        this.handleClose();
                      } else {
                          this.handleClose();
                    }
                }
            }
        })
        .catch(function(error){
            console.log(error)
        }) 
    }

    updateCurrentTemplateGroupName = (e) =>{
        this.setState({currentTemplateGroupName:e.target.value})
    }

    updateCurrentMessageGroupName = (e) =>{
        this.setState({currentMessageGroupName:e.target.value})
    }


    renderNewTemplateGroup=()=>{
        return (<>
            <DialogTitle id="form-dialog-title">Create New Template Group</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <TextField
                        id="templateName"
                        label="Template Group Name"
                        type="text"
                        name="templateName"
                        autoComplete="templateName"
                        margin="normal"
                        variant="outlined"
                        value={this.state.currentTemplateGroupName}
                        fullWidth
                        onChange={this.updateCurrentTemplateGroupName}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={this.handleRequestNewTemplateGroup}component="span" >
                    Confirm
                </Button>
                <Button variant="outlined" onClick={()=>{
                    this.setState({dialogDisplay:'save'})
                }} component="span" >
                    Cancel
                </Button>
            </DialogActions>
            </>)
    }


    renderNewMessageGroup=()=>{
        return (<>
            <DialogTitle id="form-dialog-title">Create New Message Group</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <TextField
                        id="messageGroupName"
                        label="Message Group Name"
                        type="text"
                        name="messageGroupName"
                        autoComplete="messageGroupName"
                        margin="normal"
                        variant="outlined"
                        value={this.state.currentMessageGroupName}
                        fullWidth
                        onChange={this.updateCurrentMessageGroupName}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={this.handleRequestNewMessageGroup}component="span" >
                    Confirm
                </Button>
                <Button variant="outlined" onClick={()=>{
                    this.setState({dialogDisplay:'messages'})
                }} component="span" >
                    Cancel
                </Button>
            </DialogActions>
            </>)
    }

    renderDialogTemplateSaveorUpdate=()=>{
        return (<>
            <DialogTitle id="form-dialog-title">Template Already Exists</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <strong>{this.state.currentTemplateGroupName} > {this.state.templateName}</strong> already Exists. Would you like to Update instead?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={this.handleRequestUpdateTemplate}component="span" >
                    Confirm
                </Button>
                <Button variant="outlined" onClick={this.handleClose} component="span" >
                    Cancel
                </Button>
            </DialogActions>
            </>)
    }

    handleRequestSaveTemplate=(e)=>{
        if(this.state.templateName.trim()==='') {
            alert('Please Add Template Name')
        } else if (this.state.preview.trim()==='') {
            alert('Template is Empty')
        } else if (this.state.currentTemplateGroup==='') {
            alert('Select Template Group')
        } else {
            axios.post(`${process.env.REACT_APP_API_URL}templates/create`,{title:this.state.templateName,content:this.state.preview,groupid:this.state.currentTemplateGroup,commitby:this.props.userData.ID})
            .then((response)=>{
              if(response.data) {
                  console.log(response.data);
                  if(response.data[0]){
                        this.setState({currentTemplateGroupName:response.data[0].Title})
                        this.setUpdateTemplate()
                  }else if(response.data.affectedRows>=0) {
                      this.handleClose();
                      this.setState({templateName:''})
                    } else {
                        this.handleClose();
                  }
              }
            })
            .catch(function(error){
                console.log(error)
            }) 
        }
    }

    handleRequestSaveMessages=(e)=>{
        if(this.state.messageName.trim()==='') {
            alert('Please add Name to the Message')
        } else if (this.state.preview==='') {
            alert('Editor is Empty')
        } else if (this.state.uploadedCSV===undefined) {
            alert('no CSV Uploaded')
        } else {
            const url = `${process.env.REACT_APP_API_URL}messages/save`;
            const formData = new FormData();
            formData.append('csvfile',this.state.uploadedCSV)
            formData.append('title',this.state.messageName)
            formData.append('content',this.state.preview)
            formData.append('commitby',this.props.userData.ID)
            formData.append('groupID',this.state.currentMessageGroup)
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }
            axios.post(url, formData,config)        
            .then((response)=>{
                if(response.data.affectedRows>=0) {
                    this.handleClose();
                } else if(response.data) {
                    if(response.data[0][0].Title) {
                        alert(`Message Collection named ${response.data[0][0].Title} already Exists. Try another name`);
                    } else {
                        alert(`unhandled exception 423`)
                    }
                } else {
                    alert(`unhandled exception 427`)
                }
            })
            .catch(function(error){
                alert('Failed to Save Messages');
            }) 
        }
    }

    updateSaveMessageName=(e) =>{
        this.setState({messageName:e.target.value})
    }

    renderSaveMessages=()=>{
        return (<>
        <DialogTitle id="form-dialog-title">Save Messages</DialogTitle>
        <DialogContent>
            <DialogContentText>
                
                <Select style={{width:228}}
                    input={<OutlinedInput name="age" id="outlined-age-simple" />}
                    value={this.state.currentMessageGroup}
                    onChange={this.handleChangeCurrentMessageGroup}
                >
                    {this.state.messageGroups.map((messageGroup)=>{
                        return(<MenuItem value={messageGroup.ID}>{unescape(messageGroup.Title)}</MenuItem>)
                    })}
                </Select>
                <IconButton aria-label="add" onClick={this.setNewMessageGroup}>
                    <AddIcon />
                </IconButton>
                <TextField
                    id="templateName"
                    label="Message Collection Name"
                    type="text"
                    name="templateName"
                    autoComplete="templateName"
                    margin="normal"
                    variant="outlined"
                    value={this.state.messageName}
                    fullWidth
                    onChange={this.updateSaveMessageName}
                />
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="outlined" onClick={this.handleRequestSaveMessages}component="span" >
                Confirm
            </Button>
            <Button variant="outlined" onClick={this.handleClose} component="span" >
                Cancel
            </Button>
        </DialogActions>
        </>)
    }

    handleChangeCurrentTemplateGroup=(e)=>{
        this.setState({currentTemplateGroup:e.target.value})
    }

    handleChangeCurrentMessageGroup=(e)=>{
        this.setState({currentMessageGroup:e.target.value})
    }

    handleChangeSelectedShortcode=(e)=>{
        this.setState({selectedShortCode:e.target.value})
    }
    renderInsertShortcode=()=>{
        return (<>
        <DialogTitle id="form-dialog-title">Insert Shortcode</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <Select style={{width:228}}
                input={<OutlinedInput name="age" id="outlined-age-simple" />}
                value={this.state.selectedShortCode}
                onChange={this.handleChangeSelectedShortcode}
                >
                    {this.state.columns.map((column,key)=>{
                        return(<MenuItem value={`[${column}]`}>[{column}]</MenuItem>)
                    })}
                </Select>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="outlined" onClick={this.handleInsertShortCode} component="span" >
                Insert
            </Button>
            <Button variant="outlined" onClick={this.handleClose} component="span" >
                Cancel
            </Button>
        </DialogActions>
        </>)
    }
    renderSaveAsTemplate=()=>{
        return (<>
        <DialogTitle id="form-dialog-title">Save Template</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <Select style={{width:228}}
                input={<OutlinedInput name="age" id="outlined-age-simple" />}
                value={this.state.currentTemplateGroup}
                onChange={this.handleChangeCurrentTemplateGroup}
                >
                    {this.state.templateGroups.map((templateGroup)=>{
                        return(<MenuItem value={templateGroup.ID}>{templateGroup.Title}</MenuItem>)
                    })}
                </Select>
                <IconButton aria-label="add" onClick={this.setNewTemplateGroup} >
                    <AddIcon />
                </IconButton>
                <TextField
                    id="templateName"
                    label="Template Name"
                    type="text"
                    name="templateName"
                    autoComplete="templateName"
                    margin="normal"
                    variant="outlined"
                    value={this.state.templateName}
                    fullWidth
                    onChange={this.updateSaveTemplateName}
                />
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="outlined" component="span" onClick={this.handleRequestSaveTemplate}>
                Confirm
            </Button>
            <Button variant="outlined" onClick={this.handleClose} component="span" >
                Cancel
            </Button>
        </DialogActions>
        </>)
    }

    renderTemplates=async ()=>{
        let templates = await axios.get(`${process.env.REACT_APP_API_URL}templates/search`);
        const data = templates.data
        this.setState({templateList:data})
        return data;
    }

    toggleTemplateGroupDrawer=(val,key)=>{
        let templateDrawers = this.state.templateGroupDrawers
        templateDrawers[val]=!key;
        this.setState({templateDrawers:templateDrawers}); 
    }


    renderSelectTemplate=()=>{
        const templates =this.state.templateList; 
        const templateGroups = this.state.templateGroups;
        let templateGroupNames = templateGroups.map((templateGroup)=>templateGroup.Title) 
        let templateStatusState={}
        templateGroupNames.forEach((val,key)=>{
            templateStatusState[val]=false;
        });
        return (<>
            <DialogTitle id="form-dialog-title">Select Template</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <List
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    >
                        {templateGroups.map((templateGroup)=>{
                            
                            const groupTemplates = templates.filter((template)=>{
                                return (template.GroupID===templateGroup.ID)
                            })
                            return(<>
                            <ListItem button 
                                onClick={()=>{this.toggleTemplateGroupDrawer(templateGroup.Title,this.state.templateGroupDrawers[templateGroup.Title])}}
                            >
                                <ListItemIcon>
                                <InboxIcon />
                                </ListItemIcon>
                                <ListItemText primary={templateGroup.Title} />
                                {groupTemplates.length>0 && (this.state.templateGroupDrawers[templateGroup.Title] ? <ExpandLess /> : <ExpandMore />) }
                            </ListItem>
                            {groupTemplates.length>0 && <Collapse in={this.state.templateGroupDrawers[templateGroup.Title]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {groupTemplates.map((groupTemplate)=>{
                                        return (<ListItem button className="nested"
                                                    onClick={()=>{this.handleSelectCurrentTemplate(groupTemplate.ID)}}
                                                >
                                                    <ListItemIcon>
                                                        <InboxIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={unescape(groupTemplate.Title)} />
                                                </ListItem>)
                                    })}
                                </List>
                            </Collapse>}
                            </>)
                        })}
                    </List>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={this.handleClose} component="span" >
                    Cancel
                </Button>
            </DialogActions>
        </>)
    }

    setNewTemplateGroup=()=>{
        this.setState({dialogDisplay:'new_template_group'})
    }

    setNewMessageGroup=()=>{
        this.setState({dialogDisplay:'new_message_group'})
    }

    setUpdateTemplate=()=>{
        this.renderTemplates()
        this.setState({dialogDisplay:'duplicate_template'})
    }

    setSelectTemplate=()=>{
        this.setState({dialogDisplay:'select'})
    }

    setSaveTemplate=()=>{
        this.setState({dialogDisplay:'save'})
    }

    setCurrentPreview=(e)=>{
        if(e.target.value<=this.state.definitions.length && e.target.value>=0) {
            if(e.target.value==0) {
                this.setState({currentDefinition:1})
            } else {
                this.setState({currentDefinition:e.target.value})
            }
        }
    }

    updateTemplateName=(e)=> {
        this.setState({templateName:e.target.value})
    }


  render = () => {
    return (<Container>
        
        <Fab size="small" color="primary" aria-label="back" onClick={this.handleBack}>
            <KeyboardArrowLeft/>
        </Fab>
        <br/>
        <br/>
        <br/>
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <Card>
                    <CardContent>
                        <h1>Shortcodes</h1>
                        <Dropzone onFilesAdded={this.onUploadCSV} />
                        {this.state.columns.length >0 && this.state.columns.map((column,index)=><p key={index}>[{column}]</p>)}
                        {this.state.columns.length === 0 && <span>No Shortcodes yet. Upload Something!</span>}                        
                    </CardContent>
                    <CardActions>
                        {/* <input
                            accept="*"
                            id="outlined-button-file"
                            multiple
                            type="file"
                            onChange={this.onUploadCSV}
                            accept=".csv"
                        />
                        <label htmlFor="outlined-button-file">
                            <Button variant="outlined" component="span" >
                            Upload CSV File
                            </Button>
                        </label> */}
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={5}>
                <Card className="emoji-container">
                    <CardContent>
                        <h1>Editor</h1>
                        <div className="editor">
                            <ReactQuill ref={(el) => { this.reactQuillRef = el }}
                            value={this.state.preview}
                                modules={this.modules}
                                formats={this.formats}
                                        onChange={this.handleUpdateEditor} />
                        </div>
                    </CardContent>
                    <CardActions>
                        <ButtonGroup size="small" aria-label="small outlined button group">
                            <Button onClick={this.handleSelectTemplate}>Select Template</Button>
                        </ButtonGroup>
                        <ButtonGroup size="small" aria-label="small outlined button group">
                            <Button onClick={this.handleSaveAsTemplate}>Save As Template</Button>
                            <Button onClick={this.handleSaveMessages}>Save All Messages</Button>
                        </ButtonGroup>
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={5}>
                <Card>
                    <CardContent>
                        <h1>Preview</h1>
                        <div id="copyToClipboard" className={'ql-editor'} dangerouslySetInnerHTML={{__html:this.convertShortCodes()}}>
                        </div>
                    </CardContent>
                    <CardActions>
                    <Button onClick={this.handlePreviousPreview}><NavigateBefore/></Button>
                    
                    <TextField
                        value={this.state.currentDefinition}
                        margin="normal"
                        style={{width:40,margin:0}}
                        onChange={this.setCurrentPreview}
                    />/{this.state.definitions.length}

                    <Button onClick={this.handleNextPreview}><NavigateNext/></Button>
                    <Button variant="outlined" onClick={this.copyToClipboard}>Copy to Clipboard</Button>
                    <ButtonGroup size="small" aria-label="small outlined button group">
                        <Button onClick={this.setEncodingNormal}>Normal</Button>
                        <Button onClick={this.setEncodingWhatsApp}>WhatsApp</Button>
                    </ButtonGroup>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
        <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
            {this.state.dialogDisplay === 'select' && this.renderSelectTemplate()}
            {this.state.dialogDisplay === 'messages' && this.renderSaveMessages()}
            {this.state.dialogDisplay === 'save' && this.renderSaveAsTemplate()}
            {/* {this.state.dialogDisplay === 'update' && this.renderUpdateTemplate()} */}
            {this.state.dialogDisplay === 'duplicate_template' && this.renderDialogTemplateSaveorUpdate()}
            {this.state.dialogDisplay === 'new_template_group' && this.renderNewTemplateGroup()}
            {this.state.dialogDisplay === 'new_message_group' && this.renderNewMessageGroup()}
            {this.state.dialogDisplay === 'insert_shortcode' && this.renderInsertShortcode()}
            {/* insert_shortcode */}
            {/* renderNewTemplateGroup */}
            {/* subject,value,host,update=true */}
        </Dialog>
    </Container>);
  }
}

export default withRouter(Generate);