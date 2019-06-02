import { reject } from "q";
import { VApp } from '@kloudsoftware/eisen';

export class HttpClient {
    private basePath: string;
    app: VApp;

    constructor(basePath: string, app: VApp) {
        this.basePath = basePath;
        this.app = app;
    }

    peformGet(path: string): Promise<Response> {
        return new Promise((resolve, reject) => {
            fetch(this.basePath + path, {
                method: "GET",
                headers: this.getHeader(),
                redirect: "follow",
            }).then(resp => {
                if (resp.status == 403) {
                    window.localStorage.removeItem("token");
                    window.sessionStorage.setItem("path", document.location.pathname);
                    this.app.router.resolveRoute("/login");
                    return;
                }
                resolve(resp);
            }).catch(err => reject(err));
        });
    }


    getHeader(contentType?: string): any {
        const token = window.localStorage.getItem("token");
        if (token != undefined && token != null && token.length > 0) {
            if (contentType == undefined) {
                return {
                    "Authorization": "Bearer " + token,
                };
            }

            return {
                "Content-Type": contentType,
                "Authorization": "Bearer " + token,
            };
        } else {
            if (contentType != undefined) {
                return {
                    "Content-Type": contentType,
                };
            }

            return {};
        }
    }

    performPost(path: string, data: any, contentType = "application/json"): Promise<Response> {
        return new Promise((resolve, reject) => {
            fetch(this.basePath + path, {
                method: "POST",
                headers: this.getHeader(contentType),

                redirect: "follow",
                body: JSON.stringify(data),
            }).then(resp => {
                if (resp.status == 403 && !path.includes("token")) {
                    window.localStorage.removeItem("token");
                    window.sessionStorage.setItem("path", document.location.pathname);
                    this.app.router.resolveRoute("/login");
                    return;
                }
                resolve(resp);
            }).catch(err => reject(err));
        });
    }

}
