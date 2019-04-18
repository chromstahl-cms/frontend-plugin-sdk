import { Router, Component } from '@kloudsoftware/eisen'
export * from './HttpClient';

export interface Registration {
    register(): Map<string, Component>;
}
