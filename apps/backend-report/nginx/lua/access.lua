ngx.log(ngx.INFO, "Processing request to: ", ngx.var.uri)
                
-- Get the current time in different formats
local current_time = os.date("!%Y-%m-%dT%H:%M:%S.000Z")  -- ISO 8601 format
local time_epoch = os.time() * 1000  -- Current time in milliseconds

-- Store the original request body as a string
local original_body = ngx.req.get_body_data() or ""
ngx.log(ngx.DEBUG, "Original request body: ", original_body)

-- Get the authorization header
local auth_header = ngx.req.get_headers()["authorization"] or ""

-- Create the new request body structure
local new_body = {
    version = "2.0",
    routeKey = "mockRouteKey",
    rawPath = "mockRawPath",
    rawQueryString = "",
    headers = {
        accept = "mockAccept",
        ["accept-encoding"] = "mockAcceptEncoding",
        authorization = auth_header,
        ["cache-control"] = "mockCacheControl",
        ["content-length"] = "mockContentLength",
        ["content-type"] = "application/json",
        host = "mockHost",
        ["postman-token"] = "mockPostManToken",
        ["user-agent"] = "mockUserAgent",
        ["x-amzn-trace-id"] = "mockXAmznTraceId",
        ["x-forwarded-for"] = "mockForwardedFor",
        ["x-forwarded-port"] = "mockForwardedPort",
        ["x-forwarded-proto"] = "mockForwardedProto"
    },
    requestContext = {
        accountId = "mockAccountId",
        apiId = "mockApiId",
        authorizer = {
            jwt = {
                claims = {},
                scopes = cjson.null
            }
        },
        domainName = "mockDomainName",
        domainPrefix = "mockDomainPrefix",
        http = {
            method = ngx.req.get_method(),
            path = ngx.var.uri,
            protocol = ngx.var.server_protocol,
            sourceIp = ngx.var.remote_addr,
            userAgent = ngx.var.http_user_agent
        },
        requestId = ngx.var.request_id,
        routeKey = ngx.req.get_method() .. " " .. ngx.var.uri,
        stage = "mockStage",
        time = current_time,
        timeEpoch = time_epoch
    },
    body = original_body,
    isBase64Encoded = false
}

local new_body_encoded = cjson.encode(new_body)
ngx.log(ngx.DEBUG, "Modified request body: ", new_body_encoded)

-- Set the modified body before proxying
ngx.req.set_body_data(new_body_encoded)
-- Update content length header
ngx.req.set_header("Content-Length", string.len(new_body_encoded))

-- Handle routing using the route mappings
local route_found = false
for pattern, route_info in pairs(route_mappings) do
    if ngx.var.uri:match("^" .. pattern) then
        ngx.log(ngx.INFO, "Routing request to: ", route_info.target)
        ngx.var.proxy_target = route_info.target
        route_found = true
        break
    end
end



if not route_found then
    ngx.log(ngx.WARN, "Route not found: ", ngx.var.uri)
    -- Return default response
    ngx.status = 404
    ngx.say(cjson.encode({
        error = "Route not found",
        path = ngx.var.uri
    }))
    return
end