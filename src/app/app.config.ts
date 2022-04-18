import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class AppConfig {

    static inited = false;

    constructor(private http: HttpClient) {
    }

    /**
     * This method:
     *   b) Loads the external configuration file, based on the environment (if applicable)
     */
    public load(): Promise<Boolean> {
        if (!AppConfig.inited) {
            AppConfig.inited = true;
            return new Promise((resolve, reject) => {
                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type': 'text/plain'
                    })
                };
                if (environment.externalConfigurationFile !== '') {
                    this.http.get(`./assets/${environment.externalConfigurationFile}`, { headers: httpOptions.headers, responseType: "text" })
                        .subscribe((responseData: string) => {
                            const variables = responseData.split(/\r\n|\r|\n/);
                            for (let variable of variables) {
                                const keyValue = variable.split(' ');
                                const keys = keyValue[0].split('.');
                                if (keys.length > 1) {
                                    environment[keys[0]][keys[1]] = keyValue[1];
                                } else {
                                    environment[keyValue[0]] = keyValue[1];
                                }
                            }
                            resolve(true);
                        });
                } else {
                    resolve(true);
                }

            });

        } else {
            return new Promise((resolve, reject) => resolve(true));
        }
    }
}
