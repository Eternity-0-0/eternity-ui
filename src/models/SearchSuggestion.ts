export class SearchSuggestion {
    constructor(
        public nice_name: string,
        public name: string,
        public short_name: string
    ) {}

    get name_for_rendering(): string {
        let shown = this.nice_name;
        if (this.short_name) {
            shown += ` (${this.short_name})`;
        }
        return shown;
    }
}
