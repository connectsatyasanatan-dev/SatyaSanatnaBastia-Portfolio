"""
cache.py - Simple in-memory TTL cache shared across routes.
"""

import time

_cache: dict = {}
_CACHE_TTL = 300  # 5 minutes default


def get_cached(key: str):
    entry = _cache.get(key)
    if entry and time.time() < entry["expires"]:
        return entry["data"]
    return None


def set_cache(key: str, data, ttl: int = _CACHE_TTL):
    _cache[key] = {"data": data, "expires": time.time() + ttl}


def invalidate_cache(*keys):
    for k in keys:
        _cache.pop(k, None)
