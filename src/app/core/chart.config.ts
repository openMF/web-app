/**
 * Chart.js 4.x Configuration
 *
 * Chart.js 4.x is ESM-only and requires explicit registration of chart types.
 * This module ensures Chart.js is properly initialized before any components use it.
 *
 * Import this module once at application startup (main.ts) to register all chart components.
 */

import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
// This must be called before creating any Chart instances
Chart.register(...registerables);

// Export Chart for use in components
export { Chart };
