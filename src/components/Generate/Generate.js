import React from 'react';
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,
    DialogActions,DialogContent,DialogContentText,Fab, CardContent,CardHeader,
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
import { /*EmojiBlot, ShortNameEmoji, ToolbarEmoji, TextAreaEmoji , */emojiList} from 'quill-emoji'
import InboxIcon from '@material-ui/icons/Inbox';
import axios from 'axios';

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
      messageName:''
  };

  modules = {
    toolbar:{
        container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'strike'],
        ['emoji'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['clean']
        ],
        handlers: {'emoji': function() {}}
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
    'link', 'image'
  ]

  handleOpen=()=>{
      this.setState({open:true})
  }

  handleClose=()=>{
      this.setState({open:false})
  }

  componentWillMount() {
      if(!this.props.isLoggedIn) {
        this.props.history.push('/login')
    }
  }
  
  handleBack=()=>{
      this.props.history.push('/home')
  }

  handleNextPreview=()=>{
      if(this.state.currentDefinition>0 && this.state.currentDefinition!==this.state.definitions.length+1) {
          this.setState({currentDefinition:this.state.currentDefinition+1})
      }
  }

  handlePreviousPreview=()=>{
    if(this.state.currentDefinition>1 && this.state.currentDefinition!==this.state.definitions.length+1) {
        this.setState({currentDefinition:this.state.currentDefinition-1})
    }
  }

  handleUpdateEditor=(value)=>{
      console.log(typeof this.state.preview)
      this.setState({preview:value})
    
  }

  convertShortCodes=()=>{
      console.log('convert');
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
    let file = e.target.files[0];
    this.setState({uploadedCSV:file})
    reader.onload = (event) => {
        const text = event.target.result;
        this.parseCSV(text);
    }
    reader.readAsText(file);
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

    handleSaveAsTemplate=()=>{
        this.setState({dialogDisplay:'save'})
        this.handleOpen();
    }

    handleSelectTemplate=()=>{
        this.renderTemplates()
        this.setState({dialogDisplay:'select'})
        this.handleOpen();
    }

    handleSaveMessages=()=>{
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
        console.log(e,`${process.env.REACT_APP_API_URL}templates/search/${e}`)
        let templates = await axios.get(`${process.env.REACT_APP_API_URL}templates/search/${e}`);
        const data = templates.data
        this.setState({preview:unescape(data[0].Content)})
        this.handleClose();
    }

    handleRequestUpdateTemplate=(e)=> {
        if(this.state.preview!=="") {
            axios.post(`${process.env.REACT_APP_API_URL}templates/update/${this.state.selectedUpdateTemplate}`,{content:this.state.preview,commitby:this.props.userData.ID})
            .then((response)=>{
              if(response.data) {
                  if(response.data.code==='ER_DUP_ENTRY') {
                    console.log(response.data)
                  } else {
                    console.log(response.data)
                    this.handleClose();
                    this.setState({templateName:''})
                  }
              }
            })
            .catch(function(error){
                console.log(error)
            }) 
        } else {
            alert('empty content')
            this.handleClose();
        }
    }

    handleRequestSaveTemplate=(e)=>{
        if(this.state.templateName.trim()==='') {
            alert('Please Add Template Name')
        } else if (this.state.preview.trim()==='') {
            alert('Template is Empty')
        } else {
            axios.post(`${process.env.REACT_APP_API_URL}templates/create`,{title:this.state.templateName,content:this.state.preview,commitby:this.props.userData.ID})
            .then((response)=>{
              if(response.data) {
                  if(response.data.code==='ER_DUP_ENTRY' || response.data.code==='ER_PARSE_ERROR') {
                    alert('Unable to Save to Database. Contact Administrator')
                  } else {
                    console.log(response.data)
                    this.handleClose();
                    this.setState({templateName:''})
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
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }
            axios.post(url, formData,config)        
            .then((response)=>{
                if(response.data.affectedRows>=0) {
                    this.handleClose();
                } else {
                    alert('Failed to Save Messages');
                    this.handleClose();
                }
            })
            .catch(function(error){
                alert('Failed to Save Messages');
                this.handleClose();
            }) 
        }
        // axios.post(`${process.env.REACT_APP_API_URL}messages/save`,{title:this.state.messageName,content:this.state.preview,csvfile:this.state.uploadedCSV,commitby:this.props.userData.ID})
        // .then((response)=>{
        //     console.log(response);
        // })
        // .catch(function(error){
        //     console.log(error);
        // }) 
    }

    updateSaveMessageName=(e) =>{
        this.setState({messageName:e.target.value})
    }

    renderSaveMessages=()=>{
        return (<>
        <DialogTitle id="form-dialog-title">Save Messages</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <TextField
                    id="templateName"
                    label="Message Group Name"
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

    renderSaveAsTemplate=()=>{
        return (<>
        <DialogTitle id="form-dialog-title">Save Template</DialogTitle>
        <DialogContent>
            <DialogContentText>
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
            <Button variant="outlined" onClick={this.setUpdateTemplate}component="span" >
                Update Template
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
    }

    renderUpdateTemplate=()=>{
        const templates =this.state.templateList; 
        return (<>
            <DialogTitle id="form-dialog-title">Update Template</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <List component="nav">
                        {templates.map((template)=>{
                        return (<ListItem
                        button
                        key={template.ID}
                        onClick={()=>{this.handleSetUpdateTemplate(template.ID)}}
                        selected={this.state.selectedUpdateTemplate===template.ID}
                        >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={unescape(template.Title)} />
                        </ListItem>)
                        })}
                    </List>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={this.handleRequestUpdateTemplate} component="span" >
                    Confirm
                </Button>
                <Button variant="outlined" onClick={this.setSaveTemplate} component="span" >
                    Save as Template
                </Button>
                <Button variant="outlined" onClick={this.handleClose} component="span" >
                    Cancel
                </Button>
            </DialogActions>
        </>)
    }

    renderSelectTemplate=()=>{
        const templates =this.state.templateList; 
        return (<>
            <DialogTitle id="form-dialog-title">Select Template</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <List component="nav">
                        {templates.map((template)=>{
                        return (<ListItem
                        button
                        key={template.ID}
                        onClick={()=>{this.handleSelectCurrentTemplate(template.ID)}}
                        selected={this.state.selectedUpdateTemplate===template.ID}
                        >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={unescape(template.Title)} />
                        </ListItem>)
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

    setUpdateTemplate=()=>{
        this.renderTemplates()
        this.setState({dialogDisplay:'update'})
    }

    setSelectTemplate=()=>{
        this.setState({dialogDisplay:'select'})
    }

    setSaveTemplate=()=>{
        this.setState({dialogDisplay:'save'})
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
        <Grid container spacing={3}>
            <Grid item xs={2}>
                <Card>
                    <CardContent>
                        <h1>Shortcodes</h1>
                        {this.state.columns.length >0 && this.state.columns.map((column,index)=><p key={index}>[{column}]</p>)}
                        {this.state.columns.length === 0 && <span>No Shortcodes yet. Upload Something!</span>}                        
                    </CardContent>
                    <CardActions>
                        <input
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
                        </label>
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={5}>
                <Card className="emoji-container">
                    <CardContent>
                        <h1>Editor</h1>
                        <div className="editor">
                            <ReactQuill value={this.state.preview}
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
                    <ButtonGroup size="small" aria-label="small outlined button group">
                        <Button onClick={this.handlePreviousPreview}><NavigateBefore/></Button>
                        <Button disabled>{this.state.currentDefinition}/{this.state.definitions.length}</Button>
                        <Button onClick={this.handleNextPreview}><NavigateNext/></Button>
                    </ButtonGroup>
                    <Button onClick={this.copyToClipboard}>Copy to Clipboard</Button>
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
            {this.state.dialogDisplay === 'update' && this.renderUpdateTemplate()}
        </Dialog>
    </Container>);
  }
}

export default withRouter(Generate);