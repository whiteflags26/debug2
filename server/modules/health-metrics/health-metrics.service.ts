// src/modules/health/health.service.ts
import os from "os";
import osUtils from "os-utils";
import mongoose from "mongoose";
import promClient from "prom-client";
import { HealthMetrics } from "./health-metrics.model";

// Initialize Prometheus client
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const activeConnections = new promClient.Gauge({
  name: "nodejs_active_connections",
  help: "Number of active connections",
});

const mongodbConnections = new promClient.Gauge({
  name: "mongodb_connections_total",
  help: "Number of MongoDB connections",
});

register.registerMetric(httpRequestDuration);
register.registerMetric(activeConnections);
register.registerMetric(mongodbConnections);

export interface MetricsHistoryOptions {
  hours?: number;
  interval?: "minute" | "hour" | "day";
}

export default class HealthService {
  // Get system health data
  async getHealthData() {
    try {
      // Get CPU usage
      const cpuUsage = await this.getCpuUsage();

      // MongoDB stats
      const isDbConnected = mongoose.connection.readyState === 1;
      let dbStats = null;

      if (isDbConnected && mongoose.connection.db) {
        try {
          const adminDb = mongoose.connection.db.admin();
          const serverStatus = await adminDb.serverStatus();
          dbStats = {
            connections: serverStatus.connections,
            uptime: serverStatus.uptime,
            opcounters: serverStatus.opcounters,
          };

          // Update prometheus metric
          mongodbConnections.set(serverStatus.connections.current);
        } catch (error) {
          console.error("Failed to get MongoDB stats:", error);
          dbStats = { error: "Failed to fetch MongoDB stats" };
        }
      }

      // Memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      return {
        status: isDbConnected ? "ok" : "database_error",
        timestamp: new Date(),
        uptime: process.uptime(),
        system: {
          hostname: os.hostname(),
          platform: process.platform,
          cpus: os.cpus().length,
          load_average: os.loadavg(),
          cpu_usage_percent: (cpuUsage * 100).toFixed(2),
          memory: {
            total_bytes: totalMem,
            free_bytes: freeMem,
            used_bytes: usedMem,
            usage_percent: ((usedMem / totalMem) * 100).toFixed(2),
          },
        },
        process: {
          pid: process.pid,
          memory_usage: process.memoryUsage(),
          version: process.version,
        },
        database: {
          connected: isDbConnected,
          status: isDbConnected ? "connected" : "disconnected",
          stats: dbStats,
        },
        active_connections: Number(activeConnections.get()),
      };
    } catch (error) {
      console.error("Health check error:", error);
      throw error;
    }
  }

  // Get Prometheus metrics
  async getPrometheusMetrics() {
    try {
      return await register.metrics();
    } catch (error) {
      console.error("Error collecting Prometheus metrics:", error);
      throw error;
    }
  }

  // Get Prometheus metrics content type
  getPrometheusContentType() {
    return register.contentType;
  }

  // Increment active connections
  incrementActiveConnections() {
    activeConnections.inc();
  }

  // Decrement active connections
  decrementActiveConnections() {
    activeConnections.dec();
  }

  // Observe HTTP request duration
  observeHttpRequestDuration(
    method: string,
    path: string,
    statusCode: string,
    durationInSeconds: number
  ) {
    httpRequestDuration
      .labels(method, path, statusCode)
      .observe(durationInSeconds);
  }

  // Collect and store metrics
  async collectAndStoreMetrics() {
    try {
      // Get CPU usage
      const cpuUsage = await this.getCpuUsage();

      // Memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memoryUsagePercent = (usedMem / totalMem) * 100;

      // MongoDB stats
      const isDbConnected = mongoose.connection.readyState === 1;
      let dbConnections = { current: 0, available: 0, pending: 0 };
      let dbOpcounters = { insert: 0, query: 0, update: 0, delete: 0 };

      if (isDbConnected && mongoose.connection.db) {
        try {
          const adminDb = mongoose.connection.db.admin();
          const serverStatus = await adminDb.serverStatus();
          dbConnections = serverStatus.connections;
          dbOpcounters = serverStatus.opcounters;
        } catch (error) {
          console.error("Failed to get MongoDB stats:", error);
        }
      }

      // Process stats
      const memoryUsage = process.memoryUsage();

      // Create and save the metrics document
      const activeConnectionsValue = Number(activeConnections.get());
      const metrics = new HealthMetrics({
        timestamp: new Date(),
        system: {
          cpuUsage: cpuUsage * 100, // Convert to percentage
          totalMemory: totalMem,
          freeMemory: freeMem,
          memoryUsagePercent,
          loadAverage: os.loadavg(),
        },
        process: {
          uptime: process.uptime(),
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
        },
        database: {
          connected: isDbConnected,
          connections: dbConnections,
          opcounters: dbOpcounters,
        },
        // Check if it's a valid number and default to 0 if it's NaN
        activeConnections: isNaN(activeConnectionsValue)
          ? 0
          : activeConnectionsValue,
      });
      await metrics.save();
      console.log(
        `Metrics collected and stored at ${new Date().toISOString()}`
      );
      return metrics;
    } catch (error) {
      console.error("Error collecting metrics:", error);
      throw error;
    }
  }

  // Get latest metrics
  async getLatestMetrics() {
    try {
      return await HealthMetrics.findOne().sort({ timestamp: -1 }).lean();
    } catch (error) {
      console.error("Error fetching latest metrics:", error);
      throw error;
    }
  }

  // Get metrics history
  async getMetricsHistory(options: MetricsHistoryOptions = {}) {
    try {
      const { hours = 24, interval = "hour" } = options;

      let timeFilter: any = {};
      let groupByInterval: any = {};

      // Create time filter based on hours parameter
      const hoursNum = parseInt(hours.toString()) || 24;
      timeFilter = {
        timestamp: {
          $gte: new Date(Date.now() - hoursNum * 60 * 60 * 1000),
        },
      };

      // Create aggregation based on interval
      switch (interval) {
        case "minute":
          groupByInterval = {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" },
            minute: { $minute: "$timestamp" },
          };
          break;
        case "hour":
          groupByInterval = {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" },
          };
          break;
        case "day":
          groupByInterval = {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          };
          break;
        default:
          groupByInterval = {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" },
          };
      }

      // Get metrics with aggregation
      return await HealthMetrics.aggregate([
        { $match: timeFilter },
        {
          $group: {
            _id: groupByInterval,
            timestamp: { $first: "$timestamp" },
            cpuUsage: { $avg: "$system.cpuUsage" },
            memoryUsage: { $avg: "$system.memoryUsagePercent" },
            activeConnections: { $avg: "$activeConnections" },
            dbConnections: { $avg: "$database.connections.current" },
          },
        },
        { $sort: { timestamp: 1 } },
      ]);
    } catch (error) {
      console.error("Error fetching metrics history:", error);
      throw error;
    }
  }

  // Helper method to get CPU usage
  private getCpuUsage(): Promise<number> {
    return new Promise<number>((resolve) => {
      osUtils.cpuUsage((value) => {
        resolve(value);
      });
    });
  }


  // Deletes metrics older than specified date

  public async cleanupOldMetrics(cutoffDate: Date): Promise<void> {
    await HealthMetrics.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
  }
}
