export const SMS_SERVICE = "ISmsService";

export interface ISmsService {
  sendOtp(phoneNumber: string, otp: string): Promise<void>;
}
