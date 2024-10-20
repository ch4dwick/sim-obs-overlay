'use client'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { useState } from 'react';

// import fs from 'fs';
import { Flight } from '@/models/Flight';

const configFile = "sim-obs.cfg";
const destDir = "./";

export default function Page() {
    const [file, setFile] = useState(null);
    const [flight] = useState<Flight>({
        depICAO: "RPLL",
        arrICAO: "RPVM",
        maxIAS: 100,
        crsAlt: 30000,
        transAlt: 8000
    });
    // async function createFlight(formData: FormData) {
    //     const flightInfo = {
    //         depICAO: formData.get('depICAO'),
    //         arrICAO: formData.get('arrICAO'),
    //         route: formData.get('route'),
    //         airline: formData.get('airline'),
    //         airlineICAO: formData.get('airlineICAO'),
    //         fltNbr: formData.get('fltNbr'),
    //         network: formData.get('network'),
    //         crsAlt: formData.get('crsAlt'),
    //         maxIAS: formData.get('maxIAS'),
    //         transAlt: formData.get('transAlt'),
    //         aircraftICAO: formData.get('aircraftICAO')
    //     }

    // }
    async function handleSave() {
        const content = JSON.stringify(flight);
        console.log(content);
        // fs.writeFile(`${destDir}/${configFile}`, content, err => {
        //     if (err) {
        //         console.error(err);
        //     } else {
        //         console.log('Config file saved');
        //     }
        // });
    }


    return (
        <div >
            <h1>Flight</h1>
            <form>
                <TextField
                    required
                    id="depICAO"
                    label="Departure ICAO"
                    value={flight.depICAO}
                />
                <TextField
                    required
                    id="arrICAO"
                    label="Arrival ICAO"
                    value={flight.arrICAO}
                />
                <TextField
                    id="route"
                    label="Route"
                    value={flight.route}
                />
                <TextField
                    id="airline"
                    label="Airline"
                    value={flight.airline}
                />
                <TextField
                    id="airlineICAO"
                    label="Airline ICAO"
                    value={flight.aircraftICAO}
                />
                <TextField
                    id="fltNbr"
                    label="Flight Number"
                    value={flight.fltNbr}
                />
                <FormControl sx={{ m: 1, minWidth: 100 }}>
                    <InputLabel id="network-lbl">Network</InputLabel>
                    <Select
                        id="network"
                        labelId="network-lbl"
                        label="Network"
                        defaultValue=""
                        value={flight.network}>
                        <MenuItem value=""></MenuItem>
                        <MenuItem value={'VATSIM'}>VATSIM</MenuItem>
                        <MenuItem value={'IVAO'}>IVAO</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    id="crsAlt"
                    label="Cruise Altitude"
                    value={flight.crsAlt}
                />
                <TextField
                    id="maxIAS"
                    label="Max IAS"
                    value={flight.maxIAS}
                />
                <TextField
                    id="transAlt"
                    label="Transition Altitude"
                    value={flight.transAlt}
                />
                <TextField
                    id="aircraftICAO"
                    label="Aircraft ICAO"
                    value={flight.aircraftICAO}
                />
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </form>
        </div>
    );
}
