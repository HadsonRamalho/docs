FROM rust:bookworm as builder

WORKDIR /usr/src/app

COPY Cargo.toml Cargo.lock ./

RUN mkdir src && echo "fn main() {println!(\"dummy\")}" > src/main.rs
RUN cargo build --release

COPY . .

RUN touch src/main.rs

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    build-essential \
    cargo \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/src/app/target/release/rust-server ./app

EXPOSE 3099

CMD ["./app"]
