FROM mariadb

# Copy the database.sql backup to the entrypoint folder like described in the manual of the mariadb image
COPY ./database2.sql /docker-entrypoint-initdb.d
