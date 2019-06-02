import { reject } from "q";
import { VApp } from '@kloudsoftware/eisen';

export enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
};

export enum ErrorType {
    REQUEST,
    RESPONSE
}

export abstract class Error {
    private errorMsg: string;

    constructor(msg: string) {
        this.errorMsg = msg;
    }

    abstract type(): ErrorType;

    msg(): string {
        return this.errorMsg;
    }
}

export class RequestError extends Error {
    type(): ErrorType {
        return ErrorType.REQUEST;
    }
}

export class ResponseError extends Error {
    type(): ErrorType {
        return ErrorType.RESPONSE;
    }
}

export class HttpClient {
    private basePath: string;
    app: VApp;

    constructor(basePath: string, app: VApp) {
        this.basePath = basePath;
        this.app = app;
    }

    async perform(method: Method, path: string, data?: any, contentType = "application/json"): Promise<Response> {
        return await this.doFetch(method, path, data, contentType);
    }

    async peformGet(path: string): Promise<Response> {
        return await this.doFetch(Method.GET, path);
    }

    async performPost(path: string, data: any, contentType = "application/json"): Promise<Response> {
        return await this.doFetch(Method.POST, path, data, contentType);
    }

    async performPut(path: string, data: any, contentType = "application/json"): Promise<Response> {
        return await this.doFetch(Method.PUT, path, data, contentType);
    }

    async performPatch(path: string, data: any, contentType = "application/json"): Promise<Response> {
        return await this.doFetch(Method.PATCH, path, data, contentType);
    }

    async performDelete(path: string, data: any, contentType = "application/json"): Promise<Response> {
        return await this.doFetch(Method.DELETE, path, data, contentType);
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

        try {
            const resp = await fetch(this.basePath + path, options);
            if (resp.status == 403 && !path.includes("token")) {
                window.localStorage.removeItem("token");
                window.sessionStorage.setItem("path", document.location.pathname);
                await this.app.router.resolveRoute("/login");
                return;
            }

            if (resp.status >= 300) {
                throw new ResponseError(`Response with status code ${resp.status}: ${resp.statusText}`);
            }

            return resp;
        } catch (error) {
            throw new RequestError(`failed to fetch "${this.basePath + path}": ${error}`);
        }
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
