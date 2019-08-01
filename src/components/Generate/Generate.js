import React from 'react';
import { Container,Card,Grid,Box,TextField,CardActions,Button,Dialog,DialogTitle,DialogActions,DialogContent,DialogContentText,Fab } from '@material-ui/core';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import { withRouter } from "react-router-dom";
import fs from 'fs';


class Generate extends React.Component {
  state = {
      title:'',
      columns:[],
      definitions:{}
  };

  componentWillMount() {
      if(!this.props.isLoggedIn) {
        this.props.history.push('/login')
    }
  }
  
  handleBack=()=>{
      this.props.history.push('/home')
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
      this.setState({columns,definitions});
  }

  readFile (path) {
        var fileContent;

        return new Promise(function(resolve) {
            fileContent = fs.readFileSync(path, {encoding: 'utf8'});
            resolve(fileContent);
        });
    }


  render = () => {
    return (<Container>
        
        <Fab size="small" color="primary" aria-label="back" onClick={this.handleBack}>
            <KeyboardArrowLeft/>
        </Fab>
        <br/>
        <br/>
        <br/>
        <Grid className="" container spacing={3}>
            <Grid item xs={4}>
                <Card  className="card-container">
                    <h1>Generate a Message</h1>
                    <TextField
                    id="title"
                    label="Title"
                    type="text"
                    name="title"
                    autoComplete="Title"
                    margin="normal"
                    variant="outlined"
                    value={this.title}
                    fullWidth
                    onChange={this.handleChange}
                    />
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
                </Card>
            </Grid>
            <Grid item xs={4}>
                <Card>asd</Card>
            </Grid>
        </Grid>
    </Container>);
  }
}

export default withRouter(Generate);