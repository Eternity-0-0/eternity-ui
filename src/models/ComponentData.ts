export class Size {
    min: number | null;
    max: number | null;
    value: number | null;
    unit: string;

    constructor(min: number | null, max: number | null, value: number | null, unit: string) {
        this.min = min;
        this.max = max;
        this.value = value;
        this.unit = unit;
    }

    to_string(): string {
        if (this.value) {
            return `${this.value} ${this.unit}`;
        }
        return `${this.min}-${this.max} ${this.unit}`;
    }
}

export class ComponentData {
    name: string;
    nice_name: string;
    short_name: string | null;
    other_names: string[];
    description: string;
    function: string;
    size: Size;
    thickness: number | null;
    volume: number | null;
    size_raw: number | null;
    location: string | null;
    image: string;
    related_processes: string[];
    component_type: string;

    constructor(
        name: string,
        nice_name: string,
        short_name: string | null,
        other_names: string[],
        description: string,
        function_: string,
        size: Size,
        thickness: number | null,
        volume: number | null,
        size_raw: number | null,
        location: string | null,
        image: string,
        related_processes: string[],
        component_type: string
    ) {
        this.name = name;
        this.nice_name = nice_name;
        this.short_name = short_name;
        this.other_names = other_names;
        this.description = description;
        this.function = function_;
        this.size = size;
        this.thickness = thickness;
        this.volume = volume;
        this.size_raw = size_raw;
        this.location = location;
        this.image = image;
        this.related_processes = related_processes;
        this.component_type = component_type;
    }
}
