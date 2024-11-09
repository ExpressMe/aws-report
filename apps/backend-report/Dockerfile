# Base building stage, build all native executables
# This stage is automatically cached by docker,
# running `docker build` on this file multiple times without changing source code in between
# does not rebuild native executables multiple times.

FROM vegardit/graalvm-maven:latest-java21 AS builder

WORKDIR /build
COPY . /build

RUN mvn package -Pnative -DskipTests

# ------------------------------------------------------------------------------

# Uppercase endpoint, copy the relevant native executable to the final image
# Build command; `docker build --target expressme_uppercase -t expressme_uppercase .`

FROM public.ecr.aws/lambda/provided:al2023 AS expressme_uppercase

COPY --from=builder /build/functions/uppercase/target/uppercase app
ENTRYPOINT ["./app"]

# ------------------------------------------------------------------------------

# Reverse endpoint, copy the relevant native executable to the final image
# Build command; `docker build --target expressme_reverse -t expressme_reverse .`

FROM public.ecr.aws/lambda/provided:al2023 AS expressme_reverse

COPY --from=builder /build/functions/reverse/target/reverse app
ENTRYPOINT ["./app"]

# ------------------------------------------------------------------------------