'use client'

import Typography from '@mui/material/Typography';
import jp from 'jsonpath';
import { useCallback, useEffect, useState } from 'react';

// import WebSocket from 'ws';
// import { Flight } from '@/models/Flight';
import { DataRefWsRequest } from '@/models/DataRefWsRequest';
import { DataRefsResponse } from '@/models/DataRefsResponse';
import Button from '@mui/material/Button';

// const rootUrl = 'http://localhost:3000/datarefs.json';
const rootUrl = 'https://4367-182-18-225-92.ngrok-free.app/api/v1/datarefs';
const ws = new WebSocket('wss://4367-182-18-225-92.ngrok-free.app/api/v1');

export default function Page() {
    // const [flight] = useState<Flight>({
    //     depICAO: "RPLL",
    //     arrICAO: "RPVM",
    //     maxIAS: 100,
    //     crsAlt: 30000,
    //     transAlt: 8000
    // });

    const [currAltId, setCurrAltId] = useState<number>(0);
    const [pilotAirspeedId, setPilotAirspeedId] = useState<number>(0);
    const [pilotTrueAirspeedId, setPilotTrueAirspeedId] = useState<number>(0);
    const [compassHeadingDegId, setCompassHeadingDegId] = useState<number>(0);
    const [compassMagneticHeadingId, setCompassMagneticHeadingId] = useState<number>(0);

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
            dataRef = jp.query(dataRefs, `$.data[?(@. name == '${name}')]`);
            // console.log(`dataref ${name} ${JSON.stringify(dataRef[0].id)}`);
        }
        return (dataRefs.data.length > 0) ? dataRef[0].id : 0;
    }, [dataRefs]);

    const getUpdatedDataRefWs = useCallback((source: object, id: number): number => {
        console.log(`getUpdatedDataRefWs(${id})`);
        let dataRef = [0];
        if (source !== undefined) {
            dataRef = jp.query(source, `$.${id}`);
            // console.log(`dataref ${id} ${JSON.stringify(dataRef[0])}`);
        }
        return dataRef[0];
    }, []);

    const subscribeToDataRefs = useCallback(async () => {
        ws.addEventListener('open', () => {
            console.log('Connected to server');
            const payload: DataRefWsRequest = {
                req_id: 1,
                type: 'dataref_subscribe_values',
                params: {
                    datarefs: [
                        { id: 2004938583872 },
                        { id: 2004938582864 },
                        // { id: pilotTrueAirspeedId },
                        { id: 2004938586224 },
                        { id: 2004938582360 }
                    ]
                }
            }
            console.log(`Final WS Payload: ${JSON.stringify(payload)}`)
            ws.send(JSON.stringify(payload));
        });
        ws.addEventListener("message", (event) => {
            // console.log("Message from server ", JSON.parse(event.data));
            const json = JSON.parse(event.data);
            if ("result" === json.type) {
                console.log(`Subscribed values ${json.success}!`);
            }
            if ("dataref_update_values" === json.type) {
                setCurrAltFt(getUpdatedDataRefWs(json.data, 2004938583872));
                // setCurrAltFt(getUpdatedDataRefWs(json.data, currAltId));
                setCurrSpd(getUpdatedDataRefWs(json.data, 2004938582864));
                // setCurrSpd(getUpdatedDataRefWs(json.data, pilotAirspeedId));
                setCurrHdg(getUpdatedDataRefWs(json.data, 2004938586224));
                // setCurrHdg(getUpdatedDataRefWs(json.data, compassHeadingDegId));
                setCurrMagHdg(getUpdatedDataRefWs(json.data, 2004938582360));
                // setCurrMagHdg(getUpdatedDataRefWs(json.data, compassMagneticHeadingId));
            }
        });
    }, [getUpdatedDataRefWs])

    const getDataRefVal = async (id: number | undefined) => {
        console.log(`DataRefId (${id})`);
        if (id !== undefined && id > 0) {
            return await fetch(`${rootUrl}/${id}/value`)
                .then(res => res.json());
        } else {
            return await Promise.resolve({ data: 0 });
        }
    }

    // TODO: Remove all these after fixing websocket. These will be populated by then.
    const getAltitude = async () => {
        console.log('getAltitude()');
        return getDataRefVal(currAltId);
    }

    const getAirspeed = async () => {
        console.log('getAirSpeed');
        return getDataRefVal(pilotAirspeedId);
    }

    const getHeading = async () => {
        console.log('getHeading()');
        return getDataRefVal(compassHeadingDegId);
    }

    const getMagHeading = async () => {
        console.log('getMagHeading()');
        return getDataRefVal(compassMagneticHeadingId);
    }

    const connectWs = () => {
        console.log('connectWs()');
        ws.addEventListener('open', () => {
            console.log('Connected to server');
            const payload: DataRefWsRequest = {
                req_id: 4,
                type: 'dataref_subscribe_values',
                params: {
                    datarefs: [
                        { id: 2004938583872 },
                        { id: 2004938582864 },
                        // { id: pilotTrueAirspeedId },
                        { id: 2004938586224 },
                        { id: 2004938582360 }
                    ]
                }
            }
            console.log(`Final WS Payload: ${JSON.stringify(payload)}`)
            ws.send(JSON.stringify(payload));
        });
        ws.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
        });
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

        getAltitude().then(res => {
            const ft: number = res.data;
            const mt = ft * 0.3048;
            setCurrAltFt(ft);
            setCurrAltMt(mt);
        });
        getAirspeed().then(res => setCurrSpd(res.data.toLocaleString('en-us', { minimumFractionDigits: 2 })))
        getHeading().then(res => setCurrHdg(res.data));
        getMagHeading().then(res => setCurrMagHdg(res.data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getDataRefSessionId])

    useEffect(() => {
        subscribeToDataRefs();
    }, [subscribeToDataRefs]);

    return (
        <div>
            <h1>Frame</h1>
            <Typography variant="body1">
                Altitude: {currAltFt}
                {/* Altitude {Math.round(currAltFt).toLocaleString('en-us', { minimumFractionDigits: 0 })}ft / {Math.round(currAltMt).toLocaleString('en-us', { minimumFractionDigits: 0 })}m */}
            </Typography>
            <Typography variant="body1">
                Airspeed {currSpd}kts
                {/* Airspeed {Math.round(currSpd).toLocaleString('en-us', { minimumFractionDigits: 0 })}deg */}
            </Typography>
            <Typography variant="body1">
                Heading {Math.round(currHdg).toLocaleString('en-us', { minimumFractionDigits: 0 })}deg
            </Typography>
            <Typography variant="body1">
                Magnetic North Heading {Math.round(currMagHdg).toLocaleString('en-us', { minimumFractionDigits: 0 })}deg
            </Typography>
            {/* <Typography variant="body1">
                DataRefs {currAltId} {pilotAirspeedId}
                {JSON.stringify(dataRefs)}
            </Typography> */}
            <Button
                variant="contained"
                // disabled={currAltId != undefined
                //     && pilotAirspeedId !== undefined
                //     && compassHeadingDegId !== undefined
                //     && compassMagneticHeadingId !== undefined}
                onClick={connectWs}>Get DataRefs</Button>
        </div>
    );
}
