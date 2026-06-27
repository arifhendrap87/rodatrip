"use client"

import { Component } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <span className="text-4xl">⚠️</span>
              <p className="text-lg font-medium">Terjadi kesalahan</p>
              <p className="text-sm text-muted-foreground max-w-md text-center">
                {this.state.error?.message || "Silakan coba lagi."}
              </p>
              <Button onClick={() => this.setState({ hasError: false })}>
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
