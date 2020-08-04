# Tobacco Atlas visualizations

Visualizations for tobacco atlas.

## Development

### Get started

```
npm install
npm run build-standalone-watch
```

### Testing changes

When making changes, it's a good idea to check chapters with visualizations of the types that would be affected by those changes. Built files are placed in `dist/`, and you can view them by running a simple Python server:

```
python -m SimpleHTTPServer
```

Each chapter has its own index file with all of the chapter's visualizations in it. For example, you can see the chapter 1 visualizations at:

```
http://localhost:8000/chapters/1/
```

### Building for deployment

Built code is committed to this repo for ease of deployment. Once you are happy with your changes, run:

```
npm run build-standalone
```

There should be changes to the JavaScript (`dist/ta-visualizations.js`) and possibly the CSS (`dist/ta-visualizations.css`). Commit these changes.
