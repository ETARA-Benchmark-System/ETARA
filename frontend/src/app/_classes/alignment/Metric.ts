export class Metric {
    private _name: string;
    private _value: number;
    private _metrics;

    constructor(name: string, value: number) {
        this._name = name;
        this._value = value;
    }

    get name(): string {
        return this._name;
    }

    get value(): number {
        return this._value;
    }
}
