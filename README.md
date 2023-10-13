# cheevos
Send achievements to fellow coworkers and teams

> Very much a work in progress, and not styled, but a fun experiment none the less
![image](https://github.com/JakeCallery/cheevos/assets/1918511/28f86a3e-3458-4a74-a7f5-ed51fea34702)
![image](https://github.com/JakeCallery/cheevos/assets/1918511/548adb6b-ccbe-4b26-8e13-4a7c363f618e)

# Premise:
Early stages of a project I had been wanting to build for a long time. While it all
technically works, it is clearly not pretty :)
When I worked for Vectorform, the team I was on was putting in crazy hours and morale
was pretty low as it didn't really feel like anyone took notice of what we were doing. So
to try and find a way to push through that, I had created an adobe AIR application that
everyone could leave running on their machines. I "borrowed" the xbox achievement
graphics, and anytime someone wanted to recognize another team member they could
send an achievement that would then run the xbox achievement animation on
everyone's machine and show what the person had accomplished. The project ended
up being more fun to use than anyone thought. It basically became a meme generator
of sorts. We quickly started seeing achievements like:
Achievement Unlocked
"No Doze": No sleep for more than 48hours
Achievement Unlocked
"It Gave Me Wings": 6 Redbulls in 6 hours
I wanted to bring this project to development and support teams everywhere, so I
started rebuilding it as a web application now that browsers could display notifications.

# Tech Features:
ES6 JS / HTML / CSS (webpack etc..)
NodeJS backend
Neo4j Graph Database backend
Webworkers (for support of the browser notifications)
Firebase integration
Google OAuth2 integration
Ansible deployment into proxmox lxc containers
