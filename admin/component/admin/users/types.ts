// src/component/admin/users/types.ts
export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  createdAt: string;
  // Add any additional fields from your backend
}

export interface Role {
  _id: string;
  name: string;
  scope: string;
  permissions?: string[]; // IDs of permissions associated with this role
  isDefault?: boolean;
  // Add any additional fields from your backend
}

export interface Permission {
  _id: string;
  name: string;
  description?: string;
  scope: string;
}

export interface UserRoleAssignment {
  _id: string;
  userId: string;
  roleId: string;
  scope: string;
  scopeId?: string;
  createdAt: string;
}