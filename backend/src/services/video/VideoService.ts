import { VideoProvider } from './VideoProvider';
import { StreamAdapter } from './StreamAdapter';

class VideoServiceFactory {
  private provider: VideoProvider;

  constructor() {
    // We can switch this based on an environment variable, e.g., process.env.VIDEO_PROVIDER === 'webrtc'
    // For now, it defaults to StreamAdapter
    this.provider = new StreamAdapter();
  }

  getProvider(): VideoProvider {
    return this.provider;
  }
}

export const VideoService = new VideoServiceFactory().getProvider();
