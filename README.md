h1 TRELEV Client

Trelev is an application which allows to create events to which users can subscribe.
It consists of two parts:

* The Trelev Manager
* The Trelev JS Code

You currently look at the client repository.
The client is designed to run as a widget in arbitrary static HTML pages and can
be loaded also in cross domain scenarios (using CORS).

There are two files the trelev-mgr.jsx and the trelev-view.jsx.

The trelev-mgr is used to maintain the events and thus requires a PW while the trelev-view is 
for public consumption. Every user can register here.

All is written with the react framework. This is my first usage of the framework, so please
be merciful ;-)

The repo contains docker files for nginx and npm.

So if you want to start the client, run

fig up -d

in the nginx directory.

If you want to compile the JSX files into JS, run

fig up

in the npm directory. You can immediately kill this docker process again after compilation.


