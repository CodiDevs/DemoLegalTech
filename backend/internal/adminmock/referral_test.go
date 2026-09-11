package adminmock

import "testing"

func TestReferralSlug(t *testing.T) {
	if g := referralSlug("Dra. Ana Ruiz", 2); g != "dra-ana-ruiz" {
		t.Fatalf("got %q", g)
	}
	if g := referralSlug("  ", 9); g != "abogado9" {
		t.Fatalf("empty got %q", g)
	}
}
