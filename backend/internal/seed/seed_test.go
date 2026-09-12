package seed

import (
	"os"
	"path/filepath"
	"testing"
)

func TestCopyDemoFixture(t *testing.T) {
	root := t.TempDir()
	fixtures := filepath.Join(root, "demo-fixtures")
	uploads := filepath.Join(root, "uploads")
	if err := os.MkdirAll(fixtures, 0o755); err != nil {
		t.Fatal(err)
	}
	src := filepath.Join(fixtures, "minuta-demo.pdf")
	if err := os.WriteFile(src, []byte("%PDF"), 0o644); err != nil {
		t.Fatal(err)
	}
	n, err := copyDemoFixture(uploads, "minuta-demo.pdf", "out.pdf")
	if err != nil {
		t.Fatal(err)
	}
	if n != 4 {
		t.Fatalf("copied %d bytes", n)
	}
	got, err := os.ReadFile(filepath.Join(uploads, "out.pdf"))
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != "%PDF" {
		t.Fatalf("got %q", got)
	}
}

func TestCopyDemoFixtureMissing(t *testing.T) {
	_, err := copyDemoFixture(t.TempDir(), "missing.pdf", "out.pdf")
	if err == nil {
		t.Fatal("expected error for missing fixture")
	}
}
