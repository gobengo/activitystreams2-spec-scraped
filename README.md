# activitystreams2-spec-scraped

Scrape data from the ActivityStreams 2.0 specs:
* https://www.w3.org/TR/activitystreams-core/
* https://www.w3.org/TR/activitystreams-vocabulary/

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

### `npm start`

```bash
$ npm install && npm start

> activitystreams2-spec-scraped@0.0.0 start ./activitystreams2-spec-scrape
> ts-node src

{
  "activityTypes": [
    {
      "name": "Accept",
      "notes": "Indicates that the actor accepts the object. The target property can be used in certain circumstances to indicate the context into which the object has been accepted.",
      "subClassOf": {
        "name": "Activity",
        "href": "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-activity"
      },
      "uri": "https://www.w3.org/ns/activitystreams#Accept"
    }
  ]
}
```

The above output is truncated. See [./data/](./data/activitystreams-vocabulary/1528590716.json) for a full example.
