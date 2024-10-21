'use client'

import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

import { DataRefWsRequest } from '@/models/DataRefWsRequest';
import { DataRefsResponse } from '@/models/DataRefsResponse';
import Button from '@mui/material/Button';
import { JSONPath } from 'jsonpath-plus';
import { FlightTelemetry } from '@/models/FlightTelemetry';

// const rootUrl = 'http://localhost:3000/datarefs.json';
const rootUrl = 'https://6594-182-18-225-92.ngrok-free.app/api/v1/datarefs';
const ws = new WebSocket('wss://6594-182-18-225-92.ngrok-free.app/api/v1');

export default function Page() {
    const [ft, setFt] = useState<FlightTelemetry>({
        currentAltId: 0,
        currentAltFt: 0,
        currentAltMt: 0,
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

    // Warning: The response is huge.
    const getDataRefs = async () => {
        console.log('getDataRefs()');
        const dataRefsRes = await fetch(`${rootUrl}`);
        const jsonRes = await dataRefsRes.json();
        setDataRefs(jsonRes);
    }

    const getDataRefSessionId = useCallback((name: string): number => {
        console.log(`getDataRefSessionId(${name})`);
        let dataRef = [];
        if (dataRefs.data.length > 0) {
            dataRef = JSONPath({ path: `$.data[?(@. name == '${name}')]`, json: dataRefs });
            console.log(`${name} ${JSON.stringify(dataRef[0].id)}`);
        }
        return (dataRefs.data.length > 0) ? dataRef[0].id : 0;
    }, [dataRefs]);

    const getUpdatedDataRefWs = (source: object, id: number): number => {
        console.log(`getUpdatedDataRefWs(): ${id}`);
        const dataRef = JSONPath({ path: `$.${id}`, json: source });
        console.log(`${id} ${dataRef[0]}`);
        return dataRef[0] ?? 0;
    };

    const subscribeToDataRefs = useCallback(async () => {
        // ws.addEventListener('open', () => {
        //     console.log('Connected to server');
        //     const payload: DataRefWsRequest = {
        //         req_id: 1,
        //         type: 'dataref_subscribe_values',
        //         params: {
        //             datarefs: [
        //                 { id: currAltId },
        //                 { id: pilotAirspeedId },
        //                 // { id: pilotTrueAirspeedId },
        //                 { id: compassHeadingDegId },
        //                 { id: compassMagneticHeadingId }
        //             ]
        //         }
        //     }
        //     console.log(`Final WS Payload: ${JSON.stringify(payload)}`)
        //     ws.send(JSON.stringify(payload));
        // });
        // ws.addEventListener("message", (event) => {
        //     // console.log("Message from server ", JSON.parse(event.data));
        //     const json = JSON.parse(event.data);
        //     if ("result" === json.type) {
        //         console.log(`Subscribed values ${json.success}!`);
        //     }
        //     if ("dataref_update_values" === json.type) {
        //         setCurrAltFt(getUpdatedDataRefWs(json.data, currAltId));
        //         setCurrSpd(getUpdatedDataRefWs(json.data, pilotAirspeedId));
        //         setCurrHdg(getUpdatedDataRefWs(json.data, compassHeadingDegId));
        //         setCurrMagHdg(getUpdatedDataRefWs(json.data, compassMagneticHeadingId));
        //     }
        // });
    }, [ft, getUpdatedDataRefWs])


    const connectWs = () => {
        console.log('connectWs()');
        if (ws.readyState !== ws.OPEN) {
            ws.addEventListener('open', () => {
                console.log('Connected to server');
            });
        }
        if (ws.readyState === ws.OPEN) {
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
            console.log(`Final WS Payload: ${JSON.stringify(payload)}`)
            ws.send(JSON.stringify(payload));
            ws.addEventListener("message", (event) => {
                console.log("Server Message: ", JSON.parse(event.data));
                const json = JSON.parse(event.data);
                if ("result" === json.type) {
                    console.log(`Response status ${json.success}!`);
                }
                if ("dataref_update_values" === json.type) {
                    setFt({
                        ...ft,
                        currentAltFt: getUpdatedDataRefWs(json.data, ft.currentAltId),
                        currentSpd: getUpdatedDataRefWs(json.data, ft.pilotAirspeedId),
                        currentHdg: getUpdatedDataRefWs(json.data, ft.compassHeadingDegId),
                        currentMagHdg: getUpdatedDataRefWs(json.data, ft.compassMagneticHeadingId)
                    });
                }
            });
        }
    }

    const stopWs = () => {
        const payload: DataRefWsRequest = {
            req_id: 2,
            type: 'dataref_unsubscribe_values',
            params: {
                datarefs: 'all'
            }
        }

        if (ws.readyState === ws.OPEN) {
            console.log(JSON.stringify(payload));
            ws.send(JSON.stringify(payload));
        }
    }

    /**
     * Call REST API for value of DataRef
     * @deprecate We use WebSockets for this now.
     */
    const getDataRefVal = async (id: number | undefined) => {
        console.log(`DataRefId (${id})`);

        return await (id !== undefined && id > 0)
            ? fetch(`${rootUrl}/${id}/value`).then(res => res.json())
            : Promise.resolve({ data: 0 });
    }

    const areDataRefIdsReady = (): boolean => {
        return ws.readyState != ws.OPEN
            && ft.currentAltId === 0
            && ft.pilotAirspeedId === 0
            && ft.compassHeadingDegId === 0
    }

    useEffect(() => {
        // Initialize DataRefs
        const initRefs = async () => { await getDataRefs() };
        initRefs();
    }, []);

    useEffect(() => {
        setFt({
            ...ft,
            currentAltId: getDataRefSessionId('sim/cockpit2/gauges/indicators/altitude_ft_pilot'),
            pilotAirspeedId: getDataRefSessionId('sim/cockpit2/gauges/indicators/airspeed_kts_pilot'),
            pilotTrueAirspeedId: getDataRefSessionId('sim/cockpit2/gauges/indicators/true_airspeed_kts_pilot'),
            compassHeadingDegId: getDataRefSessionId('sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot'),
            compassMagneticHeadingId: getDataRefSessionId('sim/cockpit2/gauges/indicators/compass_heading_deg_mag')
        });

    }, [getDataRefSessionId])

    useEffect(() => {
        subscribeToDataRefs();
    }, [subscribeToDataRefs, ft]);

    return (
        <div>
            <h1>Frame</h1>
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
            <Typography variant="body1">
                DataRefs {ft.currentAltId},
                {ft.pilotAirspeedId},
                {ft.compassHeadingDegId},
                {ft.compassMagneticHeadingId}
                {/* {JSON.stringify(dataRefs)} */}
            </Typography>
            <Button
                variant="contained"
                disabled={areDataRefIdsReady()}
                onClick={connectWs}>Get DataRefs</Button>
            <Button
                variant="contained"
                disabled={areDataRefIdsReady()}
                onClick={stopWs}>Stop DataRefs</Button>
        </div>
    );
}
