export interface Flight {
    depICAO: string;
    arrICAO: string;
    route?: string;
    airline?: string;
    airlineICAO?: string;
    fltNbr?: string;
    network?: string;
    crsAlt?: number;
    transAlt?: number;
    maxIAS?: number;
    aircraftICAO?: string;
}
