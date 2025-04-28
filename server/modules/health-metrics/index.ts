// src/modules/health/index.ts
import express, { Request, Response, NextFunction } from 'express';
import HealthService from '../health-metrics/health-metrics.service';
import { healthRouter, metricsRouter, metricsApiRouter } from '../health-metrics/health-metrics.routes';

/**
 * Sets up health monitoring middleware and routes
 * @param app Express application instance
 */
export function setupHealthMonitoring(app: express.Application): void {
  const healthService = new HealthService();
  
  // Middleware to track request duration and active connections
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    healthService.incrementActiveConnections();
    
    res.on('finish', () => {
      healthService.decrementActiveConnections();
      
      const duration = process.hrtime(start);
      const durationInSeconds = duration[0] + duration[1] / 1e9;
      
      // Don't measure health and metrics endpoints
      if (req.path !== '/health' && req.path !== '/metrics') {
        healthService.observeHttpRequestDuration(
          req.method, 
          req.path, 
          res.statusCode.toString(), 
          durationInSeconds
        );
      }
    });
    
    next();
  });

  
  // Register the routes
  app.use('/health', healthRouter);
  app.use('/metrics', metricsRouter);
  app.use('/api/v1/metrics', metricsApiRouter);

  // Start periodic metrics collection
  startPeriodicMetricsCollection(healthService);
}

async function startMetricsCleanup(healthService: HealthService) {
  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // Run daily
  const RETENTION_DAYS = 7; // Keep data for 7 days

  setInterval(async () => {
    try {
      const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
      await healthService.cleanupOldMetrics(cutoffDate);
      console.log(`Cleaned up metrics older than ${RETENTION_DAYS} days`);
    } catch (error) {
      console.error('Metrics cleanup failed:', error);
    }
  }, CLEANUP_INTERVAL);
}


/**
 * Starts periodic collection of system metrics
 * @param healthService Health service instance
 */
function startPeriodicMetricsCollection(healthService: HealthService): void {
  // Collect metrics immediately when server starts
  healthService.collectAndStoreMetrics()
    .catch(error => console.error('Initial metrics collection failed:', error));
  
  // Then collect every 20 minutes
  setInterval(() => {
    healthService.collectAndStoreMetrics()
      .catch(error => console.error('Periodic metrics collection failed:', error));
  }, 20 * 60 * 1000);
  
  startMetricsCleanup(healthService);
}

// Export controllers, services, models
export { default as HealthController } from '../health-metrics/health-metrics.controller';
export { default as HealthService } from './health-metrics.service';
export { HealthMetrics } from './health-metrics.model';