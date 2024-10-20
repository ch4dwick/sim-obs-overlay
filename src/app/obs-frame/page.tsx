'use client'

import Typography from '@mui/material/Typography';
import jp from 'jsonpath';
import { SetStateAction, useEffect, useState } from 'react';

// import WebSocket from 'ws';
// import { Flight } from '@/models/Flight';
import { DataRefWsRequest } from '@/models/DataRefWsRequest';
import { DataRefsResponse } from '@/models/DataRefsResponse';

const rootUrl = 'http://localhost:3000/datarefs.json';
const ws = new WebSocket('wss://localhost:8086/api/v1');

export default function Page() {
    // const [flight] = useState<Flight>({
    //     depICAO: "RPLL",
    //     arrICAO: "RPVM",
    //     maxIAS: 100,
    //     crsAlt: 30000,
    //     transAlt: 8000
    // });

    // sim/cockpit2/gauges/indicators/altitude_ft_pilot
    // const currAltId = '2711343677248';
    const [currAltId, setCurrAltId] = useState<number>();
    // sim/cockpit2/gauges/indicators/airspeed_kts_pilot
    // const pilotAirspeedId = '2711343676240';
    const [pilotAirspeedId, setPilotAirspeedId] = useState<number>();
    // sim/cockpit2/gauges/indicators/true_airspeed_kts_pilot
    // const pilotTrueAirspeedId = '2711343678256';
    const [pilotTrueAirspeedId, setPilotTrueAirspeedId] = useState<number>();
    // sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot
    // const compassHeadingDegId = '2711343679600';
    const [compassHeadingDegId, setCompassHeadingDegId] = useState<number>();
    // sim/cockpit2/gauges/indicators/compass_heading_deg_mag
    // const compassMagneticHeadingId = '2711343675736';
    const [compassMagneticHeadingId, setCompassMagneticHeadingId] = useState<number>();

    const [dataRefs, setDataRefs] = useState<DataRefsResponse>({ data: [] });
    const [currAltFt, setCurrAltFt] = useState<number>(0);
    const [currAltMt, setCurrAltMt] = useState<number>(0);
    const [currSpd, setCurrSpd] = useState<number>(0);
    const [currHdg, setCurrHdg] = useState<number>(0);

    useEffect(() => {
        // Initialize DataRefs
        const initRefs = async () => { await getDataRefs() };
        initRefs();

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
        // });dataRefs
        // getAirspeed().then(res => setCurrSpd(res.data.toLocaleString('en-us', { minimumFractionDigits: 2 })))
        // getHeading().then(res => setCurrHdg(res.data.toLocaleString('en-us', { minimumFractionDigits: 2 })))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Warning: The response is huge.
    async function getDataRefs() {
        console.log('getDataRefs()');
        const dataRefsRes = await fetch(`${rootUrl}`);
        const jsonRes = await dataRefsRes.json();
        setDataRefs(jsonRes);
    }

    function getDataRefSessionId(name: string): number {
        console.log(`getDataRefSessionId(${name})`);
        let dataRef = [];
        if (dataRefs.data.length > 0) {
            dataRef = jp.query(dataRefs, `$.data[?(@. name == '${name}')]`);
            console.log(`dataref ${name} ${dataRef}`);
        }
        return (dataRefs.data.length > 0) ? dataRef[0].id : 0;
    }

    async function subscribeToDataRefs() {
        ws.addEventListener('open', () => {
            console.log('Connected to server');
            const payload: DataRefWsRequest = {
                req_id: 1,
                type: 'dataref_update_values',
                params: {
                    datarefs: [
                        { id: currAltId },
                        { id: pilotAirspeedId },
                        { id: pilotTrueAirspeedId },
                        { id: compassHeadingDegId },
                        { id: compassMagneticHeadingId }
                    ]
                }
            }

            ws.send(JSON.stringify(payload));
        });
    }

    async function getAltitude() {
        console.log(currAltId);
        const altitudeRes = await fetch(`${rootUrl}/${currAltId}/value`);
        const dataRefs = await altitudeRes.json();
        console.log(dataRefs.data)
        return dataRefs;
    }

    async function getAirspeed() {
        console.log(pilotAirspeedId);
        const speedRes = await fetch(`${rootUrl}/${pilotAirspeedId}/value`);
        const dataRefs = await speedRes.json();
        console.log(dataRefs.data)
        return dataRefs;
    }

    async function getHeading() {
        console.log(compassHeadingDegId)
        const hdgRes = await fetch(`${rootUrl}/${compassHeadingDegId}/value`);
        const dataRefs = await hdgRes.json();
        console.log(dataRefs.data)
        return dataRefs;
    }

    return (
        <div>
            <h1>Frame</h1>
            <Typography variant="body1">
                Altitude {Math.round(currAltFt).toLocaleString('en-us', { minimumFractionDigits: 0 })}ft / {Math.round(currAltMt).toLocaleString('en-us', { minimumFractionDigits: 0 })}m
            </Typography>
            <Typography variant="body1">
                Airspeed {Math.round(currSpd).toLocaleString('en-us', { minimumFractionDigits: 0 })}kts
            </Typography>
            <Typography variant="body1">
                Heading {Math.round(currHdg).toLocaleString('en-us', { minimumFractionDigits: 0 })}deg
            </Typography>
            <Typography variant="body1">
                DataRefs {currAltId} {pilotAirspeedId}
                {/* {JSON.stringify(dataRefs)} */}
            </Typography>
        </div>
    );
}
