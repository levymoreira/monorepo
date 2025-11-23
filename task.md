I want to use 1 VM in azure to host 10 websites I own. 
Each domain will point to this server. 
On this server I would like to user docker compose to create a system that can 
1- host each app (some nodejs+express some nextjs) in a isolated way 
2- proxy request to specific docker based on domain
3- support https for those domains 
4- support cronjobs (using docker as well, no native crontab)
5- allow all app logs to go to a docker with Grafana Loki
6- support to easilly get a new version of any of the apps installed (new docker image) without downtime
7- redundance of 2 running dockers for any of my own services (not needed for grafana)
8- support for redis

I want you to create a the docker compose and anything else necessary for a initial POC. 
It must contain the following apps: 

2 NextJs applications (use npx and create a basic empty nextjs app)
1 NodeJS cronjob (it must re-run every 1 minute and just log a string)
1 NodeJS app with express (for now it can return just a hello word)

