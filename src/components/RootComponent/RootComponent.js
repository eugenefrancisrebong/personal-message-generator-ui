import React from 'react';
import { withRouter } from "react-router-dom";

class RootComponent extends React.Component {
  state = {
  };

  componentWillMount() {
      if(!this.props.isLoggedIn) {
        this.props.history.push('/login')
    } else {
        this.props.history.push('/home');
      }
  }


  render = () => {
    return (
        <div>
        </div>);
  }
}

export default withRouter(RootComponent);