import { DataRefWsRequestParam } from "./DataRefWsRequestParam";

export interface DataRefWsRequest {
    req_id: number;
    type: string;
    params?: DataRefWsRequestParam;
}
