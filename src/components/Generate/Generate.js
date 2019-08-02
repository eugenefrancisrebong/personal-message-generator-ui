import React from 'react';
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,DialogActions,DialogContent,DialogContentText,Fab, CardContent,CardHeader,ButtonGroup} from '@material-ui/core';
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
      columns: /*localStorage.getItem('columns').split(','),*/[],
      definitions:/*JSON.parse(localStorage.getItem('definitions')),*/{},
      editorState:EditorState.createEmpty(), 
      preview:'',
      currentDefinition:/*Number(localStorage.getItem('currentDefinition'))//*/0,
      editorText:'',
      encoding:'normal'
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
                <Card>
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
                        <Button variant="outlined">Save As Template</Button>
                        <Button variant="outlined">Save All Messages</Button>
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
    </Container>);
  }
}

export default withRouter(Generate);