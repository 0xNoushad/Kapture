/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  EncodedVideoPacketSource,
  EncodedPacket,
} from 'mediabunny';
import type { ExportConfig } from './types';


export class VideoMuxer {
  private output: Output | null = null;
  private videoSource: EncodedVideoPacketSource | null = null;
  private target: BufferTarget | null = null;
  private config: ExportConfig;
  private isFirstChunk = true;

  constructor(config: ExportConfig, _hasAudio = false) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.target = new BufferTarget();

    this.output = new Output({
      format: new Mp4OutputFormat({
        fastStart: 'in-memory',
      }),
      target: this.target,
    });

    // Create video source for H.264/AVC
    this.videoSource = new EncodedVideoPacketSource('avc');
    this.output.addVideoTrack(this.videoSource, {
      frameRate: this.config.frameRate,
    });

    await this.output.start();
    this.isFirstChunk = true;
  }

  async addVideoChunk(chunk: EncodedVideoChunk, metadata?: EncodedVideoChunkMetadata): Promise<void> {
    if (!this.videoSource) {
      throw new Error('Muxer not initialized');
    }

    // Convert WebCodecs chunk to Mediabunny packet
    const packet = EncodedPacket.fromEncodedChunk(chunk);

    // Pass metadata for first chunk (contains codec description)
    if (this.isFirstChunk && metadata?.decoderConfig) {
      await this.videoSource.add(packet, metadata);
      this.isFirstChunk = false;
    } else {
      await this.videoSource.add(packet);
    }
  }

  async addAudioChunk(_chunk: EncodedAudioChunk, _metadata?: EncodedAudioChunkMetadata): Promise<void> {
    // Audio support can be added later if needed
  }

  async finalize(): Promise<Blob> {
    if (!this.output || !this.target) {
      throw new Error('Muxer not initialized');
    }

    await this.output.finalize();
    const buffer = this.target.buffer;

    if (!buffer) {
      throw new Error('Failed to finalize output');
    }

    return new Blob([buffer], { type: 'video/mp4' });
  }
}
