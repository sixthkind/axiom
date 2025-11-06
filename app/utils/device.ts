import { Device } from '@capacitor/device';


class DeviceInfo {
  static async isIOS() {
    const info = await Device.getInfo();
    return info.platform === 'ios';
  } 
  
  static async isAndroid() {
    const info = await Device.getInfo();
    return info.platform === 'android';
  }
  
  static async isMobile() {
    const info = await Device.getInfo();
    return info.platform === 'ios' || info.platform === 'android';
  }
  
  static async platform() {
    const info = await Device.getInfo();
    return info.platform;
  }
}

export { DeviceInfo };

