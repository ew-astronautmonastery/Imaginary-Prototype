"""Local preview server for the Imaginary prototype.
Same as `python3 -m http.server`, but tells browsers never to cache, so every
refresh shows the latest HTML/CSS/JS (Safari otherwise holds on to old files)."""
import http.server, sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8450
http.server.ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
