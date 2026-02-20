
export const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const isSecureContext = (): boolean => {
  return typeof window !== 'undefined' && (window.isSecureContext || window.location.protocol === 'https:');
};

export const getHardwareSupport = async () => {
  const support = {
    camera: false,
    gps: !!navigator.geolocation,
    https: isSecureContext(),
    error: ''
  };

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      support.camera = devices.some(device => device.kind === 'videoinput');
    }
  } catch (e) {
    support.camera = false;
  }

  return support;
};
