FROM postgres:12

RUN apt-get clean && apt-get update

ADD *.sql /docker-entrypoint-initdb.d/
