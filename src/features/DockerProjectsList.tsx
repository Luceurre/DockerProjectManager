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

class DockerProjectEntry extends React.Component<{project: DockerProject}, {project: DockerProject}> {
    constructor(props: {project: DockerProject}) {
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
            return <div className="projectStatus" style={{color: "green"}}>RUNNING</div>;
        } else {
            return <div className="projectStatus" style={{color: "red"}}>STOPPED</div>;
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

        return <div className="containersStatus"><span>{upContainerCount}</span>/<span>{downContainerCount}</span></div>
    }

    render() {
        return (
            <div className="projectEntry">
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
            renderedProjects.push(<DockerProjectEntry project={project} />)
        })
        return (
            <div className="projectsList">
                {renderedProjects}
            </div>
        )
    }
} 