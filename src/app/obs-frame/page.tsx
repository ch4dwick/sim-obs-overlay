'use client'

import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

import { DataRefWsRequest } from '@/models/DataRefWsRequest';
import { DataRefsResponse } from '@/models/DataRefsResponse';
import Button from '@mui/material/Button';
import { JSONPath } from 'jsonpath-plus';
import { FlightTelemetry } from '@/models/FlightTelemetry';
import { DataRefWsRequestParamItem } from '@/models/DataRefWsRequestParamItem';

// const rootUrl = 'http://localhost:3000/datarefs.json';
const rootHttpUrl = 'https://4eec-182-18-225-92.ngrok-free.app/api/v1/datarefs';
const rootWsUrl = 'wss://4eec-182-18-225-92.ngrok-free.app/api/v1';


export default function Page() {
    const [ws, setWs] = useState<WebSocket>();
    const [ft, setFt] = useState<FlightTelemetry>({
        currentAltId: 0,
        currentAltFt: 0,
        pilotAirspeedId: 0,
        currentSpd: 0,
        pilotTrueAirspeedId: 0,
        compassHeadingDegId: 0,
        currentHdg: 0,
        compassMagneticHeadingId: 0,
        currentMagHdg: 0,
        distanceToTODId: 0,
        distanceAfterTODId: 0
    });

    const [dataRefs, setDataRefs] = useState<DataRefsResponse>({ data: [] });

    // Warning: The response can be huge.
    const getDataRefs = useCallback(async () => {
        console.log('getDataRefs()');
        const dataRefsRes = await fetch(`${rootHttpUrl}`);
        const jsonRes = await dataRefsRes.json();
        setDataRefs(jsonRes);
    }, []);

    /**
     * Get the current unique dataref session id of the game.
     */
    const getDataRefSessionId = useCallback((name: string): number => {
        console.log(`getDataRefSessionId(${name})`);
        let dataRef = [];
        if (dataRefs.data.length > 0) {
            dataRef = JSONPath({ path: `$.data[?(@. name == '${name}')]`, json: dataRefs });
            // console.log(`${name} ${JSON.stringify(dataRef[0].id)}`);
            return (dataRef[0] !== undefined) ? dataRef[0].id : 0;
        }
        return 0;
    }, [dataRefs]);

    /**
     * Gets new values from the triggered WebSocket event. Return previous value to prevent
     * undesired side effects.
     */
    const getUpdatedDataRefWs = useCallback((source: object, id: number, fallback: number = 0): number => {
        console.log(`getUpdatedDataRefWs(): ${id}`);
        const dataRef = JSONPath({ path: `$.${id}`, json: source });
        console.log(`${id} ${dataRef[0]} fallback: ${fallback}`);
        return dataRef[0] !== undefined ? dataRef[0] : fallback;
    }, []);

    /**
     * Map the value of the dataRef to the corresponding FlightTelemetry field.
     */
    const wsMessageHandler = useCallback((event: MessageEvent) => {
        const json = JSON.parse(event.data);
        if ("result" === json.type && !json.success) {
            console.log(json.error_message);
        }
        if ("dataref_update_values" === json.type) {
            // console.log(JSON.stringify(ft));
            const newFt = {
                ...ft,
                currentAltFt: getUpdatedDataRefWs(json.data, ft.currentAltId, ft.currentAltFt),
                currentSpd: getUpdatedDataRefWs(json.data, ft.pilotAirspeedId, ft.currentSpd),
                currentHdg: getUpdatedDataRefWs(json.data, ft.compassHeadingDegId, ft.currentHdg),
                currentMagHdg: getUpdatedDataRefWs(json.data, ft.compassMagneticHeadingId, ft.currentMagHdg),
            }
            setFt(newFt);
        }
    }, [ft]);

    const subscribeWs = useCallback(() => {
        if (ws?.readyState === WebSocket.OPEN) {
            console.log('subscribeWs() connection opened. Subscribing...');
            const payload: DataRefWsRequest = {
                req_id: 1,
                type: 'dataref_subscribe_values',
                params: {
                    datarefs: [
                        { id: ft.currentAltId },
                        { id: ft.pilotAirspeedId },
                        { id: ft.pilotTrueAirspeedId },
                        { id: ft.compassHeadingDegId },
                        { id: ft.compassMagneticHeadingId }
                    ]
                }
            }

            // Remove unmapped datarefs just in case. This can happen if the plane being monitored doesn't have that dataref.
            if (Array.isArray(payload?.params?.datarefs)) {
                const newParams = payload?.params?.datarefs.filter((element: DataRefWsRequestParamItem) => element.id != 0);
                payload.params.datarefs = newParams;
            }

            console.log(`Actual WS Payload: ${JSON.stringify(payload)}`)
            if (Array.isArray(payload?.params?.datarefs) && payload.params.datarefs.length > 0) {
                ws.send(JSON.stringify(payload));
                ws.removeEventListener('message', wsMessageHandler);
                ws.addEventListener('message', wsMessageHandler);
            }
        }
    }, [ws, wsMessageHandler]);

    const stopWs = () => {
        const payload: DataRefWsRequest = {
            req_id: 2,
            type: 'dataref_unsubscribe_values',
            params: {
                datarefs: 'all'
            }
        }

        if (ws?.readyState === WebSocket.OPEN) {
            console.log(JSON.stringify(payload));
            ws.send(JSON.stringify(payload));
        }
    }

    const areDataRefIdsReady = useCallback(() => {
        return ws?.readyState === WebSocket.OPEN
            && ft.currentAltId > 0
            && ft.pilotAirspeedId > 0
            && ft.compassHeadingDegId > 0
    }, [ft, ws]);

    // Initialize WebSocket connection
    useEffect(() => {
        if (ws === undefined) {
            console.log('setWs(new WebSocket(rootWsUrl))');
            setWs(new WebSocket(rootWsUrl));
        }
        if (ws !== undefined && ws.readyState !== WebSocket.OPEN) {
            // Establish connectoin
            ws.addEventListener('open', (event) => {
                console.log(`Connected to server ${JSON.stringify(event)}`);
            });
        }
    }, [ws]);

    // Get dataRefs from REST API.
    useEffect(() => {
        // Initialize DataRefs
        getDataRefs();
    }, [getDataRefs]);

    // These maps the current dataRef IDs to the FlightTelemetry object. These don't pull data yet.
    // Once done, subscribe to the WebSocket using these ids.
    useEffect(() => {
        const newFt = {
            ...ft,
            currentAltId: getDataRefSessionId('sim/cockpit2/gauges/indicators/altitude_ft_pilot'),
            pilotAirspeedId: getDataRefSessionId('sim/cockpit2/gauges/indicators/airspeed_kts_pilot'),
            pilotTrueAirspeedId: getDataRefSessionId('sim/cockpit2/gauges/indicators/true_airspeed_kts_pilot'),
            compassHeadingDegId: getDataRefSessionId('sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot'),
            compassMagneticHeadingId: getDataRefSessionId('sim/cockpit2/gauges/indicators/compass_heading_deg_mag')
        }
        setFt(newFt);
        subscribeWs();
    }, [dataRefs]);

    /**
     * Call REST API for value of DataRef
     * @deprecate We use WebSockets for this now.
     */
    // const getDataRefVal = async (id: number | undefined) => {
    //     console.log(`DataRefId (${id})`);

    //     return (id !== undefined && id > 0)
    //         ? fetch(`${rootHttpUrl}/${id}/value`).then(res => res.json())
    //         : Promise.resolve({ data: 0 });
    // }

    return (
        <div>
            <h1>Telemetry</h1>
            <Typography variant="body1">
                Test Altitude: {ft.currentAltFt}ft<br />
                Altitude {Math.round(ft.currentAltFt).toLocaleString('en-us', { minimumFractionDigits: 0 })}ft /
                {Math.round(ft.currentAltFt * 0.3048).toLocaleString('en-us', { minimumFractionDigits: 0 })}m
            </Typography>
            <Typography variant="body1">
                Test Airspeed {ft.currentSpd}kts<br />
                Airspeed {Math.round(ft.currentSpd).toLocaleString('en-us', { minimumFractionDigits: 0 })}kts
            </Typography>
            <Typography variant="body1">
                Test Heading {ft.currentHdg}&#176; <br />
                Heading {Math.round(ft.currentHdg).toLocaleString('en-us', { minimumFractionDigits: 0 })}&#176;
            </Typography>
            <Typography variant="body1">
                Test Magnetic Heading {ft.currentMagHdg}&#176; <br />
                Magnetic North Heading {Math.round(ft.currentMagHdg).toLocaleString('en-us', { minimumFractionDigits: 0 })}&#176;
            </Typography>
            {/* <Typography variant="body1">
                DataRefs: {JSON.stringify(dataRefs)}
            </Typography> */}
            <Button
                variant="contained"
                disabled={!areDataRefIdsReady()}
                onClick={subscribeWs}>Get DataRefs</Button>
            <Button
                variant="contained"
                disabled={!areDataRefIdsReady()}
                onClick={stopWs}>Stop DataRefs</Button>
        </div>
    );
}
