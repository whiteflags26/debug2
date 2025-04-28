export const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;

export const isBangladeshiPhone = (
  phone: string | null | undefined
): boolean => {
  if (!phone) return true; // Empty is valid
  return bdPhoneRegex.test(phone);
};
