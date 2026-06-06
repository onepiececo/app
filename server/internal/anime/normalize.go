package anime

import (
	"regexp"
	"strings"
	"sync"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

// diacriticPool hands each caller its own transformer since transform chains hold state and are not safe to share across goroutines.
var diacriticPool = sync.Pool{
	New: func() any {
		return transform.Chain(norm.NFKD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	},
}

var (
	seasonRe   = regexp.MustCompile(`(?i)\b(season|s)\s*0*(\d+)\b`)
	whitespace = regexp.MustCompile(`\s+`)
	punct      = regexp.MustCompile(`[^\p{L}\p{N}\s]+`)
)

// Normalize returns a canonical form for comparison and search keys.
// Lowercases, strips diacritics and punctuation, collapses `season N` to `sN`, squashes whitespace.
func Normalize(s string) string {
	s = strings.ToLower(s)
	t := diacriticPool.Get().(transform.Transformer)
	r, _, err := transform.String(t, s)
	diacriticPool.Put(t)
	if err == nil {
		s = r
	}
	s = punct.ReplaceAllString(s, " ")
	s = seasonRe.ReplaceAllString(s, "s$2")
	s = whitespace.ReplaceAllString(s, " ")
	return strings.TrimSpace(s)
}

// Slugify returns a URL safe slug from a title.
func Slugify(s string) string {
	n := Normalize(s)
	n = strings.ReplaceAll(n, " ", "-")
	if len(n) > 80 {
		n = n[:80]
	}
	return strings.Trim(n, "-")
}

// SeedAliases lists short hand fan abbreviations to insert with priority 1 after every ingestion run.
// Each entry maps an exact slug to one or more aliases.
var SeedAliases = map[string][]string{
	"my-hero-academia":  {"mha", "bnha"},
	"jujutsu-kaisen":    {"jjk"},
	"attack-on-titan":   {"aot", "snk"},
	"one-piece":         {"op"},
	"hunter-x-hunter":   {"hxh"},
	"demon-slayer":      {"kny"},
	"kimetsu-no-yaiba":  {"kny"},
	"bocchi-the-rock":   {"bocchi"},
	"konosuba":          {"konosuba"},
	"fullmetal-alchemist-brotherhood": {"fma", "fmab"},
	"chainsaw-man":      {"csm"},
	"spy-x-family":      {"spy", "spyxfamily"},
	"oshi-no-ko":        {"oshinoko"},
	"frieren":           {"frieren"},
}
