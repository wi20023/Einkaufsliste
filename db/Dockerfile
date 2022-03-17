FROM mariadb

# Copy the database.sql backup to the entrypoint folder like described in the manual of the mariadb image
COPY ./database.sql /docker-entrypoint-initdb.d
# COPY ./list2.sql /docker-entrypoint-initdb.d
# COPY ./list3.sql /docker-entrypoint-initdb.d