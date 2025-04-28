export interface Permission {
    _id: string;
    name: string;
    description?: string;
    scope: string;
  }
  
  export interface Role {
    _id: string;
    name: string;
    scope: string;
    permissions: Permission[];
    isDefault: boolean;
  }