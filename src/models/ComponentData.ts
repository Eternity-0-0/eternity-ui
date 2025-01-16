export interface Size {
    min: number;
    max: number;
    unit: string;
}

export interface ComponentData {
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
}
