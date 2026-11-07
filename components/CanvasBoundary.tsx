"use client";   // class components with state must be client components in the App Router

import React from "react";

type Props = { children: React.ReactNode; fallback: React.ReactNode };
type State = { hasError: boolean };

export default class CanvasBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Canvas section crashed:", error.name, error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}