import React from 'react';
import './App.css';
import { DockerProject, getDockerProjectsList } from './DockerProject';
import DockerProjectsList from './features/DockerProjectsList';
import { docker } from './promiseTests';
import {getDockerProjects} from './tools';

type MyProps = {  };
type MyState = { commandResult: Array<string> };
class App extends React.Component<MyProps, MyState> {
  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.state = {
      commandResult: []
    }
  }

  componentDidMount() {
  }

  render() {
    return (
      <DockerProjectsList />
    )
  }
}

export default App;
