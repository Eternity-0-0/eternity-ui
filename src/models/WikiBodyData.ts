export class WikiBodyData {
    text: string;
    image: string;
    whiten_image: boolean = true;
    metainfo: { [key: string]: string };

    constructor(text: string = '', image: string = '', whiten_image: boolean = true, metainfo: { [key: string]: string } = {}) {
        this.text = text;
        this.image = image;
        this.whiten_image = whiten_image;
        this.metainfo = metainfo;
    }
}
