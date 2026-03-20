# custom middleware for x-frame-options
class AllowIframeMiddleware:
    def __init__(self,get_response):
        self.get_response = get_response
    
    def __call__(self,request):
        response = self.get_response(request)
        if 'x-frame-options' in response.headers:
            del response.headers['x-frame-options']
        return response