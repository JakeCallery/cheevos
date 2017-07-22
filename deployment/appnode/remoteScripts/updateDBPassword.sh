#!/usr/bin/env bash
echo "Setting DB Password to \"$1\""
curl -H "Content-Type: application/json" -X POST -d "{\"password\":\"$1\"}" -u neo4j:neo4j http://localhost:7474/user/neo4j/password
touch /etc/neo4j/pass_set
