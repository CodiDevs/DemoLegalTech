package main

import (
	"testing"
)

func TestListenAddrPrefersPort(t *testing.T) {
	t.Setenv("PORT", "10000")
	t.Setenv("ADDR", ":9")
	if got := listenAddr(); got != "0.0.0.0:10000" {
		t.Fatalf("listenAddr() = %q", got)
	}
}

func TestListenAddrFallsBackToAddr(t *testing.T) {
	t.Setenv("PORT", "")
	t.Setenv("ADDR", ":9090")
	if got := listenAddr(); got != ":9090" {
		t.Fatalf("listenAddr() = %q", got)
	}
}

func TestCorsOriginsIncludesVercelAndExtra(t *testing.T) {
	t.Setenv("FRONTEND_ORIGINS", " https://preview.example ,https://other.example ")
	got := corsOrigins()
	want := []string{
		"http://localhost:4200",
		"http://127.0.0.1:4200",
		"https://legalstation.vercel.app",
		"https://legalstation-vixio-s-projects.vercel.app",
		"https://preview.example",
		"https://other.example",
	}
	if len(got) != len(want) {
		t.Fatalf("len=%d want %d (%v)", len(got), len(want), got)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("corsOrigins()[%d]=%q want %q", i, got[i], want[i])
		}
	}
}
