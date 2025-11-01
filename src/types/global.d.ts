declare global {
  interface Window {
    Notification: typeof Notification;
    speechSynthesis: SpeechSynthesis;
    SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
    DeviceOrientationEvent: typeof DeviceOrientationEvent;
  }
}

export {};