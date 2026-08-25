export type SubmarineStatus = 'ACTIVE' | 'REFIT' | 'DAMAGED' | 'RETIRED';

export type SubmarineType = 'SSBN' | 'SSN' | 'SSGN' | 'SSK';

export type SubmarineRole = 'SSBN' | 'SSN';

export type SubmarineClass =
  | 'OHIO'
  | 'LOS_ANGELES'
  | 'STURGEON'
  | 'SEAWOLF'
  | 'RESOLUTION'
  | 'SWIFTSURE'
  | 'TRAFALGAR'
  | 'DELTA_IV'
  | 'TYPHOON'
  | 'VICTOR_III'
  | 'AKULA';

export interface Submarine {
  id: number;
  name: string;
  type: SubmarineType;
  submarineClass: SubmarineClass;
  nation: string;
  status: SubmarineStatus;
  submarineRole: SubmarineRole;
}

export interface SubmarineRequest {
  name: string;
  type: SubmarineType;
  submarineClass: SubmarineClass;
  nation: string;
  status: SubmarineStatus;
  submarineRole: SubmarineRole;
}
