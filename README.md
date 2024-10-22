# SIM OBS Overlay

After seeing existing Flight Sim overlays reliant on XPUIPC, I realized I could implement a more modern solution. Since the end goal here was basically to use it as a BrowserPlugin frame in OBS Studio there was no need to rely on something so elaborate since X-Plane already has a system for me to query flight details.

## Requirements

- Latest installation of NodeJs
- X-Plane 12 is running and in an active flight. There will be no DataRefs if it's not in a flight.

## TODO

- config dashboard (beneoverlay for reference)
- save a config file
- widget refinement

## Limitations

- Relies on the user to install NodeJs. I'll try to find a better way to distrubte this for the end-user in a simpler way.
- only supports X-Plane 12.
- my HTML skills.
- X-Plane REST & WebSocket API still does not have all the data that is available in the SDK.
- unsubscribing using params.datarefs: all doesn't work in a single call. To stop completely, you need to press Stop until all the values stop updating.

# Privacy Notice

This app does not collect any personal data - at least not yet. :)

X-Plane DataRef variables don't contain any personal data and the IDs generate every game load.
