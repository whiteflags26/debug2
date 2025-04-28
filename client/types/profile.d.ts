export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
