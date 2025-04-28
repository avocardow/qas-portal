/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '@casl/ability' {
  export class Ability {
    constructor(rules?: any);
    can(action: any, subject: any, field?: any): boolean;
    cannot(action: any, subject: any, field?: any): boolean;
    // include other members as needed
  }
  export class AbilityBuilder {
    can: (action: any, subject: any, conditionsOrFields?: any, conditions?: any) => void;
    cannot: (action: any, subject: any, fieldsOrConditions?: any, conditions?: any) => void;
    build: () => Ability;
    constructor(AbilityClass: any);
  }
} 