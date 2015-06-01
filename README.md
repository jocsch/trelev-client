## TRELEV Client

Trelev is an application which allows to create events to which users can subscribe.
It consists of two parts:

* The [Trelev Manager](https://github.com/jocsch/trelev-manager)
* The Trelev JS Code

You currently look at the client repository which is entirely javascript based.
The client is designed to run as a widget in arbitrary static HTML pages and can
be loaded also in cross domain scenarios (using CORS).

There are two files the [trelev-mgr.jsx](trelev-client/nginx/content/trelev-mgr.jsx) and the [trelev-view.jsx](trelev-client/nginx/content/trelev-view.jsx).

The *trelev-mgr* widget is used to maintain the events and thus requires a PW while the *trelev-view* widget is 
for public consumption. Every user can register here.

All is written with the react framework. This is my first usage of the framework, so please
be merciful ;-)

The repo contains docker files for nginx and npm.

So if you want to start the client, run

`fig up -d`

in the `nginx` directory.

Afterwards you can point the browser towards http://<boot2dockerip>/edit.html 
You can find the boot2docker ip by running: boot2docker ip

If you want to compile the JSX files into JS, run

`fig up`

in the `npm` directory. You can immediately kill this docker process again after compilation.

In any case, without the corresponding Trelev Manager (available in a separate repository) you will not see any content.
