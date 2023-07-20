#!/bin/bash

export DJANGO_ENV="dev"

if [ "$1" == "migrate" ]; then
    python manage.py migrate
elif [ "$1" == "runserver" ]; then
    python manage.py runserver
fi