import React from 'react';
import {
    DockerContainer,
    DockerProject,
    DockerProjectStatus,
    getDockerProjectContainers,
    getDockerProjectsList,
    getDockerProjectStatus
} from '../DockerProject';
import './DockerProjectsList.css'

class DockerProjectEntry extends React.Component<{project: DockerProject, height: number}, {project: DockerProject}> {
    constructor(props: {project: DockerProject, height: number}) {
        super(props);

        this.state = {
            project: props.project
        }
    }
    componentDidMount() {
        getDockerProjectContainers(this.props.project).then((containers: Array<any>) => {
            let project = this.state.project;
            project.containers = containers;
            project.status = getDockerProjectStatus(this.props.project);
            this.setState({
                project
            });
        });
    }

    describeProjectStatus(status: number) {
        if (status === DockerProjectStatus.RUNNING) {
            return <div className="projectStatus" style={{color: "green"}}><i className="fas fa-check"/></div>;
        } else {
            return <div className="projectStatus" style={{color: "red"}}><i className="fas fa-times"/></div>;
        }
    }

    displayContainersStatus(containers: Array<DockerContainer> | undefined) {
        let upContainerCount: number = 0;
        let downContainerCount: number = 0;

        containers?.forEach((container: DockerContainer) => {
            if (container.State === "running") {
                upContainerCount += 1;
            } else {
                downContainerCount += 1;
            }
        });

        return <div className="containersStatus"><span style={{color: "green"}}>{upContainerCount}</span> / <span style={{color: "red"}}>{downContainerCount}</span></div>
    }

    render() {
        return (
            <div className="projectEntry" style={{height: 0.9 * this.props.height + "vh", fontSize: this.props.height * 0.25 + "vh"}}>
                <div className="projectName">{this.state.project.name}</div>
                {this.displayContainersStatus(this.state.project.containers)}
                {this.describeProjectStatus(this.state.project.status)}
            </div>
        )
    }
}

type Props = {};
type State = {projects: Array<DockerProject>};
export default class DockerProjectsList extends React.Component<Props, State> {
    private scheduler: number;
    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = {
            projects: []
        };

        this.scheduler = -1;
    }

    componentDidMount() {
        getDockerProjectsList().then((dockerProjects: Array<DockerProject>) => {
            dockerProjects.sort((a: DockerProject, b: DockerProject) => {
                if (a.name < b.name) {
                    return -1;
                } else {
                    return 1;
                }
            });
            this.setState({projects: dockerProjects});
        });

        this.scheduler = window.setInterval(() => {
            getDockerProjectsList().then((dockerProjects: Array<DockerProject>) => {
                this.setState({projects: dockerProjects});
            });
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.scheduler);
    }

    render() {
        const renderedProjects: Array<JSX.Element> = []
        this.state.projects.forEach((project: DockerProject) => {
            renderedProjects.push(<DockerProjectEntry project={project} height={100. / this.state.projects.length} />)
        })
        return (
            <div className="projectsList">
                {renderedProjects}
            </div>
        )
    }
} 