#!/usr/bin/env bash
node /cheevos/DBTools/dbtools.js --apply-constraints
touch /etc/neo4j/db_constraints_applied