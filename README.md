# Viz Vanadium Viewer
Viz is a browser-like application that lets developers and other users view
the Vanadium world.
Starting from their namespace root, a user can see where services are mounted and
browse through the mount table hierarchy. The user can also select a service to
see more detailed information about it. A user can also interact with the
service; by invoking methods they can examine or modify the service's state.

## Installing the Vanadium Extension

Viz requires that users install the Vanadium Extension from the Chrome Web Store.
Without this extension, Viz will not load properly.

Link to the Vanadium Extension:
https://chrome.google.com/webstore/detail/vanadium-extension/jcaelnibllfoobpedofhlaobfcoknpap

##Building Viz

You will need to install the Vanadium environment and setup the web
profile to build your own copy of Viz. See the development instructions
for Vanadium for more information.

In order to build your own copy of Viz, simply run:

```sh
cd $VANADIUM_ROOT/release/projects/browser
make build
```

This compiles the relevant bundle files in the 'public' folder. The
assets inside can be served as your own instance of Viz.

### Running Viz locally for development

You can serve a local instance of Viz with the following command:

```sh
make start
```

Note: You will need to install the Vanadium environment and setup the web
profile for this command to succeed.

This command compiles and launches Viz. Additionally, demo services that
represent a virtual house and cottage are added to your local namespace.

Navigate to http://localhost:9000 to access Viz.
You can quit by using `CTRL-C` on the console running `make start`

If you have any problems after updating the code, try cleaning the build.

```sh
make clean
make start
```

## Testing Viz

Viz has some unit and integration tests that verify basic functionality.

Run these tests with the following command:

```sh
make test
```

There are no UI tests yet.

## Contributing to Viz
Coming Soon!
Meanwhile, you can submit issues and suggestions from Viz itself.

# Deploy

If you do not have access to the vanadium-staging GCE account ping jasoncampbell@. Once you have access you will need to login to the account via the command line.

    gcloud auth login

To deploy the site to https://staging.namespace.v.io use the make target `deploy-staging`.

    make deploy-staging

This will sync the `public` directory to the private Google Storage bucket `gs://staging.namespace.v.io` which gets automatically updated to the nginx front-end servers. Currently all static content is protected by OAuth. For more details on the deployment infrastructure see [this doc][deploy] and the [infrastructure] repository.

[deploy]: http://goo.gl/QfD4gl
[infrastructure]: https://vanadium.googlesource.com/infrastructure/+/master/nginx/README.md
