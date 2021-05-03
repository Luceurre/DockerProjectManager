import { exec } from "child_process";
import { stderr } from "node:process";


export function getDockerProjects() {
    let funCall = "docker network ls";
    let findProjectRegex = new RegExp("[a-zA-Z]*(?=_default)");

    return new Promise<Array<string>>((resolve, reject) => {
        exec(funCall, (error, stdout, stderr) => {
            if (error || stderr) {
                reject(error + stderr);
            }
            let results = findProjectRegex.exec(stdout);
            resolve(Array.from(results?.values() ?? []));
        });
    }).then(results => {
        return getDockerNetworkId(results[0]);
    }).then(result => getDockerProjectInfo(result))
}

function getDockerNetworkId(networkName: string) {
    let funCall = "docker network ls"
    let findNetworkIdRegex = new RegExp(`[a-zA-Z0-9]*(?=\ *${networkName})`)

    return new Promise<string>((resolve, reject) => {
        exec(funCall, (error, stdout, stderr) => {
            if (error || stderr) {
                reject(error + stderr);
            }
            let results = stdout.match(findNetworkIdRegex);
            if (results && results.length == 1) {
                return results[0]
                //console.log(results[0])
                //resolve(results[0])
            } else {
                reject("No network with this name.")
            }
        })
    })
}

export function getDockerProjectInfo(projectName: string) {
    getDockerNetworkId(projectName).then(networkId => {
        //if (!networkId) { throw "Couldn't get project info." }

        let funCall = `docker container ps --filter "network=${networkId}"`
        console.log("funCall")
        let findContainerIdRegex = new RegExp('[a-zA-Z0-9]', "m")

        return new Promise<string>((resolve, reject) => {
            exec(funCall, (error, stdout, stderr) => {
                if (error || stderr) {
                    reject(error + stderr);
                }
                let results = stdout.match(findContainerIdRegex);
                if (results) {
                    console.log(results)
                    return "";
                }
            })
        })
    });
}
