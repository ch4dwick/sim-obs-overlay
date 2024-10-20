import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

export default function Page() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <h1>Widgets</h1>
            <div className="">
                <FormControlLabel control={<Switch id="callsignEnabled" value={true} defaultChecked />} label="Callsign Enabled" />
                <FormControlLabel control={<Switch id="networkEnabled" value={true} defaultChecked />} label="Network Enabled" />
                <FormControlLabel control={<Switch id="speedEnabled" value={true} defaultChecked />} label="Speed Enabled" />
                <FormControlLabel control={<Switch id="headingEnabled" value={true} defaultChecked />} label="Heading Enabled" />
                <FormControlLabel control={<Switch id="altitudeEnabled" value={true} defaultChecked />} label="Altitude Enabled" />
                <FormControlLabel control={<Switch id="tempEnabled" value={true} defaultChecked />} label="Temperature Enabled" />
                <FormControlLabel control={<Switch id="perfEnabled" value={true} defaultChecked />} label="Performance Enabled" />
            </div>
        </div>
    );
}
