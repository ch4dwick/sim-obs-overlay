# SIM OBS Overlay

After seeing existing Flight Sim overlays reliant on XPUIPC, I realized I could implement a more modern solution. Since the end goal here was basically to use it as a BrowserPlugin frame in OBS Studio there was no need to rely on something so elaborate since X-Plane already has a system for me to query flight details.

## Requirements

- Latest installation of NodeJs
- X-Plane 12

## TODO

- config dashboard (beneoverlay for reference)
- save a config file
- X-Plane Rest API interface
- using WebSocket for more real-time checking
- widgets
- Actual output

## Limitations

- Relies on the user to install NodeJs. I'll try to find a better way to distrubte this for the end-user in a simpler way.
- only supports X-Plane 12.
- my HTML skills.
- X-Plane REST & WebSocket API still does not have all the data that is available in the SDK.

# Privacy Notice

This app does not collect any personal data - at least not yet. :)
