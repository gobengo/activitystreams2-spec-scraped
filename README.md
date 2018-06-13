# activitystreams2-spec-scraped

[![Build Status](https://travis-ci.com/gobengo/activitystreams2-spec-scraped.svg?branch=master)](https://travis-ci.com/gobengo/activitystreams2-spec-scraped)

Scrape data from the ActivityStreams 2.0 specs:
* https://www.w3.org/TR/activitystreams-core/
* https://www.w3.org/TR/activitystreams-vocabulary/

Why?
* Test libraries that deal with ActivityStreams2 data, e.g. to make sure the library fully models every vocab term. This was the original motivation: to help test [gobengo/activitystreams2](https://github.com/gobengo/activitystreams2)
* generate code for libraries in other languages. [go-fed/activity](https://github.com/go-fed/activity/tree/master/tools) did this because the polymorphic nature of ActivityStreams 2.0 / JSON-LD data makes it hard to model in golang's type system
* render better documentation for ActivityStreams 2.0. Right now the canonical documentation is in a couple huge html files, but it might be easier to maintain HTML docs (ideally with RDFa metadata) if rendered from less messy data like the JSON this library generates.

## Usage

### node.js/TypeScript

```javascript
import { scrapeVocabulary, vocabularySpecUrl } from "activitystreams2-spec-scraped"

(async () => {
  let v

  // This will load from a fixture and *will not* make an http request
  v = await scrapeVocabulary()

  // Provide a URL to fetch the html from there, then parse
  v = await scrapeVocabulary(vocabularySpecUrl)

  console.log(v)
})()
```

### Command Line Interface

* `npx activitystreams2-spec-scraped`
* `npm install -g activitystreams2-spec-scraped && activitystreams2-spec-scraped`
* Clone repo and `npm install && npm start`

```bash
$ npx activitystreams2-spec-scraped
```

The output is big!. See [./data/](./data/activitystreams-vocabulary/1528589057.json) for a full example.
