pg_ctl -D $PREFIX/var/lib/postgresql start
sleep 5
cd $HOME/dev/backend
npm run dev < /dev/null &
cd ../frontend
npm run dev < /dev/null &
sleep 2

