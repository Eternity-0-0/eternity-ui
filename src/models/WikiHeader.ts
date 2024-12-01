export class WikiHeader {
    navigation: string[];
    title: string;

    constructor(navigation: string[] = [], title: string = '') {
        this.navigation = navigation;
        this.title = title;
    }
}
