import D from './Dialog';
import T from './Tooltip';
import Vue from 'vue';

/**
 * Generate Dialog & Tooltip component pair
 */
const tooltips = () => {
	// Create shared event bus
  const tooltipBus = new Vue();

	// Extend both the components so they share the bus
  const Dialog = {
    extends: D,
    tooltipBus
  };

  const Tooltip = {
    extends: T,
    tooltipBus
  }

  return { Dialog, Tooltip };
}

export default tooltips;

export const { Dialog, Tooltip } = tooltips();
