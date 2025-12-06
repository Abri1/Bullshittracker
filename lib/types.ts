export interface Driver {
  id: string;
  name: string;
  pin: string;
  created_at: string;
}

export interface Field {
  id: string;
  name: string;
  color: string;
  target_loads: number;
  is_active: boolean;
  created_at: string;
}

export interface Load {
  id: string;
  field_id: string;
  driver: string;
  created_at: string;
}

export interface LoadWithField extends Load {
  fields?: Field;
}
