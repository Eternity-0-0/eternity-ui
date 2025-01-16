export class WikiBodyData {
    text: string;
    image: string;
    metainfo: { [key: string]: string };

    constructor(text: string = '', image: string = '', metainfo: { [key: string]: string } = {}) {
        this.text = text;
        this.image = image;
        this.metainfo = metainfo;
    }
}
