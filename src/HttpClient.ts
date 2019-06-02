import { reject } from "q";
import { VApp } from '@kloudsoftware/eisen';

export enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
};

export class HttpClient {
    private basePath: string;
    app: VApp;

    constructor(basePath: string, app: VApp) {
        this.basePath = basePath;
        this.app = app;
    }

    async peformGet(path: string): Promise<Response> {
        return await this.doFetch(Method.GET, path);
    }

    async performPost(path: string, data: any, contentType = "application/json"): Promise<Response> {
        return await this.doFetch(Method.POST, path, data, contentType);
    }

    private async doFetch(method: Method, path: string, data?: any, contentType = "application/json"): Promise<Response> {
        let options: RequestInit = {
            method: method,
            headers: this.getHeader(contentType),
            redirect: "follow"
        }

        if ([Method.POST, Method.PUT, Method.PATCH].includes(method)) {
            Object.assign(options, { "body": JSON.stringify(data) });
        }

        const resp = await fetch(this.basePath + path, options);

        if (resp.status == 403 && !path.includes("token")) {
            window.localStorage.removeItem("token");
            window.sessionStorage.setItem("path", document.location.pathname);
            await this.app.router.resolveRoute("/login");
            return;
        }

        if (resp.status >= 300) {
            throw `Response with status code ${resp.status}: ${resp.statusText}`;
        }

        return resp;
    }


    private getHeader(contentType?: string): any {
        const token = window.localStorage.getItem("token");
        let header = {};
        if (token != undefined && token != null && token.length > 0) {
            Object.assign(header, { "Authorization": "Bearer " + token });
        }

        if (contentType != undefined) {
            Object.assign(header, { "Content-Type": contentType });
        }

        return header;
    }
}
