#!/usr/bin/env bash

# wait-for-it.sh: Wait for a service to be ready

set -e

host="$1"
shift

port="$1"
shift

cmd="$@"

until nc -z "$host" "$port"; do
  >&2 echo "Waiting for $host:$port to be available..."
  sleep 1
done

>&2 echo "$host:$port is available. Running command."
exec $cmd