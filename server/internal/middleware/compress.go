package middleware

import (
	"compress/gzip"
	"net/http"
	"strings"
	"sync"
)

// gzipMinSize is the body threshold below which responses are sent uncompressed since tiny payloads gain nothing from gzip.
const gzipMinSize = 1024

var gzipWriterPool = sync.Pool{
	New: func() any { return gzip.NewWriter(nil) },
}

// Gzip compresses responses for gzip capable clients, buffering until the body crosses gzipMinSize and pooling writers to avoid the large per-request allocation.
func Gzip(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}
		w.Header().Add("Vary", "Accept-Encoding")
		gw := &gzipResponseWriter{ResponseWriter: w}
		defer gw.close()
		next.ServeHTTP(gw, r)
	})
}

type gzipResponseWriter struct {
	http.ResponseWriter
	status    int
	buf       []byte
	gz        *gzip.Writer
	committed bool
}

func (w *gzipResponseWriter) WriteHeader(code int) {
	if w.status == 0 {
		w.status = code
	}
}

func (w *gzipResponseWriter) Write(p []byte) (int, error) {
	if w.committed {
		return w.sinkWrite(p)
	}
	w.buf = append(w.buf, p...)
	if len(w.buf) < gzipMinSize {
		return len(p), nil
	}
	if err := w.commit(true); err != nil {
		return 0, err
	}
	return len(p), nil
}

// commit decides gzip versus plain, writes the deferred status header, and flushes the buffer without double-encoding a body that already set Content-Encoding.
func (w *gzipResponseWriter) commit(tryGzip bool) error {
	w.committed = true
	if w.status == 0 {
		w.status = http.StatusOK
	}
	if tryGzip && w.ResponseWriter.Header().Get("Content-Encoding") == "" {
		h := w.ResponseWriter.Header()
		h.Set("Content-Encoding", "gzip")
		h.Del("Content-Length")
		w.gz = gzipWriterPool.Get().(*gzip.Writer)
		w.gz.Reset(w.ResponseWriter)
	}
	w.ResponseWriter.WriteHeader(w.status)
	if len(w.buf) == 0 {
		return nil
	}
	buf := w.buf
	w.buf = nil
	if w.gz != nil {
		_, err := w.gz.Write(buf)
		return err
	}
	_, err := w.ResponseWriter.Write(buf)
	return err
}

func (w *gzipResponseWriter) sinkWrite(p []byte) (int, error) {
	if w.gz != nil {
		return w.gz.Write(p)
	}
	return w.ResponseWriter.Write(p)
}

func (w *gzipResponseWriter) Flush() {
	if !w.committed {
		_ = w.commit(len(w.buf) >= gzipMinSize)
	}
	if w.gz != nil {
		_ = w.gz.Flush()
	}
	if f, ok := w.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

func (w *gzipResponseWriter) Unwrap() http.ResponseWriter {
	return w.ResponseWriter
}

func (w *gzipResponseWriter) close() {
	if !w.committed {
		_ = w.commit(false)
	}
	if w.gz != nil {
		_ = w.gz.Close()
		w.gz.Reset(nil)
		gzipWriterPool.Put(w.gz)
		w.gz = nil
	}
}
