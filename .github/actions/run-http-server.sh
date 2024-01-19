#!/bin/bash

sudo apt-get install socat
sudo socat TCP-LISTEN:80,fork,reuseaddr TCP:localhost:8080 &
php -S 127.0.0.1:8080 -t . >& access.log &
