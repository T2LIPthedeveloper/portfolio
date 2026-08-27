"use client";

import { Component, type ReactNode } from "react";

interface GlobeErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface GlobeErrorBoundaryState {
  hasError: boolean;
}

/** Catches WebGL / Three.js init failures so Travel stays usable without a map. */
export class GlobeErrorBoundary extends Component<
  GlobeErrorBoundaryProps,
  GlobeErrorBoundaryState
> {
  state: GlobeErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GlobeErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
