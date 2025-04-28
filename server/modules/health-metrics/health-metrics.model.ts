// src/modules/health/health-metrics.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IHealthMetrics extends Document {
  timestamp: Date;
  system: {
    cpuUsage: number;
    totalMemory: number;
    freeMemory: number;
    memoryUsagePercent: number;
    loadAverage: number[];
  };
  process: {
    uptime: number;
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  database: {
    connected: boolean;
    connections: {
      current: number;
      available: number;
      pending: number;
    };
    opcounters: {
      insert: number;
      query: number;
      update: number;
      delete: number;
    };
  };
  activeConnections: number;
}

const HealthMetricsSchema: Schema = new Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    system: {
      cpuUsage: Number,
      totalMemory: Number,
      freeMemory: Number,
      memoryUsagePercent: Number,
      loadAverage: [Number],
    },
    process: {
      uptime: Number,
      rss: Number,
      heapTotal: Number,
      heapUsed: Number,
      external: Number,
    },
    database: {
      connected: Boolean,
      connections: {
        current: Number,
        available: Number,
        pending: Number,
      },
      opcounters: {
        insert: Number,
        query: Number,
        update: Number,
        delete: Number,
      },
    },
    activeConnections: Number,
  },
  { timestamps: true }
);

export const HealthMetrics = mongoose.models.HealthMetrics || 
  mongoose.model<IHealthMetrics>("HealthMetrics", HealthMetricsSchema);