from flask import make_response
from functools import wraps


def add_response_headers(headers):
    """ This decorator adds the headers passed in to the response """
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            resp = make_response(func(*args, **kwargs))
            h = resp.headers
            for header, value in headers.items():
                h[header] = value
            return resp
        return decorated_function
    return decorator


def nocache(func):
    """ This decorator passes Pragma: no-cache """
    @wraps(func)
    @add_response_headers({'Cache-Control': 'no-cache'})
    def decorated_function(*args, **kwargs):
        return func(*args, **kwargs)
    return decorated_function
