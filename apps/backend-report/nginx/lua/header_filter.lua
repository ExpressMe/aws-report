ngx.log(ngx.DEBUG, "Removing content-length header for response transformation")
ngx.header.content_length = nil