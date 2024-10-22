export interface FlightTelemetry {
    // sim/cockpit2/gauges/indicators/altitude_ft_pilot
    currentAltId: number;
    currentAltFt: number;
    // sim/cockpit2/gauges/indicators/airspeed_kts_pilot
    pilotAirspeedId: number;
    currentSpd: number;
    // sim/cockpit2/gauges/indicators/true_airspeed_kts_pilot
    pilotTrueAirspeedId: number;
    // sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot
    compassHeadingDegId: number;
    currentHdg: number;
    // sim/cockpit2/gauges/indicators/compass_heading_deg_mag
    compassMagneticHeadingId: number;
    currentMagHdg: number;
    // sim/cockpit2/radios/indicators/fms_distance_to_tod_pilot
    distanceToTODId: number;
    // sim/cockpit2/radios/indicators/fms_tod_before_distance_pilot
    distanceAfterTODId: number;

    // TODO: Removing this for now because each plane uses a different dataRef variable to set this.
    // laminar/autopilot/ap_on
    // autopilotStatusId: number;
    // autopilotStatus: number;
}
