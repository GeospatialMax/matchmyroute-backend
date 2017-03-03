import * as path from "path";

import { EndpointCollection } from "../../microservices-framework/web/services/endpoint-collection";

// Import Endpoints
import { get } from "./get";
import { getById } from "./get-by-id";
import { post } from "./post";
import { resize } from "./resize";

export const images: EndpointCollection = new EndpointCollection(path.parse(__dirname).name);

// export Endpoints
images.addEndpoint(get);
images.addEndpoint(getById);
images.addEndpoint(post);
images.addEndpoint(resize);