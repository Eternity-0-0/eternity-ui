export class RelatedProcess {
    title: string;
    image: string;

    constructor(title: string = '', image: string = '') {
        this.title = title;
        this.image = image;
    }
}

export class WikiRelatedProcessesData {
    processes: RelatedProcess[];

    constructor(processes: RelatedProcess[] = []) {
        this.processes = processes;
    }
}
