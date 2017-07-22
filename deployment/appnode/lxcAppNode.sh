#!/usr/bin/env bash
cp /cheevos_deployment/inventory/hosts /cheevos/deployment/inventory/hosts
ansible-playbook -i ../inventory/hosts appnode_lxc_playbook.yml