import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as cors from "koa-cors";
import * as qs from "koa-qs";
import * as Router from "koa-router";
import * as serve from "koa-static";
import * as path from "path";
import * as Seneca from "seneca";
import * as SenecaWeb from "seneca-web";
import * as senecaWebAdapter from "seneca-web-adapter-koa1";
import * as logger from "winston";

// local modules
import { config } from "../config";
import * as middleware from "./middleware";
import { servicesHelper } from "./services";
import getSwaggerJson from "./swagger";

export const app = new Koa();

export const setupServer = (eventEmitter) => {
    // Seneca setup
    const senecaWebConfig = {
        adapter: senecaWebAdapter,
        context: Router(),
        options: { parseBody: false },
        routes: servicesHelper.routes,
    };
    const seneca = Seneca();

    seneca.use(SenecaWeb, senecaWebConfig)
        .use(servicesHelper.api, { fatal$: false, seneca })
        .client({
            pins: servicesHelper.pins,
            type: config.services.transport,
      });

    // enable qs for query string parsing
    qs(app, "strict");

    app
        .use(bodyParser())
        .use(middleware.handleErrors())
        .use(cors({
            headers: ["content-type", "api_key", "Authorization"],
            methods: ["GET", "HEAD", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
            origin: "*",
        }));

    // serve files in public folder (css, js etc)
    app.use(serve(path.join(__dirname, "../static")));

    seneca.ready(() => {
        logger.info("seneca ready");

        // we need this to stop Typescript borking!
        const senecaExport: any = seneca.export("web/context");
        app.use(senecaExport().routes());

        /* tslint:disable only-arrow-functions */
        app.use(function * (next) {
            if (this.path === "/swagger.json") {
                try {

                    this.body = yield getSwaggerJson;
                } catch (err) {
                    this.status = 500;
                    return {
                        detail: err,
                        error: "Failed to parse swagger.json",
                        path: this.request.url,
                        status: this.status,
                    };
                }
            } else {
                yield next;
            }
        });

        app.use(function * (next) {
            yield next;

            this.body = JSON.stringify({
                node: process.versions,
                test: "Hello Koa async multi-process using middleware",
            });
        });
        /* tslint:enable only-arrow-functions */

        eventEmitter.emit("ready");
    });
};