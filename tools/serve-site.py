#!/usr/bin/env python3
"""Serve the built project website and keep earlier local demo URLs usable."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

BASE = '/sahajlipi/'
SITE_DIRECTORY = Path(__file__).resolve().parent.parent / '.site-dist'


class SiteHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        location = urlsplit(self.path)
        if not location.path.startswith(BASE):
            target = BASE if location.path == BASE.rstrip('/') else BASE + location.path.lstrip('/')
            self.send_response(302)
            self.send_header('Location', urlunsplit(('', '', target, location.query, '')))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        return super().send_head()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4178)
    parser.add_argument('--bind', default='127.0.0.1')
    options = parser.parse_args()
    if not (SITE_DIRECTORY / 'sahajlipi/index.html').is_file():
        parser.error('Website build is missing. Run npm run site:build first.')
    handler = partial(SiteHandler, directory=str(SITE_DIRECTORY))
    with ThreadingHTTPServer((options.bind, options.port), handler) as server:
        print(f'SahajLipi website: http://{options.bind}:{options.port}{BASE}', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
