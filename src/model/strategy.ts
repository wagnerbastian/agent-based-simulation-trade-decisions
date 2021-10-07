export class Strategy {
    id: number;
    name: string;
    isConsumer: boolean;
    distribution: number;

    constructor(id: number, name: string, isConsumer: boolean, distribution: number) {
        this.id = id;
        this.name = name;
        this.isConsumer = isConsumer;
        this.distribution = distribution;
    }
}