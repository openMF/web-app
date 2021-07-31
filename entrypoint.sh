#!/bin/bash

set -e

#while ! nc -zvw3 mifos-ms-backoffice 8443 ; do
#    >&2 echo "Fineract is unavailable - sleeping"
#    sleep 5
#done
#>&2 echo "Fineract is up - executing command"

if [ -z "$(ls -A -- "/usr/local/lsws/conf/")" ]; then
        cp -R /usr/local/lsws/.conf/* /usr/local/lsws/conf/
fi
if [ -z "$(ls -A -- "/usr/local/lsws/admin/conf/")" ]; then
        cp -R /usr/local/lsws/admin/.conf/* /usr/local/lsws/admin/conf/
fi
chown 999:999 /usr/local/lsws/conf -R
chown 999:1000 /usr/local/lsws/admin/conf -R

/usr/local/lsws/bin/lswsctrl start
$@
while true; do
        if ! /usr/local/lsws/bin/lswsctrl status | grep 'litespeed is running with PID *' > /dev/null; then
                break
        fi
        sleep 60
done