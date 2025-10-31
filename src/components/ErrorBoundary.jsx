// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error(err, info); }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-danger">Algo deu errado ao renderizar. Tente recarregar.</div>;
    }
    return this.props.children;
  }
}
