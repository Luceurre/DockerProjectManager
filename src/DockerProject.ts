let Docker = require('dockerode');
let docker = new Docker();

enum DockerProjectStatus {
    RUNNING,
    STOPPED,
    UNKNOWN
}

interface DockerNetwork {
    id: string;
    name: string
}

interface DockerImage {
    repo: string,
    tag: string,
    id: string
}

interface DockerContainer {
    id: string;
    name: string;
    ports: Array<string>;
    image: DockerImage;
    State: string;
}

export interface DockerProject {
    name: string;
    status: DockerProjectStatus;
    network: DockerNetwork;
    containers: Array<DockerContainer> | undefined;
}

function getDockerProjectNamesList() {
    let getProjectNameFromNetworkRegex = new RegExp("^[a-zA-Z]*(?=_default)");
    return getDockerProjectNetworksList().then((networks: Array<any>) => {
        return networks.map((network: any) => {
            return network.Name.match(getProjectNameFromNetworkRegex)[0];
        });
    });
}

function getDockerProjectNetworksList() {
    let isProjectNetworkRegex = new RegExp("^[a-zA-Z]*(?=_default)");
    return docker.listNetworks().then((networks: Array<any>) => {
        return networks.filter((network: any) => {
            return network.Name.match(isProjectNetworkRegex);
        });
    });
}

function getDockerProjectsList() {
    let getProjectNameFromNetworkRegex = new RegExp("^[a-zA-Z]*(?=_default)");
    return getDockerProjectNetworksList().then((networks: Array<any>) => {
        const projects: Array<DockerProject> = networks.map((network: any) => {
            const dockerProject: DockerProject = {
                name: network.Name.match(getProjectNameFromNetworkRegex)[0],
                network: network.Id,
                status: DockerProjectStatus.UNKNOWN,
                containers: undefined
            };
            return dockerProject;
        });
        return projects;
    }).then((dockerProjects: Array<DockerProject>) => {
        dockerProjects.forEach((dockerProject: DockerProject) => {
            getDockerProjectContainers(dockerProject)
            .then((containers: Array<any>) => dockerProject.containers = containers)
            .then(() => {
                dockerProject.status = getDockerProjectStatus(dockerProject);
            });
        });
        return dockerProjects;
    });;
}

function getDockerProjectContainers(dockerProject: DockerProject) {
    let options = {
        all: true,
        network: dockerProject.network
    };
    let isNotRelevantContainerRegex = "_run";
    return docker.listContainers(options).then((containers: any) => {
        return containers.filter((container: any) => {
            let isValid = true;
            container.Names.forEach((name: string) => {
                if (name.match(isNotRelevantContainerRegex)) {
                    isValid = false;
                }
            });
            return isValid;
        });
    });
}

function getDockerProjectStatus(dockerProject: DockerProject) {
    let isRunning = false;
    dockerProject.containers?.forEach((container: DockerContainer) => {
        if (container.State === "running") {
            isRunning = true;
        }
    })
    return (isRunning) ? DockerProjectStatus.RUNNING : DockerProjectStatus.STOPPED;
}

export { getDockerProjectNamesList, getDockerProjectsList}