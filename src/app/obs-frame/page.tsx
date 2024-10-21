'use client'

import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

// import WebSocket from 'ws';
// import { Flight } from '@/models/Flight';
import { DataRefWsRequest } from '@/models/DataRefWsRequest';
import { DataRefsResponse } from '@/models/DataRefsResponse';
import Button from '@mui/material/Button';
import { JSONPath } from 'jsonpath-plus';

// const rootUrl = 'http://localhost:3000/datarefs.json';
const rootUrl = 'https://6594-182-18-225-92.ngrok-free.app/api/v1/datarefs';
const ws = new WebSocket('wss://6594-182-18-225-92.ngrok-free.app/api/v1');

export default function Page() {

    // sim/cockpit2/gauges/indicators/altitude_ft_pilot
    const [currAltId, setCurrAltId] = useState<number>(0);
    // sim/cockpit2/gauges/indicators/airspeed_kts_pilot
    const [pilotAirspeedId, setPilotAirspeedId] = useState<number>(0);
    // sim/cockpit2/gauges/indicators/true_airspeed_kts_pilot
    const [pilotTrueAirspeedId, setPilotTrueAirspeedId] = useState<number>(0);
    // sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot
    const [compassHeadingDegId, setCompassHeadingDegId] = useState<number>(0);
    // sim/cockpit2/gauges/indicators/compass_heading_deg_mag
    const [compassMagneticHeadingId, setCompassMagneticHeadingId] = useState<number>(0);
    // sim/cockpit2/radios/indicators/fms_distance_to_tod_pilot
    const [distanceToTODId, setDistanceToTODId] = useState<number>(0);
    // sim/cockpit2/radios/indicators/fms_tod_before_distance_pilot
    const [distanceAfterTODId, setDistanceAfterTODId] = useState<number>(0);

    // TODO: Move this to an object.
    const [dataRefs, setDataRefs] = useState<DataRefsResponse>({ data: [] });
    const [currAltFt, setCurrAltFt] = useState<number>(0);
    const [currAltMt, setCurrAltMt] = useState<number>(0);
    const [currSpd, setCurrSpd] = useState<number>(0);
    const [currHdg, setCurrHdg] = useState<number>(0);
    const [currMagHdg, setCurrMagHdg] = useState<number>(0);

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

    const getUpdatedDataRefWs = (source: object, id: number, fallBackVal: number): number => {
        console.log(`getUpdatedDataRefWs(): ${id}`);
        const dataRef = JSONPath({ path: `$.${id}`, json: source });
        console.log(`${id} ${fallBackVal} ${dataRef[0]}`);
        return dataRef[0] ?? fallBackVal;
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
    }, [compassHeadingDegId, compassMagneticHeadingId, currAltId, getUpdatedDataRefWs, pilotAirspeedId])


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
                        { id: currAltId },
                        { id: pilotAirspeedId },
                        // { id: pilotTrueAirspeedId },
                        { id: compassHeadingDegId },
                        { id: compassMagneticHeadingId }
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
                    setCurrAltFt(getUpdatedDataRefWs(json.data, currAltId, currAltFt));
                    setCurrSpd(getUpdatedDataRefWs(json.data, pilotAirspeedId, currSpd));
                    setCurrHdg(getUpdatedDataRefWs(json.data, compassHeadingDegId, currHdg));
                    setCurrMagHdg(getUpdatedDataRefWs(json.data, compassMagneticHeadingId, currMagHdg));
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
            && currAltId === 0
            && pilotAirspeedId === 0
            && compassHeadingDegId === 0
            && compassMagneticHeadingId === 0
    }

    useEffect(() => {
        // Initialize DataRefs
        const initRefs = async () => { await getDataRefs() };
        initRefs();
    }, []);

    useEffect(() => {
        setCurrAltId(getDataRefSessionId('sim/cockpit2/gauges/indicators/altitude_ft_pilot'))
        setPilotAirspeedId(getDataRefSessionId('sim/cockpit2/gauges/indicators/airspeed_kts_pilot'));
        setPilotTrueAirspeedId(getDataRefSessionId('sim/cockpit2/gauges/indicators/true_airspeed_kts_pilot'));
        setCompassHeadingDegId(getDataRefSessionId('sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot'));
        setCompassMagneticHeadingId(getDataRefSessionId('sim/cockpit2/gauges/indicators/compass_heading_deg_mag'));

        // getAltitude().then(res => {
        //     const ft: number = res.data;
        //     const mt = ft * 0.3048;
        //     setCurrAltFt(ft);
        //     setCurrAltMt(mt);
        // });

        // getAirspeed().then(res => setCurrSpd(res.data.toLocaleString('en-us', { minimumFractionDigits: 2 })))
        // getHeading().then(res => setCurrHdg(res.data));
        // getMagHeading().then(res => setCurrMagHdg(res.data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getDataRefSessionId])

    useEffect(() => {
        subscribeToDataRefs();
    }, [subscribeToDataRefs, compassHeadingDegId, compassMagneticHeadingId, currAltId, pilotAirspeedId]);

    return (
        <div>
            <h1>Frame</h1>
            <Typography variant="body1">
                Test Altitude: {currAltFt}<br />
                Altitude {Math.round(currAltFt).toLocaleString('en-us', { minimumFractionDigits: 0 })}ft /
                {Math.round(currAltFt * 0.3048).toLocaleString('en-us', { minimumFractionDigits: 0 })}m
            </Typography>
            <Typography variant="body1">
                Test Airspeed {currSpd}kts<br />
                Airspeed {Math.round(currSpd).toLocaleString('en-us', { minimumFractionDigits: 0 })}deg
            </Typography>
            <Typography variant="body1">
                Test Heading {currHdg}kts <br />
                Heading {Math.round(currHdg).toLocaleString('en-us', { minimumFractionDigits: 0 })}deg
            </Typography>
            <Typography variant="body1">
                Test Magnetic Heading {currMagHdg}kts <br />
                Magnetic North Heading {Math.round(currMagHdg).toLocaleString('en-us', { minimumFractionDigits: 0 })}deg
            </Typography>
            <Typography variant="body1">
                DataRefs {currAltId},
                {pilotAirspeedId},
                {compassHeadingDegId},
                {compassMagneticHeadingId}
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
