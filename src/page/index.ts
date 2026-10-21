// Runs in the page's own JavaScript world (manifest "world": "MAIN") so it
// can wrap the APIs WhatsApp uses to make noise. It has no access to chrome.*
// APIs; the content script tells it whether to mute via MUTE_ATTRIBUTE.
import { MUTE_ATTRIBUTE } from '../shared/pageFlags';
import { shouldSilence } from './silence';

const isMuteEnabled = () => document.documentElement.hasAttribute(MUTE_ATTRIBUTE);

function silenceAudio(): void {
  const originalPlay = HTMLMediaElement.prototype.play;
  // Elements we muted, so we can unmute them if the person plays them later.
  const mutedByUs = new WeakSet<HTMLMediaElement>();

  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    if (this instanceof HTMLAudioElement) {
      if (mutedByUs.has(this) && navigator.userActivation?.isActive) {
        this.muted = false;
        mutedByUs.delete(this);
      }
      const silence = shouldSilence({
        muteEnabled: isMuteEnabled(),
        elementMuted: this.muted,
        userActive: navigator.userActivation?.isActive ?? false,
      });
      if (silence) {
        // Play muted rather than refusing, so WhatsApp's own bookkeeping
        // (ended events, promises) still behaves normally.
        this.muted = true;
        mutedByUs.add(this);
      }
    }
    return originalPlay.call(this);
  };
}

function withSilent(options?: NotificationOptions): NotificationOptions | undefined {
  return isMuteEnabled() ? { ...options, silent: true } : options;
}

function silenceNotifications(): void {
  const OriginalNotification = window.Notification;
  if (OriginalNotification) {
    // Subclassing keeps the statics WhatsApp relies on (permission,
    // requestPermission) working through the prototype chain.
    class SilentNotification extends OriginalNotification {
      constructor(title: string, options?: NotificationOptions) {
        super(title, withSilent(options));
      }
    }
    window.Notification = SilentNotification;
  }

  const registration = window.ServiceWorkerRegistration?.prototype;
  if (registration) {
    const originalShow = registration.showNotification;
    registration.showNotification = function (this: ServiceWorkerRegistration, title, options) {
      return originalShow.call(this, title, withSilent(options));
    };
  }
}

silenceAudio();
silenceNotifications();
