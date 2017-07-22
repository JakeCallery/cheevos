#!/usr/bin/env bash
end="$((SECONDS+30))"
while true; do
    [[ "200" = "$(curl --silent --write-out %{http_code} --output /dev/null http://localhost:7474)" ]] && break
    [[ "${SECONDS}" -ge "${end}" ]] && echo "DB Failed to start..." && exit 1
    sleep 1
done
touch /etc/neo4j/db_started
echo "DB Started..."
exit 0
