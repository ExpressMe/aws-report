

local chunk, eof = ngx.arg[1], ngx.arg[2]
local buf = ngx.ctx.buf

ngx.log(ngx.INFO, "Body filter phase - chunk size: ", 
                chunk and string.len(chunk) or 0,
                " EOF: ", eof)

if not buf then
    buf = {}
    ngx.ctx.buf = buf
end

if chunk then
    table.insert(buf, chunk)
end

if eof then
    -- Concatenate all chunks
    local response_body = table.concat(buf)
    ngx.log(ngx.DEBUG, "Original response: ", response_body)
    
    -- Try to decode the response as JSON
    local success, decoded = pcall(cjson.decode, response_body)
    if success and decoded.body then
        ngx.log(ngx.INFO, "Successfully extracted body from response")
        ngx.arg[1] = decoded.body
    else
        ngx.log(ngx.WARN, "Could not extract body from response, returning original")
        ngx.arg[1] = response_body
    end
    
    -- Clear the buffer
    ngx.ctx.buf = nil
else
    -- If we havent reached the end, dont output anything yet
    ngx.arg[1] = nil
end