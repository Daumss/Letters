pkill vite
pkill node
echo waiting for 10 sec before stopping postgresql
sleep 10
pg_ctl -D $PREFIX/var/lib/postgresql stop
