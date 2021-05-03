import React from 'react';
import { DockerProject, getDockerProjectsList } from '../DockerProject';
import './DockerProjectsList.css'

class DockerProjectEntry extends React.Component<{project: DockerProject}, {}> {
    render() {
        return (
            <div className="projectEntry">
                <div className="projectName">{this.props.project.name}</div>
                <div className="projectStatus">{this.props.project.status}</div>
            </div>
        )
    }
}

type Props = {};
type State = {projects: Array<DockerProject>};
export default class DockerProjectsList extends React.Component<Props, State> {
    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = {
            projects: []
        };
    }

    componentDidMount() {
        getDockerProjectsList().then((dockerProjects: Array<DockerProject>) => {
            this.setState({projects: dockerProjects});
        });
    }

    render() {
        const renderedProjects: Array<JSX.Element> = []
        this.state.projects.forEach((project: DockerProject) => {
            renderedProjects.push(<DockerProjectEntry project={project} />)
        })
        return renderedProjects
    }
} 